import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//  Importación del módulo para formularios
import { FormsModule } from '@angular/forms';

//  Importación del módulo para hacer peticiones HTTP (API REST)
import { HttpClientModule } from '@angular/common/http';

import { ReactiveFormsModule } from '@angular/forms';


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
import { AprobacionesComponent } from './views/aprobaciones/aprobaciones.component';
import { ReportesComponent } from './views/reportes/reportes.component';
import { AuditoriaComponent } from './views/auditoria/auditoria.component'; 

import { ProgramacionComponent } from './views/programacion/programacion.component'; // datatables de angular


import { LOCALE_ID } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    LayoutComponent,
    LandingPageComponent,
    QuienesSomosComponent,
    ManualComponent,
    GestionCuentasComponent,
    SolicitudesComponent,
    AprobacionesComponent,
    ReportesComponent,
    AuditoriaComponent,
    ProgramacionComponent 
    // Agregarás más componentes aquí luego
  ],
   imports: [ 
    BrowserModule,
    DataTablesModule,  
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,       // formulario
    HttpClientModule, 
       // Api Rest 
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Agregago de ion-icons para que sea reconocido por Angular
  providers: [{ provide: LOCALE_ID, useValue: 'es-ES' }]
})
export class AppModule { }
