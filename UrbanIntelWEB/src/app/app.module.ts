import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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



@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    QuienesSomosComponent,
    ManualComponent,
    GestionCuentasComponent,
    SolicitudesComponent,
    AprobacionesComponent,
    ReportesComponent,
    AuditoriaComponent
    // Agregarás más componentes aquí luego
  ],
    BrowserModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
