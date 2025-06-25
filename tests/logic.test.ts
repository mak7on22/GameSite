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
    const bad = defend(state, 0, '7_of_clubs');
    expect(bad).toBe(true);
    expect(state.table[0].defense?.id).toBe('7_of_clubs');
  });
});
