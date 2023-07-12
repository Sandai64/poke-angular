import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LucideAngularModule, Compass, Loader, FileQuestion, ChevronRight, Unlink } from 'lucide-angular';
import { PokemonCardComponent } from './pokemon-card/pokemon-card.component';
import { ErrorComponent } from './error/error.component';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';
import { DetailedInfoModalComponent } from './detailed-info-modal/detailed-info-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    PokemonCardComponent,
    ErrorComponent,
    PokemonListComponent,
    DetailedInfoModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LucideAngularModule.pick({ Compass, Loader, FileQuestion, ChevronRight, Unlink }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
