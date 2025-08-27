// src/app/models/consumer-paged-response.model.ts
import { Consumer } from './consumer.model';

/**
 * Interface para a resposta paginada de consumidores.
 */
export interface ConsumerPagedResponse {
  content: Consumer[];  // Lista de consumidores na página atual
  totalElements: number;  // Total de consumidores disponíveis na API
  totalPages: number;  // Total de páginas disponíveis
  size: number;  // Tamanho da página (quantidade de itens por página)
  number: number;  // Página atual (baseada em zero, ou seja, 0 representa a primeira página)
  first: boolean;  // Indica se é a primeira página
  last: boolean;   // Indica se é a última página
  pageable: {
    pageNumber: number;  // Página atual (baseada em zero)
    pageSize: number;  // Tamanho da página
    sort: {
      sorted: boolean;  // Se a resposta foi ordenada
      unsorted: boolean;  // Se a resposta não foi ordenada
    };
  };
  numberOfElements: number;  // Número de elementos na página atual
}

