import { Component, OnInit } from '@angular/core';

interface Solicitud {
  id: number;
  nombre: string;
  direccion: string;
  descripcion: string;
  imagenes: string[];
  tipoReparacion: string;
  estado: string; // pendiente, finalizado, rechazada
  prioridad:string;
}

@Component({
  selector: 'app-aprobaciones',
  templateUrl: './aprobaciones.component.html',
  styleUrls: ['./aprobaciones.component.scss']
})
export class AprobacionesComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  solicitudesPaginadas: Solicitud[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  activeIndex: number | null = null;

  searchText: string = '';
  estadoSeleccionado: string = '';

  ngOnInit(): void {
    // Simular solicitudes mock
        const imagenesDisponibles = [
      'assets/imagenes/ejemplo_aprobacion1.png',
      'assets/imagenes/ejemplo_aprobacion2.jpg',
      'assets/imagenes/ejemplo_aprobacion3.jpg'
    ];

    const prioridades = ['Alta', 'Media', 'Baja'];

    this.solicitudes = Array.from({ length: 12 }).map((_, i) => {
      const cantidad = Math.floor(Math.random() * 3) + 1; // de 1 a 3 imágenes
      const imagenes = Array.from({ length: cantidad }).map(() => {
        const randomIndex = Math.floor(Math.random() * imagenesDisponibles.length);
        return imagenesDisponibles[randomIndex];
      });

       const prioridad = prioridades[Math.floor(Math.random() * prioridades.length)];

      return {
        id: i + 1,
        nombre: `Calle ${i + 1}`,
        direccion: `Dirección Falsa ${i + 1}`,
        descripcion: `Descripción de la solicitud número ${i + 1}.`,
        imagenes,
        tipoReparacion: '',
        estado: 'Pendiente',
        prioridad
      };
    });

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

  aprobarSolicitud(index: number): void {
    const solicitud = this.solicitudesPaginadas[index];
    solicitud.estado = 'Finalizado';
    console.log(`✅ Aprobada solicitud ID ${solicitud.id}`);
  }

  denegarSolicitud(index: number): void {
    const solicitud = this.solicitudesPaginadas[index];
    solicitud.estado = 'Rechazada';
    console.log(`❌ Rechazada solicitud ID ${solicitud.id}`);
  }

 filtrosVisibles: boolean = false;

filtro = {
  id: '',
  comuna: '',
  estadoId: '',
  tipoReparacionId: '',
  prioridadId: ''
};

tiposReparacion = [
  { id: 'Vialidad', nombre: 'Vialidad' },
  { id: 'Alumbrado Público', nombre: 'Alumbrado Público' },
  { id: 'Espacios Públicos', nombre: 'Espacios Públicos' },
  { id: 'Áreas Verdes', nombre: 'Áreas Verdes' },
  { id: 'Edificaciones Municipales', nombre: 'Edificaciones Municipales' },
  { id: 'Limpieza Urbana', nombre: 'Limpieza Urbana' }
];

prioridades = [
  { id: 'Alta', nombre: 'Alta' },
  { id: 'Media', nombre: 'Media' },
  { id: 'Baja', nombre: 'Baja' }
];

estados = [
  { id: 'Pendiente', nombre: 'Pendiente' },
  { id: 'En proceso', nombre: 'En proceso' },
  { id: 'Finalizado', nombre: 'Finalizado' },
  { id: 'Rechazada', nombre: 'Rechazada' }
];

abrirFiltro(): void {
  this.filtrosVisibles = !this.filtrosVisibles;
}

buscarPorFiltros(): void {
  const { id, comuna, estadoId, tipoReparacionId, prioridadId } = this.filtro;

  const filtradas = this.solicitudes.filter(sol => {
    const coincideId = id ? sol.id.toString().includes(id) : true;
    const coincideComuna = comuna ? sol.direccion.toLowerCase().includes(comuna.toLowerCase()) : true;
    const coincideEstado = estadoId ? sol.estado === estadoId : true;
    const coincideTipo = tipoReparacionId ? sol.tipoReparacion === tipoReparacionId : true;
    const coincidePrioridad = prioridadId ? sol['prioridad'] === prioridadId : true; // prioridad simulada
    return coincideId && coincideComuna && coincideEstado && coincideTipo && coincidePrioridad;
  });

  this.totalPages = Math.ceil(filtradas.length / this.pageSize);
  this.solicitudesPaginadas = filtradas.slice(0, this.pageSize);
  this.currentPage = 1;
  this.activeIndex = null;
  this.filtrosVisibles = false;
}

limpiarFiltros(): void {
  this.filtro = {
    id: '',
    comuna: '',
    estadoId: '',
    tipoReparacionId: '',
    prioridadId: ''
  };
  this.actualizarPagina();
}

filtrarSolicitudes(): void {
  const texto = this.searchText.toLowerCase();
  const estado = this.estadoSeleccionado;

  const filtradas = this.solicitudes.filter(sol => {
    const coincideTexto =
      sol.nombre.toLowerCase().includes(texto) ||
      sol.direccion.toLowerCase().includes(texto) ||
      sol.descripcion.toLowerCase().includes(texto);

    const coincideEstado = estado ? sol.estado === estado : true;

    return coincideTexto && coincideEstado;
  });

  this.totalPages = Math.ceil(filtradas.length / this.pageSize);
  this.solicitudesPaginadas = filtradas.slice(0, this.pageSize);
  this.currentPage = 1;
  this.activeIndex = null;
}


}
