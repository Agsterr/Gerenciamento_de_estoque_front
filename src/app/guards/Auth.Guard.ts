import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | import('@angular/router').UrlTree> | Promise<boolean | import('@angular/router').UrlTree> | boolean | import('@angular/router').UrlTree {
    // Permite acesso livre à rota de login
    if (route.routeConfig && route.routeConfig.path === 'login') {
      return true;
    }

    // Se não está logado, redireciona para login via UrlTree (sem navegar aqui)
    const token = localStorage.getItem('jwtToken');
    if (!this.authService.isLoggedIn() || !token) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedUser');
      return this.router.createUrlTree(['/login']);
    }

    // Verifica validade do token JWT
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        // Token expirado -> limpar storage e redirecionar
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('loggedUser');
        return this.router.createUrlTree(['/login']);
      }
    } catch (e) {
      // Token inválido -> limpar storage e redirecionar
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedUser');
      return this.router.createUrlTree(['/login']);
    }

    const loggedUser = this.authService.getLoggedUser();

    // Se não há usuário logado ou estrutura inválida, redireciona para login
    if (!loggedUser || !Array.isArray(loggedUser.roles)) {
      return this.router.createUrlTree(['/login']);
    }

    // Usuário autenticado tem acesso às rotas protegidas por AuthGuard (não exige ROLE_ADMIN)
    return true;
  }
}
