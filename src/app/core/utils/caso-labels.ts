import { Criticidad, EstadoCaso } from '../models/caso-prueba.model';
import { ResultadoEjecucion } from '../models/ejecucion.model';

export function labelEstado(estado: EstadoCaso | string): string {
  return estado.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

export function labelCriticidad(c: Criticidad): string {
  return c.charAt(0) + c.slice(1).toLowerCase();
}

export function labelResultado(r: ResultadoEjecucion): string {
  switch (r) {
    case 'APROBADO': return 'Aprobado';
    case 'FALLIDO': return 'Fallido';
    case 'BLOQUEADO': return 'Bloqueado';
    default: return r;
  }
}

export function criticidadClass(crit: Criticidad | string): string {
  switch (crit) {
    case 'ALTA': return 'crit-Alta';
    case 'MEDIA': return 'crit-Media';
    case 'BAJA': return 'crit-Baja';
    default: return '';
  }
}

export function estadoClass(estado: EstadoCaso | string): string {
  switch (estado) {
    case 'PENDIENTE': return 'pill-Pendiente';
    case 'EN_CURSO': return 'pill-Encurso';
    case 'EJECUTADO': return 'pill-Ejecutado';
    case 'BLOQUEADO': return 'pill-Bloqueado';
    case 'OBSOLETO': return 'pill-Obsoleto';
    case 'ARCHIVADO': return 'pill-Archivado';
    default: return '';
  }
}

export function scoreClass(score: number): string {
  if (score >= 8) return 'score-hi';
  if (score >= 5) return 'score-mid';
  return 'score-lo';
}
