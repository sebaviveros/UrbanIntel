
import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit{
  map!: mapboxgl.Map;

  ngAfterViewInit(): void {


    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-71.537451, -33.046225],
      zoom: 12,
      accessToken: 'pk.eyJ1IjoiZGllZ29kZ2FldGUiLCJhIjoiY21hYzRvMXBmMDBodDJrb2ZoNWRjODc4diJ9.PZWoFlc_AgPi9Vd8D4wc4g' // ✅ dentro del config
    });
  }

  constructor(private router: Router) {}

  navigate(path: string) {
    this.router.navigate([path]);
  }

}
