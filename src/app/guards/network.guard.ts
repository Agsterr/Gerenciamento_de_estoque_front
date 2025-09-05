import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

// Bloqueia navegação quando offline e redireciona para /offline
export const NetworkGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return router.parseUrl('/offline');
  }
  return true;
};