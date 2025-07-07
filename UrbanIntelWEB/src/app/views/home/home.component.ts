import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { GoogleMapsPlatformService } from '../../services/mapService/google-maps-platform.service';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';
import { Solicitud } from '../../models/solicitud.model';
import { firstValueFrom } from 'rxjs';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;
  infoAbierto: google.maps.InfoWindow | null = null;
  marcadorCache: Record<string, number> = {};
  marcadores: google.maps.Marker[] = []; // 👈 NUEVO

  mostrarFiltros = false;

  filtro = {
    tipoReparacion: '',
    prioridad: ''
  };

  tiposReparacion: string[] = [];
  tiposPrioridad: string[] = [];

  constructor(
    private googleMapsService: GoogleMapsPlatformService,
    private solicitudService: SolicitudService
  ) {}

  ngAfterViewInit(): void {
    this.googleMapsService.loadApi()
      .then(() => {
        this.initializeMap();
        this.obtenerFiltros();
      })
      .catch(error => console.error('Error al cargar Google Maps API:', error));
  }

  initializeMap(): void {
    const center = { lat: -33.0425, lng: -71.3732 };

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: center,
      zoom: 16,
      mapTypeId: 'hybrid',
      tilt: 45
    });

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.map.setZoom(16);
    });

    window.addEventListener('resize', () => {
      google.maps.event.trigger(this.map, 'resize');
    });

    this.cargarSolicitudes();
  }

  async obtenerFiltros(): Promise<void> {
    try {
      const solicitudes = await firstValueFrom(this.solicitudService.obtenerSolicitudPorFiltro({}));
      this.tiposReparacion = [...new Set(solicitudes.map(s => s.tipoReparacionNombre))].filter(Boolean);
      this.tiposPrioridad = [...new Set(solicitudes.map(s => s.prioridadNombre))].filter(Boolean);
    } catch (error) {
      console.error('Error obteniendo tipos:', error);
    }
  }

  async cargarSolicitudes(): Promise<void> {
    try {
      this.marcadorCache = {};

      // 👇 Limpia marcadores del mapa
      this.marcadores.forEach(m => m.setMap(null));
      this.marcadores = [];

      const solicitudes = await firstValueFrom(this.solicitudService.obtenerSolicitudPorFiltro({}));

      const solicitudesFiltradas = solicitudes
        .filter(s => s.estadoNombre?.toLowerCase() === 'en proceso')
        .filter(s => !this.filtro.tipoReparacion || s.tipoReparacionNombre === this.filtro.tipoReparacion)
        .filter(s => !this.filtro.prioridad || s.prioridadNombre === this.filtro.prioridad);

      const solicitudesConImagenes = await Promise.all(
        solicitudesFiltradas.map(async (sol) => {
          const imagenes = await firstValueFrom(this.solicitudService.obtenerImagenesPorSolicitud(sol.id));
          return { ...sol, imagenes };
        })
      );

      const offset = 0.00005;

      for (const solicitud of solicitudesConImagenes) {
        const direccionCompleta = `${solicitud.direccion}, ${solicitud.comuna}`;
        const coords = await this.geocodeDireccion(direccionCompleta);

        if (coords) {
          const key = `${coords.lat.toFixed(5)},${coords.lng.toFixed(5)}`;
          const repeticiones = this.marcadorCache[key] || 0;
          this.marcadorCache[key] = repeticiones + 1;

          const newCoords = {
            lat: coords.lat + offset * repeticiones,
            lng: coords.lng + offset * repeticiones
          };

          this.agregarMarcador(newCoords, solicitud);
        }
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  }

  geocodeDireccion(direccion: string): Promise<google.maps.LatLngLiteral | null> {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: direccion }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].geometry.location.toJSON());
        } else {
          console.warn(`Geocoding falló para ${direccion}: ${status}`);
          resolve(null);
        }
      });
    });
  }

  agregarMarcador(pos: google.maps.LatLngLiteral, solicitud: Solicitud): void {
    const iconUrl = this.getIconoPorTipo(solicitud.tipoReparacionNombre || '');

    const contenidoHTML = `
  <div style="max-width: 260px; background-color: #1e1e1e; color: #ffffff; padding: 10px; border-radius: 8px;">
    <h4 style="margin:0; color: #f7941d; font-weight:bold;">ID Solicitud N°${solicitud.id}</h4>
    <p style="margin:0 0 5px; font-size: 0.9rem;"><strong>Tipo:</strong> ${solicitud.tipoReparacionNombre}</p>
    <p style="margin:0;"><strong>Dirección:</strong> ${solicitud.direccion}, ${solicitud.comuna}</p>
    <p style="margin:0;"><strong>Estado:</strong> ${solicitud.estadoNombre}</p>
    <p style="margin:0;"><strong>Prioridad:</strong> ${solicitud.prioridadNombre}</p>
    <p style="margin:0;"><strong>Fecha:</strong> ${new Date(solicitud.fechaCreacion!).toLocaleDateString()}</p>
    <p style="margin:0;"><strong>Descripción:</strong> ${solicitud.descripcion}</p>

    ${solicitud.imagenes?.length ? `
      <div id="carousel-${solicitud.id}" class="carousel slide" data-bs-ride="carousel" style="margin-top:10px;">
        <div class="carousel-inner">
          ${solicitud.imagenes.map((img, idx) => `
            <div class="carousel-item ${idx === 0 ? 'active' : ''}">
              <img src="${img}" class="d-block w-100" style="height:150px;object-fit:cover;border-radius:4px;">
            </div>
          `).join('')}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${solicitud.id}" data-bs-slide="prev">
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carousel-${solicitud.id}" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
        </button>
      </div>
    ` : ''}
  </div>
`;


    const infoWindow = new google.maps.InfoWindow({ content: contenidoHTML });

    const marker = new google.maps.Marker({
      position: pos,
      map: this.map,
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(50, 50)
      },
      animation: google.maps.Animation.DROP,
      title: solicitud.tipoReparacionNombre
    });

    marker.addListener('click', () => {
      if (this.infoAbierto === infoWindow) {
        this.infoAbierto?.close();
        this.infoAbierto = null;
      } else {
        this.infoAbierto?.close();
        infoWindow.open(this.map, marker);
        this.infoAbierto = infoWindow;
      }
    });

    // 👇 Guarda el marcador para borrarlo luego si es necesario
    this.marcadores.push(marker);
  }

  getIconoPorTipo(tipo: string): string {
    const tipoNormalizado = tipo.trim().toLowerCase();

    switch (tipoNormalizado) {
      case 'vialidad':
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'alumbrado público':
        return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'espacios públicos':
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'áreas verdes':
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'edificaciones municipales':
        return 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png';
      case 'limpieza urbana':
        return 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png';
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  }

  filtrar(): void {
    this.mostrarFiltros = false;
    this.cargarSolicitudes();
  }

  limpiarFiltros(): void {
    this.filtro = { tipoReparacion: '', prioridad: '' };
    this.mostrarFiltros = false;
    this.cargarSolicitudes();
  }
}
