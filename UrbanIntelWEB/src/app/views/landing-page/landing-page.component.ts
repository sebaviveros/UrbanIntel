import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
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
export class LandingPageComponent implements AfterViewInit {

  @ViewChild('seccionFormulario', { static: false }) seccionFormulario!: ElementRef;
  @ViewChild('direccionInput', { static: false }) direccionInput!: ElementRef;

  // Formulario reactivo
  solicitudForm: FormGroup;
  activeTab: 'solicitudes' | 'consulta' = 'solicitudes';

  // Manejo de múltiples imágenes (máximo 3)
  selectedFiles: File[] = [];
  fileLimitExceeded: boolean = false;

   // Regiones y Comunas
  regiones: any[] = [];
  comunas: string[] = [];
  regionSeleccionada: string = '';
  comunaSeleccionada: string = '';
  
  // Inputs de consulta ciudadana
  rutConsulta: string = "";
  idConsulta: string = "";
  resultados: any[] = [];

  // datos botones tabla consulta
  descripcionSeleccionada: string = '';
  imagenesSeleccionadas: string[] = [];


  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudService,
    private comunaService: ComunaService,
    private googleMapsService: GoogleMapsPlatformService
  ) {

    // Inicialización del formulario reactivo
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

  ngOnInit(): void {
    this.comunaService.obtenerComunas().subscribe({
      next: (data) => {
        this.regiones = data;
      },
      error: (err) => {
        console.error('Error al cargar comunas:', err); // Mostrar error si falla
      }
    });
  }

   onRegionChange(): void {
    const region = this.solicitudForm.get('region')?.value;
    const regionEncontrada = this.regiones.find((r: any) => r.region === region);
    this.comunas = regionEncontrada ? regionEncontrada.comunas : [];
    this.solicitudForm.get('comuna')?.setValue('');
  }


    //Configuración del menú de navegación (Modo Responsive)
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

  // Scroll suave al formulario
  scrollToFormulario(): void {
    this.seccionFormulario.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  // Cambio de pestaña (Realizar Solicitud / Consultar Solicitud)
  setActiveTab(tab: 'solicitudes' | 'consulta') {
    this.activeTab = tab;
  }

  // Selección de archivos de imagen
  onFilesSelected(event: any): void {
    const input = event.target as HTMLInputElement;

    if (input.files) {
      const filesArray = Array.from(input.files);

      // Verificar si el número total de archivos supera el límite
      if (this.selectedFiles.length + filesArray.length > 3) {
        this.fileLimitExceeded = true;
        return;
      }

      this.fileLimitExceeded = false;
      this.selectedFiles = [...this.selectedFiles, ...filesArray].slice(0, 3);
    }
  }

  // Eliminar una imagen de la lista
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  // Enviar el formulario al backend
  enviarSolicitud(): void {
    if (this.solicitudForm.valid) {
        const formValues = this.solicitudForm.value;
        const formData = new FormData();

        // Añadir solo los campos requeridos por el backend
        formData.append('NombreCiudadano', formValues.nombre);
        formData.append('ApellidoCiudadano', formValues.apellido);
        formData.append('RutCiudadano', formValues.rut);
        formData.append('Comuna', formValues.comuna);
        formData.append('Direccion', formValues.direccion);
        formData.append('EmailCiudadano', formValues.correo);
        formData.append('TelefonoCiudadano', formValues.celular);
        formData.append('Descripcion', formValues.descripcion);

        // Adjuntar las imágenes con el nombre adecuado
        this.selectedFiles.forEach((file) => {
            formData.append('imagenes', file);
        });

        this.solicitudService.crearSolicitud(formData).subscribe(
            response => {
                alert('Solicitud enviada correctamente');
                this.solicitudForm.reset();
                this.selectedFiles = [];
            },
            error => {
                alert('Hubo un problema al enviar la solicitud');
            }
        );
    } else {
        alert('Por favor, complete todos los campos correctamente.');
    }
  }

  buscarSolicitud(): void {
  const rut = this.rutConsulta.trim();
  const id = this.idConsulta.trim();

  if (!rut && !id) {
    Swal.fire('Error', 'Ingrese al menos el RUT o el ID de la solicitud.', 'warning');
    return;
  }

  // Construcción dinámica de filtros
  const filtros: any = {};
  if (id) filtros.id = id;
  if (rut) filtros.rutCiudadano = rut;

  // Llamada al servicio
  this.solicitudService.obtenerSolicitudPorFiltro(filtros).subscribe({
    next: (solicitudes) => {
      if (!solicitudes || solicitudes.length === 0) {
        Swal.fire('Sin resultados', 'No se encontraron solicitudes con los datos ingresados.', 'info');
        this.resultados = [];
        return;
      }

      // Cargar imágenes para cada solicitud (cuando tengas implementado el endpoint)
      const solicitudesConImagenes = solicitudes.map((solicitud: any) => {
        return this.solicitudService.obtenerImagenesPorSolicitud(solicitud.id).pipe(
          // Asignamos las imágenes al objeto solicitud
          // Si falla, le asignamos un arreglo vacío
          // Esto requiere que uses RxJS (forkJoin si quisieras paralelizar todos, opcional)
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

      // Esperar a que todas las solicitudes terminen de cargar sus imágenes
      forkJoin(solicitudesConImagenes).subscribe({
        next: (solicitudesFinales) => {
          this.resultados = solicitudesFinales;
        },
        error: () => {
          Swal.fire('Error', 'No se pudieron cargar las imágenes de algunas solicitudes.', 'warning');
          this.resultados = solicitudes; // Muestra los datos sin imágenes
        }
      });
    },
    error: () => {
      Swal.fire('Error', 'Hubo un problema al consultar las solicitudes.', 'error');
    }
  });
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
}