import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Play, Repeat } from "lucide-react";

/**
 * Durak React Prototype
 * ---------------------
 * - Supports 24 / 36 / 52‑card decks (quick, standard, long)
 * - Animates dealing of 6 cards to each side (player + AI)
 * - Player hand is clickable; selected card moves to table
 * - AI logic + online multiplayer are TODO hooks (see comments)
 *
 * 📁 Assets:
 *   Put PNGs from Cards.rar inside `/textures/cards` **unchanged**.
 *   Example: /textures/cards/6_of_hearts.png, /textures/cards/back.png
 *
 * 🛠 Tech stack:
 *   React 18 · TailwindCSS · shadcn/ui · framer‑motion · lucide‑react
 *
 * 🏃‍♂️ Quick start (with Vite):
 *   pnpm create vite@latest durak --template react
 *   cd durak && pnpm i
 *   pnpm i tailwindcss postcss autoprefixer framer-motion lucide-react @radix-ui/react-slot class-variance-authority tailwind-merge @tailwindcss/forms
 *   # copy shadcn/ui setup or use a wrapper
 *   # drop this file into src/DurakApp.jsx
 *   # add <DurakApp/> to main.jsx
 */

const SUITS = ["clubs", "diamonds", "hearts", "spades"];
const RANKS = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king",
    "ace",
];

function buildDeck(size = 52) {
    // slice ranks for 24- or 36-card decks
    let relevantRanks;
    if (size === 24) {
        relevantRanks = RANKS.slice(5); // 9‑A
    } else if (size === 36) {
        relevantRanks = RANKS.slice(3); // 6‑A
    } else {
        relevantRanks = [...RANKS];
    }
    const deck = [];
    relevantRanks.forEach((rank) =>
        SUITS.forEach((suit) => {
            deck.push({
                id: `${rank}_of_${suit}`,
                rank,
                suit,
                img: `/textures/cards/${rank}_of_${suit}.png`,
            });
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

export default function DurakApp() {
    const [deckSize, setDeckSize] = useState(36);
    const [deck, setDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [aiHand, setAiHand] = useState([]);
    const [table, setTable] = useState([]);
    const [phase, setPhase] = useState("menu"); // menu | dealing | playing

    const startGame = () => {
        const freshDeck = shuffle(buildDeck(deckSize));
        // simple dealing logic: 6 each
        const pHand = freshDeck.slice(0, 6);
        const aHand = freshDeck.slice(6, 12);
        const remaining = freshDeck.slice(12);
        setDeck(remaining);
        setPlayerHand(pHand);
        setAiHand(aHand);
        setTable([]);
        setPhase("dealing");
        // after animation, switch to playing
        setTimeout(() => setPhase("playing"), 1000);
    };

    const reset = () => {
        setPhase("menu");
        setDeck([]);
        setPlayerHand([]);
        setAiHand([]);
        setTable([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-700 to-emerald-800 p-4">
            <div className="max-w-5xl mx-auto flex flex-col gap-4">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white drop-shadow">
                        Durak Online<span className="text-sm block text-emerald-200">
                            React prototype
                        </span>
                    </h1>
                    <Button variant="secondary" onClick={reset}>
                        <Repeat size={16} className="mr-2" /> New Game
                    </Button>
                </header>

                {phase === "menu" && (
                    <Card className="bg-white/10 backdrop-blur p-6 text-white">
                        <CardContent className="flex flex-col gap-4">
                            <h2 className="text-xl mb-2">Choose deck size:</h2>
                            <div className="flex gap-3">
                                {[24, 36, 52].map((size) => (
                                    <Button
                                        key={size}
                                        variant={size === deckSize ? "default" : "outline"}
                                        onClick={() => setDeckSize(size)}
                                    >
                                        {size} cards
                                    </Button>
                                ))}
                            </div>
                            <Button size="lg" className="mt-6" onClick={startGame}>
                                <Play size={18} className="mr-2" /> Start
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Dealing / Playing area */}
                {phase !== "menu" && (
                    <div className="flex flex-col gap-6">
                        {/* AI cards */}
                        <div className="flex justify-center gap-2">
                            <AnimatePresence>
                                {aiHand.map((card, index) => (
                                    <motion.img
                                        key={card.id}
                                        src="/textures/cards/back.png"
                                        alt="Card back"
                                        className="w-16 md:w-20 rounded-lg shadow"
                                        initial={{ y: -100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -100, opacity: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Table */}
                        <div className="flex justify-center gap-2 min-h-[120px]">
                            {table.map((card) => (
                                <img
                                    key={card.id}
                                    src={card.img}
                                    alt={card.id}
                                    className="w-20 rounded-lg shadow-lg"
                                />
                            ))}
                        </div>

                        {/* Player hand */}
                        <div className="flex justify-center gap-2">
                            <AnimatePresence>
                                {playerHand.map((card, index) => (
                                    <motion.img
                                        key={card.id}
                                        src={card.img}
                                        alt={card.id}
                                        className="w-16 md:w-20 rounded-lg shadow hover:-translate-y-2 transition-transform cursor-pointer"
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 100, opacity: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => {
                                            if (phase === "playing") {
                                                // 🔮 TODO: validate move vs. game rules
                                                setTable((t) => [...t, card]);
                                                setPlayerHand((h) => h.filter((c) => c.id !== card.id));
                                            }
                                        }}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * 🔌 Multiplayer sketch:
 * ----------------------
 * For real‑time online games attach any websocket / signaling layer.
 * Recommended: `yjs` + `y‑webrtc` or `socket.io` for server relay.
 *
 * - On `startGame` create a lobby id & share via URL or matchmaking.
 * - Sync deck order & trump via initial message so every client deals identically.
 * - Use `y.Array` or Redux store + broadcast for shared game state.
 * - Lock moves through server authority or optimistic UI w/ rollback.
 *
 * 🤖 AI sketch:
 * -------------
 * A simple heuristic bot can be written that:
 *   1. Always defends with the lowest possible card that beats the attack.
 *   2. When attacking, plays the lowest non‑trump rank.
 *   3. In endgame, track remaining trumps to prefer stronger attacks.
 * Integrate by calling `aiTurn()` whenever `phase === "playing"` and
 * it's the AI's turn.
 */
