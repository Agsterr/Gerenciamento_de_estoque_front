
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importa RouterModule para usar rotas filhas

@Component({
  selector: 'app-estoque',
  standalone: true,
  templateUrl: './estoque.component.html',
  styleUrls: ['./estoque.component.scss'],
  imports: [RouterModule], // Necessário para rotas filhas
})
export class EstoqueComponent {}
