import { Component, OnInit } from '@angular/core';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';

interface Solicitud {
  id: number;
  direccion: string;
  estado: string;
  descripcion: string;
  imagenes: string[];
  fechaCreacion: string;
  fechaAprobacion: string;
  fechaAsignacion: string;
  tipoReparacion: string;
  prioridad: string;
}

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

  activeIndex: number | null = null;
  modalIndex: number | null = null; // ← Modal activo
  searchText: string = '';
  estadoSeleccionado: string = '';

  constructor(private solicitudService: SolicitudService) {}

  ngOnInit(): void {
    // Datos simulados (reemplazar con datos reales desde el backend si es necesario)
    this.solicitudes = Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      direccion: `Calle Falsa ${i + 1}`,
      estado: '',
      descripcion: `Descripción de la solicitud número ${i + 1}.`,
      imagenes: [
        'https://via.placeholder.com/600x300?text=Imagen+1',
        'https://via.placeholder.com/600x300?text=Imagen+2'
      ],
      fechaCreacion: '2025-05-01',
      fechaAprobacion: '2025-05-03',
      fechaAsignacion: '2025-05-04',
      tipoReparacion: i % 2 === 0 ? 'Bacheo' : 'Alumbrado',
      prioridad: i % 3 === 0 ? 'Alta' : 'Media'
    }));

    this.totalPages = Math.ceil(this.solicitudes.length / this.pageSize);
    this.actualizarPagina();
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

  crearSolicitud(): void {
    alert('Redirigir a crear solicitud');
  }

  abrirFiltro(): void {
    alert('Abrir panel de filtros');
  }

  filtrarSolicitudes(): void {
    const texto = this.searchText.toLowerCase();
    const estado = this.estadoSeleccionado;

    const filtradas = this.solicitudes.filter(sol => {
      const coincideTexto =
        sol.descripcion.toLowerCase().includes(texto) ||
        sol.direccion.toLowerCase().includes(texto);
      const coincideEstado = estado ? sol.estado === estado : true;
      return coincideTexto && coincideEstado;
    });

    this.totalPages = Math.ceil(filtradas.length / this.pageSize);
    this.currentPage = 1;
    this.solicitudesPaginadas = filtradas.slice(0, this.pageSize);
  }

  estadoCambiado(index: number): void {
    const solicitud = this.solicitudesPaginadas[index];
    console.log(`Nuevo estado asignado a solicitud ID ${solicitud.id}: ${solicitud.estado}`);
  }

  abrirModal(index: number): void {
    this.modalIndex = index;
  }

  cerrarModal(): void {
    this.modalIndex = null;
  }

  guardarCambios(index: number): void {
    const solicitud = this.solicitudesPaginadas[index];
    console.log('Solicitud actualizada:', solicitud);

    // Aquí podrías hacer una llamada al backend para persistir los cambios
    // this.solicitudService.actualizarSolicitud(solicitud).subscribe(...);

    this.modalIndex = null;
  }
}
