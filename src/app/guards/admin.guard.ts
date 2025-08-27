import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const user = this.authService.getLoggedUser();

    if (!environment.production) {
      // Logs somente em desenvolvimento para depuração
      console.log('Dados do Usuário Recuperados:', user);
    }

    if (!user || !user.roles) {
      if (!environment.production) {
        console.log('Usuário não encontrado ou roles não definidas');
      }
      return this.router.createUrlTree(['/login']);
    }

    const isAdmin = Array.isArray(user.roles) && user.roles.some((role: any) => {
      if (typeof role === 'string') return role === 'ROLE_ADMIN';
      if (role && typeof role === 'object' && 'nome' in role) return role.nome === 'ROLE_ADMIN';
      return false;
    });

    if (!environment.production) {
      console.log('Usuário tem a role ROLE_ADMIN?', isAdmin);
    }

    if (!isAdmin) {
      return this.router.createUrlTree(['/home'], { queryParams: { notice: 'admin_required' } });
    }

    return true;
  }
}
