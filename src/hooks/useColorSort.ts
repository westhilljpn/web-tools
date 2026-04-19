"use client";
import { useState, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const TUBE_CAP = 4;

export const TUBE_HEIGHT = 144; // px — ColorSort.tsx が参照
export const LAYER_HEIGHT = TUBE_HEIGHT / TUBE_CAP; // 36px

export const PALETTE_DATA = [
  { base: "#ef4444", glow: "rgba(239,68,68,0.7)",   light: "#fca5a5" },
  { base: "#3b82f6", glow: "rgba(59,130,246,0.7)",  light: "#93c5fd" },
  { base: "#22c55e", glow: "rgba(34,197,94,0.7)",   light: "#86efac" },
  { base: "#eab308", glow: "rgba(234,179,8,0.7)",   light: "#fde68a" },
  { base: "#a855f7", glow: "rgba(168,85,247,0.7)",  light: "#d8b4fe" },
  { base: "#f97316", glow: "rgba(249,115,22,0.7)",  light: "#fed7aa" },
  { base: "#ec4899", glow: "rgba(236,72,153,0.7)",  light: "#f9a8d4" },
  { base: "#06b6d4", glow: "rgba(6,182,212,0.7)",   light: "#a5f3fc" },
  { base: "#84cc16", glow: "rgba(132,204,22,0.7)",  light: "#d9f99d" },
  { base: "#f43f5e", glow: "rgba(244,63,94,0.7)",   light: "#fda4af" },
] as const;

// 後方互換: Confetti コンポーネントが PALETTE を参照するためそのまま残す
export const PALETTE = PALETTE_DATA.map((p) => p.base);

export function getColorData(hex: string) {
  return PALETTE_DATA.find((p) => p.base === hex) ?? PALETTE_DATA[0];
}

export const DIFF_CONFIG = {
  easy:   { colors: 4,  tubes: 6  },
  medium: { colors: 6,  tubes: 8  },
  hard:   { colors: 8,  tubes: 10 },
  expert: { colors: 10, tubes: 12 },
} as const;

const DIFF_KEYS: Difficulty[] = ["easy", "medium", "hard", "expert"];

type SaveData = {
  difficulty: Difficulty;
  cleared: Record<Difficulty, number>;
  best: Record<Difficulty, Record<string, number>>;
};

const DEFAULT_SAVE: SaveData = {
  difficulty: "easy",
  cleared: { easy: 0, medium: 0, hard: 0, expert: 0 },
  best: { easy: {}, medium: {}, hard: {}, expert: {} },
};

function lcg(seed: number) {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0x100000000;
  };
}

const SHUFFLE_ITERS: Record<Difficulty, [number, number]> = {
  easy:   [300, 200],
  medium: [400, 200],
  hard:   [500, 200],
  expert: [600, 300],
};

export function generatePuzzle(level: number, diff: Difficulty): string[][] {
  const { colors, tubes } = DIFF_CONFIG[diff];
  const [base, extra] = SHUFFLE_ITERS[diff];
  const rng = lcg(level * 31 + DIFF_KEYS.indexOf(diff) * 9973 + 1);
  const iters = base + Math.floor(rng() * extra);

  const state: string[][] = [
    ...Array.from({ length: colors }, (_, i) => Array<string>(TUBE_CAP).fill(PALETTE[i])),
    ...Array.from({ length: tubes - colors }, () => [] as string[]),
  ];

  let lastFrom = -1;
  let lastTo = -1;

  for (let k = 0; k < iters; k++) {
    // Single-ball valid moves: [fromIdx, toIdx]
    const valid: [number, number][] = [];
    for (let f = 0; f < state.length; f++) {
      if (!state[f].length) continue;
      const top = state[f][state[f].length - 1];
      for (let t = 0; t < state.length; t++) {
        if (f === t) continue;
        // Anti-reversal: skip only the exact reverse of last move
        if (f === lastTo && t === lastFrom) continue;
        if (
          state[t].length < TUBE_CAP &&
          (!state[t].length || state[t][state[t].length - 1] === top)
        ) {
          valid.push([f, t]);
        }
      }
    }
    if (!valid.length) break;
    const [f, t] = valid[Math.floor(rng() * valid.length)];
    state[t].push(state[f].pop()!);
    lastFrom = f;
    lastTo = t;
  }

  return state;
}

