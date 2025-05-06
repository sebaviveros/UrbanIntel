import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { QuienesSomosComponent } from './views/quienes-somos/quienes-somos.component';
import { ManualComponent } from './views/manual/manual.component';
const routes: Routes = [
  { path: 'landing-page', component: LandingPageComponent},
  {path: 'quienes-somos', component: QuienesSomosComponent},
  {path:'manual', component: ManualComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // cuando se levanta el sistema, dirige a este path  ej: http://localhost:4200/ --> http://localhost:4200/login
  { path: '**', redirectTo: 'login' } // ruta comodín
  // Aquí irán las rutas como { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
