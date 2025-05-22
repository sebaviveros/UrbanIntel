import { Component, OnInit } from '@angular/core';

interface Solicitud {
  id: number;
  nombre: string;
  direccion: string;
  descripcion: string;
  imagen: string;
  tipoReparacion: string;
  estado: string; // pendiente, finalizado, rechazada
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
    this.solicitudes = Array.from({ length: 12 }).map((_, i) => ({
      id: i + 1,
      nombre: `Calle ${i + 1}`,
      direccion: `Dirección Falsa ${i + 1}`,
      descripcion: `Descripción de la solicitud número ${i + 1}.`,
      imagen: 'https://via.placeholder.com/600x300?text=Evidencia',
      tipoReparacion: '',
      estado: 'Pendiente'
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
    this.currentPage = 1;
    this.solicitudesPaginadas = filtradas.slice(0, this.pageSize);
    this.activeIndex = null;
  }
}
