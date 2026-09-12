import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TrazabilidadService } from './trazabilidad.service';
import { Trazabilidad } from '../models/trazabilidad.model';

describe('TrazabilidadService', () => {
  let service: TrazabilidadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrazabilidadService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TrazabilidadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('obtener trazabilidad por caso de prueba', () => {
    const mock: Trazabilidad = {
      requisito: { codigo: 'RF-03', nombre: 'Transferencias entre cuentas propias' },
      casoPrueba: { id: 104, titulo: 'Validar transferencia entre cuentas propias' },
      ultimaEjecucion: { resultado: 'FALLIDO', fecha: '2026-05-21' },
      estadoActual: 'BLOQUEADO',
    };

    service.obtener(104).subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne('/api/v1/trazabilidad/104');
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'success', data: mock });
  });
});
