import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor'; // Substitua pelo caminho correto do interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Configura as rotas
    provideHttpClient(
      withInterceptors([AuthInterceptor]) // Registra o interceptor
    ),
    provideAnimations() // Necessário para o MatDialog
  ],
};

