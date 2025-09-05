import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offline',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="offline-page">
      <mat-icon>cloud_off</mat-icon>
      <h1>Você está offline</h1>
      <p>Algumas funcionalidades podem não estar disponíveis.
         Tente novamente quando a conexão voltar.</p>
      <button mat-raised-button color="primary" (click)="reload()">
        Tentar novamente
      </button>
    </div>
  `,
  styles: [`
    .offline-page {
      min-height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 12px;
      text-align: center;
      padding: 16px;
    }
    mat-icon { font-size: 64px; height: 64px; width: 64px; color: #b45309; }
    h1 { margin: 0; font-size: 1.8rem; }
    p { margin: 0; color: #444; }
  `]
})
export class OfflineComponent {
  constructor(private router: Router) {}
  reload() {
    if (navigator.onLine) {
      this.router.navigateByUrl('/');
    } else {
      window.location.reload();
    }
  }
}