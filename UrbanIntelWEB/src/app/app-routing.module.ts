import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component'; // <-- importa el componente

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // cuando se levanta el sistema, dirige a este path  ej: http://localhost:4200/ --> http://localhost:4200/login
  { path: '**', redirectTo: 'login' } // ruta comodín
  // Aquí irán las rutas como { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
