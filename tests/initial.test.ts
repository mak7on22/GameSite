import { buildDeck, dealInitial } from '../src/durak';

describe('deck', () => {
  test('36 card deck contains unique cards', () => {
    const deck = buildDeck(36);
    const ids = deck.map(c => c.id);
    expect(new Set(ids).size).toBe(deck.length);
  });
});

describe('dealInitial', () => {
  test('correct trump and attacker determined', () => {
    const state = dealInitial();
    const { players, trump, attacker } = state;
    // attacker must have the minimal trump card
    const allTrumpPlayerCards = players[attacker].hand.filter(c => c.suit === trump);
    const allTrumpCards = [
      ...players.human.hand,
      ...players.ai.hand,
    ].filter(c => c.suit === trump);
    const minTrumpRank = Math.min(...allTrumpCards.map(c => c.rank));
    expect(Math.min(...allTrumpPlayerCards.map(c => c.rank))).toBe(minTrumpRank);
  });

  test('dealInitial accepts deck size', () => {
    const s24 = dealInitial(24);
    expect(s24.deck.length).toBe(11);
    const s52 = dealInitial(52);
    expect(s52.deck.length).toBe(39);
  });
});
