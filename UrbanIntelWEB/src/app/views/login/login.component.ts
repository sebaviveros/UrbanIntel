import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { Router } from '@angular/router';

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

  toggleForm() {
    this.wrapperRef.nativeElement.classList.toggle('active');
  }

  onSubmit() {
    this.loginError = ''; // limpiar mensaje anterior

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
  
        this.authService.guardarToken(response.token);
  
        // redireccionar al home
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('error al iniciar sesion', error);
        this.loginError = 'Credenciales incorrectas. Intenta nuevamente.';
      }
    });
  }
  
}
