import React from 'react';
import { Card } from '../../../src/types';

export function DeckArea({ deck, trumpCard }: { deck: Card[]; trumpCard: Card }) {
  const img = `/textures/cards/${trumpCard.id}.png`;
  return (
    <div className="deck-area">
      <img src={img} className="card trump" />
      <span className="deck-counter">× {deck.length}</span>
    </div>
  );
}
