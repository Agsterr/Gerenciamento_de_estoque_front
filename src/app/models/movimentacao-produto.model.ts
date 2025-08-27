export interface MovimentacaoProduto {
  id: number;
  produtoId: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  dataHora: string; // Data e hora da movimentação
  orgId: number; // ID da organização
  nomeProduto: string; // Nome do produto
  usuarioId?: number; // ID do usuário que fez a movimentação
  nomeUsuario?: string; // Nome do usuário que fez a movimentação
  nomeConsumidor?: string; // Nome do consumidor (se vinculado a entrega)
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}

export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA'
}
