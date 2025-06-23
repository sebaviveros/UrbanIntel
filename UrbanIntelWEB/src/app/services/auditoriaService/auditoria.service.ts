import { Injectable } from '@angular/core';
import { GenericItem } from '../../models/generic-item.model';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Auditoria } from '../../models/auditoria.model';
import { FiltroAuditoriaDto } from '../../models/Dto/filtroAuditoriaDto';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private apiUrl = `${environment.apiUrl}/Auditoria`;

  constructor(private http: HttpClient) { }


  obtenerAccionAuditoria(): Observable<GenericItem[]> {
      return this.http.get<GenericItem[]>(`${this.apiUrl}/accion-auditoria`);
    }

  obtenerModuloAuditoria(): Observable<GenericItem[]> {
      return this.http.get<GenericItem[]>(`${this.apiUrl}/modulo-auditoria`);
    } 
    
   buscarAuditorias(filtro: FiltroAuditoriaDto): Observable<Auditoria[]> {
    return this.http.post<Auditoria[]>(`${this.apiUrl}/buscar`, filtro);
  } 
}
