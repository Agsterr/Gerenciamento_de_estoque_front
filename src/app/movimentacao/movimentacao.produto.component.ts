import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MovimentacaoProdutoService } from '../services/movimentacao-produto.service';
import { MovimentacaoProduto, TipoMovimentacao, PageResponse } from '../models/movimentacao-produto.model';
import { MovimentacaoModalComponent, MovimentacaoModalData } from './movimentacao-modal/movimentacao-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-movimentacao-produto',
  templateUrl: './movimentacao.produto.component.html',
  styleUrls: ['./movimentacao.produto.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule
  ]
})
export class MovimentacaoProdutoComponent implements OnInit {
  // ViewChild para o paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Constantes para tipos de movimentação
  readonly TIPO_MOVIMENTACAO_ENTRADA = TipoMovimentacao.ENTRADA;
  readonly TIPO_MOVIMENTACAO_SAIDA = TipoMovimentacao.SAIDA;

  // Dados da lista
  movimentacoes: MovimentacaoProduto[] = [];
  loading: boolean = false;

  // Parâmetros de paginação
  totalItems: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  // Filtros
  tipoMovimentacao: TipoMovimentacao = TipoMovimentacao.ENTRADA;
  tiposMovimentacao: TipoMovimentacao[] = [TipoMovimentacao.ENTRADA, TipoMovimentacao.SAIDA];
  data: Date | null = null;
  inicio: Date | null = null;
  fim: Date | null = null;
  ano: number | null = null;
  mes: number | null = null;
  nomeProduto: string = '';
  categoriaProduto: string = '';
  produtoId: number = 0;
  nomeConsumidor: string = '';

  constructor(
    private movimentacaoService: MovimentacaoProdutoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Carrega ambos os tipos por padrão para evitar lista vazia quando só há saídas
    this.buscarPorTiposAmbos();
  }

  private buscarPorTiposAmbos(): void {
    this.loading = true;
    this.movimentacaoService.buscarPorTipos([TipoMovimentacao.ENTRADA, TipoMovimentacao.SAIDA], this.pageIndex, this.pageSize)
      .subscribe({
        next: (response) => {
          let movimentacoesFiltradas = response.content || [];

          // Filtra por consumidor se especificado
          if (this.nomeConsumidor?.trim()) {
            const consumidorBusca = this.nomeConsumidor.trim().toLowerCase();
            movimentacoesFiltradas = movimentacoesFiltradas.filter(m => 
              m.nomeConsumidor?.toLowerCase().includes(consumidorBusca)
            );
          }

          const responseFiltrada = {
            ...response,
            content: movimentacoesFiltradas,
            totalElements: movimentacoesFiltradas.length
          };
          this.atualizarDadosPaginados(responseFiltrada);
        },
        error: this.handleError.bind(this)
      });
  }

  // Função auxiliar para formatar data como ISO.DATE_TIME
  private formatarDataISO(data: string | Date | null, comHora: boolean = false): string | null {
    if (!data) return null;
    
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    
    // Ajusta o fuso horário para meia-noite ou 23:59:59 conforme necessário
    if (comHora) {
      dataObj.setHours(23, 59, 59, 999); // Para data final
    } else {
      dataObj.setHours(0, 0, 0, 0); // Para data inicial
    }
    
    // Formata a data no padrão ISO.DATE_TIME
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const horas = String(dataObj.getHours()).padStart(2, '0');
    const minutos = String(dataObj.getMinutes()).padStart(2, '0');
    const segundos = String(dataObj.getSeconds()).padStart(2, '0');
    
    return `${ano}-${mes}-${dia}T${horas}:${minutos}:${segundos}`; // Formato ISO.DATE_TIME
  }

  // Função auxiliar para formatar data como ISO.DATE (apenas data)
  private formatarDataISO_DATE(data: string | Date | null): string | null {
    if (!data) return null;
    
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    
    // Formata a data no padrão ISO.DATE (YYYY-MM-DD)
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const dia = String(dataObj.getDate()).padStart(2, '0');
    
    return `${ano}-${mes}-${dia}`; // Formato ISO.DATE
  }

