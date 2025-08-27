export interface EntregaResponse {
  id: number;
  nomeConsumidor: string;
  nomeProduto: string;
  nomeEntregador: string;
  quantidade: number;
  horarioEntrega: string;    // Horário de entrega em formato de string ISO
  produtoId: number;         // ID do produto
  consumidorId: number;      // ID do consumidor

  /**
   * Valor total da entrega (preço unitário * quantidade),
   * calculado e retornado pelo backend.
   */
  total: number;
}
