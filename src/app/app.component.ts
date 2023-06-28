import { Component } from '@angular/core';
import Pokemon from './interfaces/pokemon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = 'poke-angular';

  numberOfPokemons = 0;

  
  isLoading: boolean = false;
  loadingStatus: string = '';
  
  maxItemsOnPage: number = 100;
  currentPage: number = 0;
  
  paginationKeys: Array<number> = [0];

  pagePokemonData: Array<Pokemon> = [];

  async getPokeAPIData() : Promise<void>
  {
    this.isLoading = true;

    this.loadingStatus = 'Fetching all Pokémons on page...';
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.maxItemsOnPage}&offset=${this.maxItemsOnPage * (this.currentPage)}`);

    this.loadingStatus = 'Deserializing data...';
    const pokemonData = await response.json();

    pokemonData.results.forEach(async (item: any, index: number) => {
      let pokemon: Pokemon = {
        name: item.name,
        index: null,
        localizedName: null,
        sprite: null,
        abilities: null,
        moves: null,
        type: null,
        weight: null
      };

      // console.log(`Load: IFace<Pokemon>: '${item.name}' [IDX#${index}]`);
      // console.log(`Trigger: Promise: fetchDetailedPokemonData(name: '${item.name}', pageIDX: ${index})`);

      // Trigger detailed async load
      this.fetchDetailedPokemonData(item.name, index);

      // Push & move on
      this.pagePokemonData.push(pokemon)
    });

    this.pagePokemonData = pokemonData.results;
    this.numberOfPokemons = pokemonData.count;
    
    this.isLoading = false;
    // console.log(this.pagePokemonData);
    this.paginationKeys = [...Array(Math.ceil(this.numberOfPokemons / this.maxItemsOnPage)).keys()];
  }

  async fetchDetailedPokemonData(name: string, pageIDX: number) : Promise<void>
  {
    let isInvalid = false;

    const pokemonDetails = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)).json();
    const pokemonSpecies = await (await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`)).json().catch(() => {
      isInvalid = true;
      // console.log("Err: Promise<fetchDetailedPokemonData>: Invalid pokemon-species for", name, "at pageIDX", pageIDX);
    });

    if (isInvalid)
    {
      this.pagePokemonData[pageIDX].index = pokemonDetails.id;
      return;
    }

    const pokemonNames: Array<any> = pokemonSpecies.names;
    
    const localizedName = pokemonNames.filter((item: any) => {
      return item.language.name === 'fr';
    })[0].name;

    const pokemonAbilities: Array<string> = [];

    pokemonDetails.abilities.forEach((element: any) => {
      pokemonAbilities.push(element.ability.name)
    });

    // console.log('localized name for IDX', pageIDX, '=', localizedName);

    this.pagePokemonData[pageIDX] = {
      name: name,
      index: pokemonDetails.id,
      localizedName: localizedName,
      sprite: {
        urlFront: pokemonDetails.sprites.front_default,
        urlBack: pokemonDetails.sprites.back_default,
      },
      abilities: [
        {name: 'sdf', url: 'sss'}
      ],
      moves: null,
      type: null,
      weight: null
    };
  }

  changePage(pageID: number) : void
  {
    if (pageID === this.currentPage) { return; }
    
    this.currentPage = pageID;
    this.getPokeAPIData();
  }

  ngOnInit() {
    this.getPokeAPIData();
  }
}
