import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { GoogleMapsPlatformService } from '../../services/mapService/google-maps-platform.service';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;

  constructor(private googleMapsService: GoogleMapsPlatformService) {}

  ngAfterViewInit(): void {
    this.googleMapsService.loadApi()
      .then(() => {
        this.initializeMap();
      })
      .catch(error => console.error('Error al cargar Google Maps API:', error));
  }

  initializeMap(): void {
    // Coordenadas del centro de Villa Alemana
    const center = { lat: -33.0425, lng: -71.3732 };

    // Inicializar el mapa en modo híbrido
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: center,
      zoom: 16, // Zoom más cercano para ver detalles
      mapTypeId: 'hybrid', // Modo híbrido: satélite + calles
      tilt: 45 // Vista en 3D
    });

    // Añadir un marcador en el centro de Villa Alemana
    new google.maps.Marker({
      position: center,
      map: this.map,
      title: 'Centro de Villa Alemana'
    });

    // Ajuste del tamaño del mapa al cambiar el tamaño de la ventana
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.map.setZoom(16);
    });

    // Ajustar tamaño al cambiar el tamaño de la ventana
    window.addEventListener('resize', () => {
      google.maps.event.trigger(this.map, 'resize');
    });
  }
}
