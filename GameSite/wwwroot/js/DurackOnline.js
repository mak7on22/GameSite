import React, { useState } from 'https://cdn.skypack.dev/react';
import { createRoot } from 'https://cdn.skypack.dev/react-dom/client';

const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
const RANKS = ['2','3','4','5','6','7','8','9','10','jack','queen','king','ace'];

function buildDeck(size = 36) {
  let ranks = RANKS;
  if (size === 24) ranks = RANKS.slice(7); // 9-A
  else if (size === 36) ranks = RANKS.slice(4); // 6-A
  const deck = [];
  ranks.forEach(rank =>
    SUITS.forEach(suit => {
      deck.push({ id: `${rank}_of_${suit}`, img: `/textures/cards/${rank}_of_${suit}.png` });
    })
  );
  return deck;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function DurakApp() {
  const [deckSize, setDeckSize] = useState(36);
  const [playerHand, setPlayerHand] = useState([]);
  const [aiHand, setAiHand] = useState([]);
  const [table, setTable] = useState([]);
  const [phase, setPhase] = useState('menu');

  const startGame = () => {
    const fresh = shuffle(buildDeck(deckSize));
    setPlayerHand(fresh.slice(0,6));
    setAiHand(fresh.slice(6,12));
    setTable([]);
    setPhase('play');
  };

  const playCard = (card) => {
    if (phase !== 'play') return;
    setTable(t => [...t, card]);
    setPlayerHand(h => h.filter(c => c.id !== card.id));
  };

  return React.createElement('div', { className: 'durak-page' },
    phase === 'menu'
      ? React.createElement('div', { className: 'menu' }, [
          React.createElement('h2', { key: 'title' }, 'Choose deck size'),
          React.createElement('div', { key: 'buttons', className: 'buttons' }, [24,36,52].map(size =>
            React.createElement('button', {
              key: size,
              onClick: () => setDeckSize(size),
              className: size === deckSize ? 'btn btn-primary' : 'btn btn-secondary'
            }, `${size} cards`)
          )),
          React.createElement('button', { key: 'start', className: 'btn btn-success', onClick: startGame }, 'Start')
        ])
      : React.createElement('div', { className: 'play-area' }, [
          React.createElement('div', { key: 'ai', className: 'ai-hand' },
            aiHand.map(card => React.createElement('img', { key: card.id, src: '/textures/cards/back.png', className: 'card' }))
          ),
          React.createElement('div', { key: 'table', className: 'table' },
            table.map(card => React.createElement('img', { key: card.id, src: card.img, className: 'card' }))
          ),
          React.createElement('div', { key: 'player', className: 'player-hand' },
            playerHand.map(card => React.createElement('img', { key: card.id, src: card.img, className: 'card', onClick: () => playCard(card) }))
          )
        ])
  );
}

createRoot(document.getElementById('durak-root')).render(React.createElement(DurakApp));
