// src/app/services/entregas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EntregaResponse } from '../models/src/app/models/entrega/entrega-response.model';
import { PageEntregaResponse } from '../models/src/app/models/entrega/PageEntregaResponse.model';
import { EntregaRequest } from '../models/src/app/models/entrega/entrega-request.model';
import { EntregaComAvisoResponse } from '../models/src/app/models/entrega/entrega-com-aviso-response.model';

@Injectable({
  providedIn: 'root'
})
export class EntregasService {
  private apiUrl = 'http://localhost:8081/entregas';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      throw new Error('Token não encontrado. Usuário não autenticado.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any) {
    console.error('Erro na requisição:', error);
    return throwError(() => error);
  }

  listarEntregas(page: number, size: number): Observable<PageEntregaResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageEntregaResponse>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  criarEntrega(entrega: EntregaRequest): Observable<EntregaComAvisoResponse> {
    return this.http.post<EntregaComAvisoResponse>(this.apiUrl, entrega, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  editarEntrega(id: number, entrega: EntregaRequest): Observable<EntregaResponse> {
    return this.http.put<EntregaResponse>(`${this.apiUrl}/${id}`, entrega, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  deletarEntrega(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  porDia(dia: string): Observable<EntregaResponse[]> {
    const params = new HttpParams().set('dia', dia);
    return this.http.get<EntregaResponse[]>(`${this.apiUrl}/por-dia`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  porPeriodo(inicio: string, fim: string): Observable<EntregaResponse[]> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fim', fim);
    return this.http.get<EntregaResponse[]>(`${this.apiUrl}/por-periodo`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  porMes(mes: number, ano: number): Observable<EntregaResponse[]> {
    const params = new HttpParams()
      .set('mes', mes)
      .set('ano', ano);
    return this.http.get<EntregaResponse[]>(`${this.apiUrl}/por-mes`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  porAno(ano: number): Observable<EntregaResponse[]> {
    const params = new HttpParams().set('ano', ano);
    return this.http.get<EntregaResponse[]>(`${this.apiUrl}/por-ano`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  porConsumidor(consumidorId: number): Observable<EntregaResponse[]> {
    return this.http.get<EntregaResponse[]>(`${this.apiUrl}/por-consumidor/${consumidorId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  porConsumidorPeriodo(consumidorId: number, inicio: string, fim: string): Observable<EntregaResponse[]> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fim', fim);
    return this.http.get<EntregaResponse[]>(`${this.apiUrl}/por-consumidor/${consumidorId}/periodo`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  porProduto(produtoId: number, orgId: number, page: number, size: number): Observable<PageEntregaResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orgId', orgId.toString());

    return this.http.get<PageEntregaResponse>(`${this.apiUrl}/por-produto/${produtoId}`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  porConsumidorAno(
    consumidorId: number,
    inicioAno: string,
    fimAno: string,
    orgId: number,
    page: number,
    size: number
  ): Observable<PageEntregaResponse> {
    const params = new HttpParams()
      .set('inicioAno', inicioAno)
      .set('fimAno', fimAno)
      .set('orgId', orgId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageEntregaResponse>(`${this.apiUrl}/consumidor/${consumidorId}/anual`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  porConsumidorMes(
    consumidorId: number,
    inicioMes: string,
    fimMes: string,
    orgId: number,
    page: number,
    size: number
  ): Observable<PageEntregaResponse> {
    const params = new HttpParams()
      .set('inicioMes', inicioMes)
      .set('fimMes', fimMes)
      .set('orgId', orgId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageEntregaResponse>(`${this.apiUrl}/consumidor/${consumidorId}/mensal`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  porOrganizacaoAno(
    inicioAno: string,
    fimAno: string,
    orgId: number,
    page: number,
    size: number
  ): Observable<PageEntregaResponse> {
    const params = new HttpParams()
      .set('inicioAno', inicioAno)
      .set('fimAno', fimAno)
      .set('orgId', orgId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageEntregaResponse>(`${this.apiUrl}/organizacao/anual`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  porOrganizacaoMes(
    inicioMes: string,
    fimMes: string,
    orgId: number,
    page: number,
    size: number
  ): Observable<PageEntregaResponse> {
    const params = new HttpParams()
      .set('inicioMes', inicioMes)
      .set('fimMes', fimMes)
      .set('orgId', orgId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageEntregaResponse>(`${this.apiUrl}/organizacao/mensal`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =========================
  // NOVOS MÉTODOS PARA TOTAIS
  // =========================

  /**
   * Obtém o total de entregas realizadas pela organização
   */
  getTotalEntregasRealizadas(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtém o total de entregas realizadas por um consumidor específico
   */
  getTotalEntregasPorConsumidor(consumidorId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total/consumidor/${consumidorId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtém o total de entregas realizadas com um produto específico
   */
  getTotalEntregasPorProduto(produtoId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total/produto/${produtoId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

}
