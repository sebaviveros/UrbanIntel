import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @ViewChild('wrapperRef') wrapperRef!: ElementRef;

  
  email: string = '';
  password: string = '';
  loginError: string = '';

  correoRecuperacion: string = '';
  emailCambio: string = '';
  passActual: string = '';
  nuevaPass: string = '';
  confirmarNuevaPass: string = '';

  mostrarModalRecuperar: boolean = false;
  mostrarModalCambiar: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // verificar si ya esta autenticado
    if (this.authService.obtenerToken()) {
      this.router.navigate(['/home']);
    }
  }

  toggleForm() {
    this.wrapperRef.nativeElement.classList.toggle('active');
  }

  loginBtn() {
    this.loginError = ''; // limpiar mensaje anterior

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.authService.guardarToken(response.token);
        Swal.fire({
          title: 'Inicio de sesión exitoso',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        // redireccionar al home
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.loginError = error.message;
      }
    });
  }

  abrirModalRecuperar() {
    this.mostrarModalRecuperar = true;
  }

  cerrarModalRecuperar () {
    this.mostrarModalRecuperar = false;
  }

  abrirModalCambiar() {
    this.mostrarModalCambiar = true;
  }

  cerrarModalCambiar() {
    this.mostrarModalCambiar = false;
  }

  enviarRecuperacion() {
    if (!this.correoRecuperacion || !this.correoRecuperacion.includes('@')) {
      Swal.fire('Error', 'Ingresa un correo electrónico válido.', 'warning');
      return;
    }

    // Aquí se llamará al servicio de recuperación cuando esté implementado
    Swal.fire('Enviado', 'Se ha enviado un correo con instrucciones.', 'success');
  }

  cambiarContrasena() {
    if (!this.emailCambio || !this.passActual || !this.nuevaPass || !this.confirmarNuevaPass) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'warning');
      return;
    }

    if (this.nuevaPass !== this.confirmarNuevaPass) {
      Swal.fire('Error', 'Las nuevas contraseñas no coinciden.', 'warning');
      return;
    }

    // Aquí se llamará al servicio de cambio de contraseña cuando esté implementado
    Swal.fire('Actualizado', 'Tu contraseña ha sido cambiada.', 'success');
  }
}
  

