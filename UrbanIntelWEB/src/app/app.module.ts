import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { QuienesSomosComponent } from './views/quienes-somos/quienes-somos.component';
import { ManualComponent } from './views/manual/manual.component';


@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    QuienesSomosComponent,
    ManualComponent
    // Agregarás más componentes aquí luego
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
