import { Component } from '@angular/core';
import Pokemon from '../interfaces/pokemon';
import { PokemonService } from '../pokemon-service.service';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokemonListComponent {
  // Members
  loadingDone: boolean = false;
  fullPokemonData: Pokemon[] = [];
  loadingPercentage: number = 0;
  title: string = 'poke-angular';
  numberOfPokemons = 0;
  isLoading: boolean = false;
  loadingStatus: string = '';  
  maxItemsOnPage: number = 365;
  currentPage: number = 0;
  paginationKeys: Array<number> = [0];
  pagePokemonData: Array<Pokemon> = [];

  detailedPokemonCount: number = 0;

  // Services
  pokemonService: PokemonService = new PokemonService();

  async delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  
  // Methods
  async getPokeAPIData() : Promise<void>
  {
    this.isLoading = true;
    this.loadingStatus = 'Fetching all Pokémons on page...';

    const pokemonData: Array<Pokemon>|null = await this.pokemonService.getAllPokemons(this.maxItemsOnPage, (this.currentPage*this.maxItemsOnPage));
    console.log(pokemonData);

    if ( pokemonData === null )
    {
      console.log('AppComponent: getPokeAPIData(): error: pokemonData is null');
      return;
    }

    this.fullPokemonData = pokemonData;
    this.pagePokemonData = pokemonData.slice((this.currentPage * this.maxItemsOnPage), this.maxItemsOnPage);
    
    this.paginationKeys = [...Array(Math.ceil(this.numberOfPokemons / this.maxItemsOnPage)).keys()];
    
    // Trigger async detailed data fetch
    for (const [pageIndex, pokemonItem] of pokemonData.entries())
    {
      this.loadingStatus = `Fetching details for Pokémon #${ pageIndex } ('${ pokemonItem.name }')`;
      console.log('Fetching detailed data for pokemon', pokemonItem.name, 'at #IDX', pageIndex);

      setTimeout(() => {
        this.fetchDetailedPokemonData(pokemonItem.name, pageIndex).then(() => {
          if ( pageIndex === pokemonData.length - 1 )
          {
            this.loadingPercentage = 0;
            this.isLoading = false;
            this.loadingDone = true;
          }
        });
      }, pageIndex * 10);
      
    }
    
    this.loadingStatus = '';
  }

  async fetchDetailedPokemonData(name: string, pageIndex: number) : Promise<void>
  {
    this.loadingStatus = name;
    const fullPokemonData: Pokemon|null = await this.pokemonService.getDetailedPokemonInfo(name);
    
    if ( fullPokemonData == null )
    {
      console.log(`AppComponent: fetchDetailedPokemonData("${name}"): error: fullPokemonData is null`);
      return;
    }

    this.detailedPokemonCount++;
    this.loadingPercentage = Math.floor((this.detailedPokemonCount / this.maxItemsOnPage) * 100);
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
