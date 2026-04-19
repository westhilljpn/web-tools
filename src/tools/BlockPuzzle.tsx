"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useCallback } from "react";
import { useBlockPuzzle, GRID_SIZE, Piece } from "@/hooks/useBlockPuzzle";

// ピース表示色パレット（スロットインデックスで固定）
const PIECE_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
];

const FLASH_COLOR = "bg-yellow-300";
const EMPTY_COLOR = "bg-slate-700";
const FILLED_COLOR = "bg-indigo-500";
const PREVIEW_VALID = "bg-indigo-300 opacity-80";
const PREVIEW_INVALID = "bg-red-400 opacity-60";

interface DragInfo {
  slotIndex: number;
  piece: Piece;
  // ピース内のクリック位置（セル単位）
  clickRow: number;
  clickCol: number;
}

export default function BlockPuzzle() {
  const t = useTranslations("block-puzzle");
  const { state, placePieceAtCell, getPreview, reset, isUnplaceable } = useBlockPuzzle();
  const { grid, tray, score, highScore, gameOver, clearFlash, comboText } = state;

  const [drag, setDrag] = useState<DragInfo | null>(null);
  // ホバー中のグリッドセル（アンカー = ピース[0][0]の位置）
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // グリッドDOM座標からセルインデックスを計算
  const getCellFromPoint = useCallback(
    (clientX: number, clientY: number): [number, number] | null => {
      if (!gridRef.current) return null;
      const rect = gridRef.current.getBoundingClientRect();
      const cellSize = rect.width / GRID_SIZE;
      const col = Math.floor((clientX - rect.left) / cellSize);
      const row = Math.floor((clientY - rect.top) / cellSize);
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
      return [row, col];
    },
    []
  );

  // プレビューセルセット計算
  const preview = useCallback((): { cells: [number, number][]; valid: boolean } | null => {
    if (!drag || !hoverCell) return null;
    const anchorRow = hoverCell[0] - drag.clickRow;
    const anchorCol = hoverCell[1] - drag.clickCol;
    return getPreview(drag.piece, anchorRow, anchorCol);
  }, [drag, hoverCell, getPreview]);

  const previewResult = preview();
  const previewSet = new Set(previewResult?.cells.map(([r, c]) => `${r},${c}`) ?? []);
  const previewValid = previewResult?.valid ?? false;

  // ドラッグ開始（ピーストレイ）
  const handlePiecePointerDown = (e: React.PointerEvent, slotIndex: number) => {
    if (gameOver) return;
    const slot = tray[slotIndex];
    if (!slot || slot.used) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    // クリックした位置をセル単位で計算
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const inner = el.querySelector("[data-piece-grid]") as HTMLElement | null;
    if (!inner) return;
    const innerRect = inner.getBoundingClientRect();
    const cellSize = innerRect.width / slot.piece[0].length;
    const clickCol = Math.floor((e.clientX - innerRect.left) / cellSize);
    const clickRow = Math.floor((e.clientY - innerRect.top) / innerRect.height * slot.piece.length);

    setDrag({
      slotIndex,
      piece: slot.piece,
      clickRow: Math.max(0, Math.min(clickRow, slot.piece.length - 1)),
      clickCol: Math.max(0, Math.min(clickCol, slot.piece[0].length - 1)),
    });
    setHoverCell(null);
    void rect;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    setHoverCell(cell);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (cell && previewValid) {
      const anchorRow = cell[0] - drag.clickRow;
      const anchorCol = cell[1] - drag.clickCol;
      placePieceAtCell(drag.slotIndex, anchorRow, anchorCol);
    }
    setDrag(null);
    setHoverCell(null);
    void e;
  };

  // グリッドセルの色を決定
  function cellClass(r: number, c: number): string {
    const key = `${r},${c}`;
    const rowKey = `r${r}`;
    const colKey = `c${c}`;
    if (clearFlash.has(rowKey) || clearFlash.has(colKey)) return FLASH_COLOR;
    if (previewSet.has(key)) return previewValid ? PREVIEW_VALID : PREVIEW_INVALID;
    if (grid[r][c]) return FILLED_COLOR;
    return EMPTY_COLOR;
  }

  return (
    <div
      className="flex flex-col items-center gap-4 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => { if (drag) { setDrag(null); setHoverCell(null); } }}
    >
      {/* スコア */}
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">{t("score")}</div>
          <div className="text-2xl font-bold text-indigo-600">{score.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">{t("best")}</div>
          <div className="text-2xl font-bold text-gray-700">{highScore.toLocaleString()}</div>
        </div>
      </div>

      {/* コンボテキスト */}
      {comboText && (
        <div className="text-orange-500 font-bold text-lg animate-bounce">{comboText}</div>
      )}

      {/* グリッド */}
      <div
        ref={gridRef}
        className="grid gap-[2px] bg-slate-800 p-1 rounded-lg touch-none"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, width: "min(360px, 96vw)" }}
      >
        {Array.from({ length: GRID_SIZE }, (_, r) =>
          Array.from({ length: GRID_SIZE }, (_, c) => (
            <div
              key={`${r}-${c}`}
              className={`aspect-square rounded-sm transition-colors duration-150 ${cellClass(r, c)}`}
            />
          ))
        )}
      </div>

      {/* ピーストレイ */}
      <div className="flex gap-3 justify-center flex-wrap">
        {tray.map((slot, i) => {
          if (slot.used) {
            return <div key={slot.id} className="w-24 h-24 rounded-lg bg-gray-100" />;
          }
          const unplaceable = isUnplaceable(slot.piece);
          return (
            <div
              key={slot.id}
              className={`w-24 h-24 rounded-lg bg-white shadow flex items-center justify-center p-2 cursor-grab active:cursor-grabbing touch-none ${
                unplaceable ? "opacity-40" : "hover:shadow-md"
              }`}
              onPointerDown={(e) => handlePiecePointerDown(e, i)}
            >
              <div
                data-piece-grid
                className="grid gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${slot.piece[0].length}, minmax(0, 1fr))`,
                  width: `${slot.piece[0].length * 16}px`,
                  height: `${slot.piece.length * 16}px`,
                }}
              >
                {slot.piece.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`rounded-sm ${cell ? PIECE_COLORS[i % PIECE_COLORS.length] : "bg-transparent"}`}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ゲームオーバー */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-xs w-full mx-4">
            <div className="text-4xl mb-2">😵</div>
            <h2 className="text-2xl font-bold mb-1">{t("gameOver")}</h2>
            <p className="text-gray-500 mb-1">{t("score")}: <span className="font-bold text-indigo-600">{score.toLocaleString()}</span></p>
            <p className="text-gray-500 mb-4">{t("best")}: <span className="font-bold">{highScore.toLocaleString()}</span></p>
            <button
              onClick={reset}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              {t("playAgain")}
            </button>
          </div>
        </div>
      )}

      {/* リセットボタン */}
      <button
        onClick={reset}
        className="text-sm text-gray-400 hover:text-gray-600 underline"
      >
        {t("reset")}
      </button>
    </div>
  );
}
