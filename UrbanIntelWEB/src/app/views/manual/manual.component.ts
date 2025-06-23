import { Component, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-manual',
  templateUrl: './manual.component.html',
  styleUrls: ['./manual.component.scss']
})
export class ManualComponent implements AfterViewInit, AfterViewChecked {
  selectedTutorial: 'formulario' | 'consulta' = 'formulario';
  private observerInitialized = false;

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.setupMenuToggle();
    this.initScrollAnimations();
  }

  ngAfterViewChecked(): void {
    // Permite re-inicializar el observer cuando se cambia de tutorial
    if (!this.observerInitialized) {
      this.initScrollAnimations();
    }
  }

  private setupMenuToggle(): void {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  }

  private initScrollAnimations(): void {
    const elements: NodeListOf<HTMLElement> = this.elRef.nativeElement.querySelectorAll('.scroll-anim');

    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          const video = entry.target.querySelector('video') as HTMLVideoElement;
          if (video) {
            video.loop = true;
            video.play().catch(() => {});
          }

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    elements.forEach(el => {
      if (!el.classList.contains('visible')) {
        observer.observe(el);
      }
    });

    this.observerInitialized = true;
  }

  setTutorial(type: 'formulario' | 'consulta') {
  this.selectedTutorial = type;
  this.observerInitialized = false; // permite reejecutar el observer
}


}