import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CriterioPriorizacionService } from './criterio-priorizacion.service';
import { CriterioPriorizacion } from '../models/criterio-priorizacion.model';

describe('CriterioPriorizacionService', () => {
  let service: CriterioPriorizacionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CriterioPriorizacionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CriterioPriorizacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listar criterios', () => {
    const mock: CriterioPriorizacion[] = [
      { id: 1, nombre: 'Criticidad', peso: 0.35, activo: true },
      { id: 2, nombre: 'Riesgo', peso: 0.30, activo: true },
    ];

    service.listar().subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne('/api/v1/criterios-priorizacion');
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'success', data: mock });
  });

  it('actualizar criterios devuelve contadores', () => {
    const payload: CriterioPriorizacion[] = [
      { id: 1, nombre: 'Criticidad', peso: 0.40, activo: true },
    ];

    service.actualizar({ criterios: payload }).subscribe((res) => {
      expect(res.criteriosActualizados).toBe(1);
      expect(res.casosRecalculados).toBe(10);
    });

    const req = httpMock.expectOne('/api/v1/criterios-priorizacion');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ criterios: payload });
    req.flush({ status: 'success', data: { criteriosActualizados: 1, casosRecalculados: 10 } });
  });
});
