import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';

export const BgSyncInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const bgHeader = event.headers.get('X-Background-Sync');
        if (event.status === 202 || (bgHeader && bgHeader.toLowerCase() === 'queued')) {
          snack.open('Requisição enfileirada para sincronização', 'OK', { duration: 3000 });
        }
      }
    })
  );
};