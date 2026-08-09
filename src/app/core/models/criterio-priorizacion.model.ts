export interface CriterioPriorizacion {
  id: number;
  nombre: string;
  peso: number;
  activo: boolean;
}

export interface ActualizacionCriteriosPayload {
  criterios: CriterioPriorizacion[];
}

export interface ActualizacionCriteriosResponse {
  criteriosActualizados: number;
  casosRecalculados: number;
}
