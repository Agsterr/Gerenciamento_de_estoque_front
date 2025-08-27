import { Component, OnInit } from '@angular/core';
import { ProdutoService } from '../services/produto.service';
import { CategoriaService } from '../services/categoria.service';
import { Produto } from '../models/produto.model';
import { Categoria } from '../models/categoria.model';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produto',
  templateUrl: './produto.component.html',
  styleUrls: ['./produto.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ProdutoComponent implements OnInit {
  produtos: Produto[] = [];
  filteredProdutos: Produto[] = [];
  searchTerm: string = '';
  categorias: Categoria[] = [];
  produtoForm: FormGroup;
  mensagem = '';
  mensagemErro = '';
  loading = false;
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [10, 20, 30, 40];
  totalPages = 0;
  totalElements = 0;
  showList = true;
  showAddForm = false;
  editingProduto = false;
  produtoEditando: Produto | null = null;

  constructor(
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private fb: FormBuilder
  ) {
    this.produtoForm = this.fb.group({
      id: [null],
      nome: ['', Validators.required],
      descricao: ['', Validators.required],
      preco: [0, [Validators.required, Validators.min(0.01)]],
      quantidade: [0, [Validators.required, Validators.min(0)]],
      quantidadeMinima: [0, [Validators.required, Validators.min(0)]],
      categoriaId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchProdutos();
    this.carregarCategorias();
  }

  fetchProdutos(page: number = 0): void {
    this.loading = true;
    this.produtoService.listarProdutos(page, this.pageSize).subscribe({
      next: (data) => {
        this.produtos = data.content;
        this.filteredProdutos = [...this.produtos];
        this.currentPage = data.currentPage || 0;
        this.totalPages = data.totalPages || 1;
        this.totalElements = data.totalElements || this.produtos.length;
        this.applyFilter();
        this.loading = false;
      },
      error: (error: any) => {
        this.mensagemErro = 'Erro ao carregar produtos.';
        this.loading = false;
        console.error('Erro ao carregar produtos:', error);
      }
    });
  }

  carregarCategorias(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (data) => this.categorias = data.content,
      error: (error: any) => {
        this.mensagemErro = 'Erro ao carregar categorias.';
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  toggleList(): void {
    this.showList = true;
    this.showAddForm = false;
    this.editingProduto = false;
    this.produtoEditando = null;
    this.produtoForm.reset();
    this.mensagem = '';
    this.mensagemErro = '';
    this.fetchProdutos(this.currentPage);
  }

  toggleAddForm(): void {
    this.showAddForm = true;
    this.showList = false;
    this.editingProduto = false;
    this.produtoEditando = null;
    this.produtoForm.reset();
    this.mensagem = '';
    this.mensagemErro = '';
  }

  submitAddForm(): void {
    if (this.produtoForm.invalid) {
      this.mensagemErro = 'Preencha todos os campos corretamente!';
      return;
    }
    this.editingProduto ? this.updateProduto() : this.createProduto();
  }

  createProduto(): void {
    const novo = this.produtoForm.value as Produto;
    this.loading = true;
    this.produtoService.criarProduto(novo).subscribe({
      next: () => {
        this.loading = false;
        this.mensagem = 'Produto adicionado!';
        this.toggleList();
      },
      error: err => {
        this.loading = false;
        this.mensagemErro = err.error?.error || 'Erro ao adicionar produto!';
      }
    });
  }

  updateProduto(): void {
    const upd = this.produtoForm.value as Produto;
    if (!upd.id) {
      this.mensagemErro = 'ID obrigatório para edição';
      return;
    }
    this.loading = true;
    this.produtoService.atualizarProduto(upd, upd.id).subscribe({
      next: () => {
        this.loading = false;
        this.mensagem = 'Produto atualizado!';
        this.toggleList();
      },
      error: () => {
        this.loading = false;
        this.mensagemErro = 'Erro ao editar produto!';
      }
    });
  }

  deleteProduto(id: number): void {
    if (!confirm('Confirma exclusão do produto?')) return;
    this.loading = true;
    this.produtoService.deletarProduto(id).subscribe({
      next: () => {
        this.loading = false;
        this.mensagem = 'Produto deletado!';
        this.fetchProdutos(this.currentPage);
      },
      error: () => {
        this.loading = false;
        this.mensagemErro = 'Erro ao deletar produto!';
      }
    });
  }

  applyFilter(): void {
    const t = this.searchTerm.trim().toLowerCase();
    this.filteredProdutos = t
      ? this.produtos.filter(p =>
          p.nome.toLowerCase().includes(t) ||
          (p.descricao && p.descricao.toLowerCase().includes(t)) ||
          (p.categoriaNome && p.categoriaNome.toLowerCase().includes(t))
        )
      : [...this.produtos];
  }

  editProduto(p: Produto): void {
    this.editingProduto = true;
    this.showAddForm = true;
    this.showList = false;
    this.produtoEditando = p;
    this.produtoForm.patchValue({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      preco: p.preco,
      quantidade: p.quantidade,
      quantidadeMinima: p.quantidadeMinima,
      categoriaId: p.categoriaId
    });
    this.mensagem = '';
    this.mensagemErro = '';
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPages) {
      this.fetchProdutos(pagina);
    }
  }

  onPageSizeChange(event: any): void {
    this.currentPage = 0;
    this.pageSize = event.target.value;
    this.fetchProdutos(0);
  }

  paginaAnterior(): void {
    if (this.currentPage > 0) {
      this.fetchProdutos(this.currentPage - 1);
    }
  }

  proximaPagina(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.fetchProdutos(this.currentPage + 1);
    }
  }
}
