import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Usuario } from '../../models/usuario.model';
import { environment } from '../../../environments/environment';  
import { UsuarioPwDto } from '../../models/Dto/usuarioPwDto';

interface ApiResponse {
  success: boolean;
  message: string;
  usuarios?: Usuario[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/Usuario`;
  

  constructor(private http: HttpClient) { }

  // Obtener todos los usuarios
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map(response => response.usuarios || []), // Extraer el array de usuarios desde el objeto de respuesta
      catchError((error) => {
        console.error('Error al obtener usuarios:', error);
        return of([]); // Devolver una lista vacía en caso de error
      })
    );
  }

  // Obtener usuario por RUT
  obtenerUsuarioPorRut(rut: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}?rut=${rut}`).pipe(
      catchError((error) => {
        console.error('Error al obtener usuario por RUT:', error);
        throw error;
      })
    );
  }


  // Crear un nuevo usuario
crearUsuario(usuarioDto: UsuarioPwDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, usuarioDto).pipe(
        catchError((error) => {
            console.error('Error al crear usuario:', error);
            // Si el error contiene un mensaje del backend, lo extraemos
            const errorMessage = error.error?.message || 'Error desconocido al crear el usuario.';
            return of({ success: false, message: errorMessage });
        })
    );
}

  // modificar un usuario existente por RUT
modificarUsuario(rut: string, usuario: Usuario): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${rut}`, usuario).pipe(
        catchError((error) => {
            console.error('Error al modificar usuario:', error);
            const errorMessage = error.error?.message || 'Error desconocido al modificar el usuario.';
            return of({ success: false, message: errorMessage });
        })
    );
}


  // eliminar un usuario por RUT
  eliminarUsuario(rut: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${rut}`).pipe(
        catchError((error) => {
            console.error('Error al eliminar usuario:', error);
            const errorMessage = error.error?.message || 'Error desconocido al eliminar el usuario.';
            return of({ success: false, message: errorMessage });
        })
    );
  }

  recuperarPassword(correo: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/recuperar-password`, { correo });

}

  cambiarPassword(data: {
    email: string,
    passwordActual: string,
    nuevaPassword: string
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/cambiar-password`, data);
  }


}


