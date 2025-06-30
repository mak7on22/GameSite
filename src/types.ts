export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export interface Card {
  id: string;
  rank: number;
  suit: Suit;
}

export interface Player {
  hand: Card[];
  role: 'human' | 'ai';
}

export interface TablePair {
  attack: Card;
  defense?: Card;
}

export interface GameState {
  players: Record<'human' | 'ai', Player>;
  deck: Card[];
  trump: Suit;
  attacker: 'human' | 'ai';
  defender: 'human' | 'ai';
  table: TablePair[];
  phase: 'attack' | 'defense' | 'resolution' | 'refill' | 'finished';
  /**
   * Information about the last move performed. Used mainly by the UI to
   * highlight AI actions. Not required for game logic.
   */
  lastMove?: {
    player: 'human' | 'ai';
    action: 'attack' | 'defense' | 'take' | 'finish';
    card?: Card;
  };
}
