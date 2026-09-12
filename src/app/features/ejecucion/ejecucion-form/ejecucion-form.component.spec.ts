import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EjecucionFormComponent } from './ejecucion-form.component';
import { EjecucionResponse } from '../../../core/models/ejecucion.model';
import { EjecucionService } from '../../../core/services/ejecucion.service';
import { CasoPruebaService } from '../../../core/services/caso-prueba.service';
import { CasoPrueba } from '../../../core/models/caso-prueba.model';

class EjecucionServiceMock {
  registrar = vi.fn();
}

class CasoPruebaServiceMock {
  obtener = vi.fn();
}

describe('EjecucionFormComponent', () => {
  let component: EjecucionFormComponent;
  let fixture: ComponentFixture<EjecucionFormComponent>;
  let ejecucionMock: EjecucionServiceMock;
  let casoMock: CasoPruebaServiceMock;

  const mockCaso: CasoPrueba = {
    id: 104,
    titulo: 'Validar transferencia',
    modulo: 'Transferencias',
    criticidad: 'ALTA',
    estado: 'EN_CURSO',
    scorePrioridad: 9,
    requisitoId: 1,
  };

  beforeEach(async () => {
    ejecucionMock = new EjecucionServiceMock();
    casoMock = new CasoPruebaServiceMock();
    casoMock.obtener.mockReturnValue(of(mockCaso));
    ejecucionMock.registrar.mockReturnValue(of({
      id: 1,
      casoPruebaId: 104,
      resultado: 'APROBADO',
      estadoCaso: 'EJECUTADO',
      fechaEjecucion: '2026-08-11T00:00:00Z',
    } as EjecucionResponse));

    await TestBed.configureTestingModule({
      imports: [EjecucionFormComponent],
      providers: [
        provideRouter([{ path: 'priorizacion', component: EjecucionFormComponent }]),
        { provide: EjecucionService, useValue: ejecucionMock },
        { provide: CasoPruebaService, useValue: casoMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EjecucionFormComponent);
    component = fixture.componentInstance;

    const injector = fixture.debugElement.injector;
    const route = injector.get(ActivatedRoute) as ActivatedRoute;
    route.snapshot.paramMap.get = (key: string) => (key === 'casoPruebaId' ? '104' : null);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('carga caso de prueba al iniciar', () => {
    expect(casoMock.obtener).toHaveBeenCalledWith(104);
    expect(component.caso()).toEqual(mockCaso);
  });

  it('formulario inválido sin resultado', () => {
    expect(component.form.valid).toBe(false);
  });

  it('registra ejecución correctamente', () => {
    component.form.patchValue({ resultado: 'APROBADO', observaciones: 'OK' });
    component.onSubmit();
    expect(ejecucionMock.registrar).toHaveBeenCalledWith({
      casoPruebaId: 104,
      resultado: 'APROBADO',
      observaciones: 'OK',
    });
    expect(component.exito()).toContain('Ejecución registrada');
  });

  it('labels de resultado legibles', () => {
    expect(component.labelResultado('APROBADO')).toBe('Aprobado');
    expect(component.labelResultado('FALLIDO')).toBe('Fallido');
  });
});
