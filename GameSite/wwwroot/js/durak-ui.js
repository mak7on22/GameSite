import { dealInitial, attack, defend, aiMove, canBeat, takeCards, finishRound } from './durak.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('durak-root');
  if (!root) return;

  let state = null;

  function renderMenu() {
    root.innerHTML = `
      <div class="durak-page menu">
        <h2>\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440 \u043a\u043e\u043b\u043e\u0434\u044b</h2>
        <div class="buttons">
          <button data-size="24">24</button>
          <button data-size="36">36</button>
          <button data-size="52">52</button>
        </div>
      </div>`;
    root.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => startGame(parseInt(btn.dataset.size)));
    });
  }

  function cardImg(card) {
    return `/textures/cards/${card.id}.png`;
  }

  function renderGame() {
    if (!state) { renderMenu(); return; }
    const trumpCard = state.deck[state.deck.length - 1] || { id: 'back', rank: 0, suit: 'clubs' };
    root.innerHTML = '';
    const page = document.createElement('div');
    page.className = 'durak-page play-area';

    const aiHand = document.createElement('div');
    aiHand.className = 'ai-hand';
    state.players.ai.hand.forEach(() => {
      const img = document.createElement('img');
      img.src = '/textures/cards/back.png';
      img.className = 'card';
      aiHand.appendChild(img);
    });

    const table = document.createElement('div');
    table.className = 'table';
    state.table.forEach(pair => {
      const tc = document.createElement('div');
      tc.className = 'table-card';
      const att = document.createElement('img');
      att.src = cardImg(pair.attack);
      att.className = 'card';
      tc.appendChild(att);
      if (pair.defense) {
        const def = document.createElement('img');
        def.src = cardImg(pair.defense);
        def.className = 'card defense';
        tc.appendChild(def);
      }
      table.appendChild(tc);
    });

    const deckArea = document.createElement('div');
    deckArea.className = 'deck-area';
    const trumpImg = document.createElement('img');
    trumpImg.src = cardImg(trumpCard);
    trumpImg.className = 'card trump';
    const counter = document.createElement('span');
    counter.className = 'deck-counter';
    counter.textContent = `\u00d7 ${state.deck.length}`;
    deckArea.appendChild(trumpImg);
    deckArea.appendChild(counter);

    const playerHand = document.createElement('div');
    playerHand.className = 'player-hand';
    state.players.human.hand.forEach(card => {
      const img = document.createElement('img');
      img.src = cardImg(card);
      img.className = 'card';
      img.addEventListener('click', () => onCardClick(card));
      playerHand.appendChild(img);
    });

    page.appendChild(aiHand);
    page.appendChild(table);
    page.appendChild(deckArea);
    page.appendChild(playerHand);

    const controls = document.createElement('div');
    controls.className = 'controls';
    const takeBtn = document.createElement('button');
    takeBtn.textContent = '\u0412\u0437\u044F\u0442\u044C';
    takeBtn.addEventListener('click', () => {
      if(state && state.defender === 'human' && (state.phase === 'defense' || state.phase === 'resolution')) {
        takeCards(state);
        renderGame();
        setTimeout(aiTurn, 500);
      }
    });
    const bitoBtn = document.createElement('button');
    bitoBtn.textContent = '\u0411\u0438\u0442\u043E';
    bitoBtn.addEventListener('click', () => {
      if(state && state.phase === 'resolution') {
        finishRound(state);
        renderGame();
        setTimeout(aiTurn, 500);
      }
    });
    controls.appendChild(takeBtn);
    controls.appendChild(bitoBtn);
    page.appendChild(controls);
    root.appendChild(page);
  }

  function aiTurn() {
    if (!state) return;
    const before = JSON.stringify(state);
    aiMove(state);
    if (JSON.stringify(state) !== before) {
      renderGame();
      if (state.attacker === 'ai' || state.defender === 'ai') {
        setTimeout(aiTurn, 500);
      }
    }
  }

  function onCardClick(card) {
    if (!state) return;
    if (state.attacker === 'human' && state.phase === 'attack') {
      if (attack(state, card.id)) {
        renderGame();
        setTimeout(aiTurn, 500);
      }
    } else if (state.defender === 'human' && state.phase === 'defense') {
      const idx = state.table.findIndex(p => !p.defense && canBeat(p.attack, card, state.trump));
      if (idx !== -1 && defend(state, idx, card.id)) {
        renderGame();
        setTimeout(aiTurn, 500);
      }
    }
  }

  function startGame(size) {
    state = dealInitial(size);
    renderGame();
    if (state.attacker === 'ai' || state.defender === 'ai') {
      setTimeout(aiTurn, 500);
    }
  }

  renderMenu();
});