  // Método para buscar movimentações com base nos filtros
  buscarMovimentacoes(): void {
    console.log('🚀 Iniciando busca de movimentações...');
    console.log('📊 Estado dos filtros:', {
      tipoMovimentacao: this.tipoMovimentacao,
      data: this.data,
      inicio: this.inicio,
      fim: this.fim,
      ano: this.ano,
      mes: this.mes,
      nomeProduto: this.nomeProduto,
      categoriaProduto: this.categoriaProduto,
      produtoId: this.produtoId,
      nomeConsumidor: this.nomeConsumidor
    });

    // Limpa o estado completamente antes de cada busca
    this.loading = true;
    this.movimentacoes = [];
    this.totalItems = 0;

    // Garante que o pageIndex nunca seja negativo
    if (this.pageIndex < 0) {
      this.pageIndex = 0;
    }

    try {
      // Prioridade 1: Filtros de intervalo com múltiplos critérios
      if (this.inicio && this.fim) {
        this.buscarPorIntervaloCombinado();
        return;
      }

      // Prioridade 2: Filtros de data específica com múltiplos critérios
      if (this.data) {
        this.buscarPorDataCombinada();
        return;
      }

      // Prioridade 3: Filtros de período (ano/mês) com múltiplos critérios
      if (this.ano) {
        this.buscarPorPeriodoCombinado();
        return;
      }

      // Prioridade 4: Filtros de produto sem data
      if (this.temFiltrosProduto()) {
        this.buscarPorProdutoCombinado();
        return;
      }

      // Prioridade 5: Filtro apenas por tipo
      if (this.tipoMovimentacao) {
        this.buscarPorTipo();
        return;
      }

      // Sem filtros: buscar ENTRADA e SAIDA
      this.buscarPorTiposAmbos();

    } catch (error) {
      console.error('❌ Erro ao processar a busca:', error);
      this.handleError(error);
    }
  }

