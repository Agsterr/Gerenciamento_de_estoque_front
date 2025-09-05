import { ApplicationConfig, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor'; // Substitua pelo caminho correto do interceptor
import { provideServiceWorker } from '@angular/service-worker';
import { BgSyncInterceptor } from './interceptors/bg-sync.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Configura as rotas
    provideHttpClient(
      withInterceptors([AuthInterceptor, BgSyncInterceptor]) // Registra os interceptors
    ),
    provideAnimations(), // Necessário para o MatDialog e animações do Material
    importProvidersFrom(MatSnackBarModule), // Disponibiliza MatSnackBar no injetor raiz (usado no interceptor)
    provideServiceWorker('custom-sw.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
};

