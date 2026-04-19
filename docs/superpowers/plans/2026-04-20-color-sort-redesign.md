# Color Sort Puzzle — リデザイン実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** カラーソートパズルにスタック移動メカニクスと Deep Space Glass ビジュアルテーマを導入し、難易度と没入感を大幅に向上させる

**Architecture:** `useColorSort.ts` でスタック移動対応シャッフル＋スタック移動ロジックを実装し、`ColorSort.tsx` でチューブを液体レイヤー表示に刷新する。CSS アニメーション 1 本を `src/styles/globals.css` に追加。翻訳・SEO・registry は触らない。

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, next-intl 4.x, CSS Animations

**Spec:** `docs/superpowers/specs/2026-04-20-color-sort-redesign.md`

---

## ファイルマップ

| ファイル | 役割 | 変更種別 |
|---|---|---|
| `src/hooks/useColorSort.ts` | パズルロジック（パレット・シャッフル・移動） | 修正 |
| `src/tools/ColorSort.tsx` | UI コンポーネント（チューブ・液体レイヤー） | 修正 |
| `src/styles/globals.css` | グローバル CSS（アニメーション追加） | 修正 |

---

## Task 1: パレットデータ構造の拡張（`useColorSort.ts`）

**Files:**
- Modify: `src/hooks/useColorSort.ts`

- [ ] **Step 1: `PALETTE_DATA` / `PALETTE` / `getColorData` を追加する**

`src/hooks/useColorSort.ts` の先頭（`TUBE_CAP` 定義の直後）に以下を追加し、既存の `PALETTE` 定義を置き換える：

```typescript
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
```

既存の `export const PALETTE = [...]` 行（10 色の hex 配列）は削除する。

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` または型エラーのみの警告（PALETTE_DATA の型を参照しているコードがあれば修正）

- [ ] **Step 3: コミット**

```bash
git add src/hooks/useColorSort.ts
git commit -m "[改善] color-sort: PALETTE_DATA 構造体・getColorData を追加"
```

---

## Task 2: シャッフルアルゴリズムをスタック移動ベースに刷新（`useColorSort.ts`）

**Files:**
- Modify: `src/hooks/useColorSort.ts`

- [ ] **Step 1: `SHUFFLE_ITERS` 定数と `generatePuzzle` を書き換える**

既存の `generatePuzzle` 関数全体を以下で置き換える。`lcg` 関数・`DIFF_KEYS` はそのまま残す：

```typescript
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

  let lastFromIdx = -1; // 直前の移動元チューブ（逆戻り防止）

  for (let k = 0; k < iters; k++) {
    // スタック移動の有効手を列挙: [fromIdx, toIdx, stackCount]
    const valid: [number, number, number][] = [];
    for (let f = 0; f < state.length; f++) {
      if (!state[f].length) continue;
      const topColor = state[f][state[f].length - 1];
      let stackCount = 0;
      for (let i = state[f].length - 1; i >= 0 && state[f][i] === topColor; i--) stackCount++;

      for (let t = 0; t < state.length; t++) {
        if (f === t) continue;
        if (t === lastFromIdx) continue; // 逆戻り禁止: 直前の移動元を移動先にしない
        const space = TUBE_CAP - state[t].length;
        const toTop = state[t].length ? state[t][state[t].length - 1] : null;
        if (space >= stackCount && (toTop === null || toTop === topColor)) {
          valid.push([f, t, stackCount]);
        }
      }
    }
    if (!valid.length) break;
    const [f, t, cnt] = valid[Math.floor(rng() * valid.length)];
    for (let i = 0; i < cnt; i++) state[t].push(state[f].pop()!);
    lastFromIdx = f;
  }

  return state;
}
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: コミット**

```bash
git add src/hooks/useColorSort.ts
git commit -m "[改善] color-sort: シャッフルをスタック移動ベース・逆戻り禁止に刷新"
```

---

## Task 3: `clickTube` をスタック移動に対応させる（`useColorSort.ts`）

