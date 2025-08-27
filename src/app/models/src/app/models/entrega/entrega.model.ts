// src/app/models/entrega.model.ts

export interface Entrega {
  id: number;
  nomeConsumidor: string;
  nomeProduto: string;
  nomeEntregador: string;
  quantidade: number;
  horarioEntrega: string | null;
  produtoId: number;      // Adicione
  consumidorId: number;   // Adicione
}
