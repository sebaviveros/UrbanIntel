import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComunaService {
  private comunasUrl = '/assets/comunas.json';

  constructor(private http: HttpClient) {}

  // metodo para obtener las comunas desde el archivo JSON
  obtenerComunas(): Observable<any[]> {
    return this.http.get<any[]>(this.comunasUrl);
  }
}
