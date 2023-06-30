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
  fullPokemonData: Pokemon[] = [];
  pagePokemonData: Array<Pokemon> = [];

  // FLAGS/OVERLAYS
  loaderOverlay = {
    enabled: false,
    header: '',
    status: '',
    percentage: 0,
  };

  errorOverlay = {
    enabled: false,
    status: '',
  };

  numberOfPokemons = 0;
  detailedPokemonCount: number = 0;

  maxItemsOnPage: number = 250;

  currentPage: number|null = null;
  paginationKeys: Array<number>|null = null;

  // Services
  pokemonService: PokemonService = new PokemonService();


  // Methods
  async delay(time: number) : Promise<unknown>
  {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  /**
   * Should only be run once on `this.ngOnInit()`.
   * DO NOT CALL THIS DIRECTLY !
   */
  async buildInitialPageCache() : Promise<void>
  {
    console.log('pokemon-list: trigger: async buildInitialPageCache()');

    // Loader overlay
    this.loaderOverlay.enabled = true;
    this.loaderOverlay.header = 'Building cache';
    this.loaderOverlay.status = 'Fetching basic Pokémon info...';

    // Store all pokémon data
    this.fullPokemonData = await this.pokemonService.getAllPokemons() ?? [];

    // Abort early, service call should work under normal conditions
    if ( ! this.fullPokemonData )
    {
      this.loaderOverlay.enabled = false;
      this.errorOverlay.enabled = true;
      this.errorOverlay.status = 'Failed to fetch all pokémon data - did your internet connection go out ?';

      return;
    }

    // Build pagination keys
    this.paginationKeys = [...Array(Math.ceil(this.numberOfPokemons / this.maxItemsOnPage)).keys()];

    // Build detailed information for each fetched Pokémon ID
    for (const [pokemonIDX, pokemonItem] of this.fullPokemonData.entries())
    {
      this.loaderOverlay.percentage = Math.floor((pokemonIDX / this.numberOfPokemons) * 100);

      if ( pokemonIDX == this.numberOfPokemons - 1 )
      {
        this.loaderOverlay.status = 'Finalizing...';
      }
      else
      {
        this.loaderOverlay.status = `Dispatching worker for: ${pokemonItem.name}`;
      }

      this.pokemonService.getDetailedPokemonInfo(pokemonItem.name).then((detailedPokemonData: Pokemon|null) => {
        if ( detailedPokemonData )
        {
          this.fullPokemonData![pokemonIDX] = detailedPokemonData;
        }

        if ( pokemonIDX === this.numberOfPokemons - 1 )
        {
          console.warn('--------------------');
          console.warn('PokemonListComponent: Promise<getPokeApiData()>: fetchDetailedPokemonData() completed, current status of [this]:', this);
          console.warn('--------------------');

          this.loaderOverlay.percentage = 0;
          this.loaderOverlay.header = '';
          this.loaderOverlay.enabled = false;
          // this.loadingDone = true;

          // Delegate page construction
          this.changePage(0);
        }
      });

    }
  }

  changePage(pageID: number) : void
  {
    if (pageID === this.currentPage) { return; }

    this.loaderOverlay.percentage = 0;
    this.loaderOverlay.header = 'Loading cache';
    this.loaderOverlay.enabled = true;

    this.currentPage = pageID;
    this.pagePokemonData = this.fullPokemonData.slice((this.currentPage * this.maxItemsOnPage), (this.currentPage * this.maxItemsOnPage) + this.maxItemsOnPage);

    this.loaderOverlay.enabled = false;
  }

  async fetchPokemonCount() : Promise<void> { this.numberOfPokemons = await this.pokemonService.getPokemonCount(); }

  async ngOnInit()
  {
    await this.fetchPokemonCount();
    this.buildInitialPageCache();
  }
}
