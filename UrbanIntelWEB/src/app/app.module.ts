import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//  Importación del módulo para formularios
import { FormsModule } from '@angular/forms';

//  Importación del módulo para hacer peticiones HTTP (API REST)
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './views/login/login.component';
import { HomeComponent } from './views/home/home.component';
import { LayoutComponent } from './views/layout/layout.component';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { QuienesSomosComponent } from './views/quienes-somos/quienes-somos.component';
import { ManualComponent } from './views/manual/manual.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    LayoutComponent,
    LandingPageComponent,
    QuienesSomosComponent,
    ManualComponent 
    // Agregarás más componentes aquí luego
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,         // formulario
    HttpClientModule, 
       // Api Rest 
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Agregago de ion-icons para que sea reconocido por Angular
})
export class AppModule { }
