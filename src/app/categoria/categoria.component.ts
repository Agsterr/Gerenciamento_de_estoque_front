import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../services/categoria.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Categoria } from '../models/categoria.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { PageCategoriaResponse } from '../models/page-categoria-response.model';
import { fromEvent, merge, Observable, of } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';

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

  // Suporte offline
  isOnline$: Observable<boolean> = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  ).pipe(startWith(navigator.onLine), distinctUntilChanged());
  isOfflineSnapshot = false;
  snapshotSavedAt?: string;
  loading = false;

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

  /** Snapshot helpers (Indexed LocalStorage) */
  private saveCategoriasSnapshot(categorias: Categoria[]) {
    const snap = { data: categorias, savedAt: new Date().toISOString() };
    localStorage.setItem('categorias_snapshot', JSON.stringify(snap));
  }
  private loadCategoriasSnapshot(): { data: Categoria[]; savedAt: string } | null {
    const raw = localStorage.getItem('categorias_snapshot');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  /** Carrega categorias com paginação e fallback offline */
  carregarCategorias(pagina: number = 0): void {
    this.limparMensagens();
    this.loading = true;

    this.categoriaService.listarCategorias(pagina, this.size).subscribe({
      next: (data: PageCategoriaResponse) => {
        this.categorias = data.content;
        this.number = data.number;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.size = data.size;
        this.applyFilter();
        // Snapshot e estado
        this.isOfflineSnapshot = false;
        this.snapshotSavedAt = new Date().toISOString();
        this.saveCategoriasSnapshot(this.categorias);
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        // Fallback: snapshot local se offline
        const snap = this.loadCategoriasSnapshot();
        if (snap) {
          this.categorias = snap.data || [];
          this.applyFilter();
          this.isOfflineSnapshot = true;
          this.snapshotSavedAt = snap.savedAt;
          this.mensagem = 'Você está offline. Exibindo categorias salvas.';
        } else {
          this.mensagemErro = 'Erro ao carregar categorias.';
        }
        console.error('Erro ao carregar categorias:', error);
        this.loading = false;
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

    if (!navigator.onLine) {
      this.mensagemErro = 'Sem conexão: não é possível criar categorias offline.';
      this.mensagemTipo = 'erro';
      return;
    }

    if (this.categoriaForm.valid) {
      const nome = (this.categoriaForm.get('nome')?.value || '').trim();
      const descricao = (this.categoriaForm.get('descricao')?.value || '').trim();

      if (this.categorias.some(cat => (cat.nome || '').toLowerCase() === nome.toLowerCase())) {
        this.mensagemErro = 'Categoria já existe!';
        this.mensagemTipo = 'erro';
        return;
      }

      this.loading = true;
      this.categoriaService.criarCategoria(nome, descricao).subscribe({
        next: () => {
          this.mensagem = 'Categoria criada com sucesso!';
          this.mensagemTipo = 'sucesso';
          this.categoriaForm.reset();
          this.showNovaCategoriaInput = false;
          this.carregarCategorias(this.number);
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.mensagemErro = 'Erro ao criar categoria.';
          console.error('Erro ao criar categoria:', error);
          this.mensagemTipo = 'erro';
          this.loading = false;
        }
      });
    } else {
      this.mensagemErro = 'Preencha corretamente os campos do formulário.';
      this.mensagemTipo = 'erro';
    }
  }

  deletarCategoria(id: number): void {
    if (!navigator.onLine) {
      this.mensagemErro = 'Sem conexão: não é possível excluir categorias offline.';
      this.mensagemTipo = 'erro';
      return;
    }

    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      this.loading = true;
      this.categoriaService.deletarCategoria(id).subscribe({
        next: () => {
          this.mensagem = 'Categoria deletada com sucesso!';
          this.mensagemTipo = 'sucesso';
          this.carregarCategorias(this.number);
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.mensagemErro = 'Erro ao deletar categoria.';
          console.error('Erro ao deletar categoria:', error);
          this.mensagemTipo = 'erro';
          this.loading = false;
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
