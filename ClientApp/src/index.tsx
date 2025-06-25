import React from 'react';
import ReactDOM from 'react-dom/client';
import { dealInitial } from '../src/durak';
import { DeckArea } from './components/DeckArea';

const root = document.getElementById('durak-root') as HTMLElement;

function App(){
  const [state] = React.useState(()=>dealInitial());
  const trumpCard = state.deck[state.deck.length - 1] || { id: 'back', rank: 0, suit: 'clubs' };
  return (
    <div className="play-area">
      <DeckArea deck={state.deck} trumpCard={trumpCard} />
    </div>
  );
}

ReactDOM.createRoot(root).render(<App/>);
