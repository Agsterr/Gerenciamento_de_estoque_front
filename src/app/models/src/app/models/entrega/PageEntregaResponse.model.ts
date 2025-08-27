import { EntregaResponse } from './entrega-response.model';

export interface PageEntregaResponse {
  content: EntregaResponse[];  // Lista de entregas
  totalPages: number;          // Número total de páginas
  totalElements: number;       // Número total de elementos
  first: boolean;              // Se esta é a primeira página
  last: boolean;               // Se esta é a última página
  size: number;                // Tamanho da página
  number: number;              // Número da página atual
  numberOfElements: number;    // Número de elementos na página atual
  pageable: {                  // Informações da paginação
    pageNumber: number;        // Número da página atual
    pageSize: number;          // Tamanho da página
    sort: {                    // Detalhes de ordenação
      empty: boolean;           // Se a ordenação está vazia
      sorted: boolean;          // Se a ordenação está ativa
      unsorted: boolean;        // Se a ordenação está desativada
    };
    offset: number;            // Deslocamento da página
    unpaged: boolean;          // Se não há paginação
    paged: boolean;            // Se a paginação está ativada
  };
  empty: boolean;              // Se a resposta está vazia
}
