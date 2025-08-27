// src/app/models/page-categoria-response.model.ts
import { Categoria } from './categoria.model';

export interface PageCategoriaResponse {
  content: Categoria[];      // Lista de categorias
  totalPages: number;        // Número total de páginas
  totalElements: number;     // Número total de elementos
  first: boolean;            // Se é a primeira página
  last: boolean;             // Se é a última página
  size: number;              // Tamanho da página
  number: number;            // Número da página atual
  numberOfElements: number;  // Número de elementos na página atual
  empty: boolean;            // Se a resposta está vazia
}
