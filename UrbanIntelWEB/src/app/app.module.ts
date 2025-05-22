import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
<<<<<<< Updated upstream
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './views/login/login.component';
=======

//  Importación del módulo para formularios
import { FormsModule } from '@angular/forms';

//  Importación del módulo para hacer peticiones HTTP (API REST)
import { HttpClientModule } from '@angular/common/http';

import { ReactiveFormsModule } from '@angular/forms';

import { NgbAccordionModule, NgbCarouselModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';



import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './views/login/login.component';
import { HomeComponent } from './views/home/home.component';
import { LayoutComponent } from './views/layout/layout.component';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { QuienesSomosComponent } from './views/quienes-somos/quienes-somos.component';
import { ManualComponent } from './views/manual/manual.component';

import { DataTablesModule } from "angular-datatables";
import { GestionCuentasComponent } from './views/gestion-cuentas/gestion-cuentas.component';
import { SolicitudesComponent } from './views/solicitudes/solicitudes.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // datatables de angular
>>>>>>> Stashed changes


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
    // Agregarás más componentes aquí luego
  ],
  imports: [
    BrowserModule,
<<<<<<< Updated upstream
    AppRoutingModule
=======
    DataTablesModule,  
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,       // formulario
    HttpClientModule, NgbModule, 
       // Api Rest 
     NgbAccordionModule,
    NgbCarouselModule,
    NgbPaginationModule
>>>>>>> Stashed changes
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
