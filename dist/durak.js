"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDeck = buildDeck;
exports.shuffle = shuffle;
exports.dealInitial = dealInitial;
const RANKS = [6, 7, 8, 9, 10, 11, 12, 13, 14];
const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
function buildDeck(size = 36) {
    let ranks = RANKS;
    if (size === 24)
        ranks = RANKS.slice(3); // 9-A
    else if (size === 52)
        ranks = [2, 3, 4, 5, ...RANKS];
    const deck = [];
    ranks.forEach(r => SUITS.forEach(s => deck.push({ id: `${r}_of_${s}`, rank: r, suit: s })));
    return deck;
}
function shuffle(cards) {
    const a = [...cards];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function dealInitial() {
    const deck = shuffle(buildDeck(36));
    const players = {
        human: { hand: [], role: 'human' },
        ai: { hand: [], role: 'ai' }
    };
    let index = 0;
    for (let i = 0; i < 6; i++) {
        players.human.hand.push(deck[index++]);
        players.ai.hand.push(deck[index++]);
    }
    const trumpCard = deck[deck.length - 1];
    const trump = trumpCard.suit;
    let attacker = 'human';
    let minTrump = 15;
    ['human', 'ai'].forEach(p => {
        players[p].hand.forEach(c => {
            if (c.suit === trump && c.rank < minTrump) {
                minTrump = c.rank;
                attacker = p;
            }
        });
    });
    const defender = attacker === 'human' ? 'ai' : 'human';
    // keep the trump card as the last card in the deck for later draw
    const rest = deck.slice(index);
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
