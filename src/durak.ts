import { Card, GameState, Player, Suit } from './types';

const RANKS = [6,7,8,9,10,11,12,13,14];
const SUITS: Suit[] = ['clubs','diamonds','hearts','spades'];

export function buildDeck(size: 24|36|52 = 36): Card[] {
  let ranks = RANKS;
  if(size === 24) ranks = RANKS.slice(3); // 9-A
  else if(size === 52) ranks = [2,3,4,5,...RANKS];
  const deck: Card[] = [];
  ranks.forEach(r => SUITS.forEach(s => deck.push({id:`${r}_of_${s}`,rank:r,suit:s})));
  return deck;
}

export function shuffle(cards: Card[]): Card[] {
  const a = [...cards];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

export function dealInitial(): GameState {
  const deck = shuffle(buildDeck(36));
  const players: Record<'human'|'ai', Player> = {
    human: {hand: [], role: 'human'},
    ai: {hand: [], role: 'ai'}
  };
  let index = 0;
  for(let i=0;i<6;i++){
    players.human.hand.push(deck[index++]);
    players.ai.hand.push(deck[index++]);
  }
  const trumpCard = deck[deck.length-1];
  const trump = trumpCard.suit;
  let attacker: 'human'|'ai' = 'human';
  let minTrump = 15;
  ['human','ai'].forEach(p=>{
    players[p as 'human'|'ai'].hand.forEach(c=>{
      if(c.suit===trump && c.rank < minTrump){
        minTrump = c.rank;
        attacker = p as 'human'|'ai';
      }
    });
  });
  const defender = attacker === 'human' ? 'ai' : 'human';

  const rest = deck.slice(index, deck.length - 1);

  return {
    players,
    deck: rest,
    trump,
    attacker,
    defender,
    table: [],
    phase: 'attack'
  };
}


function ranksOnTable(state: GameState): number[] {
  const ranks: number[] = [];
  state.table.forEach(p => {
    ranks.push(p.attack.rank);
    if (p.defense) ranks.push(p.defense.rank);
  });
  return ranks;
}

export function canBeat(att: Card, def: Card, trump: Suit): boolean {
  if (def.suit === att.suit && def.rank > att.rank) return true;
  if (def.suit === trump && att.suit !== trump) return true;
  return false;
}

export function attack(state: GameState, cardId: string): boolean {
  if (state.phase !== 'attack') return false;
  const player = state.players[state.attacker];
  const idx = player.hand.findIndex(c => c.id === cardId);
  if (idx === -1) return false;
  const card = player.hand[idx];
  if (state.table.length > 0) {
    if (state.table.length >= 6) return false;
    const ranks = ranksOnTable(state);
    if (!ranks.includes(card.rank)) return false;
  }
  player.hand.splice(idx, 1);
  state.table.push({ attack: card });
  state.phase = 'defense';
  return true;
}

export function defend(state: GameState, attackIndex: number, cardId: string): boolean {
  if (state.phase !== 'defense') return false;
  const pair = state.table[attackIndex];
  if (!pair || pair.defense) return false;
  const defender = state.players[state.defender];
  const idx = defender.hand.findIndex(c => c.id === cardId);
  if (idx === -1) return false;
  const card = defender.hand[idx];
  if (!canBeat(pair.attack, card, state.trump)) return false;
  defender.hand.splice(idx, 1);
  pair.defense = card;
  if (state.table.every(p => p.defense)) {
    state.phase = 'resolution';
  } else {
    state.phase = 'attack';
  }
  return true;
}
