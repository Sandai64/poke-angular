import PokemonAbility from "./pokemon-ability";
import PokemonMove from "./pokemon-move";
import PokemonSprite from "./pokemon-sprite";

export default interface Pokemon
{
    // Required members
    name: string;

    // Nullable members
    index: number|undefined|null;
    localizedName: string|undefined|null;
    sprite: PokemonSprite|undefined|null;
    abilities: Array<PokemonAbility>|undefined|null
    moves: Array<PokemonMove>|undefined|null
    type: string|undefined|null
    weight: number|undefined|null
}
