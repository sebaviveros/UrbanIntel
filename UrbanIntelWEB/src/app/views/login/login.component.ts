import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';

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
  
}
