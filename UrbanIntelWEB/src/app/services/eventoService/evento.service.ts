import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Evento {
  id_evento?: number;           // opcional para POST
  nombre_evento: string;
  descripcion?: string;
  hora_inicio: string;
  hora_termino?: string | null;
  notificacion: boolean;
  rut_usuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = `${environment.apiUrl}/eventos`;

  constructor(private http: HttpClient) {}

  obtenerEventos(rutUsuario: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/listar?rutUsuario=${rutUsuario}`).pipe(
      catchError(this.handleError)
    );
  }

  crearEvento(evento: Evento): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, evento).pipe(
      catchError(this.handleError)
    );
  }

  eliminarEvento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let message = 'Ocurrió un error inesperado.';
    if (error?.error?.message) {
      message = error.error.message;
    }
    return throwError(() => new Error(message));
  }
}