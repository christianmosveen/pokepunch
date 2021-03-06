import React, { useState, FormEvent } from "react";
import "./App.css";
import { Pokemon, PokemonType } from "./api";

enum Status {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

function App() {
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [pokemon, setPokemon] = useState<Pokemon>();
  const [weaknesses, setWeaknesses] = useState<PokemonType[]>([]);
  const [pokemonName, setPokemonName] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(Status.LOADING);

    // TODO: Prøv SWR
    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName?.toLowerCase()}`
      );
      const result = (await res.json()) as Pokemon;
      setPokemon(result);

      const typeResponses = await Promise.all(
        result?.types.map(async (t) => {
          const typeRes = await fetch(
            `https://pokeapi.co/api/v2/type/${t.type.name}`
          );
          return (await typeRes.json()) as any;
        })
      );

      const weaknesses = typeResponses
        .flatMap((res) => res.damage_relations.double_damage_from)
        .filter(
          (obj, i, arr) => arr.findIndex((o) => o.name === obj.name) === i
        );
      setWeaknesses(weaknesses);

      setStatus(Status.SUCCESS);
    } catch {
      setStatus(Status.ERROR);
    }
  };

  return (
    <div className="container">
      <h1>Pokémon Punch Up</h1>
      <form action="/" onSubmit={handleSubmit}>
        <div className="row">
          <div className="nine columns">
            <input
              type="search"
              className="u-full-width"
              id="pokemonName"
              name="pokemon"
              placeholder="Pokémon name"
              value={pokemonName}
              onChange={(e) => setPokemonName(e.target.value)}
            />
          </div>
          <div className="three columns">
            <input
              className="button-primary u-full-width"
              type="submit"
              value="Find Pokémon"
            />
          </div>
        </div>
      </form>

      <div id="pokemon">
        {status === Status.ERROR && <span>ErrrROAR!</span>}
        {status === Status.LOADING && <span>Loading..</span>}
        {status === Status.SUCCESS && (
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
                    <li key={weakness.name}>{capitalize(weakness.name)}</li>
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
