import { TestBed } from '@angular/core/testing';
import { RouterModule, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'; // Importando Router
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: jasmine.SpyObj<AuthService>;  // Aqui fazemos o tipo ser um SpyObj
  let router: Router;

  beforeEach(() => {
    // Criando o espião para o AuthService usando jasmine.createSpyObj
    const authServiceMock = jasmine.createSpyObj('AuthService', ['getLoggedUser']);

    // Configure o TestBed
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],  // Usando RouterModule para testes
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authServiceMock }, // Usando o mock do AuthService
      ],
    });

    guard = TestBed.inject(AdminGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>; // Garantimos que o tipo seja SpyObj
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if user is admin', () => {
    // Simula um usuário com a role ROLE_ADMIN
    authService.getLoggedUser.and.returnValue({ roles: [{ nome: 'ROLE_ADMIN' }] });

    // Criando mock dos parâmetros necessários para o canActivate
    const route: ActivatedRouteSnapshot = {} as any; // Mock para ActivatedRouteSnapshot
    const state: RouterStateSnapshot = {} as any; // Mock para RouterStateSnapshot

    // Verifica se o guard permite o acesso
    const result = guard.canActivate(route, state);
    expect(result).toBe(true); // O guard deve permitir o acesso
  });

  it('should redirect to login if user is not admin', () => {
    // Simula um usuário sem a role ROLE_ADMIN
    authService.getLoggedUser.and.returnValue({ roles: [{ nome: 'ROLE_USER' }] });

    // Criando mock dos parâmetros necessários para o canActivate
    const route: ActivatedRouteSnapshot = {} as any;
    const state: RouterStateSnapshot = {} as any;

    // Verifica se o guard redireciona para o login
    const result = guard.canActivate(route, state);
    expect(result).toEqual(router.createUrlTree(['/login'])); // Espera redirecionamento para login
  });

  it('should redirect to dashboard if user is not admin', () => {
    // Simula um usuário sem a role ROLE_ADMIN
    authService.getLoggedUser.and.returnValue({ roles: [{ nome: 'ROLE_USER' }] });

    // Criando mock dos parâmetros necessários para o canActivate
    const route: ActivatedRouteSnapshot = {} as any;
    const state: RouterStateSnapshot = {} as any;

    // Verifica se o guard redireciona para o dashboard
    const result = guard.canActivate(route, state);
    expect(result).toEqual(router.createUrlTree(['/dashboard'])); // Espera redirecionamento para o dashboard
  });
});
