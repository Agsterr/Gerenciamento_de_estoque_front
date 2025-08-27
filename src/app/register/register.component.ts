import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../environments/environment';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ transform: 'translateY(50px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ transform: 'translateX(-30px)', opacity: 0 }),
        animate('400ms 200ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(30px)', opacity: 0 }),
        animate('400ms 300ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  roles: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  isSubmitting: boolean = false;
  focusedField: string = '';
  passwordStrength = {
    percentage: 0,
    text: '',
    class: ''
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private roleService: RoleService,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      orgId: ['', Validators.required],
      roles: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    // Verifica se há uma mensagem de erro armazenada no localStorage
    const errorMessage = localStorage.getItem('authErrorMessage');
    if (errorMessage) {
      this.errorMessage = errorMessage;
      localStorage.removeItem('authErrorMessage');
    }

    // Carregar as roles do backend
    this.roleService.listarRoles().subscribe({
      next: (roles: any[]) => {
        this.roles = roles;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar roles:', err);
        this.errorMessage = 'Erro ao carregar roles.';
        this.snackBar.open(this.errorMessage, 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onFieldFocus(fieldName: string): void {
    this.focusedField = fieldName;
  }

  onFieldBlur(fieldName: string): void {
    if (this.focusedField === fieldName) {
      this.focusedField = '';
    }
  }

  onPasswordChange(): void {
    const password = this.registerForm.get('senha')?.value || '';
    this.passwordStrength = this.calculatePasswordStrength(password);
  }

  calculatePasswordStrength(password: string): any {
    let score = 0;
    let text = '';
    let className = '';

    if (password.length >= 6) score += 20;
    if (password.length >= 8) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;

    if (score < 40) {
      text = 'Fraca';
      className = 'weak';
    } else if (score < 70) {
      text = 'Média';
      className = 'medium';
    } else {
      text = 'Forte';
      className = 'strong';
    }

    return {
      percentage: Math.min(score, 100),
      text,
      class: className
    };
  }

  getFormProgress(): number {
    const fields = ['username', 'senha', 'email', 'orgId', 'roles'];
    let filledFields = 0;

    fields.forEach(field => {
      const control = this.registerForm.get(field);
      if (control && control.value && control.valid) {
        filledFields++;
      }
    });

    return Math.round((filledFields / fields.length) * 100);
  }

  isRoleSelected(roleName: string): boolean {
    const selectedRoles = this.registerForm.get('roles')?.value || [];
    return selectedRoles.includes(roleName);
  }

  toggleRole(roleName: string): void {
    const currentRoles = this.registerForm.get('roles')?.value || [];
    const index = currentRoles.indexOf(roleName);
    
    if (index > -1) {
      currentRoles.splice(index, 1);
    } else {
      currentRoles.push(roleName);
    }
    
    this.registerForm.get('roles')?.setValue([...currentRoles]);
    this.registerForm.get('roles')?.markAsTouched();
  }

  getRoleIcon(roleName: string): string {
    const iconMap: { [key: string]: string } = {
      'ADMIN': 'admin_panel_settings',
      'USER': 'person',
      'MANAGER': 'supervisor_account',
      'VIEWER': 'visibility',
      'EDITOR': 'edit'
    };
    return iconMap[roleName.toUpperCase()] || 'assignment_ind';
  }

  trackByRole(index: number, role: any): any {
    return role.id || role.nome;
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isSubmitting) {
      const { username, senha, email } = this.registerForm.value;
      let { orgId, roles } = this.registerForm.value;

      // Garante que orgId seja número e válido
      const parsedOrgId = Number(orgId);
      if (!Number.isFinite(parsedOrgId) || parsedOrgId <= 0) {
        this.errorMessage = 'ID da organização inválido. Informe um número válido.';
        this.snackBar.open(this.errorMessage, 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      // Garante que roles seja um array de strings
      roles = Array.isArray(roles) ? roles.map((r: any) => String(r)) : [];

      // Verifica se pelo menos uma role foi selecionada
      if (roles.length === 0) {
        this.errorMessage = 'Você precisa selecionar pelo menos uma permissão.';
        this.snackBar.open(this.errorMessage, 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = '';

      const payload = { username, senha, email, orgId: parsedOrgId, roles };

      // Chama o serviço de autenticação para registrar o usuário
      this.authService
        .register(payload)
        .subscribe({
          next: (response) => {
            if (!environment.production) {
              console.log('Registro bem-sucedido:', response);
            }
            this.successMessage = 'Conta criada com sucesso! Redirecionando...';
            this.snackBar.open(this.successMessage, 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.errorMessage = '';
            
            // Delay para mostrar a mensagem de sucesso
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (err: HttpErrorResponse) => {
            console.error('Erro ao registrar:', err);
            // Mensagens mais específicas para 400
            if (err.status === 400) {
              this.errorMessage = err.error?.message || 'Dados inválidos. Verifique o ID da organização e os campos obrigatórios.';
            } else if (err.status === 403) {
              this.errorMessage = 'Ação não permitida. É necessário ter permissão de ADMIN.';
            } else {
              this.errorMessage = 'Erro ao criar conta. Verifique os dados e tente novamente.';
            }
            this.snackBar.open(this.errorMessage, 'Fechar', {
              duration: 4000,
              panelClass: ['error-snackbar'],
            });
            this.successMessage = '';
            this.isSubmitting = false;
          },
        });
    } else if (!this.registerForm.valid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
      this.snackBar.open(this.errorMessage, 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      
      // Marca todos os campos como touched para mostrar erros
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    if (!this.isSubmitting) {
      this.registerForm.reset();
      this.successMessage = '';
      this.errorMessage = '';
      this.showPassword = false;
      this.focusedField = '';
      this.passwordStrength = { percentage: 0, text: '', class: '' };
      this.router.navigate(['/login']);
    }
  }
}