**Files:**
- Modify: `src/hooks/useColorSort.ts`

- [ ] **Step 1: `getTopStack` ヘルパーを追加し `clickTube` を書き換える**

`isSolved` 関数の直前に `getTopStack` を追加する：

```typescript
function getTopStack(tube: string[]): { color: string; count: number } | null {
  if (!tube.length) return null;
  const color = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0 && tube[i] === color; i--) count++;
  return { color, count };
}
```

次に `useColorSort` 内の `clickTube` を以下で置き換える：

```typescript
const clickTube = useCallback((idx: number) => {
  if (status === "won") return;
  if (sel === null) {
    if (tubes[idx].length) setSel(idx);
    return;
  }
  if (sel === idx) { setSel(null); return; }

  const fromStack = getTopStack(tubes[sel]);
  if (!fromStack) { setSel(null); return; }

  const { color, count } = fromStack;
  const toBalls = tubes[idx];
  const space = TUBE_CAP - toBalls.length;
  const toTop = toBalls.length ? toBalls[toBalls.length - 1] : null;
  const canMove = space >= count && (toTop === null || toTop === color);

  if (!canMove) {
    setSel(toBalls.length ? idx : null);
    return;
  }

  const next = tubes.map((t) => [...t]);
  for (let i = 0; i < count; i++) next[idx].push(next[sel].pop()!);
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
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: 動作を手動確認する（dev サーバー起動済みであれば不要）**

ブラウザで `/ja/color-sort` を開き：
- チューブをクリック → 上端の同色ブロックが**まとめて**ハイライトされることを確認（ビジュアルは Task 5 以降で変わる）
- 移動先に同色スペースがある場合のみ移動できることを確認
- Undo が正しく 1 手戻ることを確認

- [ ] **Step 4: コミット**

```bash
git add src/hooks/useColorSort.ts
git commit -m "[改善] color-sort: スタック移動メカニクスを実装"
```

---

## Task 4: CSS アニメーションを追加（`globals.css`）

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: `pour-in` アニメーションを globals.css に追加する**

`src/styles/globals.css` の末尾（`cs-confetti` ブロックの直後）に以下を追加する：

```css
/* ========================================
   Color Sort: 液体レイヤー流入アニメーション
   ======================================== */
