import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';
import { fromEvent, merge, Observable } from 'rxjs';
import { map, startWith, distinctUntilChanged, filter } from 'rxjs/operators';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Gerenciamento De Estoque';
  menuAberto = false;
  online$: Observable<boolean> = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  ).pipe(startWith(navigator.onLine), distinctUntilChanged());

  // Contador da fila de BG Sync reportado pelo Service Worker
  queueCount = 0;

  constructor(public authService: AuthService, private swUpdate: SwUpdate, private snack: MatSnackBar, private zone: NgZone) {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          const ref = this.snack.open('Nova versão disponível', 'Atualizar', { duration: 10000 });
          ref.onAction().subscribe(() => {
            this.swUpdate.activateUpdate().then(() => document.location.reload());
          });
        });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.swUpdate.checkForUpdate();
        }
      });
    }

    // Ouve mensagens do Service Worker para atualizar o contador da fila
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
        const data: any = event.data || {};
        if (data && (data.type === 'BG_SYNC_COUNT' || data.type === 'BG_SYNC_QUEUED' || data.type === 'BG_SYNC_REPLAYED')) {
          const count = Number(data.count) || 0;
          this.zone.run(() => {
            this.queueCount = count;
            // Mensagens amigáveis opcionais
            if (data.type === 'BG_SYNC_QUEUED') {
              this.snack.open('Requisição enfileirada para sincronização', 'OK', { duration: 3500 });
            }
            if (data.type === 'BG_SYNC_REPLAYED' && (data.successCount || 0) > 0) {
              this.snack.open(`${data.successCount} operação(ões) sincronizada(s) com o servidor`, 'OK', { duration: 3500 });
            }
          });
        }
      });

      // Solicita o count atual após pronto/controlado
      navigator.serviceWorker.ready.then(() => {
        navigator.serviceWorker.controller?.postMessage({ type: 'BG_SYNC_GET_COUNT' });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Quando um novo SW assume o controle
        setTimeout(() => navigator.serviceWorker.controller?.postMessage({ type: 'BG_SYNC_GET_COUNT' }), 500);
      });
    }
  }

  // Verifica se o usuário está logado
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Obtém o nome do usuário logado, com fallback
  get userName(): string {
    const user = this.authService.getLoggedUser();
    return user?.username || 'Usuário';
  }

  // Verifica se o usuário é admin
  get isAdmin(): boolean {
    const user = this.authService.getLoggedUser();
    if (!user || !Array.isArray(user.roles)) return false;
    try {
      return user.roles.some((role: any) => {
        if (typeof role === 'string') return role === 'ROLE_ADMIN';
        return role?.name === 'ROLE_ADMIN' || role?.authority === 'ROLE_ADMIN' || role?.role === 'ROLE_ADMIN';
      });
    } catch {
      return false;
    }
  }

  // Faz logout
  logout(): void {
    this.authService.logout();
  }
}
