import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuarioService/usuario.service';

declare var bootstrap: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @ViewChild('wrapperRef') wrapperRef!: ElementRef;

  get tieneMayuscula(): boolean {
  return /[A-Z]/.test(this.nuevaPass);
  }

  get tieneMinuscula(): boolean {
    return /[a-z]/.test(this.nuevaPass);
  }

  get tieneNumero(): boolean {
    return /\d/.test(this.nuevaPass);
  }

  get tieneSimbolo(): boolean {
  return /[!@#$%&()]/.test(this.nuevaPass);
  }

  
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

  constructor(private authService: AuthService, private usuarioService: UsuarioService, private router: Router) {}

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
  this.usuarioService.recuperarPassword(this.correoRecuperacion).subscribe({
    next: () => {
      Swal.fire('Correo enviado', 'Tu contraseña ha sido enviada a tu correo.', 'success');
      this.cerrarModalRecuperar();
    },
    error: () => {
      Swal.fire('Error', 'No se pudo enviar la contraseña. Intenta nuevamente.', 'error');
    }
  });
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

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&()]).{10,}$/;
  if (!regex.test(this.nuevaPass)) {
    Swal.fire('Error', 'La nueva contraseña no cumple con los requisitos.', 'warning');
    return;
  }

  const data = {
    email: this.emailCambio,
    passwordActual: this.passActual,
    nuevaPassword: this.nuevaPass
  };

  this.usuarioService.cambiarPassword(data).subscribe({
    next: () => {
      Swal.fire('Éxito', 'Contraseña actualizada. Revisa tu correo.', 'success');
      this.cerrarModalCambiar();
    },
    error: () => {
      Swal.fire('Error', 'No se pudo actualizar la contraseña.', 'error');
    }
  });
}} 

