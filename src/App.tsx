import React, { useState, FormEvent } from "react";
import "./App.css";

interface Pokemon {
  name: string;
  types: TypeSlot[];
  sprites: Sprites;
}

interface TypeSlot {
  type: PokemonType;
}

interface PokemonType {
  name: string;
  url: string;
}

interface Sprites {
  front_default: string;
}

function App() {
  const [error, setError] = useState<Error | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [pokemon, setPokemon] = useState<Pokemon>();
  const [weaknesses, setWeaknesses] = useState<PokemonType[]>([]);
  const [pokemonName, setPokemonName] = useState("");

  const handleSubmit = (event: FormEvent) => {
    setIsLoaded(false);
    setWeaknesses([]);
    let pokemon: Pokemon;
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
      .then((res) => res.json())
      .then(
        (result) => {
          pokemon = result;
          setPokemon(pokemon);

          Promise.all(
            pokemon?.types.map((t) =>
              fetch(`https://pokeapi.co/api/v2/type/${t.type.name}`)
            )
          ).then((responses) =>
            Promise.all(responses.map((res) => res.json())).then((results) =>
              results.forEach((result) => {
                result.damage_relations.double_damage_from.map(
                  (pt: PokemonType) =>
                    setWeaknesses((weaknesses) => [...weaknesses, pt])
                );
              })
            )
          );
          setIsLoaded(true);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );

    event.preventDefault();
  };

  return (
    <div className="App">
      <h1>Pokémon Punch Up</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Pokemon:
          <input
            name="pokemon"
            value={pokemonName}
            onChange={(e) => setPokemonName(e.target.value)}
          />
        </label>
      </form>

      <div id="pokemon">
        {error ? (
          <span>Error: {error.message}</span>
        ) : !isLoaded ? (
          <span>Loading..</span>
        ) : (
          <div>
            <h2>{capitalize(pokemon?.name)}</h2>
            <img
              src={pokemon?.sprites.front_default}
              alt={pokemon?.name}
              width="200"
            />
            {weaknesses.length > 0 ? (
              <div>
                <h3>Weaknesses</h3>
                <ul>
                  {weaknesses.map((weakness) => (
                    <li key={weakness.name}>{weakness.name}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function capitalize(s: string | undefined): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

export default App;
