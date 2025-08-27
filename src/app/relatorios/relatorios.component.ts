import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RelatoriosService } from '../services/relatorios.service';

// Configuração do formato de data brasileiro
export const BR_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// Adapter personalizado para formato brasileiro
export class BrazilianDateAdapter extends NativeDateAdapter {
  private monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  private fullMonthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'DD/MM/YYYY') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else if (displayFormat === 'MMM YYYY') {
      const month = this.monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${year}`;
    } else if (displayFormat === 'MMMM YYYY') {
      const month = this.fullMonthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${year}`;
    }
    return super.format(date, displayFormat);
  }

  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const parts = value.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return super.parse(value);
  }

  override getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    if (style === 'long') {
      return ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    } else if (style === 'short') {
      return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    } else {
      return ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    }
  }

  override getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    if (style === 'long') {
      return this.fullMonthNames;
    } else if (style === 'short') {
      return this.monthNames;
    } else {
      return this.monthNames.map(m => m[0]);
    }
  }
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatDatepickerModule, 
    MatNativeDateModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: DateAdapter, useClass: BrazilianDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: BR_DATE_FORMATS },
  ],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss']
})
export class RelatoriosComponent {
  // Filtros
  inicio: Date | null = null;
  fim: Date | null = null;
  dia: Date | null = null;
  ano: number = new Date().getFullYear();
  mes: number = new Date().getMonth() + 1;

