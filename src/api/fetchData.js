const BASE_URL = 'https://pokeapi.co/api/v2';
const cache = new Map();

export async function fetchPokemon(nameOrId) {
  const key = String(nameOrId).toLowerCase();
  if (cache.has(key)) return cache.get(key);
  const res = await fetch(`${BASE_URL}/pokemon/${key}`);
  if (!res.ok) throw new Error(`Pokemon not found: ${key}`);
  const data = await res.json();
  cache.set(key, data);
  return data;
}

export function mapPokemonToMonster(data) {
  const statMap = {};
  data.stats.forEach(s => { statMap[s.stat.name] = s.base_stat; });
  return {
    id: data.id,
    name: data.name,
    life: statMap['hp'],
    damage: statMap['attack'],
    defense: statMap['defense'],
    speed: statMap['speed'],
    type: data.types[0].type.name,
    types: data.types.map(t => t.type.name),
    sprites: {
      front: data.sprites.front_default,
      back: data.sprites.back_default,
      artwork: data.sprites.other?.['official-artwork']?.front_default ?? data.sprites.front_default,
    },
    attacks: data.moves.slice(0, 2).map(m => ({ name: m.move.name, type: data.types[0].type.name })),
  };
}
