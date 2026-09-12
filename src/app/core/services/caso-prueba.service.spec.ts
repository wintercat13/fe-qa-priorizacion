import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CasoPruebaService } from './caso-prueba.service';
import { CasoPrueba } from '../models/caso-prueba.model';

describe('CasoPruebaService', () => {
  let service: CasoPruebaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CasoPruebaService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CasoPruebaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listar obtiene casos de prueba', () => {
    const mock: CasoPrueba[] = [
      { id: 1, titulo: 'Caso A', modulo: 'Transferencias', criticidad: 'ALTA', estado: 'PENDIENTE', scorePrioridad: 9, requisitoId: 1 },
    ];

    service.listar().subscribe((casos) => {
      expect(casos).toEqual(mock);
    });

    const req = httpMock.expectOne('/api/v1/casos-prueba');
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'success', data: mock });
  });

  it('verificarDuplicidad envía título y módulo', () => {
    const mockResponse = { posibleDuplicado: true, casoSimilarId: 5, porcentajeSimilitud: 0.85 };

    service.verificarDuplicidad('Transferencia', 'Transferencias').subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/v1/casos-prueba/verificar-duplicidad');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ titulo: 'Transferencia', modulo: 'Transferencias' });
    req.flush({ status: 'success', data: mockResponse });
  });

  it('listarPriorizados incluye módulo como query param', () => {
    const mock: CasoPrueba[] = [
      { id: 2, titulo: 'Caso B', modulo: 'Tarjetas', criticidad: 'MEDIA', estado: 'PENDIENTE', scorePrioridad: 8, requisitoId: 2 },
    ];

    service.listarPriorizados('Tarjetas').subscribe((casos) => {
      expect(casos).toEqual(mock);
    });

    const req = httpMock.expectOne('/api/v1/casos-prueba/priorizados?modulo=Tarjetas');
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'success', data: mock });
  });
});
