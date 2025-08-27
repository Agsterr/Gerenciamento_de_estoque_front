import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscaEntregaComponent } from './busca-entrega.component';

describe('BuscaEntregaComponent', () => {
  let component: BuscaEntregaComponent;
  let fixture: ComponentFixture<BuscaEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscaEntregaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscaEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
