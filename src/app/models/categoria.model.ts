// src/app/models/categoria.model.ts
export class Categoria {
  constructor(
    public id: number,  // ID da categoria
    public nome: string,  // Nome da categoria
    public descricao?: string | null,  // Opcional, pois não está na resposta da API
    public criadoEm?: string,  // Opcional, pois não está na resposta da API
    public orgId?: number  // Opcional, pois não está na resposta da API
  ) {}
}