  // Meses para seleção
  meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
  ];

  loading: boolean = false;
  mensagem: string = '';
  erro: string = '';

  constructor(
    private relatoriosService: RelatoriosService,
    private snackBar: MatSnackBar
  ) {}

  private resetStatus() {
    this.mensagem = '';
    this.erro = '';
  }

  private showMessage(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Fechar', {
      duration: 4000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  private saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Adiciona timestamp ao nome do arquivo se não estiver presente
    if (!filename.includes('relatorio-')) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
      const ext = filename.split('.').pop();
      filename = `${nameWithoutExt}-${timestamp}.${ext}`;
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.showMessage(`Relatório ${filename} baixado com sucesso!`);
  }

  // Produtos - Estoque baixo
  baixarEstoqueBaixoPdf() {
    if (this.loading) return;
    this.resetStatus();
    this.loading = true;
    this.relatoriosService.estoqueBaixoPdf().subscribe({
      next: (blob) => { 
        this.saveBlob(blob, 'relatorio-estoque-baixo.pdf'); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de estoque baixo:', error);
        this.erro = 'Erro ao gerar PDF de estoque baixo. Verifique se existem produtos cadastrados.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de estoque baixo', true);
      }
    });
  }

  baixarEstoqueBaixoXlsx() {
    if (this.loading) return;
    this.resetStatus();
    this.loading = true;
    this.relatoriosService.estoqueBaixoXlsx().subscribe({
      next: (blob) => { 
        this.saveBlob(blob, 'relatorio-estoque-baixo.xlsx'); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de estoque baixo:', error);
        this.erro = 'Erro ao gerar XLSX de estoque baixo. Verifique se existem produtos cadastrados.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de estoque baixo', true);
      }
    });
  }

  // Entregas por período - Backend espera OffsetDateTime
  baixarEntregasPeriodoPdf() {
    if (this.loading) return;
    this.resetStatus();
    if (!this.inicio || !this.fim) { 
      this.erro = 'Informe início e fim'; 
      this.showMessage('Informe as datas de início e fim', true);
      return; 
    }
    
    // Validação: data de início não pode ser maior que data de fim
    if (this.inicio > this.fim) {
      this.erro = 'A data de início não pode ser maior que a data de fim';
      this.showMessage('Data de início maior que data de fim', true);
      return;
    }
    
    const inicioISO = this.toOffsetDateTime(this.inicio, false);
    const fimISO = this.toOffsetDateTime(this.fim, true);
    this.loading = true;
    
    this.relatoriosService.entregasPeriodoPdf(inicioISO, fimISO).subscribe({
      next: (blob) => { 
        const inicioStr = this.inicio?.toLocaleDateString('pt-BR');
        const fimStr = this.fim?.toLocaleDateString('pt-BR');
        this.saveBlob(blob, `relatorio-entregas-${inicioStr}-${fimStr}.pdf`); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de entregas por período:', error);
        this.erro = 'Erro ao gerar PDF de entregas por período. Verifique se existem dados para o período selecionado.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de entregas por período', true);
      }
    });
  }

  baixarEntregasPeriodoXlsx() {
    if (this.loading) return;
    this.resetStatus();
    if (!this.inicio || !this.fim) { 
      this.erro = 'Informe início e fim'; 
      this.showMessage('Informe as datas de início e fim', true);
      return; 
    }
    
    // Validação: data de início não pode ser maior que data de fim
    if (this.inicio > this.fim) {
      this.erro = 'A data de início não pode ser maior que a data de fim';
      this.showMessage('Data de início maior que data de fim', true);
      return;
    }
    
    const inicioISO = this.toOffsetDateTime(this.inicio, false);
    const fimISO = this.toOffsetDateTime(this.fim, true);
    this.loading = true;
    
    this.relatoriosService.entregasPeriodoXlsx(inicioISO, fimISO).subscribe({
      next: (blob) => { 
        const inicioStr = this.inicio?.toLocaleDateString('pt-BR');
        const fimStr = this.fim?.toLocaleDateString('pt-BR');
        this.saveBlob(blob, `relatorio-entregas-${inicioStr}-${fimStr}.xlsx`); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de entregas por período:', error);
        this.erro = 'Erro ao gerar XLSX de entregas por período. Verifique se existem dados para o período selecionado.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de entregas por período', true);
      }
    });
  }

  // Entregas do dia - Backend espera LocalDate
  baixarEntregasDiaPdf() {
    if (this.loading) return;
    this.resetStatus();
    if (!this.dia) { 
      this.erro = 'Informe o dia'; 
      this.showMessage('Informe o dia para o relatório', true);
      return; 
    }
    
    // Validação: não pode ser data futura
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (this.dia > hoje) {
      this.erro = 'Não é possível gerar relatório para datas futuras';
      this.showMessage('Data futura não permitida', true);
      return;
    }
    
    const diaISO = this.toISODateOnly(this.dia);
    this.loading = true;
    
    this.relatoriosService.entregasDiaPdf(diaISO).subscribe({
      next: (blob) => { 
        const diaStr = this.dia?.toLocaleDateString('pt-BR');
        this.saveBlob(blob, `relatorio-entregas-${diaStr}.pdf`); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de entregas do dia:', error);
        this.erro = 'Erro ao gerar PDF de entregas do dia. Verifique se existem dados para a data selecionada.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de entregas do dia', true);
      }
    });
  }

  // Movimentações por mês
  baixarMovimentacoesMesPdf() {
    if (this.loading) return;
    this.resetStatus();
    
    // Validação dos parâmetros
    if (!this.ano || this.ano < 2000 || this.ano > 2099) {
      this.erro = 'Ano inválido. Informe um ano entre 2000 e 2099.';
      this.showMessage('Ano inválido para o relatório', true);
      return;
    }
    
    if (!this.mes || this.mes < 1 || this.mes > 12) {
      this.erro = 'Mês inválido. Informe um mês entre 1 e 12.';
      this.showMessage('Mês inválido para o relatório', true);
      return;
    }
    
    // Validação: não pode ser mês futuro para o ano atual
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    
    if (this.ano === anoAtual && this.mes > mesAtual) {
      this.erro = 'Não é possível gerar relatório para meses futuros';
      this.showMessage('Mês futuro não permitido', true);
      return;
    }
    
    this.loading = true;
    this.relatoriosService.movimentacoesMesPdf(this.ano, this.mes).subscribe({
      next: (blob) => { 
        this.saveBlob(blob, `relatorio-movimentacoes-${this.ano}-${this.mes.toString().padStart(2, '0')}.pdf`); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de movimentações:', error);
        this.erro = 'Erro ao gerar PDF de movimentações do mês. Verifique se existem dados para o período selecionado.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de movimentações do mês', true);
      }
    });
  }

  baixarMovimentacoesMesXlsx() {
    if (this.loading) return;
    this.resetStatus();
    
    // Validação dos parâmetros
    if (!this.ano || this.ano < 2000 || this.ano > 2099) {
      this.erro = 'Ano inválido. Informe um ano entre 2000 e 2099.';
      this.showMessage('Ano inválido para o relatório', true);
      return;
    }
    
    if (!this.mes || this.mes < 1 || this.mes > 12) {
      this.erro = 'Mês inválido. Informe um mês entre 1 e 12.';
      this.showMessage('Mês inválido para o relatório', true);
      return;
    }
    
    // Validação: não pode ser mês futuro para o ano atual
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    
    if (this.ano === anoAtual && this.mes > mesAtual) {
      this.erro = 'Não é possível gerar relatório para meses futuros';
      this.showMessage('Mês futuro não permitido', true);
      return;
    }
    
    this.loading = true;
    this.relatoriosService.movimentacoesMesXlsx(this.ano, this.mes).subscribe({
      next: (blob) => { 
        this.saveBlob(blob, `relatorio-movimentacoes-${this.ano}-${this.mes.toString().padStart(2, '0')}.xlsx`); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de movimentações:', error);
        this.erro = 'Erro ao gerar XLSX de movimentações do mês. Verifique se existem dados para o período selecionado.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de movimentações do mês', true);
      }
    });
  }

  // Entregas por mês
  baixarEntregasMesPdf() {
    if (this.loading) return;
    this.resetStatus();
    
    // Validação dos parâmetros
    if (!this.ano || this.ano < 2000 || this.ano > 2099) {
      this.erro = 'Ano inválido. Informe um ano entre 2000 e 2099.';
      this.showMessage('Ano inválido para o relatório', true);
      return;
    }
    
    if (!this.mes || this.mes < 1 || this.mes > 12) {
      this.erro = 'Mês inválido. Informe um mês entre 1 e 12.';
      this.showMessage('Mês inválido para o relatório', true);
      return;
    }
    
    // Validação: não pode ser mês futuro para o ano atual
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    
    if (this.ano === anoAtual && this.mes > mesAtual) {
      this.erro = 'Não é possível gerar relatório para meses futuros';
      this.showMessage('Mês futuro não permitido', true);
      return;
    }
    
    this.loading = true;
    this.relatoriosService.entregasMesPdf(this.ano, this.mes).subscribe({
      next: (blob) => { 
        const mesNome = this.meses.find(m => m.valor === this.mes)?.nome;
        this.saveBlob(blob, `relatorio-entregas-${mesNome}-${this.ano}.pdf`); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de entregas por mês:', error);
        this.erro = 'Erro ao gerar PDF de entregas por mês. Verifique se existem dados para o período selecionado.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de entregas por mês', true);
      }
    });
  }

  baixarEntregasMesXlsx() {
    if (this.loading) return;
    this.resetStatus();
    
    // Validação dos parâmetros
    if (!this.ano || this.ano < 2000 || this.ano > 2099) {
      this.erro = 'Ano inválido. Informe um ano entre 2000 e 2099.';
      this.showMessage('Ano inválido para o relatório', true);
      return;
    }
    
    if (!this.mes || this.mes < 1 || this.mes > 12) {
      this.erro = 'Mês inválido. Informe um mês entre 1 e 12.';
      this.showMessage('Mês inválido para o relatório', true);
      return;
    }
    
    // Validação: não pode ser mês futuro para o ano atual
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    
    if (this.ano === anoAtual && this.mes > mesAtual) {
      this.erro = 'Não é possível gerar relatório para meses futuros';
      this.showMessage('Mês futuro não permitido', true);
      return;
    }
    
    this.loading = true;
    this.relatoriosService.entregasMesXlsx(this.ano, this.mes).subscribe({
      next: (blob) => { 
        const mesNome = this.meses.find(m => m.valor === this.mes)?.nome;
        this.saveBlob(blob, `relatorio-entregas-${mesNome}-${this.ano}.xlsx`); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de entregas por mês:', error);
        this.erro = 'Erro ao gerar XLSX de entregas por mês. Verifique se existem dados para o período selecionado.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de entregas por mês', true);
      }
    });
  }

  // Entregas por ano
  baixarEntregasAnoPdf() {
    if (this.loading) return;
    this.resetStatus();
    
    // Validação dos parâmetros
    if (!this.ano || this.ano < 2000 || this.ano > 2099) {
      this.erro = 'Ano inválido. Informe um ano entre 2000 e 2099.';
      this.showMessage('Ano inválido para o relatório', true);
      return;
    }
    
    // Validação: não pode ser ano futuro
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    
    if (this.ano > anoAtual) {
      this.erro = 'Não é possível gerar relatório para anos futuros';
      this.showMessage('Ano futuro não permitido', true);
      return;
    }
    
    this.loading = true;
    this.relatoriosService.entregasAnoPdf(this.ano).subscribe({
      next: (blob) => { 
        this.saveBlob(blob, `relatorio-entregas-${this.ano}.pdf`); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de entregas por ano:', error);
        this.erro = 'Erro ao gerar PDF de entregas por ano. Verifique se existem dados para o ano selecionado.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de entregas por ano', true);
      }
    });
  }

  baixarEntregasAnoXlsx() {
    if (this.loading) return;
    this.resetStatus();
    
    // Validação dos parâmetros
    if (!this.ano || this.ano < 2000 || this.ano > 2099) {
      this.erro = 'Ano inválido. Informe um ano entre 2000 e 2099.';
      this.showMessage('Ano inválido para o relatório', true);
      return;
    }
    
    // Validação: não pode ser ano futuro
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    
    if (this.ano > anoAtual) {
      this.erro = 'Não é possível gerar relatório para anos futuros';
      this.showMessage('Ano futuro não permitido', true);
      return;
    }
    
    this.loading = true;
    this.relatoriosService.entregasAnoXlsx(this.ano).subscribe({
      next: (blob) => { 
        this.saveBlob(blob, `relatorio-entregas-${this.ano}.xlsx`); 
        this.loading = false; 
      },
      error: (error) => { 
        console.error('Erro ao gerar relatório de entregas por ano:', error);
        this.erro = 'Erro ao gerar XLSX de entregas por ano. Verifique se existem dados para o ano selecionado.'; 
        this.loading = false;
        this.showMessage('Erro ao gerar relatório de entregas por ano', true);
      }
    });
  }

  // Método para gerar OffsetDateTime (ISO 8601 com timezone) - Backend espera isso
  private toOffsetDateTime(date: Date, endOfDay: boolean): string {
    const d = new Date(date);
    if (endOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    
    // Obtém o offset do timezone local
    const offset = d.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMinutes = Math.abs(offset % 60);
    const offsetSign = offset <= 0 ? '+' : '-';
    
    const pad = (n: number) => String(n).padStart(2, '0');
    const isoString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    
    return `${isoString}${offsetSign}${pad(offsetHours)}:${pad(offsetMinutes)}`;
  }

  // Método para gerar LocalDate (ISO DATE) - Backend espera isso para entregas do dia
  private toISODateOnly(date: Date): string {
    const d = new Date(date);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // Método para limpar filtros
  limparFiltros() {
    this.inicio = null;
    this.fim = null;
    this.dia = null;
    this.ano = new Date().getFullYear();
    this.mes = new Date().getMonth() + 1;
    this.resetStatus();
  }
}