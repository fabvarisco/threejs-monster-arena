export const POKEMON_ROSTER = [
  'charmander',
  'squirtle',
  'bulbasaur',
  'pikachu',
  'eevee',
  'snorlax',
];

export const player = {
  selectedMonster: null,
  monsters: [],
  items: {
    potion: { name: 'potion', _func: () => {} },
    damageBoost: { name: 'damageBoost', _func: () => {} },
  },
};

export const Enemy = {
  selectedMonster: null,
  monsters: [],
  items: {
    potion: { name: 'potion', _func: () => {} },
    damageBoost: { name: 'damageBoost', _func: () => {} },
  },
};
