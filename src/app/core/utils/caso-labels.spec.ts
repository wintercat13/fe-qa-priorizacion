import {
  labelCriticidad,
  labelEstado,
  labelResultado,
  criticidadClass,
  estadoClass,
  scoreClass,
} from './caso-labels';

describe('caso-labels', () => {
  describe('labelEstado', () => {
    it('formatea estados con guión bajo', () => {
      expect(labelEstado('EN_CURSO')).toBe('En Curso');
      expect(labelEstado('BLOQUEADO')).toBe('Bloqueado');
    });
  });

  describe('labelCriticidad', () => {
    it('pone la primera letra en mayúscula', () => {
      expect(labelCriticidad('ALTA')).toBe('Alta');
      expect(labelCriticidad('BAJA')).toBe('Baja');
    });
  });

  describe('labelResultado', () => {
    it('devuelve etiqueta legible', () => {
      expect(labelResultado('APROBADO')).toBe('Aprobado');
      expect(labelResultado('FALLIDO')).toBe('Fallido');
      expect(labelResultado('BLOQUEADO')).toBe('Bloqueado');
    });
  });

  describe('criticidadClass', () => {
    it('asigna clase según criticidad', () => {
      expect(criticidadClass('ALTA')).toBe('crit-Alta');
      expect(criticidadClass('MEDIA')).toBe('crit-Media');
      expect(criticidadClass('BAJA')).toBe('crit-Baja');
      expect(criticidadClass('DESCONOCIDA')).toBe('');
    });
  });

  describe('estadoClass', () => {
    it('asigna clase según estado', () => {
      expect(estadoClass('PENDIENTE')).toBe('pill-Pendiente');
      expect(estadoClass('EJECUTADO')).toBe('pill-Ejecutado');
      expect(estadoClass('OBSOLETO')).toBe('pill-Obsoleto');
      expect(estadoClass('ARCHIVADO')).toBe('pill-Archivado');
    });
  });

  describe('scoreClass', () => {
    it('clasifica score en alto, medio o bajo', () => {
      expect(scoreClass(9)).toBe('score-hi');
      expect(scoreClass(7)).toBe('score-mid');
      expect(scoreClass(4)).toBe('score-lo');
    });
  });
});
