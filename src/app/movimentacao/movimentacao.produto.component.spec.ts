import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimentacaoProdutoComponent } from './movimentacao.produto.component';

describe('MovimentacaoProdutoComponent', () => {
  let component: MovimentacaoProdutoComponent;
  let fixture: ComponentFixture<MovimentacaoProdutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovimentacaoProdutoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovimentacaoProdutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
