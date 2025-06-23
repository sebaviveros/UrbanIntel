import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';
import { Solicitud } from '../../models/solicitud.model';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
  estados: any[] = [];

  filtro: {
    tipoReparacionId?: number | null;
    prioridadId?: number | null;
    comuna?: string | null;
    estadoId?: number | null;
    fechaCreacion?: string | null;
    fechaAprobacion?: string | null;
  } = {
    tipoReparacionId: null,
    prioridadId: null,
    comuna: null,
    estadoId: null,
    fechaCreacion: null,
    fechaAprobacion: null
  };

  graficoTiposReparacion: { tipo: string, cantidad: number, porcentaje: number }[] = [];
  graficoPrioridades: { prioridad: string, cantidad: number, porcentaje: number }[] = [];
  graficoComunas: { comuna: string, cantidad: number, porcentaje: number }[] = [];
  graficoEstados: { estado: string, cantidad: number, porcentaje: number }[] = [];

  paginaActual: number = 1;
  tamanoPagina: number = 10;

  constructor(private solicitudService: SolicitudService, private http: HttpClient) {}

  async ngOnInit(): Promise<void> {
    try {
      this.tiposReparacion = await firstValueFrom(this.solicitudService.obtenerTiposReparacion());
      this.prioridades = await firstValueFrom(this.solicitudService.obtenerPrioridades());
      this.estados = await firstValueFrom(this.solicitudService.obtenerEstados());

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
      estadoId: null,
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

  get reportesFiltradosPorTexto(): Solicitud[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.reportes.filter(r => {
      return (
        r.id?.toString().includes(texto) ||
        r.tipoReparacionNombre?.toLowerCase().includes(texto) ||
        r.prioridadNombre?.toLowerCase().includes(texto) ||
        r.comuna?.toLowerCase().includes(texto) ||
        r.estadoNombre?.toLowerCase().includes(texto) ||
        new Date(r.fechaCreacion!).toLocaleString().toLowerCase().includes(texto) ||
        new Date(r.fechaAprobacion!).toLocaleString().toLowerCase().includes(texto)

      );
    });
  }

  get reportesPaginados(): Solicitud[] {
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    const end = start + this.tamanoPagina;
    return this.reportesFiltradosPorTexto.slice(start, end);
  }

  get totalPaginas(): number {
    return Math.ceil(this.reportesFiltradosPorTexto.length / this.tamanoPagina);
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
  const formatter = new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const dataExportada = this.reportesFiltradosPorTexto.map(r => ({
    'Nro Solicitud': r.id ?? '',
    'Categoría': r.tipoReparacionNombre ?? '',
    'Prioridad': r.prioridadNombre ?? '',
    'Comuna': r.comuna ?? 'N/A',
    'Estado': r.estadoNombre ?? 'N/A',
    'Fecha Creación': r.fechaCreacion
      ? formatter.format(new Date(r.fechaCreacion))
      : 'N/A',
    'Fecha Aprobación': r.fechaAprobacion
      ? formatter.format(new Date(r.fechaAprobacion))
      : 'N/A'
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
  const formatter = new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  this.http.get('assets/imagenes/7cff6bf4-c274-4c75-be64-e9b65939ffd4-removebg-preview.png', {
    responseType: 'blob'
  }).subscribe((imgBlob) => {
    const reader = new FileReader();

    reader.onload = () => {
      const logoBase64 = reader.result as string;
      const doc = new jsPDF();

      autoTable(doc, {
        head: [['Nro Solicitud', 'Categoría', 'Prioridad', 'Comuna', 'Estado', 'Fecha Creación', 'Fecha Aprobación']],
        body: this.reportesFiltradosPorTexto.map(r => [
          r.id ?? '',
          r.tipoReparacionNombre ?? 'N/A',
          r.prioridadNombre ?? 'N/A',
          r.comuna ?? 'N/A',
          r.estadoNombre ?? 'N/A',
          r.fechaCreacion ? formatter.format(new Date(r.fechaCreacion)) : 'N/A',
          r.fechaAprobacion ? formatter.format(new Date(r.fechaAprobacion)) : 'N/A'
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [230, 126, 34] },
        margin: { top: 35 },
        didDrawPage: (data) => {
          const pageWidth = doc.internal.pageSize.getWidth();
          const imgSize = 25;
          const x = (pageWidth - imgSize) / 2;
          const y = 10;
          doc.addImage(logoBase64, 'PNG', x, y, imgSize, imgSize);
        }
      });

      doc.save('reportes.pdf');
    };

    reader.readAsDataURL(imgBlob);
  });
}

}
