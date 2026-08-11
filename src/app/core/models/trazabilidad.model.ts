export interface RequisitoTrazabilidad {
  codigo: string;
  nombre: string;
}

export interface CasoPruebaTrazabilidad {
  id: number;
  titulo: string;
}

export interface UltimaEjecucion {
  resultado: string;
  fecha: string;
}

export interface Trazabilidad {
  requisito: RequisitoTrazabilidad;
  casoPrueba: CasoPruebaTrazabilidad;
  ultimaEjecucion: UltimaEjecucion | null;
  estadoActual: string;
}
