"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDeck = buildDeck;
exports.shuffle = shuffle;
exports.dealInitial = dealInitial;
exports.canBeat = canBeat;
exports.attack = attack;
exports.defend = defend;
exports.aiMove = aiMove;
exports.takeCards = takeCards;
exports.finishRound = finishRound;
exports.refillHands = refillHands;
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
function dealInitial(deckSize = 36) {
    const deck = shuffle(buildDeck(deckSize));
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
function ranksOnTable(state) {
    const ranks = [];
    state.table.forEach(p => {
        ranks.push(p.attack.rank);
        if (p.defense)
            ranks.push(p.defense.rank);
    });
    return ranks;
}
function canBeat(att, def, trump) {
    if (def.suit === att.suit && def.rank > att.rank)
        return true;
    if (def.suit === trump && att.suit !== trump)
        return true;
    return false;
}
function attack(state, cardId) {
    if (state.phase !== 'attack')
        return false;
    const player = state.players[state.attacker];
    const idx = player.hand.findIndex(c => c.id === cardId);
    if (idx === -1)
        return false;
    const card = player.hand[idx];
    if (state.table.length > 0) {
        const defenderCards = state.players[state.defender].hand.length;
        if (state.table.length >= Math.min(6, defenderCards))
            return false;
        const ranks = ranksOnTable(state);
        if (!ranks.includes(card.rank))
            return false;
    }
    player.hand.splice(idx, 1);
    state.table.push({ attack: card });
    state.phase = 'defense';
    state.lastMove = { player: state.attacker, action: 'attack', card };
    return true;
}
function defend(state, attackIndex, cardId) {
    if (state.phase !== 'defense')
        return false;
    const pair = state.table[attackIndex];
    if (!pair || pair.defense)
        return false;
    const defender = state.players[state.defender];
    const idx = defender.hand.findIndex(c => c.id === cardId);
    if (idx === -1)
        return false;
    const card = defender.hand[idx];
    if (!canBeat(pair.attack, card, state.trump))
        return false;
    defender.hand.splice(idx, 1);
    pair.defense = card;
    state.lastMove = { player: state.defender, action: 'defense', card };
    if (state.table.every(p => p.defense)) {
        state.phase = 'resolution';
    }
    else {
        state.phase = 'attack';
    }
    return true;
}
function aiMove(state) {
    if (state.attacker === 'ai' && state.phase === 'attack') {
        const hand = state.players.ai.hand;
        const ranks = ranksOnTable(state);
        const limit = Math.min(6, state.players[state.defender].hand.length);
        if (state.table.length >= limit)
            return;
        let candidate;
        if (state.table.length === 0) {
            candidate = [...hand].sort((a, b) => a.rank - b.rank)
                .find(c => c.suit !== state.trump) || [...hand].sort((a, b) => a.rank - b.rank)[0];
        }
        else {
            candidate = hand.filter(c => ranks.includes(c.rank))
                .sort((a, b) => a.rank - b.rank)[0];
        }
        if (candidate)
            attack(state, candidate.id);
        return;
    }
    if (state.defender === 'ai' && state.phase === 'defense') {
        const idx = state.table.findIndex(p => !p.defense);
        if (idx === -1)
            return;
        const attackCard = state.table[idx].attack;
        const hand = state.players.ai.hand;
        const def = hand.find(c => canBeat(attackCard, c, state.trump));
        if (def) {
            defend(state, idx, def.id);
        }
        else {
            takeCards(state);
        }
    }
    // When resolution is reached and the AI participated, wait for the human
    // player to confirm round completion via UI instead of finishing
    // automatically.
}
function takeCards(state) {
    const defender = state.players[state.defender];
    defender.hand.push(...state.table.flatMap(p => [p.attack, ...(p.defense ? [p.defense] : [])]));
    state.table = [];
    refillHands(state);
    const taker = state.defender;
    const newAttacker = state.defender;
    state.defender = state.attacker;
    state.attacker = newAttacker;
    state.phase = 'attack';
    state.lastMove = { player: taker, action: 'take' };
}
function finishRound(state) {
    state.table = [];
    const finisher = state.defender;
    const newAttacker = state.defender;
    state.defender = state.attacker;
    state.attacker = newAttacker;
    refillHands(state);
    state.phase = 'attack';
    state.lastMove = { player: finisher, action: 'finish' };
}
function refillHands(state) {
    const order = [state.attacker, state.defender];
    for (const role of order) {
        const player = state.players[role];
        while (player.hand.length < 6 && state.deck.length > 0) {
            const c = state.deck.shift();
            if (c)
                player.hand.push(c);
        }
    }
    if (state.players.human.hand.length === 0 && state.players.ai.hand.length === 0 && state.deck.length === 0) {
        state.phase = 'finished';
    }
}