  // Método para buscar por intervalo com filtros combinados
  private buscarPorIntervaloCombinado(): void {
    console.log('🔍 Buscando por intervalo com filtros combinados');
    
    const inicioFormatado = this.formatarDataISO(this.inicio);
    const fimFormatado = this.formatarDataISO(this.fim, true);
    
    if (!inicioFormatado || !fimFormatado) {
      this.loading = false;
      return;
    }

    // Usa o endpoint de intervalo que suporta múltiplos filtros
    this.movimentacaoService.buscarPorProdutoNomeCategoriaIdAndIntervalo(
      this.nomeProduto?.trim() || null,
      this.categoriaProduto?.trim() || null,
      this.produtoId > 0 ? this.produtoId : null,
      inicioFormatado,
      fimFormatado,
      this.pageIndex,
      this.pageSize
    ).subscribe({
      next: (response) => {
        let movimentacoesFiltradas = response.content || [];

        // Filtra por tipo se especificado
        if (this.tipoMovimentacao) {
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => m.tipo === this.tipoMovimentacao);
        }

        // Filtra por consumidor se especificado
        if (this.nomeConsumidor?.trim()) {
          const consumidorBusca = this.nomeConsumidor.trim().toLowerCase();
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => 
            m.nomeConsumidor?.toLowerCase().includes(consumidorBusca)
          );
        }

        const responseFiltrada = {
          ...response,
          content: movimentacoesFiltradas,
          totalElements: movimentacoesFiltradas.length
        };
        this.atualizarDadosPaginados(responseFiltrada);
      },
      error: this.handleError.bind(this)
    });
  }

  // Método para buscar por data específica com filtros combinados
  private buscarPorDataCombinada(): void {
    console.log('🔍 Buscando por data específica com filtros combinados');
    
    const dataFormatada = this.formatarDataISO_DATE(this.data);
    if (!dataFormatada) {
      this.loading = false;
      return;
    }

    // Busca por data e filtra por outros critérios no frontend
    this.movimentacaoService.buscarPorData(
      this.tipoMovimentacao || TipoMovimentacao.ENTRADA, 
      dataFormatada, 
      this.pageIndex, 
      this.pageSize
    ).subscribe({
      next: (response) => {
        let movimentacoesFiltradas = response.content || [];

        // Filtra por produto se especificado
        if (this.produtoId > 0) {
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => m.produtoId === this.produtoId);
        }

        // Filtra por nome se especificado
        if (this.nomeProduto?.trim()) {
          const nomeBusca = this.nomeProduto.trim().toLowerCase();
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => 
            m.nomeProduto.toLowerCase().includes(nomeBusca)
          );
        }

        // Filtra por categoria se especificado
        if (this.categoriaProduto?.trim()) {
          const categoriaBusca = this.categoriaProduto.trim().toLowerCase();
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => 
            m.nomeProduto.toLowerCase().includes(categoriaBusca)
          );
        }

        // Filtra por consumidor se especificado
        if (this.nomeConsumidor?.trim()) {
          const consumidorBusca = this.nomeConsumidor.trim().toLowerCase();
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => 
            m.nomeConsumidor?.toLowerCase().includes(consumidorBusca)
          );
        }

        const responseFiltrada = {
          ...response,
          content: movimentacoesFiltradas,
          totalElements: movimentacoesFiltradas.length
        };
        this.atualizarDadosPaginados(responseFiltrada);
      },
      error: this.handleError.bind(this)
    });
  }

  // Método para buscar por período (ano/mês) com filtros combinados
  private buscarPorPeriodoCombinado(): void {
    console.log('🔍 Buscando por período com filtros combinados');
    
    let observable: Observable<PageResponse<MovimentacaoProduto>>;
    
    if (this.ano && this.mes) {
      observable = this.movimentacaoService.buscarPorMes(this.ano, this.mes, this.pageIndex, this.pageSize);
    } else {
      observable = this.movimentacaoService.buscarPorAno(this.ano!, this.pageIndex, this.pageSize);
    }

    observable.subscribe({
      next: (response) => {
        let movimentacoesFiltradas = response.content || [];

        // Filtra por tipo se especificado
        if (this.tipoMovimentacao) {
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => m.tipo === this.tipoMovimentacao);
        }

        // Filtra por produto se especificado
        if (this.produtoId > 0) {
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => m.produtoId === this.produtoId);
        }

        // Filtra por nome se especificado
        if (this.nomeProduto?.trim()) {
          const nomeBusca = this.nomeProduto.trim().toLowerCase();
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => 
            m.nomeProduto.toLowerCase().includes(nomeBusca)
          );
        }

        // Filtra por categoria se especificado
        if (this.categoriaProduto?.trim()) {
          const categoriaBusca = this.categoriaProduto.trim().toLowerCase();
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => 
            m.nomeProduto.toLowerCase().includes(categoriaBusca)
          );
        }

        // Filtra por consumidor se especificado
        if (this.nomeConsumidor?.trim()) {
          const consumidorBusca = this.nomeConsumidor.trim().toLowerCase();
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => 
            m.nomeConsumidor?.toLowerCase().includes(consumidorBusca)
          );
        }

        const responseFiltrada = {
          ...response,
          content: movimentacoesFiltradas,
          totalElements: movimentacoesFiltradas.length
        };
        this.atualizarDadosPaginados(responseFiltrada);
      },
      error: this.handleError.bind(this)
    });
  }

  // Método para buscar por produto com filtros combinados
  private buscarPorProdutoCombinado(): void {
    console.log('🔍 Buscando por produto com filtros combinados');
    
    let observable: Observable<PageResponse<MovimentacaoProduto>>;
    
    if (this.produtoId > 0) {
      observable = this.movimentacaoService.buscarPorIdProduto(this.produtoId, this.pageIndex, this.pageSize);
    } else if (this.nomeProduto?.trim()) {
      observable = this.movimentacaoService.buscarPorNomeProduto(this.nomeProduto.trim(), this.pageIndex, this.pageSize);
    } else if (this.categoriaProduto?.trim()) {
      observable = this.movimentacaoService.buscarPorCategoriaProduto(this.categoriaProduto.trim(), this.pageIndex, this.pageSize);
    } else {
      this.loading = false;
      return;
    }

    observable.subscribe({
      next: (response) => {
        let movimentacoesFiltradas = response.content || [];

        // Filtra por tipo se especificado
        if (this.tipoMovimentacao) {
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => m.tipo === this.tipoMovimentacao);
        }

        // Filtra por consumidor se especificado
        if (this.nomeConsumidor?.trim()) {
          const consumidorBusca = this.nomeConsumidor.trim().toLowerCase();
          movimentacoesFiltradas = movimentacoesFiltradas.filter(m => 
            m.nomeConsumidor?.toLowerCase().includes(consumidorBusca)
          );
        }

        const responseFiltrada = {
          ...response,
          content: movimentacoesFiltradas,
          totalElements: movimentacoesFiltradas.length
        };
        this.atualizarDadosPaginados(responseFiltrada);
      },
      error: this.handleError.bind(this)
    });
  }

  // Método para buscar apenas por tipo
  private buscarPorTipo(): void {
    console.log('🔍 Buscando apenas por tipo:', this.tipoMovimentacao);
    this.movimentacaoService.buscarPorTipos([this.tipoMovimentacao], this.pageIndex, this.pageSize)
      .subscribe({
        next: (response) => {
          let movimentacoesFiltradas = response.content || [];

          // Filtra por consumidor se especificado
          if (this.nomeConsumidor?.trim()) {
            const consumidorBusca = this.nomeConsumidor.trim().toLowerCase();
            movimentacoesFiltradas = movimentacoesFiltradas.filter(m => 
              m.nomeConsumidor?.toLowerCase().includes(consumidorBusca)
            );
          }

          const responseFiltrada = {
            ...response,
            content: movimentacoesFiltradas,
            totalElements: movimentacoesFiltradas.length
          };
          this.atualizarDadosPaginados(responseFiltrada);
        },
        error: this.handleError.bind(this)
      });
  }

  // Método auxiliar para verificar se há filtros de produto
  private temFiltrosProduto(): boolean {
    const temProdutoId = Boolean(this.produtoId > 0);
    const temNomeProduto = Boolean(this.nomeProduto && this.nomeProduto.trim());
    const temCategoria = Boolean(this.categoriaProduto && this.categoriaProduto.trim());
    
    return temProdutoId || temNomeProduto || temCategoria;
  }

  // Método auxiliar para atualizar os dados paginados
  private atualizarDadosPaginados(response: PageResponse<MovimentacaoProduto>): void {
    // Reset do estado de carregamento
    this.loading = false;

    // Se não houver resposta, limpa tudo
    if (!response) {
      this.movimentacoes = [];
      this.totalItems = 0;
      this.pageIndex = 0;
      return;
    }
    
    // Atualiza os dados da página atual
    this.movimentacoes = response.content || [];
    this.totalItems = response.totalElements;
    this.pageIndex = response.pageable?.pageNumber || 0;
    
    // Atualiza o paginador se necessário
    if (this.paginator) {
      // Só atualiza se os valores forem diferentes para evitar loop
      if (this.paginator.pageIndex !== this.pageIndex) {
        this.paginator.pageIndex = this.pageIndex;
      }
      if (this.paginator.pageSize !== response.pageable?.pageSize) {
        this.pageSize = response.pageable?.pageSize || this.pageSize;
      }
      if (this.paginator.length !== response.totalElements) {
        this.paginator.length = response.totalElements;
      }
    }
  }

  // Método auxiliar para tratar erros
  private handleError(error: any): void {
    console.error('Erro na busca de movimentações:', error);
    this.loading = false;
    this.movimentacoes = [];
    this.totalItems = 0;
  }

  // Método para registrar uma nova movimentação
  registrarMovimentacao(): void {
    // Dados iniciais para o modal
    const modalData: MovimentacaoModalData = {
      modo: 'criar',
      tipoMovimentacao: this.tipoMovimentacao,
      produtoId: this.produtoId || undefined,
      nomeProduto: this.nomeProduto || undefined
    };

    // Abre o modal
    const dialogRef = this.dialog.open(MovimentacaoModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: modalData,
      disableClose: false,
      autoFocus: true
    });

    // Aguarda o resultado do modal
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        // Registra a movimentação
        this.movimentacaoService.registrarMovimentacao(result.data).subscribe({
          next: (response) => {
            console.log('Movimentação registrada com sucesso!', response);
            this.buscarMovimentacoes(); // Atualiza a lista
          },
          error: (error) => {
            console.error('Erro ao registrar movimentação:', error);
          }
        });
      }
    });
  }

  editarMovimentacao(mov: MovimentacaoProduto): void {
    const modalData: MovimentacaoModalData = {
      modo: 'editar',
      movimentacao: mov,
      tipoMovimentacao: mov.tipo,
      produtoId: mov.produtoId,
      nomeProduto: mov.nomeProduto
    };

    const dialogRef = this.dialog.open(MovimentacaoModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: modalData,
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.movimentacaoService.editarMovimentacao(mov.id, result.data).subscribe({
          next: () => {
            console.log('Movimentação editada com sucesso!');
            this.buscarMovimentacoes();
          },
          error: (err) => {
            console.error('Erro ao editar movimentação:', err);
          }
        });
      }
    });
  }

  // Compatível com o template atualizado
  onPageChange(event: PageEvent): void {
    this.handlePageEvent(event);
  }

  // Método para lidar com eventos de paginação
  handlePageEvent(event: PageEvent): void {
    // Atualiza os valores de paginação
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    
    // Busca os dados da nova página
    this.buscarMovimentacoes();
  }

  // Método para limpar filtros
  limparFiltros(): void {
    console.log('🧹 Limpando todos os filtros...');
    
    // Reset de todos os filtros para valores neutros
    this.tipoMovimentacao = TipoMovimentacao.ENTRADA;
    this.data = null;
    this.inicio = null;
    this.fim = null;
    this.ano = null;
    this.mes = null;
    this.nomeProduto = '';
    this.categoriaProduto = '';
    this.produtoId = 0;
    this.nomeConsumidor = '';

    // Reset da paginação
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
    }
    this.pageSize = 10;

    // Limpa a lista e busca apenas por tipo (padrão)
    this.movimentacoes = [];
    this.totalItems = 0;
    
    console.log('✅ Filtros limpos. Buscando apenas por tipo padrão...');
    this.buscarMovimentacoes();
  }

  // Método para aplicar filtros
  aplicarFiltros(): void {
    // Limpa completamente o estado
    this.movimentacoes = [];
    this.totalItems = 0;
    
    // Reseta a paginação
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = this.pageSize;
    }
    
    // Busca com os novos filtros
    this.buscarMovimentacoes();
  }

  // Método para aplicar filtro por tipo de movimentação
  aplicarFiltroTipo(): void {
    // Não limpa outros filtros - permite combinações
    // Reseta apenas a paginação
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    // Busca com todos os filtros ativos
    this.buscarMovimentacoes();
  }

  // Método para aplicar filtro por data
  aplicarFiltroData(): void {
    // Não limpa outros filtros - permite combinações
    // Reseta apenas a paginação
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    // Busca com todos os filtros ativos
    this.buscarMovimentacoes();
  }

  // Método para aplicar filtro por produto
  aplicarFiltroProduto(): void {
    // Não limpa outros filtros - permite combinações
    // Reseta apenas a paginação
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    // Busca com todos os filtros ativos
    this.buscarMovimentacoes();
  }

  // Método para aplicar filtro por consumidor
  aplicarFiltroConsumidor(): void {
    // Não limpa outros filtros - permite combinações
    // Reseta apenas a paginação
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    // Busca com todos os filtros ativos
    this.buscarMovimentacoes();
  }

  // Método para aplicar todos os filtros ativos
  aplicarTodosFiltros(): void {
    console.log('🚀 Aplicando todos os filtros ativos...');
    console.log('📊 Estado atual dos filtros:', {
      tipoMovimentacao: this.tipoMovimentacao,
      data: this.data,
      inicio: this.inicio,
      fim: this.fim,
      ano: this.ano,
      mes: this.mes,
      nomeProduto: this.nomeProduto,
      categoriaProduto: this.categoriaProduto,
      produtoId: this.produtoId,
      nomeConsumidor: this.nomeConsumidor
    });
    
    // Verifica se há filtros ativos além do tipo padrão
    const temFiltrosAtivos = this.temFiltrosAtivos();
    if (!temFiltrosAtivos) {
      console.log('ℹ️ Nenhum filtro adicional ativo. Aplicando apenas filtro de tipo padrão.');
    }
    
    // Reseta a paginação
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    // Busca com todos os filtros ativos
    this.buscarMovimentacoes();
  }

  // Método para verificar se há filtros ativos além do tipo padrão
  temFiltrosAtivos(): boolean {
    const temData = Boolean(this.data);
    const temPeriodo = Boolean(this.inicio && this.fim);
    const temAno = Boolean(this.ano);
    const temMes = Boolean(this.mes);
    const temNomeProduto = Boolean(this.nomeProduto && this.nomeProduto.trim());
    const temCategoria = Boolean(this.categoriaProduto && this.categoriaProduto.trim());
    const temProdutoId = Boolean(this.produtoId && this.produtoId > 0);
    const temConsumidor = Boolean(this.nomeConsumidor && this.nomeConsumidor.trim());
    
    return temData || temPeriodo || temAno || temMes || temNomeProduto || temCategoria || temProdutoId || temConsumidor;
  }
}