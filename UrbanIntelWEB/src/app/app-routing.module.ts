import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component'; // <-- importa el componente
import { HomeComponent } from './views/home/home.component';
import { LayoutComponent } from './views/layout/layout.component';

const routes: Routes = [
  // redirecciona al login si la url está vacía
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ruta para login
  { path: 'login', component: LoginComponent },

  // rutas protegidas que usan layout (sidebar)
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
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
