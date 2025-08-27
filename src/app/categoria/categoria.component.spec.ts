
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';  // Certifique-se de que você tem esse modelo

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:8080/api/categorias'; // Substitua pela URL correta da sua API

  constructor(private http: HttpClient) {}

  // Listar categorias
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // Criar nova categoria
  criarCategoria(nome: string): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, { nome }, { headers: this.getAuthHeaders() });
  }

  // Deletar categoria
  deletarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Adicionando o token ao cabeçalho para autenticação
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken'); // Obtendo o token JWT do localStorage
    if (!token) {
      throw new Error('Token não encontrado');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
