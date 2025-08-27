// src/app/models/entrega-com-aviso-response.model.ts
import { EntregaResponse } from './entrega-response.model';

export interface EntregaComAvisoResponse {
  entrega: EntregaResponse;
  mensagemEstoqueBaixo: string | null; // O nome bate com o backend
}
