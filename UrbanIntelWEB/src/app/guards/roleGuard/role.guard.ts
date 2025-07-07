import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authSvc: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'];
    const userRole = this.authSvc.getRolUsuario();

    if (!userRole || !expectedRoles.includes(userRole)) {
      Swal.fire('Acceso denegado', 'No tienes los permisos suficientes.', 'warning');
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}
