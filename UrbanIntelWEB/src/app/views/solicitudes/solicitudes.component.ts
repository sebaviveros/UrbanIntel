import { Component, OnInit } from '@angular/core';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';
import Swal from 'sweetalert2';
import { Solicitud } from '../../models/solicitud.model';
import { GenericItem } from '../../models/generic-item.model';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/authService/auth.service';


@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss']
})
export class SolicitudesComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  solicitudesPaginadas: Solicitud[] = [];
  currentPage: number = 1;
  pageSize: number = 15;
  totalPages: number = 0;
  modalCiudadanoIndex: number | null = null;

  filtrosVisibles: boolean = false;
  filtro: {
  id?: number | null;
  comuna?: string | null;
  estadoId?: number | null;
  tipoReparacionId?: number | null;
  prioridadId?: number | null;
} = {
  id: null,
  comuna: null,
  estadoId: null,
  tipoReparacionId: null,
  prioridadId: null
};

modalCrearVisible: boolean = false;

nuevaSolicitud: {
  direccion: string;
  descripcion: string;
  comuna: string;
  tipoReparacionId: number | null;
  prioridadId: number | null;
  estadoId: number | null;
  rutUsuario?: string; 
  imagenes?: File[];
} = {
  direccion: '',
  descripcion: '',
  comuna: '',
  tipoReparacionId: null,
  prioridadId: null,
  estadoId: null
};

imagenesAdjuntas: File[] = [];


  activeIndex: number | null = null;
  modalIndex: number | null = null; // ← Modal activo
  searchText: string = '';
  estadoSeleccionado: string = '';

  tiposReparacion: GenericItem[] = [];
  prioridades: GenericItem[] = [];
  estados: GenericItem[] = [];

  imagenSeleccionada: string | null = null;

  constructor(private solicitudService: SolicitudService, private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
  try {
    // Cargar catálogos en paralelo
    const [tipos, prioridades, estados] = await Promise.all([
      firstValueFrom(this.solicitudService.obtenerTiposReparacion()),
      firstValueFrom(this.solicitudService.obtenerPrioridades()),
      firstValueFrom(this.solicitudService.obtenerEstados())
    ]);

    this.tiposReparacion = tipos;
    this.prioridades = prioridades;
    this.estados = estados;

    // Obtener solicitudes filtradas (todas si se pasa objeto vacío)
    const todasSolicitudes = await firstValueFrom(this.solicitudService.obtenerSolicitudPorFiltro({}));
    const solicitudes = todasSolicitudes.filter(sol => sol.estadoNombre !== 'Pendiente');

    // Obtener imágenes de cada solicitud en paralelo
    const solicitudesConImagenes = await Promise.all(
      solicitudes.map(async (sol) => {
        try {
          const imagenes = await firstValueFrom(this.solicitudService.obtenerImagenesPorSolicitud(sol.id));
          return { ...sol, imagenes };
        } catch (error) {
          console.error(`Error al obtener imágenes para solicitud ${sol.id}:`, error);
          return { ...sol, imagenes: [] };
        }
      })
    );

    this.solicitudes = solicitudesConImagenes;
    this.totalPages = Math.ceil(this.solicitudes.length / this.pageSize);
    this.actualizarPagina();

  } catch (error) {
    console.error('Error durante la carga inicial:', error);
  }
}

onImagenesSeleccionadas(event: any): void {
  this.imagenesAdjuntas = Array.from(event.target.files);
}

abrirImagen(img: string): void {
  this.imagenSeleccionada = img;
}

cerrarImagen(): void {
  this.imagenSeleccionada = null;
}

abrirModalCrear(): void {
  this.modalCrearVisible = true;
  this.nuevaSolicitud = {
    direccion: '',
    descripcion: '',
    comuna: '',
    tipoReparacionId: null,
    prioridadId: null,
    estadoId: null
  };
  this.imagenesAdjuntas = [];
}

crearNuevaSolicitud(): void {
  this.nuevaSolicitud.rutUsuario = this.authService.getRutUsuario()!;
  const formData = new FormData();

  Object.entries(this.nuevaSolicitud).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));  // <- corregido: fuerza todo a string
    }
  });
  console.log("datos:",formData)
  this.imagenesAdjuntas.forEach(file => {
    formData.append('imagenes', file);
  });

  this.solicitudService.crearSolicitudInterna(formData).subscribe({
    next: (res) => {
      Swal.fire('Solicitud creada', `Se ha creado la solicitud con ID #${res.id}`, 'success');
      this.cerrarModalCrear();
      this.ngOnInit(); // refrescar solicitudes
    },
    error: () => {
      Swal.fire('Error', 'No se pudo crear la solicitud.', 'error');
    }
  });
}




