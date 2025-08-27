import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { jwtDecode } from 'jwt-decode';  // Importando jwt-decode corretamente
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private apiService: ApiService, private router: Router) {}

  /**
   * Realiza o login e armazena os dados recebidos (token, usuário e roles).
   */
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', data).pipe(
      tap((response: LoginResponse) => {
        if (response && response.token) {
          // Armazena o token JWT
          localStorage.setItem('jwtToken', response.token);

          // Decodificar o token JWT
          const decodedToken: any = jwtDecode(response.token);
          
          // Log apenas em desenvolvimento
          if (!environment.production) {
            console.log('Token Decodificado:', decodedToken);
          }
          
          const userInfo = {
            username: decodedToken.sub,
            userId: decodedToken.user_id,
            orgId: decodedToken.org_id,
            roles: decodedToken.roles || []
          };

          // Log apenas em desenvolvimento
          if (!environment.production) {
            console.log('Informações do Usuário:', userInfo);
          }

          // Armazenando o usuário no localStorage
          localStorage.setItem('loggedUser', JSON.stringify(userInfo));

          // Redireciona para a home
          this.router.navigate(['/home']);
        }
      }),
      catchError((err) => {
        console.error('Erro ao fazer login:', err);
        window.alert('Erro ao tentar fazer login. Verifique suas credenciais.');
        this.router.navigate(['/login']);
        return of({ token: '', roles: [] });
      })
    );
  }

  /**
   * Realiza o registro de um novo usuário.
   */
  register(data: any): Observable<any> {
    return this.apiService.postWithAuth('/auth/register', data);
  }

  /**
   * Retorna os dados do usuário logado a partir do localStorage.
   */
  getLoggedUser(): any {
    const userData = localStorage.getItem('loggedUser');
    
    // Remover log verboso - só loggar em caso de debug específico
    // if (!environment.production) {
    //   console.log('Dados do Usuário Recuperados do localStorage:', userData);
    // }

    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Remove os dados de autenticação e redireciona para a tela de login.
   */
  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loggedUser');
    this.router.navigate(['/login']);
  }

  /**
   * Verifica se o usuário está autenticado.
   */
  isLoggedIn(): boolean {
    const loggedIn = !!localStorage.getItem('jwtToken');
    
    // Remover log verboso - só loggar em caso de debug específico
    // if (!environment.production) {
    //   console.log('Usuário Logado:', loggedIn);
    // }

    return loggedIn;
  }
}
