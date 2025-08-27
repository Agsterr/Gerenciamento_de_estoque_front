// src/app/models/entrega-request.model.ts
export interface EntregaRequest {
  produtoId: number;
  quantidade: number;
  consumidorId: number;
  horarioEntrega?: string;  // ISO 8601 string, opcional
}