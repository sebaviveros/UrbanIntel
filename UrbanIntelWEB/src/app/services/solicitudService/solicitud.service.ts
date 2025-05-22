import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GenericItem } from '../../models/generic-item.model';

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

  modificarCiudadano(id: number, data: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}/ciudadano`, data);
  } 

  eliminarSolicitud(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
  } 

 modificarSolicitud(id: number, solicitud: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, solicitud);
  }

  obtenerTiposReparacion(): Observable<GenericItem[]> {
    return this.http.get<GenericItem[]>(`${this.apiUrl}/tipos-reparacion`);
  }

  obtenerPrioridades(): Observable<GenericItem[]> {
    return this.http.get<GenericItem[]>(`${this.apiUrl}/prioridades`);
  }

  obtenerEstados(): Observable<GenericItem[]> {
    return this.http.get<GenericItem[]>(`${this.apiUrl}/estados`);
  }

  crearSolicitudInterna(formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/crear-interna`, formData);
}



}
  


