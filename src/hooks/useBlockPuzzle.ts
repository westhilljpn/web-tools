"use client";

import { useState, useCallback, useRef } from "react";

export const GRID_SIZE = 10;

// 各ピース形状: [row][col] の boolean 二次元配列
export const PIECES: boolean[][][] = [
  // 1セル
  [[true]],
  // 1×2
  [[true, true]],
  // 1×3
  [[true, true, true]],
  // 1×4
  [[true, true, true, true]],
  // 1×5
  [[true, true, true, true, true]],
  // 2×1
  [[true], [true]],
  // 3×1
  [[true], [true], [true]],
  // 4×1
  [[true], [true], [true], [true]],
  // 5×1
  [[true], [true], [true], [true], [true]],
  // 2×2
  [[true, true], [true, true]],
  // 3×3
  [[true, true, true], [true, true, true], [true, true, true]],
  // L字（右下）
  [[true, false], [true, false], [true, true]],
  // L字（左下）
  [[false, true], [false, true], [true, true]],
  // L字（右上）
  [[true, true], [true, false], [true, false]],
  // L字（左上）
  [[true, true], [false, true], [false, true]],
  // T字（下）
  [[true, true, true], [false, true, false]],
  // T字（上）
  [[false, true, false], [true, true, true]],
  // T字（右）
  [[true, false], [true, true], [true, false]],
  // Z字（横）
  [[true, true, false], [false, true, true]],
  // S字（横）
  [[false, true, true], [true, true, false]],
];

export type Grid = boolean[][];
export type Piece = boolean[][];

export interface PieceSlot {
  piece: Piece;
  id: number; // 一意ID
  used: boolean;
}

export interface DragState {
  slotIndex: number;
  piece: Piece;
  offsetRow: number;
  offsetCol: number;
  ghostRow: number | null;
  ghostCol: number | null;
  valid: boolean;
}

interface State {
  grid: Grid;
  tray: PieceSlot[];
  score: number;
  highScore: number;
  combo: number;
  lastCombo: number;
  gameOver: boolean;
  clearFlash: Set<string>; // "r0", "c3" etc
  comboText: string | null;
  nextId: number;
}

// ローカルストレージからハイスコア読み込み
function loadHighScore(): number {
  try {
    return parseInt(localStorage.getItem("block-puzzle-hi") ?? "0") || 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number) {
  try {
    localStorage.setItem("block-puzzle-hi", String(score));
  } catch {
    // ignore
  }
}

function emptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
}

// ランダムピース選択（重複なし）
function randomPieces(count: number, nextId: number): { slots: PieceSlot[]; nextId: number } {
  const indices: number[] = [];
  while (indices.length < count) {
    const i = Math.floor(Math.random() * PIECES.length);
    if (!indices.includes(i)) indices.push(i);
  }
  const slots: PieceSlot[] = indices.map((pi, j) => ({
    piece: PIECES[pi],
    id: nextId + j,
    used: false,
  }));
  return { slots, nextId: nextId + count };
}

// ピースをグリッドに配置できるか検証
function canPlace(grid: Grid, piece: Piece, row: number, col: number): boolean {
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[r].length; c++) {
      if (!piece[r][c]) continue;
      const gr = row + r;
      const gc = col + c;
      if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
      if (grid[gr][gc]) return false;
    }
  }
  return true;
}

// ピースをどこかに置けるか確認
function pieceCanFit(grid: Grid, piece: Piece): boolean {
  for (let r = 0; r <= GRID_SIZE - piece.length; r++) {
    for (let c = 0; c <= GRID_SIZE - piece[0].length; c++) {
      if (canPlace(grid, piece, r, c)) return true;
    }
  }
  return false;
}

// すべてのトレイのピースがどこにも置けないか確認
function isGameOver(grid: Grid, tray: PieceSlot[]): boolean {
  const remaining = tray.filter((s) => !s.used);
  if (remaining.length === 0) return false;
  return remaining.every((s) => !pieceCanFit(grid, s.piece));
}

