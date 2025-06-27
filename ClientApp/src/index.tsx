import React from 'react';
import ReactDOM from 'react-dom/client';
import { dealInitial, attack, defend, aiMove, canBeat } from '../../src/durak';
import { DeckArea } from './components/DeckArea';
import { Card, GameState } from '../../src/types';

const root = document.getElementById('durak-root') as HTMLElement;

function CardImg({ card, onClick }: { card: Card; onClick?: () => void }) {
  const img = `/textures/cards/${card.id}.png`;
  return <img src={img} className="card" onClick={onClick} />;
}

function App() {
  const [state, setState] = React.useState<GameState | null>(null);

  if (!state) {
    return (
      <div className="durak-page menu">
        <h2>Выберите размер колоды</h2>
        <div className="buttons">
          <button onClick={() => setState(dealInitial(24))}>24</button>
          <button onClick={() => setState(dealInitial(36))}>36</button>
          <button onClick={() => setState(dealInitial(52))}>52</button>
        </div>
      </div>
    );
  }

  const trumpCard =
    state.deck[state.deck.length - 1] || ({ id: 'back', rank: 0, suit: 'clubs' } as Card);

  const handleCardClick = (c: Card) => {
    if (state.attacker === 'human' && state.phase === 'attack') {
      if (attack(state, c.id)) {
        setState({ ...state });
        setTimeout(() => {
          aiMove(state);
          setState({ ...state });
        }, 500);
      }
    } else if (state.defender === 'human' && state.phase === 'defense') {
      const idx = state.table.findIndex(p => !p.defense && canBeat(p.attack, c, state.trump));
      if (idx !== -1 && defend(state, idx, c.id)) {
        setState({ ...state });
        setTimeout(() => {
          aiMove(state);
          setState({ ...state });
        }, 500);
      }
    }
  };

  return (
    <div className="durak-page play-area">
      <div className="ai-hand">
        {state.players.ai.hand.map(card => (
          <img key={card.id} src="/textures/cards/back.png" className="card" />
        ))}
      </div>

      <div className="table">
        {state.table.map((p, i) => (
          <div className="table-card" key={i}>
            <CardImg card={p.attack} />
            {p.defense && (
              <img
                src={`/textures/cards/${p.defense.id}.png`}
                className="card defense"
              />
            )}
          </div>
        ))}
      </div>

      <DeckArea deck={state.deck} trumpCard={trumpCard} />

      <div className="player-hand">
        {state.players.human.hand.map(card => (
          <CardImg key={card.id} card={card} onClick={() => handleCardClick(card)} />
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(root).render(<App/>);
