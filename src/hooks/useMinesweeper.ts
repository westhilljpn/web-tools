"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Difficulty = "easy" | "medium" | "hard";
export type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};
export type GameStatus = "idle" | "playing" | "won" | "lost";

const CONFIGS: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy:   { rows: 9,  cols: 9,  mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard:   { rows: 16, cols: 30, mines: 99 },
};

function createGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0,
    }))
  );
}

function placeMines(
  grid: Cell[][], rows: number, cols: number, count: number, safeR: number, safeC: number
): Cell[][] {
  const safe = new Set<string>();
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++)
      safe.add(`${safeR + dr},${safeC + dc}`);

  const candidates: [number, number][] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!safe.has(`${r},${c}`)) candidates.push([r, c]);

  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const next = grid.map((row) => row.map((cell) => ({ ...cell })));
  for (let i = 0; i < count; i++) next[candidates[i][0]][candidates[i][1]].isMine = true;

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (next[r][c].isMine) continue;
      let adj = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr; const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && next[nr][nc].isMine) adj++;
        }
      next[r][c].adjacentMines = adj;
    }
  return next;
}

function floodReveal(grid: Cell[][], rows: number, cols: number, startR: number, startC: number): Cell[][] {
  const next = grid.map((row) => row.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[startR, startC]];
  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) break;
    const [r, c] = item;
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    const cell = next[r][c];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) continue;
    cell.isRevealed = true;
    if (cell.adjacentMines === 0)
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) stack.push([r + dr, c + dc]);
  }
  return next;
}

function checkWin(grid: Cell[][]): boolean {
  return grid.every((row) => row.every((cell) => cell.isMine || cell.isRevealed));
}

export function useMinesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const { rows, cols, mines } = CONFIGS[difficulty];
  const [grid, setGrid] = useState<Cell[][]>(() => createGrid(9, 9));
  const [status, setStatus] = useState<GameStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [bestTimes, setBestTimes] = useLocalStorage<Record<Difficulty, number | null>>(
    "minesweeper-best",
    { easy: null, medium: null, hard: null }
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    elapsedRef.current = 0;
    setElapsed(0);
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  }, [stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    setGrid(createGrid(rows, cols));
    setStatus("idle");
    setElapsed(0);
    elapsedRef.current = 0;
  }, [rows, cols, stopTimer]);

  const changeDifficulty = useCallback((d: Difficulty) => {
    stopTimer();
    setDifficulty(d);
    const { rows: r, cols: c } = CONFIGS[d];
    setGrid(createGrid(r, c));
    setStatus("idle");
    setElapsed(0);
    elapsedRef.current = 0;
  }, [stopTimer]);

  const reveal = useCallback((r: number, c: number) => {
    if (status === "won" || status === "lost") return;
    setGrid((prev) => {
      if (prev[r][c].isRevealed || prev[r][c].isFlagged) return prev;
      let g = prev;
      if (status === "idle") {
        g = placeMines(prev, rows, cols, mines, r, c);
        setStatus("playing");
        startTimer();
      }
      if (g[r][c].isMine) {
        stopTimer();
        setStatus("lost");
        return g.map((row) =>
          row.map((cell) => ({ ...cell, isRevealed: cell.isMine ? true : cell.isRevealed }))
        );
      }
      const revealed = floodReveal(g, rows, cols, r, c);
      if (checkWin(revealed)) {
        stopTimer();
        setStatus("won");
        const t = elapsedRef.current;
        setBestTimes((prev) => {
          const best = prev[difficulty];
          return best === null || t < best ? { ...prev, [difficulty]: t } : prev;
        });
      }
      return revealed;
    });
  }, [status, rows, cols, mines, difficulty, startTimer, stopTimer, setBestTimes]);

  const toggleFlag = useCallback((r: number, c: number) => {
    if (status === "won" || status === "lost") return;
    setGrid((prev) => {
      if (prev[r][c].isRevealed) return prev;
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      next[r][c].isFlagged = !next[r][c].isFlagged;
      return next;
    });
  }, [status]);

  const flagCount = grid.flat().filter((c) => c.isFlagged).length;

  return { grid, status, difficulty, elapsed, flagCount, mineCount: mines, bestTimes, reveal, toggleFlag, reset, changeDifficulty };
}
