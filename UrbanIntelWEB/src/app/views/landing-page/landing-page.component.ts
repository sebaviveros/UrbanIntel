import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';
import { ComunaService } from '../../services/comunaService/comuna.service';
import { GoogleMapsPlatformService } from '../../services/mapService/google-maps-platform.service';

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
    console.log('Formulario:', this.solicitudForm.value);  // Ver el valor de cada campo
    console.log('Errores:', this.solicitudForm.errors);    // Ver si el formulario tiene errores
    console.log('Estado de validez:', this.solicitudForm.valid); // Ver el estado de validez
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
}