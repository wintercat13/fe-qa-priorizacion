export interface MetricasDashboard {
  cobertura: number;
  porcentajeEjecutado: number;
  casosObsoletosDepurados: number;
  cumplimientoSLA: number;
}

export interface RangoFechas {
  desde: string;
  hasta: string;
}
