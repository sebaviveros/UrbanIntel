import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements AfterViewInit{

  
  @ViewChild('seccionFormulario', { static: false }) seccionFormulario!: ElementRef;

  ngAfterViewInit(): void {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  }

  

 
   scrollToFormulario(): void {
      this.seccionFormulario.nativeElement.scrollIntoView({ behavior: 'smooth' });
  
  }

  activeTab: 'solicitudes' | 'consulta' = 'solicitudes';

  setActiveTab(tab: 'solicitudes' | 'consulta') {
    this.activeTab = tab;
  }



}


