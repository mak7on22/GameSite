(function(){
  function loadScripts(urls, cb){
    let loaded=0;
    urls.forEach(u=>{
      const s=document.createElement('script');
      s.src=u;
      s.crossOrigin='';
      s.onload=()=>{if(++loaded===urls.length)cb();};
      document.head.appendChild(s);
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    loadScripts([
      'https://unpkg.com/react@18/umd/react.production.min.js',
      'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
    ], init);
  });

  function init(){
    const {useState,useEffect}=React;
    const SUITS=['clubs','diamonds','hearts','spades'];
    const RANKS=['2','3','4','5','6','7','8','9','10','jack','queen','king','ace'];

    function buildDeck(size){
      let ranks=RANKS;
      if(size===24) ranks=RANKS.slice(7);
      else if(size===36) ranks=RANKS.slice(4);
      const deck=[];
      ranks.forEach(r=>SUITS.forEach(s=>{
        deck.push({id:`${r}_of_${s}`,rank:r,suit:s,img:`/textures/cards/${r}_of_${s}.png`});
      }));
      return deck;
    }

    function shuffle(arr){
      const a=[...arr];
      for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
      }
      return a;
    }

    function canBeat(a,d,trump){
      if(d.suit===a.suit && RANKS.indexOf(d.rank)>RANKS.indexOf(a.rank)) return true;
      if(d.suit===trump && a.suit!==trump) return true;
      return false;
    }

    function DurakApp(){
      const [deckSize,setDeckSize]=useState(36);
      const [deck,setDeck]=useState([]);
      const [playerHand,setPlayerHand]=useState([]);
      const [aiHand,setAiHand]=useState([]);
      const [table,setTable]=useState([]);
      const [trump,setTrump]=useState(null);
      const [trumpCard,setTrumpCard]=useState(null);
      const [phase,setPhase]=useState('menu');
      const [turn,setTurn]=useState('player');

      const startGame=()=>{
        const fresh=shuffle(buildDeck(deckSize));
        const tCard=fresh[fresh.length-1];
        setTrump(tCard.suit);
        setTrumpCard(tCard);
        const rest=fresh.slice(0,fresh.length-1);
        setDeck(rest.slice(12));
        setPlayerHand([]); setAiHand([]); setTable([]);
        setPhase('play');
        for(let i=0;i<6;i++){
          setTimeout(()=>{
            setPlayerHand(h=>[...h,{...rest[i*2],dealClass:'deal-player'}]);
            setAiHand(h=>[...h,{...rest[i*2+1],dealClass:'deal-ai'}]);
          },i*300);
        }
      };

      const dealCards=(first='player')=>{
        setDeck(d=>{
          const deck=[...d];
          const give=setter=>{
            setter(h=>{
              const hand=[...h];
              while(hand.length<6 && deck.length){
                hand.push(deck.shift());
              }
              return hand;
            });
          };
          if(first==='player'){ give(setPlayerHand); give(setAiHand); }
          else { give(setAiHand); give(setPlayerHand); }
          return deck;
        });
      };

      const aiDefend=(card)=>{
        const cand=aiHand.filter(c=>canBeat(card,c,trump))
          .sort((a,b)=>RANKS.indexOf(a.rank)-RANKS.indexOf(b.rank))[0];
        if(cand){
          setTimeout(()=>{
            setAiHand(h=>h.filter(c=>c.id!==cand.id));
            setTable(t=>t.map((p,i)=>i===t.length-1?{attack:p.attack,defense:cand}:p));
            setTurn('player');
          },500);
        }else{
          setTimeout(()=>{
            setAiHand(h=>[...h,card,...table.flatMap(p=>p.defense?[p.defense]:[])]);
            setTable([]);
            dealCards('player');
            setTurn('player');
          },500);
        }
      };

      const playCard=(card)=>{
        if(phase!=='play'||turn!=='player')return;
        setPlayerHand(h=>h.filter(c=>c.id!==card.id));
        setTable(t=>[...t,{attack:card}]);
        setTurn('ai');
        aiDefend(card);
      };

      const handleBito=()=>{
        if(table.length===0||!table.every(p=>p.defense))return;
        setTable([]);
        dealCards('player');
        setTurn('player');
      };

      const handleTake=()=>{
        if(table.length===0)return;
        setAiHand(h=>[...h,...table.flatMap(p=>[p.attack,p.defense].filter(Boolean))]);
        setTable([]);
        dealCards('player');
        setTurn('player');
      };

      return (
        React.createElement('div',{className:'durak-page'},
          phase==='menu'
            ? React.createElement('div',{className:'menu'},[
                React.createElement('h2',{key:'title'},'Choose deck size'),
                React.createElement('div',{key:'btn',className:'buttons'},[24,36,52].map(size=>
                  React.createElement('button',{
                    key:size,
                    onClick:()=>setDeckSize(size),
                    className:size===deckSize?'btn btn-primary':'btn btn-secondary'
                  },`${size} cards`)
                )),
                React.createElement('button',{key:'start',className:'btn btn-success',onClick:startGame},'Start')
              ])
              : React.createElement('div',{className:'play-area'},[
                React.createElement('div',{key:'ai',className:'ai-hand'},
                  aiHand.map(c=>React.createElement('img',{key:c.id,src:'/textures/cards/back.png',className:`card ${c.dealClass||''}`}))
                ),
                React.createElement('div',{key:'deck',className:'deck-area'},[
                  React.createElement('img',{key:'d',src:'/textures/cards/back.png',className:'card'}),
                  trumpCard?React.createElement('img',{key:'t',src:trumpCard.img,className:'card'}):null,
                  React.createElement('span',{key:'c',className:'deck-count'},`× ${deck.length}`)
                ]),
                React.createElement('div',{key:'table',className:'table'},
                  table.map((p,i)=>React.createElement('div',{className:'table-card',key:i},[
                    React.createElement('img',{key:'a',src:p.attack.img,className:'card'}),
                    p.defense?React.createElement('img',{key:'d',src:p.defense.img,className:'card defense'}):null
                  ]))
                ),
                React.createElement('div',{key:'controls',className:'round-controls'},[
                  React.createElement('button',{key:'take',className:'btn btn-warning me-2',onClick:handleTake,disabled:table.length===0},'Забрать'),
                  React.createElement('button',{key:'bito',className:'btn btn-success',onClick:handleBito,disabled:table.length===0||!table.every(p=>p.defense)},'Бито')
                ]),
                React.createElement('div',{key:'player',className:'player-hand'},
                  playerHand.map(c=>React.createElement('img',{
                    key:c.id,
                    src:c.img,
                    className:`card ${c.dealClass||''}`,
                    onClick:()=>playCard(c)
                  }))
                )
              ])
        )
      );
    }

    ReactDOM.createRoot(document.getElementById('durak-root'))
      .render(React.createElement(DurakApp));
  }
})();
