import { Component, OnInit } from '@angular/core';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';
import { AuthService } from '../../services/authService/auth.service';
import { AprobarSolicitudDto } from '../../models/Dto/aprobarSolicitudDto';
import { GenericItem } from '../../models/generic-item.model';
import Swal from 'sweetalert2';

interface Solicitud {
  id: number;
  nombre: string;
  direccion: string;
  descripcion: string;
  imagenes: string[];
  tipoReparacionId: number;
  prioridadId: number;
  estado: string;
  rutCiudadano: string;
  emailCiudadano: string;
  estadoNombre: string;
  comuna: string;
}

@Component({
  selector: 'app-aprobaciones',
  templateUrl: './aprobaciones.component.html',
  styleUrls: ['./aprobaciones.component.scss']
})
export class AprobacionesComponent implements OnInit {

  // datos de solicitudes
  solicitudes: Solicitud[] = [];
  solicitudesPaginadas: Solicitud[] = [];

  // paginacion
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;

  // estado del acordeon
  activeIndex: number | null = null;

  // datos de filtros y busqueda
  filtrosVisibles: boolean = false;
  filtro = { id: '', comuna: '' };
  searchText: string = '';

  // opciones para selects
  tiposReparacion: GenericItem[] = [];
  prioridades: GenericItem[] = [];

  // modal de imagen
  imagenSeleccionada: string | null = null;

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerSolicitudesPendientes();
    this.obtenerTiposReparacion();
    this.obtenerPrioridades();
  }

  // obtiene solicitudes con estado pendiente y sus imagenes
  obtenerSolicitudesPendientes(): void {
    const filtros = { estadoId: 2 };
    this.solicitudService.obtenerSolicitudPorFiltro(filtros).subscribe(async solicitudes => {
      const solicitudesConImagenes = await Promise.all(
        solicitudes.map(async (sol: any) => {
          const imagenes = await this.solicitudService.obtenerImagenesPorSolicitud(sol.id).toPromise();
          return { ...sol, imagenes };
        })
      );
      this.solicitudes = solicitudesConImagenes;
      this.totalPages = Math.ceil(this.solicitudes.length / this.pageSize);
      this.actualizarPagina();
    });
  }

  // obtiene listado de tipos de reparacion
  obtenerTiposReparacion(): void {
    this.solicitudService.obtenerTiposReparacion().subscribe(data => {
      this.tiposReparacion = data;
    });
  }

  // obtiene listado de prioridades
  obtenerPrioridades(): void {
    this.solicitudService.obtenerPrioridades().subscribe(data => {
      this.prioridades = data;
    });
  }

  // aprueba una solicitud
  aprobarSolicitud(index: number): void {
    const solicitud = this.solicitudesPaginadas[index];

    if (!solicitud.tipoReparacionId || !solicitud.prioridadId) {
      Swal.fire('Campos requeridos', 'Debes seleccionar tipo de reparación y prioridad.', 'warning');
      return;
    }

    const rut = this.authService.obtenerRutUsuario();
    if (!rut) {
      Swal.fire('Error', 'No se pudo obtener el RUT del usuario.', 'error');
      return;
    }

    const dto: AprobarSolicitudDto = {
      tipoReparacionId: solicitud.tipoReparacionId,
      prioridadId: solicitud.prioridadId,
      rutUsuario: rut
    };

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas aprobar la solicitud #${solicitud.id}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.solicitudService.aprobarSolicitud(solicitud.id, dto).subscribe({
          next: () => {
            Swal.fire('Aprobada', 'La solicitud ha sido aprobada.', 'success');
            this.obtenerSolicitudesPendientes();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo aprobar la solicitud.', 'error');
          }
        });
      }
    });
  }

  // deniega una solicitud
  denegarSolicitud(index: number): void {
    const solicitud = this.solicitudesPaginadas[index];

    Swal.fire({
      title: '¿Deseas denegar esta solicitud?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, denegar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Motivo de denegación',
          input: 'textarea',
          inputLabel: 'Por favor, escribe una explicación (opcional):',
          inputPlaceholder: 'Motivo del rechazo...',
          inputAttributes: { 'aria-label': 'Motivo' },
          showCancelButton: true
        }).then(res => {
          if (res.isConfirmed) {
            const motivo = res.value?.trim() || "N/A";

            const rut = this.authService.obtenerRutUsuario();
            if (!rut) {
              Swal.fire('Error', 'No se pudo obtener el RUT del usuario.', 'error');
              return;
            }

            const dto = { motivo, rutUsuario: rut };

            this.solicitudService.denegarSolicitud(solicitud.id, dto).subscribe({
              next: () => {
                Swal.fire('Rechazada', 'La solicitud ha sido denegada.', 'success');
                this.obtenerSolicitudesPendientes();
              },
              error: () => {
                Swal.fire('Error', 'No se pudo denegar la solicitud.', 'error');
              }
            });
          }
        });
      }
    });
  }

  // abre modal de imagen
  abrirImagen(imagen: string): void {
    this.imagenSeleccionada = imagen;
  }

  // cierra modal de imagen
  cerrarImagen(): void {
    this.imagenSeleccionada = null;
  }

  // cambia de pagina
  cambiarPagina(pagina: number): void {
    this.currentPage = pagina;
    this.actualizarPagina();
  }

  // actualiza la pagina con las solicitudes visibles
  actualizarPagina(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.solicitudesPaginadas = this.solicitudes.slice(start, end);
    this.activeIndex = null;
  }

  // alterna visibilidad de acordeon
  toggleAcordeon(index: number): void {
    if (this.activeIndex === index) {
      this.activeIndex = null;
    } else {
      this.activeIndex = index;
      this.solicitudesPaginadas[index].tipoReparacionId = null!;
      this.solicitudesPaginadas[index].prioridadId = null!;
    }
  }

  // alterna visibilidad de filtros
  abrirFiltro(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  // aplica filtros por id y comuna
  buscarPorFiltros(): void {
    const { id, comuna } = this.filtro;

    const normalizar = (texto: string) =>
      texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtradas = this.solicitudes.filter(sol => {
      const coincideId = id ? sol.id.toString().includes(id) : true;
      const coincideComuna = comuna ? normalizar(sol.direccion).includes(normalizar(comuna)) : true;
      return coincideId && coincideComuna;
    });

    this.totalPages = Math.ceil(filtradas.length / this.pageSize);
    this.solicitudesPaginadas = filtradas.slice(0, this.pageSize);
    this.currentPage = 1;
    this.activeIndex = null;
    this.filtrosVisibles = false;
  }

  // limpia filtros aplicados
  limpiarFiltros(): void {
    this.filtro = { id: '', comuna: '' };
    this.actualizarPagina();
  }

  // busca texto en direccion, descripcion, comuna e id
  filtrarSolicitudes(): void {
    const texto = this.searchText.toLowerCase();

    const filtradas = this.solicitudes.filter(sol =>
      sol.direccion.toLowerCase().includes(texto) ||
      sol.descripcion.toLowerCase().includes(texto) ||
      sol.comuna.toLowerCase().includes(texto) ||
      sol.id.toString().includes(texto)
    );

    this.totalPages = Math.ceil(filtradas.length / this.pageSize);
    this.solicitudesPaginadas = filtradas.slice(0, this.pageSize);
    this.currentPage = 1;
    this.activeIndex = null;
  }

  // actualiza todas las solicitudes
  actualizarAprobaciones(): void {
    this.obtenerSolicitudesPendientes();
  }
}
