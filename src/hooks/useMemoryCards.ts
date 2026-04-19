"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Card = { id: number; emoji: string; isFlipped: boolean; isMatched: boolean };
export type MemStatus = "playing" | "won";

const EMOJIS = ["🎸", "🎺", "🎻", "🥁", "🎹", "🎵", "🎶", "🎤"];

function createDeck(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((emoji, id) => ({ id, emoji, isFlipped: false, isMatched: false }));
}

export function useMemoryCards() {
  const [cards, setCards] = useState<Card[]>(createDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [status, setStatus] = useState<MemStatus>("playing");
  const [elapsed, setElapsed] = useState(0);
  const [bestMoves, setBestMoves] = useLocalStorage<number | null>("memory-cards-best", null);
  const lockRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const flip = useCallback((idx: number) => {
    if (lockRef.current || cards[idx].isFlipped || cards[idx].isMatched) return;
    if (flipped.length === 2) return;

    const newCards = cards.map((c, i) => i === idx ? { ...c, isFlipped: true } : c);

    if (flipped.length === 0) {
      setCards(newCards);
      setFlipped([idx]);
      return;
    }

    // Second flip
    const firstIdx = flipped[0];
    setCards(newCards);
    setFlipped([]);
    const newMoves = moves + 1;
    setMoves(newMoves);

    if (cards[firstIdx].emoji === cards[idx].emoji) {
      // Match
      const matched = newCards.map((c, i) =>
        i === firstIdx || i === idx ? { ...c, isMatched: true } : c
      );
      setCards(matched);
      const newMatches = matches + 1;
      setMatches(newMatches);
      if (newMatches === EMOJIS.length) {
        setStatus("won");
        if (timerRef.current) clearInterval(timerRef.current);
        setBestMoves((b) => (b === null || newMoves < b ? newMoves : b));
      }
    } else {
      // No match — lock and flip back
      lockRef.current = true;
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c, i) =>
            (i === firstIdx || i === idx) && !c.isMatched ? { ...c, isFlipped: false } : c
          )
        );
        lockRef.current = false;
      }, 700);
    }
  }, [cards, flipped, moves, matches, setBestMoves]);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    lockRef.current = false;
    setCards(createDeck());
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setStatus("playing");
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, []);

  return { cards, moves, matches, status, elapsed, bestMoves, flip, reset };
}
