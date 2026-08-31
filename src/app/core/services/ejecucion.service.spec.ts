import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EjecucionService } from './ejecucion.service';
import { EjecucionPayload, EjecucionResponse } from '../models/ejecucion.model';

describe('EjecucionService', () => {
  let service: EjecucionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EjecucionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EjecucionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('registrar envía payload correcto y devuelve respuesta', () => {
    const payload: EjecucionPayload = {
      casoPruebaId: 10,
      resultado: 'FALLIDO',
      observaciones: 'Falla detectada',
    };

    const mockResponse: EjecucionResponse = {
      id: 1,
      casoPruebaId: 10,
      resultado: 'FALLIDO',
      estadoCaso: 'BLOQUEADO',
      fechaEjecucion: '2026-08-11T00:00:00Z',
    };

    service.registrar(payload).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/v1/ejecuciones');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ status: 'success', data: mockResponse });
  });
});
