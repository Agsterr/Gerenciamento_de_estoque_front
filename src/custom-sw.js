/* eslint-disable no-restricted-globals */
// Custom Service Worker que estende o Angular Service Worker (NGSW)
// - Mantém todo o comportamento do NGSW
// - Adiciona fila com Background Sync para requisições POST/PUT/PATCH/DELETE quando offline

// Importa o NGSW original para manter cache/atualizações do Angular
importScripts('ngsw-worker.js');

const API_BASE = 'https://gerenciamento-de-estoque-mw08.onrender.com';
const DB_NAME = 'bg-sync-db';
const STORE_NAME = 'requests';
const SYNC_TAG = 'bg-sync-queue';

// Utilitários simples de IndexedDB
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_key', 'key', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function addRequest(record) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const add = store.add(record);
    add.onsuccess = () => {
      resolve(add.result);
      db.close();
    };
    add.onerror = () => {
      reject(add.error);
      db.close();
    };
  }));
}

function getAllRequests() {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const getAll = store.getAll();
    getAll.onsuccess = () => {
      resolve(getAll.result || []);
      db.close();
    };
    getAll.onerror = () => {
      reject(getAll.error);
      db.close();
    };
  }));
}

function deleteRequest(id) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const del = store.delete(id);
    del.onsuccess = () => {
      resolve();
      db.close();
    };
    del.onerror = () => {
      reject(del.error);
      db.close();
    };
  }));
}

function deleteByKey(key) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_key');
    const req = index.openCursor();
    const toDelete = [];
    req.onsuccess = (ev) => {
      const cursor = ev.target.result;
      if (cursor) {
        if (cursor.value.key === key) {
          toDelete.push(cursor.primaryKey);
        }
        cursor.continue();
      } else {
        // No more
        Promise.all(toDelete.map(id => new Promise((res, rej) => {
          const d = store.delete(id);
          d.onsuccess = () => res();
          d.onerror = () => rej(d.error);
        }))).then(() => {
          resolve(toDelete.length);
          db.close();
        }).catch(err => {
          reject(err);
          db.close();
        });
      }
    };
    req.onerror = () => {
      reject(req.error);
      db.close();
    };
  }));
}

async function getQueueSize() {
  const all = await getAllRequests();
  return all.length;
}

async function serializeRequest(request) {
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.clone().text();
    } catch (_) {
      body = null; // Se não conseguirmos clonar o body, ignoramos
    }
  }

  const url = request.url;
  const method = request.method;
  const key = `${method} ${url}`; // chave p/ deduplicação simples (última escrita vence)

  return {
    url,
    method,
    headers,
    body,
    key,
    timestamp: Date.now(),
  };
}

function reconstructRequest(entry) {
  const headers = new Headers(entry.headers || {});
  const init = { method: entry.method, headers };
  if (entry.body != null && entry.method !== 'GET' && entry.method !== 'HEAD') {
    init.body = entry.body;
  }
  return new Request(entry.url, init);
}

async function queueRequest(request) {
  const record = await serializeRequest(request);
  // Deduplicação: remove entradas com a mesma chave antes de inserir
  try { await deleteByKey(record.key); } catch (_) {}
  await addRequest(record);
  await notifyClientsQueued();
}

async function replayQueued() {
  const items = await getAllRequests();
  let successCount = 0;
  for (const item of items) {
    try {
      const req = reconstructRequest(item);
      const res = await fetch(req);
      if (res && res.ok) {
        await deleteRequest(item.id);
        successCount += 1;
      }
      // Se não OK, mantemos na fila para próxima sincronização
    } catch (_) {
      // Mantém na fila
    }
  }
  await notifyClientsReplayed(successCount);
}

async function broadcastMessage(message) {
  const clientsList = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  for (const client of clientsList) {
    try { client.postMessage(message); } catch (_) {}
  }
}

async function notifyClientsQueued() {
  const count = await getQueueSize();
  await broadcastMessage({ type: 'BG_SYNC_QUEUED', count });
}

async function notifyClientsReplayed(successCount) {
  const count = await getQueueSize();
  await broadcastMessage({ type: 'BG_SYNC_REPLAYED', successCount, count });
}

self.addEventListener('sync', (event) => {
  if ((event.tag || '') === SYNC_TAG) {
    event.waitUntil(replayQueued());
  }
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data && data.type === 'BG_SYNC_GET_COUNT') {
    event.waitUntil((async () => {
      const count = await getQueueSize();
      await broadcastMessage({ type: 'BG_SYNC_COUNT', count });
    })());
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const method = req.method;
  const isWrite = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
  if (isWrite && req.url.startsWith(API_BASE)) {
    event.respondWith((async () => {
      try {
        // Tenta enviar normalmente
        return await fetch(req.clone());
      } catch (_) {
        // Offline ou falha de rede: coloca na fila e retorna 202
        try {
          await queueRequest(req);
          if (self.registration && 'sync' in self.registration) {
            try { await self.registration.sync.register(SYNC_TAG); } catch (_) {}
          }
        } catch (_) {
          // Se falhar ao enfileirar, retorna erro padrão
          return new Response(JSON.stringify({ queued: false, offline: true }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ queued: true, offline: true }), {
          status: 202,
          headers: {
            'Content-Type': 'application/json',
            'X-Background-Sync': 'queued'
          }
        });
      }
    })());
  }
});