import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CriteriosPriorizacionComponent } from './criterios-priorizacion.component';
import { CriterioPriorizacionService } from '../../core/services/criterio-priorizacion.service';
import { CriterioPriorizacion } from '../../core/models/criterio-priorizacion.model';

class CriterioPriorizacionServiceMock {
  listar = vi.fn();
  actualizar = vi.fn();
}

describe('CriteriosPriorizacionComponent', () => {
  let component: CriteriosPriorizacionComponent;
  let fixture: ComponentFixture<CriteriosPriorizacionComponent>;
  let serviceMock: CriterioPriorizacionServiceMock;

  const mockCriterios: CriterioPriorizacion[] = [
    { id: 1, nombre: 'Criticidad', peso: 0.35, activo: true },
    { id: 2, nombre: 'Riesgo', peso: 0.30, activo: true },
    { id: 3, nombre: 'Historial', peso: 0.20, activo: true },
    { id: 4, nombre: 'Frecuencia', peso: 0.15, activo: true },
  ];

  beforeEach(async () => {
    serviceMock = new CriterioPriorizacionServiceMock();
    serviceMock.listar.mockReturnValue(of(mockCriterios));
    serviceMock.actualizar.mockReturnValue(of({ criteriosActualizados: 4, casosRecalculados: 100 }));

    await TestBed.configureTestingModule({
      imports: [CriteriosPriorizacionComponent],
      providers: [
        provideRouter([]),
        { provide: CriterioPriorizacionService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CriteriosPriorizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('carga criterios al iniciar', () => {
    expect(serviceMock.listar).toHaveBeenCalled();
    expect(component.criterios()).toEqual(mockCriterios);
  });

  it('detecta configuración válida cuando suma 100%', () => {
    expect(component.sumaPesos()).toBeCloseTo(1, 10);
    expect(component.esValido()).toBe(true);
  });

  it('detecta configuración inválida cuando la suma no es 100%', () => {
    component.actualizarPeso(1, 50);
    expect(component.sumaPesos()).toBeCloseTo(1.15, 10);
    expect(component.esValido()).toBe(false);
  });

  it('deshabilita criterio y recalcula suma', () => {
    component.toggleActivo(mockCriterios[3]);
    expect(component.criterios()[3].activo).toBe(false);
    expect(component.sumaPesos()).toBeCloseTo(0.85, 10);
  });

  it('guarda configuración válida', () => {
    component.onSubmit();
    expect(serviceMock.actualizar).toHaveBeenCalled();
    expect(component.exito()).toContain('4 criterios actualizados');
  });
});