@keyframes pour-in {
  from { transform: scaleY(0); opacity: 0; }
  to   { transform: scaleY(1); opacity: 1; }
}
.liquid-pour-in {
  transform-origin: bottom;
  animation: pour-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: コミット**

```bash
git add src/styles/globals.css
git commit -m "[スタイル] color-sort: liquid-pour-in アニメーションを追加"
```

---

## Task 5: Tube コンポーネントを液体レイヤー表示に刷新（`ColorSort.tsx`）

**Files:**
- Modify: `src/tools/ColorSort.tsx`

- [ ] **Step 1: import を更新する**

`ColorSort.tsx` の先頭 import を以下に書き換える（`PALETTE` を `PALETTE_DATA`, `getColorData`, `TUBE_HEIGHT`, `LAYER_HEIGHT` に変更）：

```typescript
"use client";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  useColorSort,
  TUBE_CAP,
  TUBE_HEIGHT,
  LAYER_HEIGHT,
  PALETTE,
  getColorData,
  type Difficulty,
} from "@/hooks/useColorSort";
```

- [ ] **Step 2: `Tube` コンポーネントを液体レイヤースタイルに書き換える**

既存の `Tube` コンポーネント全体を以下で置き換える：

```typescript
function Tube({ balls, isSelected, onClick }: {
  balls: string[];
  isSelected: boolean;
  onClick: () => void;
}) {
  const completed = balls.length === TUBE_CAP && balls.every((b) => b === balls[0]);
  const topData = balls.length ? getColorData(balls[balls.length - 1]) : null;

  const borderStyle = completed && topData
    ? {
        border: `2px solid ${topData.glow.replace("0.7", "0.9")}`,
        boxShadow: `0 0 22px ${topData.glow}, 0 4px 20px rgba(0,0,0,0.6)`,
      }
    : isSelected && topData
    ? {
        border: `2px solid ${topData.glow.replace("0.7", "0.85")}`,
        boxShadow: `0 0 20px ${topData.glow}, 0 6px 24px rgba(0,0,0,0.7)`,
      }
    : {
        border: "1.5px solid rgba(255,255,255,0.2)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      };

  return (
    <button
      onClick={onClick}
      aria-label="tube"
      className={`relative flex flex-col-reverse overflow-hidden cursor-pointer transition-transform duration-150
        ${isSelected ? "-translate-y-2.5" : "hover:-translate-y-0.5"}
      `}
      style={{
        width: 44,
        height: TUBE_HEIGHT,
        borderRadius: "6px 6px 22px 22px",
        background: "rgba(255,255,255,0.05)",
        ...borderStyle,
      }}
    >
      {/* 液体レイヤー（下から上に積み重なる）: key の i+color でアニメーション制御 */}
      {balls.map((color, i) => {
        const cd = getColorData(color);
        return (
          <div
            key={`${i}-${color}`}
            className="liquid-pour-in shrink-0 relative w-full"
            style={{
              height: LAYER_HEIGHT,
              background: `linear-gradient(180deg, ${cd.light}F0 0%, ${cd.base} 100%)`,
              boxShadow: `inset 0 0 12px ${cd.glow}`,
              borderTop: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            {/* シャインストライプ */}
            <div
              className="absolute"
              style={{
                top: 4,
                left: 5,
                right: 5,
                height: 3,
                background: "rgba(255,255,255,0.30)",
                borderRadius: 2,
              }}
            />
          </div>
        );
      })}

      {/* 完成チューブの ✓ アイコン */}
      {completed && topData && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span
            style={{
              fontSize: 22,
              filter: `drop-shadow(0 0 6px ${topData.base})`,
            }}
          >
            ✓
          </span>
        </div>
      )}

      {/* ガラスハイライト（左端の縦ストライプ） */}
      <div
        className="absolute pointer-events-none rounded"
        style={{
          top: 0,
          left: 6,
          width: 8,
          height: "60%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
        }}
      />
    </button>
  );
}
```

- [ ] **Step 3: ビルドが通ることを確認する**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`（型エラーがあれば修正する）

- [ ] **Step 4: コミット**

```bash
git add src/tools/ColorSort.tsx
git commit -m "[スタイル] color-sort: Tube を液体レイヤー表示に刷新・完成グロー・アニメーション対応"
```

---

## Task 6: ゲームパネルを Deep Space Glass テーマに変更（`ColorSort.tsx`）

**Files:**
- Modify: `src/tools/ColorSort.tsx`

- [ ] **Step 1: ゲームパネル部分（tube grid の wrapper）を書き換える**

`ColorSort` コンポーネント内の「Tube grid」セクション（現在 `bg-gradient-to-b from-slate-800 to-slate-900` のdiv）を以下に置き換える：

```tsx
{/* Tube grid (Deep Space Glass panel) */}
<div
  className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
  style={{
    background: "linear-gradient(160deg, #0a0e1a 0%, #0d1a2e 60%, #0a1020 100%)",
  }}
>
  {/* 背景グロー光源 */}
  <div
    className="absolute pointer-events-none"
    style={{
      width: 140,
      height: 140,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(56,189,248,0.09) 0%, transparent 70%)",
      top: -30,
      left: 10,
    }}
  />
  <div
    className="absolute pointer-events-none"
    style={{
      width: 100,
      height: 100,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)",
      bottom: 10,
      right: 10,
    }}
  />

  <div
    className="relative grid gap-2.5"
    style={{ gridTemplateColumns: `repeat(${COLS[diff]}, minmax(0, 1fr))` }}
  >
    {tubes.map((balls, i) => (
      <Tube
        key={i}
        balls={balls}
        isSelected={sel === i}
        onClick={() => clickTube(i)}
      />
    ))}
  </div>
