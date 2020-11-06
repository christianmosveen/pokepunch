export interface Pokemon {
  name: string;
  types: TypeSlot[];
  sprites: Sprites;
}

export interface TypeSlot {
  type: PokemonType;
}

export interface PokemonType {
  name: string;
  url: string;
}

export interface Sprites {
  front_default: string;
}