function isSolved(tubes: string[][]): boolean {
  return tubes.every(
    (t) => !t.length || (t.length === TUBE_CAP && t.every((c) => c === t[0]))
  );
}

export function useColorSort() {
  const [save, setSave] = useLocalStorage<SaveData>("color-sort-save", DEFAULT_SAVE);
  const [diff, setDiff] = useState<Difficulty>(save.difficulty);
  const [level, setLevel] = useState(1);
  const [initial, setInitial] = useState<string[][]>(() => generatePuzzle(1, save.difficulty));
  const [tubes, setTubes] = useState<string[][]>(() => generatePuzzle(1, save.difficulty));
  const [sel, setSel] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [hist, setHist] = useState<string[][][]>([]);
  const [status, setStatus] = useState<"playing" | "won">("playing");

  const clickTube = useCallback((idx: number) => {
    if (status === "won") return;
    if (sel === null) {
      if (tubes[idx].length) setSel(idx);
      return;
    }
    if (sel === idx) { setSel(null); return; }

    const fromBalls = tubes[sel];
    const toBalls = tubes[idx];
    const top = fromBalls[fromBalls.length - 1];
    if (!top) { setSel(null); return; }

    const canMove =
      toBalls.length === 0 ||
      (toBalls[toBalls.length - 1] === top && toBalls.length < TUBE_CAP);

    if (!canMove) { setSel(toBalls.length ? idx : null); return; }

    const next = tubes.map((t) => [...t]);
    next[idx].push(next[sel].pop()!);
    const m = moves + 1;
    setHist((h) => [...h, tubes.map((t) => [...t])]);
    setTubes(next);
    setMoves(m);
    setSel(null);

    if (isSolved(next)) {
      setStatus("won");
      setSave((p) => {
        const key = String(level);
        const prev = (p.best[diff] ?? {})[key];
        return {
          ...p,
          difficulty: diff,
          cleared: { ...p.cleared, [diff]: Math.max(p.cleared[diff], level) },
          best: {
            ...p.best,
            [diff]: { ...p.best[diff], [key]: prev !== undefined ? Math.min(prev, m) : m },
          },
        };
      });
    }
  }, [sel, tubes, moves, status, diff, level, setSave]);

  const undo = useCallback(() => {
    if (!hist.length) return;
    setTubes(hist[hist.length - 1].map((t) => [...t]));
    setHist((h) => h.slice(0, -1));
    setMoves((m) => Math.max(0, m - 1));
    setSel(null);
  }, [hist]);

  const restart = useCallback(() => {
    setTubes(initial.map((t) => [...t]));
    setHist([]); setMoves(0); setSel(null); setStatus("playing");
  }, [initial]);

  const nextLevel = useCallback(() => {
    const lvl = level + 1;
    const p = generatePuzzle(lvl, diff);
    setLevel(lvl); setInitial(p); setTubes(p.map((t) => [...t]));
    setHist([]); setMoves(0); setSel(null); setStatus("playing");
  }, [level, diff]);

  const changeDiff = useCallback((d: Difficulty) => {
    const p = generatePuzzle(1, d);
    setDiff(d); setLevel(1); setInitial(p); setTubes(p.map((t) => [...t]));
    setHist([]); setMoves(0); setSel(null); setStatus("playing");
    setSave((prev) => ({ ...prev, difficulty: d }));
  }, [setSave]);

  return {
    tubes, sel, moves, status, level, diff, hist,
    best: (save.best[diff] ?? {})[String(level)] ?? null,
    cleared: save.cleared,
    clickTube, undo, restart, nextLevel, changeDiff,
  };
}
