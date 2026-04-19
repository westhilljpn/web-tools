"use client";
import { useReducer, useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Status = "playing" | "won" | "over";
type Grid = number[][];
type State = { grid: Grid; score: number; status: Status; continued: boolean };
type Action =
  | { type: "MOVE"; dir: "left" | "right" | "up" | "down" }
  | { type: "RESET" }
  | { type: "CONTINUE" };

function emptyGrid(): Grid {
  return Array.from({ length: 4 }, () => [0, 0, 0, 0]);
}

function spawnTile(g: Grid): Grid {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (g[r][c] === 0) empty.push([r, c]);
  if (empty.length === 0) return g;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = g.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function slideRow(row: number[]): { row: number[]; gained: number } {
  const tiles = row.filter((v) => v !== 0);
  let gained = 0;
  const merged: number[] = [];
  for (let i = 0; i < tiles.length; i++) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const val = tiles[i] * 2;
      merged.push(val);
      gained += val;
      i++;
    } else {
      merged.push(tiles[i]);
    }
  }
  while (merged.length < 4) merged.push(0);
  return { row: merged, gained };
}

function rotate90cw(g: Grid): Grid {
  return g[0].map((_, c) => g.map((row) => row[c]).reverse());
}

function rotateGrid(g: Grid, n: number): Grid {
  let r = g;
  for (let i = 0; i < n; i++) r = rotate90cw(r);
  return r;
}

function applyLeft(g: Grid): { grid: Grid; gained: number; changed: boolean } {
  let gained = 0;
  let changed = false;
  const next = g.map((row) => {
    const { row: nr, gained: s } = slideRow(row);
    gained += s;
    if (nr.some((v, i) => v !== row[i])) changed = true;
    return nr;
  });
  return { grid: next, gained, changed };
}

function doMove(
  g: Grid,
  dir: "left" | "right" | "up" | "down"
): { grid: Grid; gained: number; changed: boolean } {
  const rot = { left: 0, down: 1, right: 2, up: 3 }[dir];
  const rotated = rotateGrid(g, rot);
  const { grid: moved, gained, changed } = applyLeft(rotated);
  return { grid: rotateGrid(moved, (4 - rot) % 4), gained, changed };
}

function hasWon(g: Grid): boolean {
  return g.some((row) => row.some((v) => v >= 2048));
}

function isOver(g: Grid): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (g[r][c] === 0) return false;
      if (c < 3 && g[r][c] === g[r][c + 1]) return false;
      if (r < 3 && g[r][c] === g[r + 1][c]) return false;
    }
  return true;
}

function initialState(): State {
  return {
    grid: spawnTile(spawnTile(emptyGrid())),
    score: 0,
    status: "playing",
    continued: false,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "MOVE": {
      if (state.status === "over") return state;
      const { grid, gained, changed } = doMove(state.grid, action.dir);
      if (!changed) return state;
      const next = spawnTile(grid);
      const score = state.score + gained;
      let status: Status = state.status;
      if (!state.continued && hasWon(next)) status = "won";
      else if (isOver(next)) status = "over";
      return { ...state, grid: next, score, status };
    }
    case "RESET":
      return initialState();
    case "CONTINUE":
      return { ...state, status: "playing", continued: true };
    default:
      return state;
  }
}

export function use2048() {
  const [state, dispatch] = useReducer(reducer, null, initialState);
  const [bestScore, setBestScore] = useLocalStorage("2048-best", 0);

  useEffect(() => {
    if (state.score > bestScore) setBestScore(state.score);
  }, [state.score]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = useCallback((dir: "left" | "right" | "up" | "down") => {
    dispatch({ type: "MOVE", dir });
  }, []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const continueGame = useCallback(() => dispatch({ type: "CONTINUE" }), []);

  return { ...state, bestScore, move, reset, continueGame };
}
