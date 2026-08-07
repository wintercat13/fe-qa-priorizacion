export const CRITICIDADES = ['ALTA', 'MEDIA', 'BAJA'] as const;
export type Criticidad = (typeof CRITICIDADES)[number];

export const ESTADOS_CASO = ['PENDIENTE', 'EN_CURSO', 'EJECUTADO', 'BLOQUEADO', 'OBSOLETO'] as const;
export type EstadoCaso = (typeof ESTADOS_CASO)[number];

export interface CasoPrueba {
  id: number;
  titulo: string;
  descripcion?: string;
  modulo: string;
  criticidad: Criticidad;
  estado: EstadoCaso;
  scorePrioridad: number;
  requisitoId: number;
  fechaActualizacion?: string;
}

export interface CasoPruebaPayload {
  titulo: string;
  descripcion: string;
  modulo: string;
  criticidad: Criticidad;
  estado?: EstadoCaso;
  requisitoId: number;
}

export interface Requisito {
  id: number;
  codigo: string;
  nombre: string;
}
