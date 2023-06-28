import { Component } from '@angular/core';
import Pokemon from './interfaces/pokemon';
import { PokemonService } from './pokemon-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Members
  title: string = 'poke-angular';
  numberOfPokemons = 0;
  isLoading: boolean = false;
  loadingStatus: string = '';  
  maxItemsOnPage: number = 100;
  currentPage: number = 0;
  paginationKeys: Array<number> = [0];
  pagePokemonData: Array<Pokemon> = [];

  // Services
  pokemonService: PokemonService = new PokemonService();

  // Methods
  async getPokeAPIData() : Promise<void>
  {
    this.isLoading = true;
    this.loadingStatus = 'Fetching all Pokémons on page...';

    const pokemonData: Array<Pokemon>|null = await this.pokemonService.getAllPokemons(this.maxItemsOnPage, (this.maxItemsOnPage * this.currentPage));

    if ( pokemonData === null )
    {
      console.error('AppComponent: getPokeAPIData(): error: pokemonData is null');
      return;
    }

    this.pagePokemonData = pokemonData;
    
    this.isLoading = false;
    this.loadingStatus = '';
    this.paginationKeys = [...Array(Math.ceil(this.numberOfPokemons / this.maxItemsOnPage)).keys()];

    // Trigger async detailed data fetch
    pokemonData.forEach((pokemon: Pokemon, pageIndex: number) => {
      this.fetchDetailedPokemonData(pokemon.name, pageIndex);
    });
  }

  async fetchDetailedPokemonData(name: string, pageIndex: number) : Promise<void>
  {
    const fullPokemonData: Pokemon|null = await this.pokemonService.getDetailedPokemonInfo(name);
    
    if ( fullPokemonData == null )
    {
      console.error(`AppComponent: fetchDetailedPokemonData("${name}"): error: fullPokemonData is null`);
      return;
    }

    this.pagePokemonData[pageIndex] = fullPokemonData;
  }

  changePage(pageID: number) : void
  {
    if (pageID === this.currentPage) { return; }
   
    this.isLoading = true;
    this.pagePokemonData = [];
    this.currentPage = pageID;
    this.getPokeAPIData();
  }

  async fetchPokemonCount() : Promise<void> { this.numberOfPokemons = await this.pokemonService.getPokemonCount(); }

  async ngOnInit()
  {
    await this.fetchPokemonCount();
    this.getPokeAPIData();
  }
}
