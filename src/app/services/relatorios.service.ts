import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RelatoriosService {
  private readonly baseUrl = `${environment.apiUrl}/relatorios`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) throw new Error('Token não encontrado. Faça login.');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Produtos - Estoque Baixo
  estoqueBaixoPdf(): Observable<Blob> {
    const headers = this.getAuthHeaders().set('Accept', 'application/pdf');
    return this.http.get(`${this.baseUrl}/estoque-baixo.pdf`, {
      responseType: 'blob',
      headers,
    });
  }

  estoqueBaixoXlsx(): Observable<Blob> {
    const headers = this.getAuthHeaders().set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return this.http.get(`${this.baseUrl}/estoque-baixo.xlsx`, {
      responseType: 'blob',
      headers,
    });
  }

  // Entregas por período - Backend espera OffsetDateTime (ISO 8601 com timezone)
  entregasPeriodoPdf(inicioISO: string, fimISO: string): Observable<Blob> {
    const params = new HttpParams().set('inicio', inicioISO).set('fim', fimISO);
    const headers = this.getAuthHeaders().set('Accept', 'application/pdf');
    return this.http.get(`${this.baseUrl}/entregas-periodo.pdf`, {
      params,
      responseType: 'blob',
      headers,
    });
  }

  entregasPeriodoXlsx(inicioISO: string, fimISO: string): Observable<Blob> {
    const params = new HttpParams().set('inicio', inicioISO).set('fim', fimISO);
    const headers = this.getAuthHeaders().set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return this.http.get(`${this.baseUrl}/entregas-periodo.xlsx`, {
      params,
      responseType: 'blob',
      headers,
    });
  }

  // Entregas do dia - Backend espera LocalDate (ISO DATE)
  entregasDiaPdf(diaISO: string): Observable<Blob> {
    const params = new HttpParams().set('dia', diaISO);
    const headers = this.getAuthHeaders().set('Accept', 'application/pdf');
    return this.http.get(`${this.baseUrl}/entregas-dia.pdf`, {
      params,
      responseType: 'blob',
      headers,
    });
  }

  // Entregas por mês
  entregasMesPdf(ano: number, mes: number): Observable<Blob> {
    const params = new HttpParams().set('ano', ano.toString()).set('mes', mes.toString());
    const headers = this.getAuthHeaders().set('Accept', 'application/pdf');
    return this.http.get(`${this.baseUrl}/entregas-mes.pdf`, {
      params,
      responseType: 'blob',
      headers,
    });
  }

  entregasMesXlsx(ano: number, mes: number): Observable<Blob> {
    const params = new HttpParams().set('ano', ano.toString()).set('mes', mes.toString());
    const headers = this.getAuthHeaders().set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return this.http.get(`${this.baseUrl}/entregas-mes.xlsx`, {
      params,
      responseType: 'blob',
      headers,
    });
  }

  // Entregas por ano
  entregasAnoPdf(ano: number): Observable<Blob> {
    const params = new HttpParams().set('ano', ano.toString());
    const headers = this.getAuthHeaders().set('Accept', 'application/pdf');
    return this.http.get(`${this.baseUrl}/entregas-ano.pdf`, {
      params,
      responseType: 'blob',
      headers,
    });
  }

  entregasAnoXlsx(ano: number): Observable<Blob> {
    const params = new HttpParams().set('ano', ano.toString());
    const headers = this.getAuthHeaders().set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return this.http.get(`${this.baseUrl}/entregas-ano.xlsx`, {
      params,
      responseType: 'blob',
      headers,
    });
  }

  // Movimentações por mês
  movimentacoesMesPdf(ano: number, mes: number): Observable<Blob> {
    const params = new HttpParams().set('ano', ano.toString()).set('mes', mes.toString());
    const headers = this.getAuthHeaders().set('Accept', 'application/pdf');
    return this.http.get(`${this.baseUrl}/movimentacoes-mes.pdf`, {
      params,
      responseType: 'blob',
      headers,
    });
  }

  movimentacoesMesXlsx(ano: number, mes: number): Observable<Blob> {
    const params = new HttpParams().set('ano', ano.toString()).set('mes', mes.toString());
    const headers = this.getAuthHeaders().set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return this.http.get(`${this.baseUrl}/movimentacoes-mes.xlsx`, {
      params,
      responseType: 'blob',
      headers,
    });
  }
}