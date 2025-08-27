
 // src/app/models/login-response.model.ts
export interface Role {
  id: number;
  nome: string;
  org: {
    id: number;
    nome: string;
    ativo: boolean;
  };
}

export interface LoginResponse {
  token: string; // Token JWT retornado pelo backend
  roles: Role[]; // Roles do usuário
  userId?: number; // ID do usuário autenticado (opcional)
  username?: string; // Nome do usuário (opcional)
}
 