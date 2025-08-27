import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';  // Importando CommonModule
import { FormsModule } from '@angular/forms';  // Importando FormsModule
import { EntregasService } from '../../services/entregas.service'; // Importando o serviço
import { EntregaResponse } from '../../models/src/app/models/entrega/entrega-response.model'; // Modelos de resposta

@Component({
  selector: 'app-busca-entrega',
  standalone: true, // Tornando o componente standalone
  imports: [CommonModule, FormsModule], // Importando os módulos necessários
  templateUrl: './busca-entrega.component.html',
  styleUrls: ['./busca-entrega.component.scss']
})
export class BuscaEntregaComponent {
  @Output() buscar = new EventEmitter<{
    filtro: string;
    entregas: EntregaResponse[]; // Tipo que pode ser um array de entregas
  }>();

  // Filtros de busca
  dataInicio: string = '';
  dataFim: string = '';
  mes: number | null = null;
  ano: number | null = null;
  produtoId: number | null = null;
  consumidorId: number | null = null;

  // Lista de entregas filtradas
  entregas: EntregaResponse[] = [];
  
  // Flags de estado
  isSearched: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private entregasService: EntregasService) {}

  // Método para formatar as datas no formato ISO
  formatarDataISO(data: string): string {
    const date = new Date(data);
    return date.toISOString();  // Retorna a data no formato ISO
  }

  // Método para validar datas
  validarDatas(dataInicio: string, dataFim: string): boolean {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    if (inicio > fim) {
      this.errorMessage = 'A data de início não pode ser maior que a data de fim.';
      return false;
    }
    
    return true;
  }

  // Método para validar mês e ano
  validarMesAno(mes: number, ano: number): boolean {
    const anoAtual = new Date().getFullYear();
    
    if (mes < 1 || mes > 12) {
      this.errorMessage = 'O mês deve estar entre 1 e 12.';
      return false;
    }
    
    if (ano < 2020 || ano > anoAtual + 1) {
      this.errorMessage = `O ano deve estar entre 2020 e ${anoAtual + 1}.`;
      return false;
    }
    
    return true;
  }

  // Método para limpar mensagens de erro
  limparErro(): void {
    this.errorMessage = '';
  }

  // Método para buscar entregas por período (data)
  onBuscarPorPeriodo() {
    this.limparErro();
    
    if (!this.dataInicio || !this.dataFim) {
      this.errorMessage = 'Por favor, preencha ambas as datas.';
      return;
    }

    if (!this.validarDatas(this.dataInicio, this.dataFim)) {
      return;
    }

    this.isLoading = true;
    const inicioISO = this.formatarDataISO(this.dataInicio);
    const fimISO = this.formatarDataISO(this.dataFim);

    this.entregasService.porPeriodo(inicioISO, fimISO).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (Array.isArray(response.content)) {
          this.entregas = response.content;  // Atualiza as entregas com o conteúdo da resposta
          this.isSearched = true;  // Marca como busca realizada
          this.emitirResultados('porPeriodo');
        } else {
          this.entregas = [];  // Se não for um array válido, limpa as entregas
          this.isSearched = true;  // Marca como busca realizada
          this.emitirResultados('porPeriodo');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao buscar entregas por período', error);
        this.errorMessage = 'Erro ao buscar entregas. Tente novamente.';
        this.entregas = [];  // Limpa as entregas em caso de erro
        this.isSearched = true;  // Marca como busca realizada
        this.emitirResultados('porPeriodo');
      }
    });
  }

  // Método para buscar entregas por mês e ano
  onBuscarPorMesAno() {
    this.limparErro();
    
    if (!this.mes || !this.ano) {
      this.errorMessage = 'Por favor, preencha o mês e o ano.';
      return;
    }

    if (!this.validarMesAno(this.mes, this.ano)) {
      return;
    }

    this.isLoading = true;
    this.entregasService.porMes(this.mes, this.ano).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (Array.isArray(response.content)) {
          this.entregas = response.content;  // Atualiza as entregas com o conteúdo da resposta
          this.isSearched = true;  // Marca como busca realizada
          this.emitirResultados('porMesAno');
        } else {
          this.entregas = [];  // Se não for um array válido, limpa as entregas
          this.isSearched = true;  // Marca como busca realizada
          this.emitirResultados('porMesAno');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao buscar entregas por mês e ano', error);
        this.errorMessage = 'Erro ao buscar entregas. Tente novamente.';
        this.entregas = [];  // Limpa as entregas em caso de erro
        this.isSearched = true;  // Marca como busca realizada
        this.emitirResultados('porMesAno');
      }
    });
  }

  // Método para buscar entregas por produto
  onBuscarPorProduto() {
    this.limparErro();
    
    if (!this.produtoId) {
      this.errorMessage = 'Por favor, informe o ID do produto.';
      return;
    }

    if (this.produtoId <= 0) {
      this.errorMessage = 'O ID do produto deve ser maior que zero.';
      return;
    }

    this.isLoading = true;
    this.entregasService.porProduto(this.produtoId, 1, 0, 20).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.entregas = data.content; // Atualiza as entregas com a resposta paginada
        this.isSearched = true;  // Marca como busca realizada
        this.emitirResultados('porProduto');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao buscar entregas por produto', error);
        this.errorMessage = 'Erro ao buscar entregas. Tente novamente.';
        this.entregas = [];
        this.isSearched = true;
        this.emitirResultados('porProduto');
      }
    });
  }

  // Método para buscar entregas por consumidor
  onBuscarPorConsumidor() {
    this.limparErro();
    
    if (!this.consumidorId) {
      this.errorMessage = 'Por favor, informe o ID do consumidor.';
      return;
    }

    if (this.consumidorId <= 0) {
      this.errorMessage = 'O ID do consumidor deve ser maior que zero.';
      return;
    }

    this.isLoading = true;
    this.entregasService.porConsumidor(this.consumidorId).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (Array.isArray(response.content)) {
          this.entregas = response.content;  // Atualiza as entregas com a resposta
          this.isSearched = true;  // Marca como busca realizada
          this.emitirResultados('porConsumidor');
        } else {
          this.entregas = [];  // Limpa as entregas se a resposta não for válida
          this.isSearched = true;  // Marca como busca realizada
          this.emitirResultados('porConsumidor');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao buscar entregas por consumidor', error);
        this.errorMessage = 'Erro ao buscar entregas. Tente novamente.';
        this.entregas = [];  // Limpa as entregas em caso de erro
        this.isSearched = true;  // Marca como busca realizada
        this.emitirResultados('porConsumidor');
      }
    });
  }

  // Emitir os resultados para o componente pai
  emitirResultados(filtro: string): void {
    this.buscar.emit({
      filtro: filtro,
      entregas: this.entregas
    });
  }

  // Método para limpar os filtros
  limparFiltros() {
    // Limpa todos os filtros
    this.dataInicio = '';
    this.dataFim = '';
    this.mes = null;
    this.ano = null;
    this.produtoId = null;
    this.consumidorId = null;
    this.isSearched = false;  // Marca como não buscado
    this.errorMessage = '';   // Limpa mensagens de erro
    
    // Emite o evento para o componente pai recarregar as entregas
    this.emitirResultados('limpar');
  }

  // Método para submeter o formulário
  onSubmit() {
    this.onBuscarPorPeriodo();
  }

  // Método para submeter o formulário de mês/ano
  onSubmitMesAno() {
    this.onBuscarPorMesAno();
  }
}
