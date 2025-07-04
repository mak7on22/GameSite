import { attack, defend, aiMove } from '../src/durak';
import { GameState, Card } from '../src/types';

describe('attack and defend logic', () => {
  function setupState(): GameState {
    const c1: Card = { id: '6_of_clubs', rank: 6, suit: 'clubs' };
    const c2: Card = { id: '7_of_clubs', rank: 7, suit: 'clubs' };
    return {
      players: {
        human: { hand: [c1], role: 'human' },
        ai: { hand: [c2], role: 'ai' }
      },
      deck: [],
      trump: 'hearts',
      attacker: 'human',
      defender: 'ai',
      table: [],
      phase: 'attack'
    };
  }

  test('attacker plays a card from hand', () => {
    const state = setupState();
    const ok = attack(state, '6_of_clubs');
    expect(ok).toBe(true);
    expect(state.table).toHaveLength(1);
    expect(state.players.human.hand).toHaveLength(0);
  });

  test('defender must beat with higher or trump card', () => {
    const state = setupState();
    attack(state, '6_of_clubs');
    const ok = defend(state, 0, '7_of_clubs');
    expect(ok).toBe(true);
    expect(state.table[0].defense?.id).toBe('7_of_clubs');
  });

  test('cannot add card with wrong rank', () => {
    const state = setupState();
    const extra: Card = { id: '8_of_hearts', rank: 8, suit: 'hearts' };
    state.players.human.hand.push(extra);
    attack(state, '6_of_clubs');
    defend(state, 0, '7_of_clubs');
    const ok = attack(state, '8_of_hearts');
    expect(ok).toBe(false);
    expect(state.players.human.hand).toContain(extra);
  });

  test('defend fails with weaker card', () => {
    const state = setupState();
    const weak: Card = { id: '5_of_clubs', rank: 5, suit: 'clubs' };
    state.players.ai.hand.push(weak);
    attack(state, '6_of_clubs');
    const ok = defend(state, 0, '5_of_clubs');
    expect(ok).toBe(false);
    expect(state.table[0].defense).toBeUndefined();
    expect(state.players.ai.hand).toContain(weak);
  });

  test('attacker cannot exceed defender hand size', () => {
    const state = setupState();
    // defender has only one card, so limit = 1
    attack(state, '6_of_clubs');
    // attacker tries to add another card of same rank
    const extra: Card = { id: '6_of_hearts', rank: 6, suit: 'hearts' };
    state.players.human.hand.push(extra);
    const ok = attack(state, '6_of_hearts');
    expect(ok).toBe(false);
  });

  test('attacker can add card during defense', () => {
    const state = setupState();
    const extra: Card = { id: '6_of_hearts', rank: 6, suit: 'hearts' };
    state.players.human.hand.push(extra);
    state.players.ai.hand.push({ id: '8_of_spades', rank: 8, suit: 'spades' });
    attack(state, '6_of_clubs'); // phase becomes defense
    const ok = attack(state, '6_of_hearts');
    expect(ok).toBe(true);
    expect(state.table).toHaveLength(2);
  });

  test('attacker can add card with matching suit', () => {
    const state = setupState();
    const extra: Card = { id: '9_of_clubs', rank: 9, suit: 'clubs' };
    const defendExtra: Card = { id: '8_of_hearts', rank: 8, suit: 'hearts' };
    const aiSpare: Card = { id: '10_of_diamonds', rank: 10, suit: 'diamonds' };
    state.players.ai.hand.push(defendExtra, aiSpare);
    state.players.human.hand.push(extra);
    attack(state, '6_of_clubs');
    defend(state, 0, '7_of_clubs');
    const ok = attack(state, '9_of_clubs');
    expect(ok).toBe(true);
    expect(state.table).toHaveLength(2);
    expect(state.table[1].attack.id).toBe('9_of_clubs');
  });

  test('ai attacks with matching suit when possible', () => {
    const c1: Card = { id: '6_of_spades', rank: 6, suit: 'spades' };
    const c2: Card = { id: '9_of_spades', rank: 9, suit: 'spades' };
    const defendCard: Card = { id: '7_of_spades', rank: 7, suit: 'spades' };
    const extraHuman: Card = { id: '8_of_diamonds', rank: 8, suit: 'diamonds' };
    const extraHuman2: Card = { id: '9_of_hearts', rank: 9, suit: 'hearts' };
    const state: GameState = {
      players: {
        human: { hand: [defendCard, extraHuman, extraHuman2], role: 'human' },
        ai: { hand: [c1, c2], role: 'ai' }
      },
      deck: [],
      trump: 'hearts',
      attacker: 'ai',
      defender: 'human',
      table: [],
      phase: 'attack'
    };
    aiMove(state);
    defend(state, 0, '7_of_spades');
    aiMove(state);
    expect(state.table).toHaveLength(2);
    expect(state.table[1].attack.suit).toBe('spades');
  });

  test('ai can add card during defense', () => {
    const c1: Card = { id: '6_of_spades', rank: 6, suit: 'spades' };
    const c2: Card = { id: '6_of_hearts', rank: 6, suit: 'hearts' };
    const defendCard: Card = { id: '7_of_clubs', rank: 7, suit: 'clubs' };
    const spare: Card = { id: '8_of_diamonds', rank: 8, suit: 'diamonds' };
    const state: GameState = {
      players: {
        human: { hand: [defendCard, spare], role: 'human' },
        ai: { hand: [c1, c2], role: 'ai' }
      },
      deck: [],
      trump: 'diamonds',
      attacker: 'ai',
      defender: 'human',
      table: [],
      phase: 'attack'
    };
    aiMove(state); // AI plays first card
    aiMove(state); // should add second card even though phase is defense
    expect(state.table).toHaveLength(2);
  });
});
