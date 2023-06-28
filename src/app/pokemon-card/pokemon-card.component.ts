import { Component, Input } from '@angular/core';
import Pokemon from '../interfaces/pokemon';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.css']
})
export class PokemonCardComponent {
  @Input() pokemon: Pokemon = {
    name: '',
    index: undefined,
    localizedNames: undefined,
    sprite: undefined,
    abilities: undefined,
    moves: undefined,
    type: undefined,
    weight: undefined
  };
}
