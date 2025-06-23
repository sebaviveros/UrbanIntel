export class Solicitud {
  id!: number; 
  direccion?: string;
  comuna?: string;
  descripcion?: string;
  fechaCreacion!: string;
  fechaAprobacion?: string;
  fechaAsignacion?: string;
  tipoReparacion?: string;
  tipoReparacionId?: number;
  tipoReparacionNombre?: string;
  prioridadNombre?: string;
  prioridad?: string;
  prioridadId?: number;
  estadoNombre?: string;
  estadoId?: number;
  rutCiudadano?: string;
  nombreCiudadano?: string;
  apellidoCiudadano?: string;
  telefonoCiudadano?: string;
  emailCiudadano?: string;
  imagenes: string[] = [];   

  constructor(init?: Partial<Solicitud>) {
    Object.assign(this, init);
  }
}