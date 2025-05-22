import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/Solicitud`;

  constructor(private http: HttpClient) {}

  // Crear solicitud con imagen adjunta
  crearSolicitud(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, formData);
  }

  // Obtener todas las solicitudes
  obtenerSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  //obtener solicitud por distintos tipos de filtro
  obtenerSolicitudPorFiltro(filtros: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/filtrar`, { params: filtros });
  }

  obtenerImagenesPorSolicitud(id: number): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/${id}/imagenes`);
  }
}
