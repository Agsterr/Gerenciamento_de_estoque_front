import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Produto } from '../models/produto.model';
import { map, catchError } from 'rxjs/operators';
import { Categoria } from '../models/categoria.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private apiUrl = `${environment.apiUrl}/produtos`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) throw new Error('Token não encontrado. O usuário precisa estar autenticado.');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private getOrgId(): string {
    const token = localStorage.getItem('jwtToken');
    if (!token) throw new Error('Token não encontrado.');
    const payload = this.decodeJwt(token);
    if (payload?.org_id) return payload.org_id;
    throw new Error('OrgId não encontrado no token.');
  }

  private decodeJwt(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Token JWT inválido.');
    const payload = atob(parts[1]);
    return JSON.parse(payload);
  }

  // ✅ Listar todos os produtos (paginado)
  listarProdutos(page: number = 0, size: number = 10): Observable<{ content: Produto[], totalPages: number, currentPage: number, totalElements: number }> {
    const orgId = this.getOrgId();
    const headers = this.getAuthHeaders();

    return this.http.get<any>(`${this.apiUrl}?orgId=${orgId}&page=${page}&size=${size}`, { headers }).pipe(
      map(response => ({
        content: response.content,
        totalPages: response.totalPages,
        currentPage: response.number,
        totalElements: response.totalElements
      })),
      catchError(err => {
        console.error('Erro ao buscar produtos:', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Listar produtos com estoque baixo
  listarProdutosComEstoqueBaixo(): Observable<Produto[]> {
    const orgId = this.getOrgId();
    const headers = this.getAuthHeaders();

    return this.http.get<Produto[]>(`${this.apiUrl}/estoque-baixo?orgId=${orgId}`, { headers }).pipe(
      catchError(err => {
        console.error('Erro ao buscar produtos com estoque baixo:', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Buscar produto por ID
  getProdutoById(produtoId: number): Observable<Produto> {
    const orgId = this.getOrgId();
    const headers = this.getAuthHeaders();
    return this.http.get<Produto>(`${this.apiUrl}/${produtoId}?orgId=${orgId}`, { headers });
  }

  // ✅ Criar produto
  criarProduto(produto: Produto): Observable<Produto> {
    const orgId = this.getOrgId();
    const headers = this.getAuthHeaders().set('orgId', orgId.toString());
    const body = { ...produto };
    return this.http.post<Produto>(`${this.apiUrl}`, body, { headers });
  }

  // ✅ Atualizar produto
  atualizarProduto(produto: Produto, id: number): Observable<Produto> {
    const orgId = this.getOrgId();
    const headers = this.getAuthHeaders();
    // Inclui orgId no corpo do produto para o backend receber
    const body = { ...produto, orgId };
    // Passa orgId também como query param conforme sua API espera
    return this.http.put<Produto>(`${this.apiUrl}/${id}?orgId=${orgId}`, body, { headers });
  }

  // ✅ Atualizar quantidade
  atualizarProdutoQuantidade(produtoId: number, quantidade: number): Observable<Produto> {
    const orgId = this.getOrgId();
    const headers = this.getAuthHeaders();
    const body = { quantidade };
    return this.http.patch<Produto>(`${this.apiUrl}/${produtoId}/${orgId}/quantidade`, body, { headers });
  }

  // ✅ Deletar produto
  deletarProduto(produtoId: number): Observable<string> {
    const orgId = this.getOrgId();
    const headers = this.getAuthHeaders();
    return this.http.delete<string>(`${this.apiUrl}/${produtoId}?orgId=${orgId}`, { headers });
  }
}
