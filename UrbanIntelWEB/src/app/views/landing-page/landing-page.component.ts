import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements AfterViewInit {

  @ViewChild('seccionFormulario', { static: false }) seccionFormulario!: ElementRef;

  // Formulario reactivo
  solicitudForm: FormGroup;
  activeTab: 'solicitudes' | 'consulta' = 'solicitudes';

  // Manejo de múltiples imágenes (máximo 3)
  selectedFiles: File[] = [];
  fileLimitExceeded: boolean = false;

  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudService
  ) {
    // Inicialización del formulario
    this.solicitudForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      rut: ['', Validators.required],
      direccion: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      celular: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  // Configuración del menú de navegación (Modo Responsive)
  ngAfterViewInit(): void {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
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

      // Crear objeto FormData para enviar los datos
      const formData = new FormData();
      formData.append('nombre', formValues.nombre);
      formData.append('apellido', formValues.apellido);
      formData.append('rut', formValues.rut);
      formData.append('direccion', formValues.direccion);
      formData.append('correo', formValues.correo);
      formData.append('celular', formValues.celular);
      formData.append('descripcion', formValues.descripcion);

      // Agregar imágenes al FormData
      this.selectedFiles.forEach((file, index) => {
        formData.append(`imagen${index + 1}`, file);
      });

      // Llamar al servicio para enviar la solicitud
      this.solicitudService.crearSolicitud(formData).subscribe(
        response => {
          console.log('Solicitud enviada con éxito:', response);
          alert('Solicitud enviada correctamente');
          this.solicitudForm.reset();
          this.selectedFiles = [];
        },
        error => {
          console.error('Error al enviar la solicitud:', error);
          alert('Hubo un problema al enviar la solicitud');
        }
      );
    } else {
      alert('Por favor, complete todos los campos correctamente.');
    }
  }
}
