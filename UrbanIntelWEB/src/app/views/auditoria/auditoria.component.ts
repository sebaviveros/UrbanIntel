import { Component, OnInit } from '@angular/core';
import { AuditoriaService } from '../../services/auditoriaService/auditoria.service';
import { Auditoria } from '../../models/auditoria.model';
import { GenericItem } from '../../models/generic-item.model';
import { FiltroAuditoriaDto } from '../../models/Dto/filtroAuditoriaDto';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver'; // ✅ Import corregido

declare var bootstrap: any;

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.scss']
})
export class AuditoriaComponent implements OnInit {
  auditorias: Auditoria[] = [];
  filtro: FiltroAuditoriaDto = {};
  acciones: GenericItem[] = [];
  modulos: GenericItem[] = [];

  ordenColumna: string = '';
  ordenAscendente: boolean = true;

  mostrarFiltros: boolean = false;

  busqueda: string = '';
  paginaActual: number = 1;
  tamanoPagina: number = 10;
  descripcionSeleccionada: string = '';

  constructor(private auditoriaService: AuditoriaService) {}

  ngOnInit(): void {
    this.cargarFiltros();

    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    this.filtro.fechaInicio = hace30Dias.toISOString().split('T')[0];
    this.filtro.fechaFin = hoy.toISOString().split('T')[0];

    this.buscarAuditorias();
  }

  set busquedaTexto(valor: string) {
    this.busqueda = valor;
    this.paginaActual = 1;
  }

  cargarFiltros(): void {
    this.auditoriaService.obtenerAccionAuditoria().subscribe(res => this.acciones = res);
    this.auditoriaService.obtenerModuloAuditoria().subscribe(res => this.modulos = res);
  }

  buscarAuditorias(): void {
    this.auditoriaService.buscarAuditorias(this.filtro).subscribe(data => {
      this.auditorias = data;
      this.paginaActual = 1;
    });
  }

  ordenarPor(columna: string): void {
    if (this.ordenColumna === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenColumna = columna;
      this.ordenAscendente = true;
    }
  }

  limpiarFiltros(): void {
    this.filtro = {};
    this.buscarAuditorias();
  }

  get auditoriasFiltradas(): Auditoria[] {
    const texto = this.busqueda
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    let filtradas = this.auditorias.filter(a => {
      const concatenado = `${a.id} ${a.rutUsuario} ${a.accionNombre} ${a.moduloNombre} ${a.descripcion ?? ''}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return concatenado.includes(texto);
    });

    if (this.ordenColumna) {
      filtradas = filtradas.sort((a: any, b: any) => {
        const valorA = a[this.ordenColumna];
        const valorB = b[this.ordenColumna];

        if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
        if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
        return 0;
      });
    }

    return filtradas;
  }

  get totalPaginas(): number {
    return Math.ceil(this.auditoriasFiltradas.length / this.tamanoPagina);
  }

  totalPaginasArray(): number[] {
    return Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

  cambiarPagina(pag: number): void {
    if (pag >= 1 && pag <= this.totalPaginas) this.paginaActual = pag;
  }

  auditoriasFiltradasPaginadas(): Auditoria[] {
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    return this.auditoriasFiltradas.slice(start, start + this.tamanoPagina);
  }

  abrirDetalle(descripcion: string): void {
    this.descripcionSeleccionada = descripcion;
    const modal = new bootstrap.Modal(document.getElementById('detalleModal')!);
    modal.show();
  }

  exportarExcel(): void {
  const datosExportar = this.auditoriasFiltradas.map(a => ({
    ID: a.id,
    'RUT Usuario': a.rutUsuario,
    Acción: a.accionNombre,
    Módulo: a.moduloNombre,
    Fecha: new Date(a.fecha).toLocaleString(),
    Descripción: a.descripcion ?? ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(datosExportar);

  // Formato en negrita para encabezados
  const range = XLSX.utils.decode_range(worksheet['!ref']!);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true },
    };
  }

  // Ancho de columnas
  worksheet['!cols'] = [
    { wch: 10 }, // ID
    { wch: 15 }, // RUT Usuario
    { wch: 12 }, // Acción
    { wch: 15 }, // Módulo
    { wch: 25 }, // Fecha
    { wch: 80 }, // Descripción
  ];

  // Alinear ID a la izquierda
  for (let R = 1; R <= datosExportar.length; R++) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 }); // Col 0 = ID
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        alignment: { horizontal: 'left' },
      };
    }
  }

  const workbook = { Sheets: { 'Auditorías': worksheet }, SheetNames: ['Auditorías'] };
  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    cellStyles: true, // Muy importante para aplicar estilos
  });

  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `auditorias_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

}