</div>
```

- [ ] **Step 2: アクションボタンをダーク系スタイルに変更する**

「Action buttons」セクションのボタン className を以下に変更する：

```tsx
{/* Action buttons */}
<div className="flex gap-2">
  <button
    onClick={undo}
    disabled={!hist.length}
    className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40"
    style={{
      background: "#1e293b",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#94a3b8",
    }}
  >
    {t("undo")}
  </button>
  <button
    onClick={restart}
    className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
    style={{
      background: "#1e293b",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#94a3b8",
    }}
  >
    {t("restart")}
  </button>
</div>
```

- [ ] **Step 3: ビルドが通ることを確認する**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: コミット**

```bash
git add src/tools/ColorSort.tsx
git commit -m "[スタイル] color-sort: Deep Space Glass パネル・ダークボタンに変更"
```

---

## Task 7: 最終確認・スモークテスト

**Files:** なし（確認のみ）

- [ ] **Step 1: dev サーバーを起動してブラウザで確認する**

```bash
cd /home/taki/projects/web-tools && npm run dev
```

`http://localhost:3000/ja/color-sort` を開いて以下をチェックする：

**ゲームパネル**
- [ ] 深いネイビー背景（`#0a0e1a` → `#0d1a2e`）が表示される
- [ ] 背景に薄いシアン・パープルのグロー光源が見える

**チューブ・液体レイヤー**
- [ ] 各チューブ内の色が矩形の液体レイヤーとして表示される（丸いボールではない）
- [ ] ガラスハイライト（左端の縦ストライプ）が見える
- [ ] 各レイヤーにシャインストライプ（上部の白い横線）が見える

**スタック移動**
- [ ] チューブを選択するとそのチューブが浮き上がる（`-translate-y-2.5`）
- [ ] 上端に同色が2つ以上あるとき、まとめて移動できる
- [ ] 移動先のスペースが足りない場合は移動できない

**アニメーション**
- [ ] 新しくレイヤーが追加されたとき、`scaleY(0→1)` のアニメーションが再生される

**完成チューブ**
- [ ] 同色4層で満杯になったチューブにグロー枠と ✓ が表示される

**既存機能の回帰確認**
- [ ] Undo が正しく動く
- [ ] Restart が正しく動く
- [ ] 全ツール完了で紙吹雪が出る
- [ ] 難易度切替（easy / medium / hard / expert）が動く
- [ ] `/en/color-sort` でも同様に動く

- [ ] **Step 2: 375px 幅（モバイル）でレイアウト崩れがないことを確認する**

Chrome DevTools で iPhone SE（375px）に切り替え、チューブが画面内に収まっていることを確認する。はみ出す場合は `ColorSort.tsx` のグリッド gap を `gap-1.5` に縮める。

- [ ] **Step 3: 最終ビルド確認**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`、型エラー・警告なし

- [ ] **Step 4: 最終コミット（README 更新は任意）**

```bash
git add -p  # 未コミットの差分があれば
git commit -m "[改善] color-sort: スタック移動・Deep Space Glass・液体レイヤー実装完了"
```

---

## 完了条件チェックリスト（spec 由来）

- [ ] スタック移動が正しく機能する（上端の同色 N 個が一括移動）
- [ ] シャッフル後の盤面が直前の逆戻りを含まない（コード確認で OK）
- [ ] 液体レイヤーがチューブ内に均等に積み重なる（36px × 4 = 144px）
- [ ] 選択チューブが上端色のグロー枠で浮き上がる
- [ ] 完成チューブがグロー枠＋ ✓ 表示になる
- [ ] 新レイヤー追加時に `pour-in` アニメーションが発火する
- [ ] `npm run build` でエラーなし
- [ ] easy〜expert の全難易度で動作確認済み
