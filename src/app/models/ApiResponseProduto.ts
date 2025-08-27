import { Produto } from "./produto.model";

export class ApiResponseProduto {
    constructor(
      public content: Produto, // Lista de produtos
      public pageable: Pageable,  // Dados de paginação
      public totalPages: number,
      public totalElements: number,
      public last: boolean,
      public size: number,
      public number: number,
      public first: boolean,
      public numberOfElements: number,
      public empty: boolean
    ) {}
  }
  
  export class Pageable {
    constructor(
      public pageNumber: number,
      public pageSize: number,
      public sort: Sort,
      public offset: number,
      public paged: boolean,
      public unpaged: boolean
    ) {}
  }
  
  export class Sort {
    constructor(
      public empty: boolean,
      public sorted: boolean,
      public unsorted: boolean
    ) {}
  }
  