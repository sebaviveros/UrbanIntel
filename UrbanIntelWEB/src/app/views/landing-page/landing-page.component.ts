import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';
import { ComunaService } from '../../services/comunaService/comuna.service';
import { GoogleMapsPlatformService } from '../../services/mapService/google-maps-platform.service';
import Swal from 'sweetalert2';
import { of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements AfterViewInit, OnInit {

  // ViewChild y estado general del componente
  @ViewChild('seccionFormulario', { static: false }) seccionFormulario!: ElementRef;
  @ViewChild('direccionInput', { static: false }) direccionInput!: ElementRef;

  solicitudForm: FormGroup;
  activeTab: 'solicitudes' | 'consulta' = 'solicitudes';

  selectedFiles: File[] = [];
  fileLimitExceeded: boolean = false;

  regiones: any[] = [];
  comunas: string[] = [];
  regionSeleccionada: string = '';
  comunaSeleccionada: string = '';

  rutConsulta: string = "";
  idConsulta: string = "";
  resultados: any[] = [];

  descripcionSeleccionada: string = '';
  imagenesSeleccionadas: string[] = [];

  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudService,
    private comunaService: ComunaService,
    private googleMapsService: GoogleMapsPlatformService,
    private cdRef: ChangeDetectorRef
  ) {
    // Inicialización del formulario
    this.solicitudForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      rut: ['', Validators.required],
      region: ['', Validators.required],
      comuna: ['', Validators.required],
      direccion: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      celular: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  // Inicialización del componente
  ngOnInit(): void {
    this.comunaService.obtenerComunas().subscribe({
      next: (data) => { this.regiones = data; },
      error: () => { Swal.fire('Error', 'Error al cargar comunas.', 'error'); }
    });

    this.solicitudForm.get('rut')?.valueChanges.subscribe(val => {
      const clean = val.replace(/\./g, '').replace(/[^0-9kK]/g, '');
      if (clean.length > 1) {
        const formatted = this.formatRut(clean);
        this.solicitudForm.get('rut')?.setValue(formatted, { emitEvent: false });
      }
    });

    this.solicitudForm.get('celular')?.valueChanges.subscribe(val => {
      if (val && /[^0-9]/.test(val)) {
        this.solicitudForm.get('celular')?.setValue(val.replace(/\D/g, ''), { emitEvent: false });
      }
    });
  }

  public onRutConsultaChange(value: string): void {
    const clean = value.replace(/\./g, '').replace(/[^0-9kK]/g, '');
    if (clean.length > 1) {
      this.rutConsulta = this.formatRut(clean);
    } else {
      this.rutConsulta = value;
    }
  }

  // Configuración de Google Autocomplete y menú
  ngAfterViewInit(): void {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }

    this.googleMapsService.loadApi().then(() => {
      this.initializeGoogleAutocomplete();
    }).catch((err) => {
      console.error('Error al cargar Google Maps:', err);
    });
  }

  // Crear solicitudes ciudadanas
  enviarSolicitud(): void {
    const formValues = this.solicitudForm.value;

    if (this.selectedFiles.length === 0) {
      Swal.fire('Error', 'Debe adjuntar al menos una imagen.', 'warning');
      return;
    }

    const rutUsuario = formValues.rut;
    if (!this.isValidRut(rutUsuario)) {
      Swal.fire('Error', 'El RUT ingresado no es válido.', 'warning');
      return;
    }

    // Validacion de campos vacios
    if (!this.solicitudForm.valid) {
      const controls = this.solicitudForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          const label = this.getFieldLabel(name);
          Swal.fire('Atención', `Debes llenar el campo "${label}" del formulario.`, 'warning');
          return;
        }
      }
    }

  
    const formData = new FormData();
    formData.append('NombreCiudadano', formValues.nombre);
    formData.append('ApellidoCiudadano', formValues.apellido);
    formData.append('RutCiudadano', this.normalizeRutForBackend(rutUsuario));
    formData.append('Comuna', formValues.comuna);
    formData.append('Direccion', formValues.direccion);
    formData.append('EmailCiudadano', formValues.correo);
    formData.append('TelefonoCiudadano', formValues.celular);
    formData.append('Descripcion', formValues.descripcion);

    this.selectedFiles.forEach((file) => {
      formData.append('imagenes', file);
    });

    this.solicitudService.crearSolicitud(formData).subscribe(
      () => {
        Swal.fire('Éxito', 'Solicitud enviada correctamente.', 'success');
        this.solicitudForm.reset();
        this.selectedFiles = [];
      },
      () => { Swal.fire('Error', 'Hubo un problema al enviar la solicitud.', 'error'); }
    );
  }


  // Obtener solicitudes ciudadanas
  buscarSolicitud(): void {
  const rut = this.rutConsulta.trim();
  const id = this.idConsulta.trim();

  // Validar campos vacíos
  if (!rut && !id) {
    Swal.fire('Error', 'Ingrese al menos el RUT o el ID de la solicitud.', 'warning');
    return;
  }

  // Validar RUT si fue ingresado
  if (rut && !this.isValidRut(rut)) {
    Swal.fire('Error', 'El RUT ingresado no es válido.', 'warning');
    return;
  }

  this.resultados = []; // <-- LIMPIA resultados antes de la nueva búsqueda
  this.cdRef.detectChanges(); // <-- Fuerza el cambio de vista

  const filtros: any = {};
  if (id) filtros.id = id;
  if (rut) filtros.rutCiudadano = this.normalizeRutForBackend(rut); // lo envías sin puntos

  this.solicitudService.obtenerSolicitudPorFiltro(filtros).subscribe({
    next: (solicitudes) => {
      if (!solicitudes || solicitudes.length === 0) {
        Swal.fire('Sin resultados', 'No se encontraron solicitudes con los datos ingresados.', 'info');
        this.resultados = [];
        return;
      }

      const solicitudesConImagenes = solicitudes.map((solicitud: any) => {
        return this.solicitudService.obtenerImagenesPorSolicitud(solicitud.id).pipe(
          map(imagenes => {
            solicitud.imagenes = imagenes;
            return solicitud;
          }),
          catchError(() => {
            solicitud.imagenes = [];
            return of(solicitud);
          })
        );
      });

      forkJoin(solicitudesConImagenes).subscribe({
        next: (solicitudesFinales) => {
          this.resultados = solicitudesFinales;
        },
        error: () => {
          Swal.fire('Error', 'No se pudieron cargar las imágenes de algunas solicitudes.', 'warning');
          this.resultados = solicitudes;
        }
      });
    },
    error: () => {
      Swal.fire('Error', 'Hubo un problema al consultar las solicitudes.', 'error');
    }
  });

  this.cdRef.detectChanges();
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  getFieldLabel(fieldName: string): string {
  const labels: { [key: string]: string } = {
    nombre: 'Nombre',
    apellido: 'Apellido',
    rut: 'RUT',
    region: 'Región',
    comuna: 'Comuna',
    direccion: 'Dirección',
    correo: 'Correo Electrónico',
    celular: 'Celular',
    descripcion: 'Descripción'
  };
  return labels[fieldName] || fieldName;
}



  // Eventos del formulario
  onRegionChange(): void {
    const region = this.solicitudForm.get('region')?.value;
    const regionEncontrada = this.regiones.find((r: any) => r.region === region);
    this.comunas = regionEncontrada ? regionEncontrada.comunas : [];
    this.solicitudForm.get('comuna')?.setValue('');
  }

  onFilesSelected(event: any): void {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const filesArray = Array.from(input.files);
    const validExtensions = ['image/png', 'image/jpeg'];

    const invalidFiles = filesArray.filter(file => !validExtensions.includes(file.type));
    if (invalidFiles.length > 0) {
      Swal.fire('Error', 'Solo se permiten archivos JPG o PNG.', 'warning');
      return;
    }

    if (this.selectedFiles.length + filesArray.length > 3) {
      this.fileLimitExceeded = true;
      return;
    }

    this.fileLimitExceeded = false;
    this.selectedFiles = [...this.selectedFiles, ...filesArray].slice(0, 3);
  }
}


  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  // Utilidades
  formatRut(rut: string): string {
    rut = rut.replace(/\./g, '').replace('-', '').toLowerCase();
    if (!rut || rut.length < 2) return rut;
    const body = rut.slice(0, -1);
    const dv = rut.slice(-1);
    let formatted = '';
    let i = 0;
    for (let j = body.length - 1; j >= 0; j--) {
      formatted = body[j] + formatted;
      i++;
      if (i % 3 === 0 && j !== 0) {
        formatted = '.' + formatted;
      }
    }
    return `${formatted}-${dv}`;
  }

  isValidRut(rut: string): boolean {
    rut = rut.replace(/\./g, '').replace('-', '').toLowerCase();
    if (!rut || rut.length < 2) return false;
    const body = rut.slice(0, -1);
    const dv = rut.slice(-1);
    let suma = 0;
    let multiplo = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      suma += parseInt(body[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvReal = dv === 'k' ? 10 : dv === '0' ? 11 : parseInt(dv);
    return dvEsperado === dvReal;
  }

  normalizeRutForBackend(rut: string): string {
    return rut.replace(/\./g, '').toLowerCase();
  }

  initializeGoogleAutocomplete(): void {
    if (typeof google !== 'undefined' && google.maps) {
      const autocomplete = new google.maps.places.Autocomplete(this.direccionInput.nativeElement, {
        componentRestrictions: { country: 'cl' },
        fields: ['formatted_address', 'geometry'],
        types: ['address']
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          this.solicitudForm.patchValue({ direccion: place.formatted_address });
        }
      });
    }
  }

  scrollToFormulario(): void {
    this.seccionFormulario.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  setActiveTab(tab: 'solicitudes' | 'consulta') {
    this.activeTab = tab;
  }

  abrirModalDescripcion(desc: string): void {
    this.descripcionSeleccionada = desc;
    const modal = new bootstrap.Modal(document.getElementById('modalDescripcion')!);
    modal.show();
  }

  abrirModalEvidencia(imagenes: string[]): void {
    this.imagenesSeleccionadas = imagenes;
    const modal = new bootstrap.Modal(document.getElementById('modalEvidencia')!);
    modal.show();
  }

  getEstadoClass(estado: string | null): string {
    if (!estado) return 'estado-na';
    switch (estado.toLowerCase()) {
      case 'finalizada': return 'estado-finalizada';
      case 'pendiente': return 'estado-pendiente';
      case 'en proceso': return 'estado-en-proceso';
      case 'rechazada': return 'estado-rechazada';
      default: return 'estado-na';
    }
  }

}
