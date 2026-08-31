import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CasoListComponent } from './caso-list.component';
import { CasoPruebaService } from '../../../core/services/caso-prueba.service';
import { CasoPrueba } from '../../../core/models/caso-prueba.model';

class CasoPruebaServiceMock {
  listar = vi.fn();
}

describe('CasoListComponent', () => {
  let component: CasoListComponent;
  let fixture: ComponentFixture<CasoListComponent>;
  let serviceMock: CasoPruebaServiceMock;

  const mockCasos: CasoPrueba[] = [
    { id: 1, titulo: 'Caso A', modulo: 'Módulo 1', criticidad: 'ALTA', estado: 'PENDIENTE', scorePrioridad: 9, requisitoId: 1 },
    { id: 2, titulo: 'Otro caso', modulo: 'Módulo 2', criticidad: 'BAJA', estado: 'OBSOLETO', scorePrioridad: 3, requisitoId: 2 },
  ];

  beforeEach(async () => {
    serviceMock = new CasoPruebaServiceMock();
    serviceMock.listar.mockReturnValue(of(mockCasos));

    await TestBed.configureTestingModule({
      imports: [CasoListComponent],
      providers: [
        provideRouter([]),
        { provide: CasoPruebaService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CasoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('carga casos al iniciar', () => {
    expect(serviceMock.listar).toHaveBeenCalled();
    expect(component.casos()).toEqual(mockCasos);
  });

  it('muestra error si falla la carga', () => {
    serviceMock.listar.mockReturnValue(throwError(() => new Error('Error de red')));
    component.cargar();
    expect(component.error()).toBe('Error de red');
  });

  it('filtra por texto', () => {
    component.filtroTexto.set('Otro');
    expect(component.casosFiltrados().length).toBe(1);
    expect(component.casosFiltrados()[0].titulo).toBe('Otro caso');
  });

  it('filtra por estado', () => {
    component.filtroEstado.set('OBSOLETO');
    expect(component.casosFiltrados().length).toBe(1);
    expect(component.casosFiltrados()[0].estado).toBe('OBSOLETO');
  });

  it('clasifica filas obsoletas y archivadas', () => {
    const obsoleto = { ...mockCasos[1], estado: 'OBSOLETO' as const };
    const archivado = { ...mockCasos[1], estado: 'ARCHIVADO' as const };
    expect(component.filaClase(obsoleto)).toBe('fila-obsoleto');
    expect(component.filaClase(archivado)).toBe('fila-archivado');
  });

  it('muestra error si falla la carga', () => {
    serviceMock.listar.mockReturnValue(throwError(() => new Error('Error de red')));
    component.cargar();
    expect(component.error()).toBe('Error de red');
  });
});
