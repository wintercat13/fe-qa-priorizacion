import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PriorizacionComponent } from './priorizacion.component';
import { CasoPruebaService } from '../../core/services/caso-prueba.service';
import { CasoPrueba } from '../../core/models/caso-prueba.model';

class CasoPruebaServiceMock {
  listarPriorizados = vi.fn();
}

describe('PriorizacionComponent', () => {
  let component: PriorizacionComponent;
  let fixture: ComponentFixture<PriorizacionComponent>;
  let serviceMock: CasoPruebaServiceMock;

  const mockCasos: CasoPrueba[] = [
    { id: 1, titulo: 'Caso alto', modulo: 'Tarjetas', criticidad: 'ALTA', estado: 'PENDIENTE', scorePrioridad: 9.5, requisitoId: 1 },
    { id: 2, titulo: 'Caso medio', modulo: 'Transferencias', criticidad: 'MEDIA', estado: 'PENDIENTE', scorePrioridad: 6.2, requisitoId: 2 },
  ];

  beforeEach(async () => {
    serviceMock = new CasoPruebaServiceMock();
    serviceMock.listarPriorizados.mockReturnValue(of(mockCasos));

    await TestBed.configureTestingModule({
      imports: [PriorizacionComponent],
      providers: [
        provideRouter([]),
        { provide: CasoPruebaService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PriorizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('carga cola priorizada al iniciar', () => {
    expect(serviceMock.listarPriorizados).toHaveBeenCalled();
    expect(component.casos()).toEqual(mockCasos);
  });

  it('aplica filtro por módulo', () => {
    component.filtroModulo.set('Tarjetas');
    component.aplicarFiltro();
    expect(serviceMock.listarPriorizados).toHaveBeenCalledWith('Tarjetas');
  });

  it('clase de score según valor', () => {
    expect(component.scoreClass(9)).toBe('score-hi');
    expect(component.scoreClass(6)).toBe('score-mid');
    expect(component.scoreClass(3)).toBe('score-lo');
  });

  it('medallas para top 3', () => {
    expect(component.posicionClass(0)).toBe('posicion-oro');
    expect(component.posicionClass(1)).toBe('posicion-plata');
    expect(component.posicionClass(2)).toBe('posicion-bronce');
    expect(component.posicionClass(3)).toBe('');
  });
});
