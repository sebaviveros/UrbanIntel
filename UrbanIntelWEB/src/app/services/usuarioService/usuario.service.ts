import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { environment } from '../../../environments/environment';  
import { UsuarioPwDto } from '../../models/Dto/usuarioPwDto';

interface ApiResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/Usuario`;
  

  constructor(private http: HttpClient) { }

  // Obtener todos los usuarios
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // Obtener usuario por RUT
  obtenerUsuarioPorRut(rut: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}?rut=${rut}`);
  }

  // Crear un nuevo usuario
  crearUsuario(usuarioDto: UsuarioPwDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, usuarioDto);
  }

  // modificar un usuario existente por RUT
  modificarUsuario(rut: string, usuario: Usuario): Observable<ApiResponse> {
  return this.http.put<ApiResponse>(`${this.apiUrl}/${rut}`, usuario);
}

  // eliminar un usuario por RUT
  eliminarUsuario(rut: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${rut}`);
  }
}

