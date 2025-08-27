import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { OrgDto } from '../models/org.model';

@Injectable({ providedIn: 'root' })
export class OrgService {
  private apiUrl = `${environment.apiUrl}/api/orgs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<OrgDto[]> {
    return this.http.get<OrgDto[]>(`${this.apiUrl}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getById(id: number): Observable<OrgDto> {
    return this.http.get<OrgDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  create(nome: string): Observable<OrgDto> {
    return this.http.post<OrgDto>(`${this.apiUrl}`, { nome }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  update(id: number, nome: string): Observable<OrgDto> {
    return this.http.put<OrgDto>(`${this.apiUrl}/${id}`, { nome }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  ativar(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/ativar`, {}).pipe(
      catchError(err => throwError(() => err))
    );
  }

  desativar(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/desativar`, {}).pipe(
      catchError(err => throwError(() => err))
    );
  }
}