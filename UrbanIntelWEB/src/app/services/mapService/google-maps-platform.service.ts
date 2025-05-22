import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsPlatformService {
  private apiLoaded = false;

  constructor() {}

  /**
   * Carga la API de Google Maps de manera segura
   * @returns Promise<void> - Promesa que se resuelve cuando la API está cargada
   */
  loadApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (this.apiLoaded) {
      resolve();
      return;
    }

      // Verificar si el script ya está en el DOM
      if (document.getElementById('googleMapsScript')) {
      this.apiLoaded = true;
      resolve();
      return;
    }

      // Crear el script de Google Maps
      const script = document.createElement('script');
      script.id = 'googleMapsScript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;

      // Manejo de carga exitosa
      script.onload = () => {
        this.apiLoaded = true;
        resolve();
      };

      // Manejo de error al cargar el script
      script.onerror = () => {
        reject(new Error('No se pudo cargar la API de Google Maps'));
      };

      // Adjuntar el script al head
      document.head.appendChild(script);
    });
  }
}
