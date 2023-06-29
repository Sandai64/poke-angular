import { Injectable } from '@angular/core';
import Pokemon from './interfaces/pokemon';
import PokemonAbility from './interfaces/pokemon-ability';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  readonly endpoint = 'https://pokeapi.co/api/v2';

  constructor() { }

  async getPokemonCount() : Promise<number>
  {
    const cachedPokemonCount = localStorage.getItem('metadata.count');

    if ( cachedPokemonCount )
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

      console.log('pokemon-service: caching pokemon count');
      localStorage.setItem('metadata.count', JSON.stringify({
        createdAt: new Date().getTime(),
        data: pokemonCount,
      }));

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
  async getAllPokemons(limit: number, offset: number) : Promise<Pokemon[] | null>
  {
    let httpResponse: any;
    let pokemonData: Array<Pokemon> = [];

    try
    {
      httpResponse = (await (await fetch(`${this.endpoint}/pokemon?limit=${limit}&offset=${offset}`)).json()).results;
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
      try
      {
        const deserializedCachedPokemon = JSON.parse(cachedPokemon);
        const now = new Date().getTime();

        // Only return if data isn't older than a day
        if (  (now - deserializedCachedPokemon.createdAt) < 86400000 )
        {
          console.log(`pokemon-service: serving cached pokemon.${name}`);
          return deserializedCachedPokemon.data;
        } 
      }
      catch
      {
        console.log(`pokemon-service: failed to deserialize pokemon.${name}`);
      }

      console.log(`pokemon-service: invalidating cache for pokemon.${name}`);
      localStorage.removeItem(`pokemon.${name}`);
    }

    let pokemonDetails;
    let pokemonSpecies;

    try
    {
      pokemonDetails = await (await fetch(`${this.endpoint}/pokemon/${name}`)).json();
      pokemonSpecies = await (await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`)).json();
    }
    catch
    {
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

    // Store pokemon in cache w/ createdAt timestamp
    const now = new Date().getTime();
    console.log(`pokemon-service: caching pokemon.${name} with createdAt value`, now);
    localStorage.setItem(`pokemon.${name}`, JSON.stringify({
      createdAt: now,
      data: pokemon,
    }));

    return pokemon;
  }
}
