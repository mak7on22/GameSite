import { attack, defend } from '../src/durak';
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
});
