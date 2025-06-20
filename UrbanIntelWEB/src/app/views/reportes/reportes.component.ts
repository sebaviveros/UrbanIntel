import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';
import { Solicitud } from '../../models/solicitud.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent implements OnInit {
  busqueda: string = '';
  mostrarFiltros: boolean = false;

  reportes: Solicitud[] = [];
  reportesOriginales: Solicitud[] = [];

  tiposReparacion: any[] = [];
  prioridades: any[] = [];
  estados: any[] = []; // ✅ Agregado para estado dinámico

  filtro: {
    tipoReparacionId?: number | null;
    prioridadId?: number | null;
    comuna?: string | null;
    estadoNombre?: string | null;
    fechaCreacion?: string | null;
    fechaAprobacion?: string | null;
  } = {
    tipoReparacionId: null,
    prioridadId: null,
    comuna: null,
    estadoNombre: null,
    fechaCreacion: null,
    fechaAprobacion: null
  };

  graficoTiposReparacion: { tipo: string, cantidad: number, porcentaje: number }[] = [];
  graficoPrioridades: { prioridad: string, cantidad: number, porcentaje: number }[] = [];
  graficoComunas: { comuna: string, cantidad: number, porcentaje: number }[] = [];
  graficoEstados: { estado: string, cantidad: number, porcentaje: number }[] = [];

  paginaActual: number = 1;
  tamanoPagina: number = 10;

  constructor(private solicitudService: SolicitudService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.tiposReparacion = await firstValueFrom(this.solicitudService.obtenerTiposReparacion());
      this.prioridades = await firstValueFrom(this.solicitudService.obtenerPrioridades());
      this.estados = await firstValueFrom(this.solicitudService.obtenerEstados()); // ✅ Agregado

      const solicitudes = await firstValueFrom(
        this.solicitudService.obtenerSolicitudPorFiltro({})
      );

      this.reportes = solicitudes;
      this.reportesOriginales = [...solicitudes];
      this.calcularDistribuciones();
    } catch (error) {
      console.error('Error al cargar los reportes:', error);
    }
  }

  async buscarPorFiltros(): Promise<void> {
    try {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(this.filtro).filter(([_, val]) => val !== null && val !== '')
      );

      const solicitudes = await firstValueFrom(
        this.solicitudService.obtenerSolicitudPorFiltro(filtrosLimpios)
      );

      this.reportes = solicitudes;
      this.paginaActual = 1;
      this.calcularDistribuciones();
    } catch (error) {
      console.error('Error al buscar:', error);
    }
  }

  limpiarFiltros(): void {
    this.filtro = {
      tipoReparacionId: null,
      prioridadId: null,
      comuna: null,
      estadoNombre: null,
      fechaCreacion: null,
      fechaAprobacion: null
    };
    this.buscarPorFiltros();
  }

  private calcularDistribuciones(): void {
    const total = this.reportes.length;

    const conteoTipos: { [key: string]: number } = {};
    const conteoPrioridades: { [key: string]: number } = {};
    const conteoComunas: { [key: string]: number } = {};
    const conteoEstados: { [key: string]: number } = {};

    this.reportes.forEach(r => {
      const tipo = r.tipoReparacionNombre ?? 'Sin categoría';
      const prioridad = r.prioridadNombre ?? 'Sin prioridad';
      const comuna = r.comuna ?? 'Sin comuna';
      const estado = r.estadoNombre ?? 'Sin estado';

      conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
      conteoPrioridades[prioridad] = (conteoPrioridades[prioridad] || 0) + 1;
      conteoComunas[comuna] = (conteoComunas[comuna] || 0) + 1;
      conteoEstados[estado] = (conteoEstados[estado] || 0) + 1;
    });

    this.graficoTiposReparacion = Object.entries(conteoTipos).map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
      porcentaje: Math.round((cantidad / total) * 100)
    }));

    this.graficoPrioridades = Object.entries(conteoPrioridades).map(([prioridad, cantidad]) => ({
      prioridad,
      cantidad,
      porcentaje: Math.round((cantidad / total) * 100)
    }));

    this.graficoComunas = Object.entries(conteoComunas).map(([comuna, cantidad]) => ({
      comuna,
      cantidad,
      porcentaje: Math.round((cantidad / total) * 100)
    }));

    this.graficoEstados = Object.entries(conteoEstados).map(([estado, cantidad]) => ({
      estado,
      cantidad,
      porcentaje: Math.round((cantidad / total) * 100)
    }));
  }

  get reportesPaginados(): Solicitud[] {
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    const end = start + this.tamanoPagina;
    return this.reportes.slice(start, end);
  }

  get totalPaginas(): number {
    return Math.ceil(this.reportes.length / this.tamanoPagina);
  }

  totalPaginasArray(): number[] {
    return Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  exportToExcel(): void {
    const dataExportada = this.reportes.map(r => ({
      'Nro Solicitud': r.id ?? '',
      'Categoría': r.tipoReparacionNombre ?? '',
      'Prioridad': r.prioridadNombre ?? '',
      'Comuna': r.comuna ?? 'Sin comuna',
      'Estado': r.estadoNombre ?? 'Sin estado',
      'Fecha Creación': r.fechaCreacion
        ? new Date(r.fechaCreacion).toLocaleString('es-CL')
        : 'Sin fecha',
      'Fecha Aprobación': r.fechaAprobacion
        ? new Date(r.fechaAprobacion).toLocaleString('es-CL')
        : 'No aprobada'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExportada);
    worksheet['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 15 },
      { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 25 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes');
    XLSX.writeFile(workbook, 'reportes.xlsx');
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Nro Solicitud', 'Categoría', 'Prioridad', 'Comuna', 'Estado', 'Fecha Creación', 'Fecha Aprobación']],
      body: this.reportes.map(r => [
        r.id ?? '',
        r.tipoReparacionNombre ?? '',
        r.prioridadNombre ?? '',
        r.comuna ?? 'Sin comuna',
        r.estadoNombre ?? 'Sin estado',
        r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleString('es-CL') : 'Sin fecha',
        r.fechaAprobacion ? new Date(r.fechaAprobacion).toLocaleString('es-CL') : 'No aprobada'
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [230, 126, 34] }
    });

    doc.save('reportes.pdf');
  }
}
