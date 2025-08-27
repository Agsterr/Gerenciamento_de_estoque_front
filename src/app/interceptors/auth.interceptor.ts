import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwtToken');  // Usando 'jwtToken' para buscar o token armazenado

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);  // Envia a requisição clonada com o cabeçalho de Authorization
  }

  return next(req);  // Caso não haja token, apenas passa a requisição original
};
