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

  maxItemsOnPage: number = 50;
  currentPage: number = 0;

  pagePokemonData: Array<Pokemon> = [];

  async getPokeAPIData() : Promise<void>
  {
    this.isLoading = true;

    this.loadingStatus = 'Fetching all Pokémons on page.';
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.maxItemsOnPage}`);

    this.loadingStatus = 'Deserializing data...';
    const pokemonData = await response.json();

    pokemonData.results.forEach((item: any, index: number) => {
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

      console.log(`Load: IFace<Pokemon>: '${item.name}' [IDX#${index}]`);
      console.log(`Trigger: Promise: fetchDetailedPokemonData(name: '${item.name}', pageIDX: ${index})`);

      // Trigger detailed async load
      this.fetchDetailedPokemonData(item.name, index);

      // Push & move on
      this.pagePokemonData.push(pokemon)
    });

    this.pagePokemonData = pokemonData.results;
    this.numberOfPokemons = pokemonData.count;
    
    this.isLoading = false;
    console.log(this.pagePokemonData);
  }

  async fetchDetailedPokemonData(name: string, pageIDX: number) : Promise<void>
  {

  }

  ngOnInit() {
    this.getPokeAPIData();
  }
}
