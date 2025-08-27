
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl; // Base da URL da API

  constructor(private http: HttpClient) {}

  // Função genérica para GET
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`);
  }

  // Função genérica para POST
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body);
  }

  // Função genérica para PUT
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body);
  }

  // Função genérica para DELETE
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`);
  }

  // Função para adicionar cabeçalhos com token de autenticação (se necessário)
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken'); // Usando 'jwtToken' como chave
    return new HttpHeaders({
      Authorization: `Bearer ${token}`, // Adiciona o token JWT
      'Content-Type': 'application/json',
    });
  }

  // Função POST com autenticação
  postWithAuth<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body, {
      headers: this.getHeaders(),
    });
  }

  // Função de login, enviando o username, senha e orgId
  login(username: string, senha: string, orgId: number): Observable<any> {
    const body = {
      username: username,
      senha: senha,
      orgId: orgId, // Adiciona o orgId aqui
    };

    return this.http.post<any>(`${this.apiUrl}/login`, body);
  }
}
