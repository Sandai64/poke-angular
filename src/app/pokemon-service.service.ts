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
    try
    {
      return (await (await fetch(`${this.endpoint}/pokemon?limit=${1}`)).json()).count;
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

    return pokemon;
  }
}
