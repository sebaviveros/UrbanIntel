import { Component, OnInit } from '@angular/core';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';
import Swal from 'sweetalert2';
import { Solicitud } from '../../models/solicitud.model';
import { GenericItem } from '../../models/generic-item.model';
import { firstValueFrom } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HttpClient } from '@angular/common/http';
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
  fechaDesde?: string | null;
  fechaHasta?: string | null;
} = {
  id: null,
  comuna: null,
  estadoId: null,
  tipoReparacionId: null,
  prioridadId: null,
  fechaDesde: null,
  fechaHasta: null
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

  constructor(private solicitudService: SolicitudService, private http: HttpClient, private authService: AuthService) {}
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
        } catch (error: unknown) {
          console.error(`Error al obtener imágenes para solicitud ${sol.id}:`, error);
          return { ...sol, imagenes: [] };
        }
      })
    );

    this.solicitudes = solicitudesConImagenes;
    this.totalPages = Math.ceil(this.solicitudes.length / this.pageSize);
    this.actualizarPagina();
  } catch (error: unknown) {
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
    prioridadId: null,
    fechaDesde: null,
    fechaHasta: null
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
    const { id, comuna, estadoId, tipoReparacionId, prioridadId, fechaDesde, fechaHasta } = this.filtro;

    // Validación de fechas
    if (fechaDesde && fechaHasta) {
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      if (hasta < desde) {
        Swal.fire('Rango inválido', 'La fecha final no puede ser menor a la inicial.', 'warning');
        return;
      }
    }

    // Filtros sin fechas (solo los que debe manejar el backend)
    const filtrosBackend: any = {};
    if (id) filtrosBackend.id = id;
    if (comuna) filtrosBackend.comuna = comuna;
    if (estadoId) filtrosBackend.estadoId = estadoId;
    if (tipoReparacionId) filtrosBackend.tipoReparacionId = tipoReparacionId;
    if (prioridadId) filtrosBackend.prioridadId = prioridadId;

    // Petición al backend
    const solicitudes = await firstValueFrom(this.solicitudService.obtenerSolicitudPorFiltro(filtrosBackend));
    let solicitudesFiltradas = solicitudes.filter(sol => sol.estadoNombre !== 'Pendiente');

    // Filtro de fechas (solo si se usan)
    if (fechaDesde || fechaHasta) {
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;

      if (hasta) hasta.setHours(23, 59, 59, 999);

      solicitudesFiltradas = solicitudesFiltradas.filter(sol => {
        const fecha = new Date(sol.fechaCreacion);
        return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
      });
    }

    // Cargar imágenes
    const solicitudesConImagenes = await Promise.all(
      solicitudesFiltradas.map(async (sol) => {
        const imagenes = await firstValueFrom(this.solicitudService.obtenerImagenesPorSolicitud(sol.id));
        return { ...sol, imagenes };
      })
    );

    this.solicitudes = solicitudesConImagenes;
    this.totalPages = Math.ceil(this.solicitudes.length / this.pageSize);
    this.currentPage = 1;
    this.actualizarPagina();
    this.filtrosVisibles = false;

  } catch (error) {
    console.error('Error al buscar por filtros:', error);
    Swal.fire('Error', 'Ocurrió un problema al aplicar los filtros.', 'error');
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

exportarSolicitudPDF(solicitud: Solicitud): void {
  const formatter = new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  this.http.get('assets/imagenes/7cff6bf4-c274-4c75-be64-e9b65939ffd4-removebg-preview.png', {
    responseType: 'blob'
  }).subscribe((imgBlob) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const logoBase64 = reader.result as string;
      const doc = new jsPDF();

      // Agregar logo al centro superior
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgSize = 25;
      const x = (pageWidth - imgSize) / 2;
      const y = 10;
      doc.addImage(logoBase64, 'PNG', x, y, imgSize, imgSize);

      // Título debajo del logo
      doc.setFontSize(14);
      doc.text(`Solicitud N°${solicitud.id}`, 20, y + imgSize + 5);

      // Tabla de datos
      autoTable(doc, {
        startY: y + imgSize + 15,
        head: [['Campo', 'Valor']],
        body: [
          ['Dirección', solicitud.direccion || 'N/A'],
          ['Comuna', solicitud.comuna || 'N/A'],
          ['Descripción', solicitud.descripcion || 'N/A'],
          ['Tipo Reparación', solicitud.tipoReparacionNombre || 'N/A'],
          ['Prioridad', solicitud.prioridadNombre || 'N/A'],
          ['Estado', solicitud.estadoNombre || 'N/A'],
          ['Fecha de Creación', solicitud.fechaCreacion ? formatter.format(new Date(solicitud.fechaCreacion)) : 'N/A'],
          ['Fecha de Aprobación', solicitud.fechaAprobacion ? formatter.format(new Date(solicitud.fechaAprobacion)) : 'N/A'],
          ['Fecha de Asignación', solicitud.fechaAsignacion ? formatter.format(new Date(solicitud.fechaAsignacion)) : 'N/A']
        ],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [230, 126, 34] }
      });

      // Cargar imágenes de la solicitud (si tiene)
      const imagenes = solicitud.imagenes?.slice(0, 3) || [];

      if (imagenes.length > 0) {
        const yStart = (doc as any).lastAutoTable?.finalY || 50;
        const imgWidth = 50;
        const imgHeight = 50;
        const spacing = 10;

        const cargarImagenComoBase64 = async (url: string): Promise<string | null> => {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            return await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          } catch (error) {
            console.warn('Error al cargar imagen como base64:', url, error);
            return null;
          }
        };

        const base64s = await Promise.all(imagenes.map(url => cargarImagenComoBase64(url)));

        base64s.forEach((base64, index) => {
          if (base64) {
            const x = 20 + index * (imgWidth + spacing);
            doc.addImage(base64, 'JPEG', x, yStart + 10, imgWidth, imgHeight);
          }
        });
      }

      doc.save(`solicitud-${solicitud.id}.pdf`);
    };

    reader.readAsDataURL(imgBlob);
  });
}

}
