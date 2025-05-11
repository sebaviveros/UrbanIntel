import { Component, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  map!: mapboxgl.Map;

  ngAfterViewInit(): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-71.537451, -33.046225],
      zoom: 12,
      accessToken: 'pk.eyJ1IjoiZGllZ29kZ2FldGUiLCJhIjoiY21hYzRvMXBmMDBodDJrb2ZoNWRjODc4diJ9.PZWoFlc_AgPi9Vd8D4wc4g' // dentro del config
    }); 

    // ajuste de tamaño del mapa al cargar
    this.map.on('load', () => {
      this.map.resize();
    });
  }
  
}
