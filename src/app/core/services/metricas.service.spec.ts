import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MetricasService } from './metricas.service';
import { MetricasDashboard } from '../models/metricas.model';

describe('MetricasService', () => {
  let service: MetricasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MetricasService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MetricasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('obtener métricas con rango de fechas', () => {
    const mock: MetricasDashboard = {
      cobertura: 78,
      porcentajeEjecutado: 71,
      casosObsoletosDepurados: 14,
      cumplimientoSLA: 92,
    };

    service.obtener({ desde: '2026-08-01', hasta: '2026-08-31' }).subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne('/api/v1/metricas?desde=2026-08-01&hasta=2026-08-31');
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'success', data: mock });
  });
});
