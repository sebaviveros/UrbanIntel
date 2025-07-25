import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; 


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(`${this.apiUrl}/auth/login`, body).pipe(
      catchError((error) => {
        let errorMessage = 'Ocurrió un error al iniciar sesión.';

        // verificar si el backend envio un mensaje específico
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          // manejo especifico para credenciales incorrectas
          errorMessage = 'Correo o contraseña incorrectos. Intente nuevamente.';
        } else if (error.status === 0) {
          // si el servidor no responde (problema de red)
          errorMessage = 'No se pudo conectar al servidor. Verifique su conexión.';
        } else if (error.status === 500) {
          // si el servidor responde con un error interno
          errorMessage = 'El servidor está experimentando problemas. Inténtelo más tarde.';
        }

        // lanzar el error para que el componente lo maneje
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  guardarToken(token: string) {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    // eliminar el token del almacenamiento local
    localStorage.removeItem('token');
  }

  getRolUsuario(): string | null {
  const token = this.obtenerToken();
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.role || decoded.rol || null;
  } catch (err) {
    return null;
   }
  }
  
  obtenerRutUsuario(): string | null {
    const token = this.obtenerToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub || null;
    } catch {
      return null;
    }
  }


  getRutUsuario(): string | null {
    const token = this.obtenerToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub || decoded.rut_usuario || decoded.rut || null;
    } catch (err) {
      return null;
    }
  } 
}
