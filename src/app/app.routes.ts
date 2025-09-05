import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProdutoComponent } from './produto/produto.component';
import { ConsumersComponent } from './consumidor/consumidor.component';
import { EntregasComponent } from './entregas/entregas.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { HomeComponent } from './home/home.component';
import { MovimentacaoProdutoComponent } from './movimentacao/movimentacao.produto.component';
import { RelatoriosComponent } from './relatorios/relatorios.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/Auth.Guard';
import { OrgComponent } from './org/org.component';
import { OfflineComponent } from './offline.component';
import { NetworkGuard } from './guards/network.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [NetworkGuard] },
  { path: 'login', component: LoginComponent, canActivate: [NetworkGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AdminGuard, NetworkGuard] },
  { path: 'orgs', component: OrgComponent, canActivate: [AdminGuard, NetworkGuard] },
  { path: 'offline', component: OfflineComponent },

  // Dashboard com rotas filhas
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, NetworkGuard],
    children: [
      { path: '', redirectTo: 'produtos', pathMatch: 'full' },
      { path: 'produtos', component: ProdutoComponent },
      { path: 'categorias', component: CategoriaComponent, canActivate: [NetworkGuard] },
      { path: 'consumidores', component: ConsumersComponent, canActivate: [NetworkGuard] },
      { path: 'entregas', component: EntregasComponent, canActivate: [NetworkGuard] },
      { path: 'movimentacoes', component: MovimentacaoProdutoComponent, canActivate: [NetworkGuard] },
      { path: 'relatorios', component: RelatoriosComponent, canActivate: [NetworkGuard] }
    ],
  },
];
