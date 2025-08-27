// src/app/models/produto.model.ts
export class Produto {
  constructor(
    public id: number,
    public nome: string,
    public descricao: string,
    public preco: number,
    public quantidade: number,
    public quantidadeMinima: number,
    public categoriaId: number,
    public categoriaNome: string, // <- Preencher separadamente (precisa ser incluído no DTO se quiser vir do back)
    public orgId: number,
    public ativo: boolean,
    public criadoEm: string,
    public status: string // <- Ex: 'Estoque Baixo', 'Normal'
  ) {}

  /**
   * Método auxiliar para determinar status com base em quantidade e quantidadeMinima.
   */
  static fromDto(dto: any): Produto {
    const status = dto.estoqueBaixo ? 'Estoque Baixo' : 'Normal';
    return new Produto(
      dto.id,
      dto.nome,
      dto.descricao || '',
      dto.preco,
      dto.quantidade,
      dto.quantidadeMinima,
      dto.categoriaId,
      dto.categoriaNome || '', // ⚠️ você pode precisar buscar essa info via outro endpoint
      dto.orgId,
      dto.ativo ?? true,
      dto.criadoEm,
      status
    );
  }
}
