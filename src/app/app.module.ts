import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LucideAngularModule, Compass, Loader, FileQuestion, ChevronRight } from 'lucide-angular';
import { PokemonCardComponent } from './pokemon-card/pokemon-card.component';

@NgModule({
  declarations: [
    AppComponent,
    PokemonCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LucideAngularModule.pick({ Compass, Loader, FileQuestion, ChevronRight }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
