import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../services/categoria.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Categoria } from '../models/categoria.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { PageCategoriaResponse } from '../models/page-categoria-response.model';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class CategoriaComponent implements OnInit {
  categoriaForm: FormGroup;
  categorias: Categoria[] = [];
  // Adicionado: lista filtrada e termo de busca
  filteredCategorias: Categoria[] = [];
  searchTerm: string = '';
  mensagem: string = '';
  mensagemErro: string = '';
  mensagemTipo: 'sucesso' | 'erro' | '' = '';
  showNovaCategoriaInput = false;
  orgId: string = '';

  size = 10;
  number = 0;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private categoriaService: CategoriaService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.categoriaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    try {
      this.orgId = this.categoriaService.getOrgId();
      this.carregarCategorias(this.number);
    } catch (error) {
      console.error('Erro ao obter orgId:', error);
      this.mensagemErro = 'OrgId não encontrado. O usuário precisa estar autenticado.';
      this.router.navigate(['/login']);
    }
  }

  /** Carrega categorias com paginação */
  carregarCategorias(pagina: number = 0): void {
    this.limparMensagens();

    this.categoriaService.listarCategorias(pagina, this.size).subscribe({
      next: (data: PageCategoriaResponse) => {
        this.categorias = data.content; // Apenas o array de categorias
        this.number = data.number; // Número da página atual
        this.totalPages = data.totalPages; // Número total de páginas
        this.totalElements = data.totalElements; // Número total de elementos
        this.size = data.size; // Tamanho da página
        // Aplica o filtro após carregar
        this.applyFilter();
      },
      error: (error: HttpErrorResponse) => {
        this.mensagemErro = 'Erro ao carregar categorias.';
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  onPageSizeChange() {
    this.carregarCategorias(0);
  }


  toggleNovaCategoriaForm(): void {
    this.showNovaCategoriaInput = !this.showNovaCategoriaInput;
    this.limparMensagens();
    this.categoriaForm.reset();
  }

  criarCategoria(): void {
    this.limparMensagens();

    if (this.categoriaForm.valid) {
      const nome = this.categoriaForm.get('nome')?.value.trim();
      const descricao = this.categoriaForm.get('descricao')?.value?.trim() || '';

      if (this.categorias.some(cat => cat.nome.toLowerCase() === nome.toLowerCase())) {
        this.mensagemErro = 'Categoria já existe!';
        this.mensagemTipo = 'erro';
        return;
      }

      this.categoriaService.criarCategoria(nome, descricao).subscribe({
        next: () => {
          this.mensagem = 'Categoria criada com sucesso!';
          this.mensagemTipo = 'sucesso';
          this.categoriaForm.reset();
          this.showNovaCategoriaInput = false;
          this.carregarCategorias(this.number); // recarrega a página atual
        },
        error: (error: HttpErrorResponse) => {
          this.mensagemErro = 'Erro ao criar categoria.';
          console.error('Erro ao criar categoria:', error);
          this.mensagemTipo = 'erro';
        }
      });
    } else {
      this.mensagemErro = 'Preencha corretamente os campos do formulário.';
      this.mensagemTipo = 'erro';
    }
  }

  deletarCategoria(id: number): void {
    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      this.categoriaService.deletarCategoria(id).subscribe({
        next: () => {
          this.mensagem = 'Categoria deletada com sucesso!';
          this.mensagemTipo = 'sucesso';
          this.carregarCategorias(this.number); // atualiza a lista da página
        },
        error: (error: HttpErrorResponse) => {
          this.mensagemErro = 'Erro ao deletar categoria.';
          console.error('Erro ao deletar categoria:', error);
          this.mensagemTipo = 'erro';
        }
      });
    }
  }

  paginaAnterior(): void {
    if (this.number > 0) {
      this.carregarCategorias(this.number - 1);
    }
  }

  proximaPagina(): void {
    if (this.number + 1 < this.totalPages) {
      this.carregarCategorias(this.number + 1);
    }
  }

  /** Limpa as mensagens de status */
  private limparMensagens(): void {
    this.mensagem = '';
    this.mensagemErro = '';
    this.mensagemTipo = '';
  }

  /** Filtro local como em Entregas */
  applyFilter(): void {
    const term = (this.searchTerm || '').toLowerCase().trim();
    this.filteredCategorias = term
      ? this.categorias.filter(c =>
          (c.nome || '').toLowerCase().includes(term) ||
          (c.descricao || '').toLowerCase().includes(term)
        )
      : [...this.categorias];
  }
}