// ピースをグリッドに置く → 完成行・列をクリア → スコア計算
function placePiece(
  grid: Grid,
  piece: Piece,
  row: number,
  col: number,
  score: number,
  combo: number,
  highScore: number
): {
  newGrid: Grid;
  newScore: number;
  newHighScore: number;
  newCombo: number;
  cleared: Set<string>;
  comboText: string | null;
  placed: number;
} {
  const newGrid = grid.map((r) => [...r]);

  // セル配置
  let placed = 0;
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[r].length; c++) {
      if (piece[r][c]) {
        newGrid[row + r][col + c] = true;
        placed++;
      }
    }
  }

  // 完成行・列検出
  const fullRows: number[] = [];
  const fullCols: number[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    if (newGrid[r].every(Boolean)) fullRows.push(r);
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    if (newGrid.every((row) => row[c])) fullCols.push(c);
  }

  const cleared = new Set<string>();
  fullRows.forEach((r) => cleared.add(`r${r}`));
  fullCols.forEach((c) => cleared.add(`c${c}`));

  // クリア処理
  fullRows.forEach((r) => {
    for (let c = 0; c < GRID_SIZE; c++) newGrid[r][c] = false;
  });
  fullCols.forEach((c) => {
    for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = false;
  });

  // スコア計算
  const lines = fullRows.length + fullCols.length;
  const newCombo = lines > 0 ? combo + 1 : 0;
  const comboBonus = newCombo > 1 ? newCombo * 50 : 0;
  const lineScore = lines * GRID_SIZE * 10;
  const placedScore = placed * 5;
  const totalGain = placedScore + lineScore + comboBonus;

  const newScore = score + totalGain;
  const newHighScore = Math.max(highScore, newScore);
  if (newHighScore > highScore) saveHighScore(newHighScore);

  const comboText = newCombo > 1 ? `COMBO x${newCombo}! +${comboBonus}` : null;

  return { newGrid, newScore, newHighScore, newCombo, cleared, comboText, placed };
}

function initialState(): State {
  const highScore = loadHighScore();
  const { slots, nextId } = randomPieces(3, 1);
  return {
    grid: emptyGrid(),
    tray: slots,
    score: 0,
    highScore,
    combo: 0,
    lastCombo: 0,
    gameOver: false,
    clearFlash: new Set(),
    comboText: null,
    nextId,
  };
}

export function useBlockPuzzle() {
  const [state, setState] = useState<State>(initialState);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const placePieceAtCell = useCallback((slotIndex: number, row: number, col: number) => {
    setState((prev) => {
      if (prev.gameOver) return prev;
      const slot = prev.tray[slotIndex];
      if (!slot || slot.used) return prev;
      if (!canPlace(prev.grid, slot.piece, row, col)) return prev;

      const { newGrid, newScore, newHighScore, newCombo, cleared, comboText } = placePiece(
        prev.grid,
        slot.piece,
        row,
        col,
        prev.score,
        prev.combo,
        prev.highScore
      );

      const newTray = prev.tray.map((s, i) => (i === slotIndex ? { ...s, used: true } : s));
      const allUsed = newTray.every((s) => s.used);

      let finalTray = newTray;
      let finalNextId = prev.nextId;
      if (allUsed) {
        const { slots, nextId } = randomPieces(3, prev.nextId);
        finalTray = slots;
        finalNextId = nextId;
      }

      const gameOver = isGameOver(newGrid, finalTray);

      return {
        ...prev,
        grid: newGrid,
        tray: finalTray,
        score: newScore,
        highScore: newHighScore,
        combo: newCombo,
        lastCombo: newCombo,
        gameOver,
        clearFlash: cleared,
        comboText,
        nextId: finalNextId,
      };
    });

    // フラッシュをクリア
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, clearFlash: new Set() }));
    }, 400);

    // コンボテキストをクリア
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, comboText: null }));
    }, 1200);
  }, []);

  const getPreview = useCallback(
    (piece: Piece, row: number, col: number): { valid: boolean; cells: [number, number][] } => {
      const cells: [number, number][] = [];
      for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
          if (piece[r][c]) cells.push([row + r, col + c]);
        }
      }
      const valid = canPlace(state.grid, piece, row, col);
      return { valid, cells };
    },
    [state.grid]
  );

  const reset = useCallback(() => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    setState(initialState);
  }, []);

  const isUnplaceable = useCallback(
    (piece: Piece): boolean => !pieceCanFit(state.grid, piece),
    [state.grid]
  );

  return {
    state,
    placePieceAtCell,
    getPreview,
    reset,
    isUnplaceable,
    canPlace,
  };
}
