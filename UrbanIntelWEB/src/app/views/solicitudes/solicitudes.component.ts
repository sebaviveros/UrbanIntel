import { Component, OnInit } from '@angular/core';
import { SolicitudService } from '../../services/solicitudService/solicitud.service';


interface Solicitud {
  nombre: string;
  direccion: string;
  descripcion: string;
  imagenUrl: string;
}

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss']
})
export class SolicitudesComponent implements OnInit {
  solicitudes: Solicitud[] = [];

  constructor(private solicitudService: SolicitudService) {}

  ngOnInit(): void {
    this.obtenerSolicitudes();
  }

  obtenerSolicitudes(): void {
    this.solicitudService.obtenerSolicitudes().subscribe(
      (data: any) => {
        console.log('Solicitudes obtenidas:', data);
        this.solicitudes = data.map((sol: any) => ({
          nombre: sol.NombreCiudadano,
          direccion: sol.Direccion,
          descripcion: sol.Descripcion,
          imagenUrl: `http://localhost:5016/uploads/${sol.UrlImagen}` // Ruta de la imagen
        }));
      },
      (error) => console.error('Error al obtener solicitudes', error)
    );
  }

  modificarSolicitud(solicitud: Solicitud): void {
    alert(`Modificar solicitud: ${solicitud.nombre}`);
  }

  descargarPDF(solicitud: Solicitud): void {
    alert(`Descargar PDF de la solicitud: ${solicitud.nombre}`);
  }
}
