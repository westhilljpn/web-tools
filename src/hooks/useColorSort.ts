"use client";
import { useState, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const TUBE_CAP = 4;

export const PALETTE = [
  "#EF4444", "#3B82F6", "#22C55E", "#EAB308",
  "#A855F7", "#F97316", "#EC4899", "#06B6D4",
  "#A3763D", "#F0F0F0",
];

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

export function generatePuzzle(level: number, diff: Difficulty): string[][] {
  const { colors, tubes } = DIFF_CONFIG[diff];
  const rng = lcg(level * 31 + DIFF_KEYS.indexOf(diff) * 9973 + 1);
  const state: string[][] = [
    ...Array.from({ length: colors }, (_, i) => Array<string>(TUBE_CAP).fill(PALETTE[i])),
    ...Array.from({ length: tubes - colors }, () => [] as string[]),
  ];
  const iters = 150 + Math.floor(rng() * 150);
  for (let k = 0; k < iters; k++) {
    const valid: [number, number][] = [];
    for (let f = 0; f < state.length; f++) {
      if (!state[f].length) continue;
      const top = state[f][state[f].length - 1];
      for (let t = 0; t < state.length; t++) {
        if (
          f !== t &&
          state[t].length < TUBE_CAP &&
          (!state[t].length || state[t][state[t].length - 1] === top)
        ) valid.push([f, t]);
      }
    }
    if (!valid.length) break;
    const [f, t] = valid[Math.floor(rng() * valid.length)];
    state[t].push(state[f].pop()!);
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
