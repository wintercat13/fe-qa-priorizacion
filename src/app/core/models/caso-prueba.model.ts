export const CRITICIDADES = ['ALTA', 'MEDIA', 'BAJA'] as const;
export type Criticidad = (typeof CRITICIDADES)[number];

export interface CasoPrueba {
  id: number;
  titulo: string;
  descripcion?: string;
  modulo: string;
  criticidad: Criticidad;
  estado: string;
  scorePrioridad: number;
  requisitoId: number;
}

export interface CasoPruebaPayload {
  titulo: string;
  descripcion: string;
  modulo: string;
  criticidad: Criticidad;
  requisitoId: number;
}

export interface Requisito {
  id: number;
  codigo: string;
  nombre: string;
}
