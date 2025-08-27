// src/app/models/login-request.model.ts

export interface LoginRequest {
  username: string; // Nome de usuário (obrigatório)
  senha: string;    // Senha do usuário (obrigatória)
  orgId: number;    // ID da organização (obrigatório)
}
