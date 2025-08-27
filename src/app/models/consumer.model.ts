// src/app/models/consumer.model.ts

/**
 * Interface que representa a estrutura de um consumidor (Consumer)
 * utilizada em todo o frontend Angular.
 */
export interface Consumer {
  id: number;               // Identificador único do consumidor
  nome: string;             // Nome completo do consumidor
  cpf: string;              // CPF (formato: 11 dígitos)
  endereco: string | null;  // Endereço do consumidor, pode ser nulo
  orgId: number | null;     // ID da organização associada (pode ser null)
}
