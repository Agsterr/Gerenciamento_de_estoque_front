import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { OrgService } from '../services/org.service';
import { OrgDto } from '../models/org.model';

@Component({
  selector: 'app-org',
  standalone: true,
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class OrgComponent implements OnInit {
  orgs: OrgDto[] = [];
  mensagem = '';
  mensagemErro = '';
  criando = false;
  form: FormGroup;

  editandoId: number | null = null;
  editNome = '';

  @ViewChild('editInput') editInputRef?: ElementRef<HTMLInputElement>;

  constructor(private orgService: OrgService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.listar();
  }

  get nomeCtrl() {
    return this.form.get('nome');
  }

  listar(): void {
    this.mensagem = '';
    this.mensagemErro = '';
    this.orgService.getAll().subscribe({
      next: data => this.orgs = data,
      error: err => {
        console.error('Erro ao listar organizações', err);
        this.mensagemErro = 'Erro ao carregar organizações.';
      }
    });
  }

  // UX: abre/fecha formulário e foca no input
  toggleCriar(): void {
    this.criando = !this.criando;
    if (!this.criando) {
      this.form.reset();
    } else {
      setTimeout(() => {
        const el = document.getElementById('nome') as HTMLInputElement | null;
        el?.focus();
      }, 0);
    }
  }

  iniciarEdicao(org: OrgDto): void {
    this.editandoId = org.id;
    this.editNome = org.nome;
    setTimeout(() => this.editInputRef?.nativeElement?.focus(), 0);
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.editNome = '';
    this.mensagem = 'Edição cancelada';
    setTimeout(() => (this.mensagem = ''), 1500);
  }

  onEditKeydown(event: KeyboardEvent, org: OrgDto): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.salvarEdicao(org);
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelarEdicao();
    }
  }

  salvarEdicao(org: OrgDto): void {
    const novoNome = this.editNome?.trim();
    if (!novoNome) {
      this.mensagemErro = 'O nome não pode ser vazio.';
      setTimeout(() => (this.mensagemErro = ''), 2000);
      return;
    }
    if (novoNome === org.nome) {
      this.cancelarEdicao();
      return;
    }
    this.orgService.update(org.id, novoNome).subscribe({
      next: atualizado => {
        this.mensagem = 'Organização atualizada com sucesso!';
        const idx = this.orgs.findIndex(o => o.id === org.id);
        if (idx > -1) this.orgs[idx] = atualizado;
        this.cancelarEdicao();
      },
      error: err => {
        console.error('Erro ao atualizar organização', err);
        this.mensagemErro = err?.error?.error || 'Erro ao atualizar organização.';
      }
    });
  }

  criar(): void {
    if (this.form.invalid) return;
    const nome = this.form.get('nome')?.value?.trim();
    if (!nome) return;

    this.mensagem = '';
    this.mensagemErro = '';

    this.orgService.create(nome).subscribe({
      next: (org) => {
        this.mensagem = 'Organização criada com sucesso!';
        this.orgs.push(org);
        this.criando = false;
        this.form.reset();
      },
      error: (err) => {
        console.error('Erro ao criar organização', err);
        this.mensagemErro = err?.error?.error || 'Erro ao criar organização.';
      }
    });
  }

  alterarStatus(org: OrgDto): void {
    const acao = org.ativo ? this.orgService.desativar(org.id) : this.orgService.ativar(org.id);
    acao.subscribe({
      next: () => {
        org.ativo = !org.ativo;
        this.mensagem = `Organização ${org.ativo ? 'ativada' : 'desativada'} com sucesso!`;
      },
      error: err => {
        console.error('Erro ao alterar status', err);
        this.mensagemErro = 'Erro ao alterar status da organização.';
      }
    });
  }

  trackByOrg(_index: number, item: OrgDto): number | undefined {
    return item?.id;
  }
}