cerrarModalCrear(): void {
  this.modalCrearVisible = false;
}

  abrirModalCiudadano(index: number): void {
  const solicitud = this.solicitudesPaginadas[index];
  if (!solicitud.rutCiudadano) {
    Swal.fire('Sin información', 'Esta solicitud no tiene datos del ciudadano.', 'info');
    return;
  }
  this.modalCiudadanoIndex = index;
}

limpiarFiltros(): void {
  this.filtro = {
    id: null,
    comuna: null,
    estadoId: null,
    tipoReparacionId: null,
    prioridadId: null
  };
}


  cerrarModalCiudadano(): void {
  this.modalCiudadanoIndex = null;
}

  guardarInfoCiudadano(index: number): void {
  const solicitud = this.solicitudesPaginadas[index];

  Swal.fire({
    title: '¿Guardar cambios?',
    text: 'Se actualizarán los datos del ciudadano.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, guardar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.solicitudService.modificarCiudadano(solicitud.id, solicitud).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Datos del ciudadano modificados.', 'success');
          this.cerrarModalCiudadano();
        },
        error: () => {
          Swal.fire('Error', 'No se pudieron guardar los datos.', 'error');
        }
      });
    }
  });
}

  confirmarEliminar(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la solicitud y sus imágenes asociadas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitudService.eliminarSolicitud(id).subscribe({
          next: () => {
            this.solicitudes = this.solicitudes.filter(s => s.id !== id);
            this.actualizarPagina(); // para paginar correctamente después del borrado
            Swal.fire('Eliminado', 'La solicitud fue eliminada correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la solicitud.', 'error');
          }
        });
      }
    });
  }

  guardarCambios(index: number): void {
    const solicitud = this.solicitudesPaginadas[index];
    solicitud.rutUsuario = this.authService.getRutUsuario()!;

    Swal.fire({
      title: '¿Guardar cambios?',
      text: 'Se actualizará la información de la solicitud.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitudService.modificarSolicitud(solicitud.id, solicitud).subscribe({
          next: () => {
            Swal.fire('Actualizado', 'La solicitud ha sido modificada.', 'success');
            this.cerrarModal();
            this.ngOnInit(); // Recarga la lista completa
          },
          error: () => {
            Swal.fire('Error', 'No se pudo actualizar la solicitud.', 'error');
          }
        });
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'bg-pendiente';
      case 'Finalizada': return 'bg-success';
      case 'En proceso': return 'bg-warning text-dark';
      case 'Rechazada': return 'bg-rechazada';
      default: return 'bg-secondary';
    }
  }

  actualizarPagina(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.solicitudesPaginadas = this.solicitudes.slice(start, end);
    this.activeIndex = null;
  }

  cambiarPagina(pagina: number): void {
    this.currentPage = pagina;
    this.actualizarPagina();
  }

  toggleAcordeon(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  abrirFiltro(): void {
  this.filtrosVisibles = !this.filtrosVisibles;
  }

  async buscarPorFiltros(): Promise<void> {
  try {
    const filtrosLimpiados = Object.fromEntries(
      Object.entries(this.filtro).filter(([_, v]) => v !== null && v !== '')
    );

    const solicitudes = await firstValueFrom(
      this.solicitudService.obtenerSolicitudPorFiltro(filtrosLimpiados)
    );

    const solicitudesConImagenes = await Promise.all(
      solicitudes.map(async (sol) => {
        const imagenes = await firstValueFrom(this.solicitudService.obtenerImagenesPorSolicitud(sol.id));
        return { ...sol, imagenes };
      })
    );

    this.solicitudes = solicitudesConImagenes;
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.solicitudes.length / this.pageSize);
    this.actualizarPagina();
    this.filtrosVisibles = false;
  } catch (error) {
    console.error('Error al buscar por filtros:', error);
  }
}


  filtrarSolicitudes(): void {
    const texto = this.searchText.toLowerCase();
    const filtradas = this.solicitudes.filter(s =>
      s.direccion?.toLowerCase().includes(texto) ||
      s.descripcion?.toLowerCase().includes(texto) ||
      s.comuna?.toLowerCase().includes(texto) ||
      s.rutCiudadano?.toLowerCase().includes(texto) ||
      s.nombreCiudadano?.toLowerCase().includes(texto) ||
      s.apellidoCiudadano?.toLowerCase().includes(texto) ||
      String(s.id).includes(texto)
    );

    this.totalPages = Math.ceil(filtradas.length / this.pageSize);
    this.solicitudesPaginadas = filtradas.slice(0, this.pageSize);
    this.currentPage = 1;
    this.activeIndex = null;
    }

    async actualizarSolicitudes(): Promise<void> {
  await this.ngOnInit();
}

  abrirModal(index: number): void {
    this.modalIndex = index;
  }

  cerrarModal(): void {
    this.modalIndex = null;
  }

}
