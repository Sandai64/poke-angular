import { Injectable } from '@angular/core';
import Pokemon from './interfaces/pokemon';
import PokemonAbility from './interfaces/pokemon-ability';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  readonly endpoint: string = 'https://pokeapi.co/api/v2';
  readonly enableCaching: boolean = true;

  constructor() { }

  async getPokemonCount() : Promise<number>
  {
    const cachedPokemonCount = localStorage.getItem('metadata.count');

    if ( cachedPokemonCount && this.enableCaching )
    {
      try
      {
        const deserializedCachedPokemonCount = JSON.parse(cachedPokemonCount);
        const now = new Date().getTime();

        if ( (deserializedCachedPokemonCount.createdAt - now) < 3600000)
        {
          console.log(`pokemon-service: serving cached pokemon count:`, deserializedCachedPokemonCount.data);
          return deserializedCachedPokemonCount.data
        }
      }
      catch
      {
        console.log('pokemon-service: getPokemonCount(): error when deserializing cached count');
      }

      console.log('pokemon-service: getPokemonCount(): invalidating cached data');
      localStorage.removeItem('metadata.count');
    }

    try
    {
      const pokemonCount = (await (await fetch(`${this.endpoint}/pokemon?limit=${1}`)).json()).count;

      if ( this.enableCaching )
      {
        console.log('pokemon-service: caching pokemon count');
        localStorage.setItem('metadata.count', JSON.stringify({
          createdAt: new Date().getTime(),
          data: pokemonCount,
        }));
      }

      return pokemonCount;
    }
    catch
    {
      return 0;
    }
  }

  /**
   * Get basic information about all Pokémons within the given boundaries
   * @param limit How many Pokémons should be returned
   * @param offset Pokémon ID offset (PokéAPI.co)
   * @returns Array of Pokemon with all values left undefined except `name`. Returns null if error.
   */
  async getAllPokemons(limit?: number|undefined, offset?: number|undefined) : Promise<Pokemon[] | null>
  {
    let httpResponse: any;
    let pokemonData: Array<Pokemon> = [];

    try
    {
      if ( ! limit && ! offset )
      {
        httpResponse = (await (await fetch(`${this.endpoint}/pokemon?limit=9999999`)).json()).results;
      }
      else
      {
        httpResponse = (await (await fetch(`${this.endpoint}/pokemon?limit=${limit}&offset=${offset}`)).json()).results;
      }
    }
    catch
    {
      return null;
    }

    httpResponse.forEach((element: any) => {
      pokemonData.push({
        name: element.name,
        index: undefined,
        localizedNames: undefined,
        sprite: undefined,
        abilities: undefined,
        moves: undefined,
        type: undefined,
        weight: undefined
      });
    });

    return pokemonData;
  }

  /**
   * 
   * @param name 
   * @returns 
   */
  async getDetailedPokemonInfo(name: string) : Promise<Pokemon | null>
  {
    // Check cache beforehand
    const cachedPokemon = localStorage.getItem(`pokemon.${name}`);

    if ( cachedPokemon )
    {
      console.log(`pokemon-service: cache hit! [pokemon.${name}]`);
      return JSON.parse(cachedPokemon);
    }

    console.warn(`pokemon-service: cache miss! [pokemon.${name}]`);

    let pokemonDetails;
    let pokemonSpecies;

    try
    {
      pokemonDetails = await (await fetch(`${this.endpoint}/pokemon/${name}`)).json();
      pokemonSpecies = await (await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`)).json();
    }
    catch
    {
      const pokemon: Pokemon = {
        name: pokemonDetails.name,
        index: undefined,
        localizedNames: undefined,
        abilities: undefined,
        moves: undefined,
        type: undefined,
        weight: undefined,
        sprite: undefined
      };

      localStorage.setItem(`pokemon.${name}`, JSON.stringify(pokemon));

      return null;
    }

    // Cleanup & format Pokémon names
    let pokemonNames: Record<string, string> = {};
    pokemonSpecies.names.forEach((element: any) => {
      pokemonNames[element.language.name] = element.name;
    });

    // Cleanup & format Pokémon abilities
    let pokemonAbilities: Array<PokemonAbility> = [];
    pokemonDetails.abilities.forEach((element: any) => {
      pokemonAbilities.push({
        name: element.ability.name,
        url: element.ability.url,
      });
    });

    const pokemon: Pokemon = {
      name: pokemonDetails.name,
      index: pokemonDetails.id,
      localizedNames: pokemonNames,
      sprite: {
        urlFront: pokemonDetails.sprites.front_default,
        urlBack: pokemonDetails.sprites.back_default,
      },
      abilities: pokemonAbilities,
      moves: undefined,
      type: undefined,
      weight: undefined
    };

    if ( this.enableCaching )
    {
      // Store pokemon in cache w/ createdAt timestamp
      console.log(`pokemon-service: caching pokemon.${name}`);
      localStorage.setItem(`pokemon.${name}`, JSON.stringify(pokemon));
    }

    return pokemon;
  }

  clearCache() : void
  {
    localStorage.clear();
  }

  // pokemonObservable: Observable<unknown> = new Observable(
  //   function subscribe(subscriber)
  //   {
  //     const allPokemons = this.
  //     subscriber.next();
  //   }
  // );
}
