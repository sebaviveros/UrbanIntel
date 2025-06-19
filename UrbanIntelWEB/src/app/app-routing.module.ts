import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component'; // importa el componente
import { HomeComponent } from './views/home/home.component';
import { LayoutComponent } from './views/layout/layout.component';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { QuienesSomosComponent } from './views/quienes-somos/quienes-somos.component';
import { ManualComponent } from './views/manual/manual.component';
import { GestionCuentasComponent } from './views/gestion-cuentas/gestion-cuentas.component';
import { SolicitudesComponent } from './views/solicitudes/solicitudes.component';
import { AprobacionesComponent } from './views/aprobaciones/aprobaciones.component';
import { ReportesComponent } from './views/reportes/reportes.component';


const routes: Routes = [
  // redirecciona al login si la url está vacía
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ruta para login
  { path: 'login', component: LoginComponent },
  { path: 'landing-page', component: LandingPageComponent},
  {path: 'quienes-somos', component: QuienesSomosComponent},
  {path:'manual', component: ManualComponent},
  // rutas protegidas que usan layout (sidebar)
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'solicitudes', component: SolicitudesComponent },
      { path: 'gestion-cuentas', component: GestionCuentasComponent },
      { path: 'aprobaciones', component: AprobacionesComponent },
      { path: 'reportes', component: ReportesComponent }
      // puedes agregar más rutas hijas aquí
    ]
  },

  // ruta comodín para rutas no encontradas
  { path: '**', redirectTo: 'login' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
