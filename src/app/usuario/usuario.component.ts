
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {
  usuarios: any[] = [];
  isAdmin: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) {
      this.loadUsuarios();
    } else {
      this.errorMessage = 'Você não tem permissão para acessar esta página.';
    }
  }

  loadUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar usuários.';
      }
    });
  }
}
