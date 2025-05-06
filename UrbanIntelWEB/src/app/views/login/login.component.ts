import { Component, ElementRef, ViewChild } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @ViewChild('wrapperRef') wrapperRef!: ElementRef;

  // Variables conectadas a los inputs
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient) {}

  toggleForm() {
    this.wrapperRef.nativeElement.classList.toggle('active');
  }

  onSubmit() {
    const loginData = {
      email: this.email,
      password: this.password
    };

    // Llama al backend (reemplaza la URL con la real)
    this.http.post('localhost:4200/login', loginData)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso', response);
          // Aquí puedes redirigir o guardar el token, etc.
        },
        error: (error) => {
          console.error('Error de login', error);
          // Aquí puedes mostrar un mensaje de error al usuario
        }
      });
  }
}
