// src/app/services/consumidor.service.ts
import { Injectable } from '@angular/core';
import {
	HttpClient,
	HttpHeaders,
	HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Consumer } from '../models/consumer.model';
import { ConsumerPagedResponse } from '../models/consumer-paged-response.model';  // ajuste o nome se o seu arquivo for PascalCase
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ConsumidorService {
	private apiUrl = `${environment.apiUrl}/consumidores`;

	constructor(private http: HttpClient) {}

	/* ---------- Helpers ---------- */

	private getAuthHeaders(): HttpHeaders {
		const token = localStorage.getItem('jwtToken');
		if (!token) throw new Error('Token não encontrado. Faça login.');
		return new HttpHeaders().set('Authorization', `Bearer ${token}`);
	}

	public getOrgId(): string {
		const token = localStorage.getItem('jwtToken');
		if (!token) throw new Error('Token não encontrado.');
		const payload = this.decodeJwt(token);
		if (payload?.org_id) return payload.org_id;
		throw new Error('OrgId não encontrado no token.');
	}

	private decodeJwt(token: string): any {
		const [header, payload, sig] = token.split('.');
		if (!payload) throw new Error('Token JWT inválido.');
		return JSON.parse(atob(payload));
	}

	/* ---------- Operações ---------- */

	/** Apenas o array de consumidores (sem metadados) */
	listarConsumidores(
		page: number = 0,
		size: number = 10
	): Observable<Consumer[]> {
		const headers = this.getAuthHeaders();
		const params  = new HttpParams()
			.set('page', page.toString())
			.set('size', size.toString());

		return this.http
			.get<{ content: Consumer[] }>(this.apiUrl, { headers, params })
			.pipe(
				map(resp => resp.content), // Extrai o array 'content' de consumidores
				catchError(err => {
					console.error('Erro ao listar consumidores:', err);
					return throwError(() => new Error('Falha ao carregar consumidores.'));
				})
			);
	}

	/** Array + metadados de paginação (resolve NaN) */
	listarConsumidoresPaged(
		page: number = 0,
		size: number = 10
	): Observable<ConsumerPagedResponse> {
		const headers = this.getAuthHeaders();
		const params  = new HttpParams()
			.set('page', page.toString())
			.set('size', size.toString());

		return this.http
			.get<ConsumerPagedResponse>(this.apiUrl, { headers, params })
			.pipe(
				catchError(err => {
					console.error('Erro ao listar consumidores paginados:', err);
					return throwError(() => new Error('Falha ao carregar consumidores.'));
				})
			);
	}

	getById(id: number): Observable<Consumer> {
		const headers = this.getAuthHeaders();
		return this.http
			.get<Consumer>(`${this.apiUrl}/${id}`, { headers })
			.pipe(
				catchError(err => {
					console.error('Erro ao buscar consumidor por ID:', err);
					return throwError(() => new Error('Falha ao carregar consumidor.'));
				})
			);
	}

	criarConsumidor(consumidor: Partial<Consumer>): Observable<Consumer> {
		const headers = this.getAuthHeaders();
		const body    = { ...consumidor, orgId: this.getOrgId() };

		return this.http
			.post<Consumer>(this.apiUrl, body, { headers })
			.pipe(
				catchError(err => {
					console.error('Erro ao criar consumidor:', err);
					return throwError(() => new Error('Erro ao criar consumidor.'));
				})
			);
	}

	editarConsumidor(consumidor: Partial<Consumer>): Observable<Consumer> {
		if (!consumidor.id) {
			return throwError(() => new Error('ID do consumidor ausente.'));
		}
		const headers = this.getAuthHeaders();
		const body    = { ...consumidor, orgId: this.getOrgId() };

		return this.http
			.put<Consumer>(`${this.apiUrl}/${consumidor.id}`, body, { headers })
			.pipe(
				catchError(err => {
					console.error('Erro ao editar consumidor:', err);
					return throwError(() => new Error('Erro ao editar consumidor.'));
				})
			);
	}

	deletarConsumidor(id: number): Observable<void> {
		const headers = this.getAuthHeaders();
		return this.http
			.delete<void>(`${this.apiUrl}/${id}`, { headers })
			.pipe(
				catchError(err => {
					console.error('Erro ao deletar consumidor:', err);
					return throwError(() => new Error('Erro ao deletar consumidor.'));
				})
			);
	}
}
