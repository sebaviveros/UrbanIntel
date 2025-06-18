import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  isMenuOpen: boolean = false;
  rolUsuario: string | null = null;

  constructor(private router: Router, private authsvc: AuthService) {}

  // Detectar el tamaño de la pantalla para ajustar el menú (hostlistener detecta eventos del navegador, es una funcion de angular)
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustMenuOnResize(window.innerWidth);
  }
  

  ngOnInit() {
    // Inicializar el menú desplegado
    this.adjustMenuOnResize(window.innerWidth);
    this.rolUsuario = this.authsvc.getRolUsuario();
  }
  


  // Ajustar el menú según el ancho de la pantalla
  adjustMenuOnResize(width: number) {
    if (width < 768) {
      this.isMenuOpen = false;  // En móviles, el menú debe estar cerrado por defecto
    } else {
      this.isMenuOpen = true;   // En PC, el menú debe estar abierto por defecto
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    Swal.fire({
      title: '¿Está seguro que desea cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authsvc.logout();
        Swal.fire(
          '¡Sesión cerrada!',
          'Has cerrado sesión correctamente.',
          'success'
        );
        this.router.navigate(['/login']);
      }
    });
  }

}
