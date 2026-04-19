# Color Sort Puzzle — リデザイン仕様書

**作成日**: 2026-04-20  
**対象ファイル**: `src/hooks/useColorSort.ts`, `src/tools/ColorSort.tsx`, `src/app/globals.css`

---

## 背景・目的

現行のカラーソートパズルには以下の2つの問題がある：

1. **難易度不足**: シャッフルが150〜300回のランダム単体移動のため、初期盤面がほぼ解かれた状態に近く簡単すぎる
2. **視覚単調**: ボール表示・暗いパネルのみでデザイン性に欠ける

本仕様はこれらを一括リファクタで解決する。

---

## スコープ

### 変更するファイル
| ファイル | 変更内容 |
|---|---|
| `src/hooks/useColorSort.ts` | スタック移動・シャッフル刷新・カラーパレット拡張 |
| `src/tools/ColorSort.tsx` | 液体レイヤーUI・Deep Space Glassテーマ・アニメーション |
| `src/app/globals.css`（または相当ファイル） | `@keyframes pour-in` を追加 |

### 変更しないファイル
- 翻訳ファイル（`src/messages/*/tools/color-sort.json`）
- ルーティング・registry・SEOメタデータ
- ツールページ（`src/app/[locale]/color-sort/page.tsx`）

---

## ゲームメカニクス変更

### スタック移動（最重要変更）

**現行**: チューブ上端のボール1個のみ移動  
**新規**: チューブ上端の「連続する同色ボール全て」をまとめて移動

```
例: tubes[i] = ["G", "R", "R"] (上がR)
  → topColor = "R", stackCount = 2
  → 移動先に2個分の空きがあり、移動先上端がR（または空）なら2個を一括移動
```

移動先の空き数 < スタック数の場合は移動不可（選択解除のみ、エラー表示なし）。

`isSolved` 条件は変更なし（各チューブが空または同色でTUBE_CAP個）。

### シャッフル改善（`generatePuzzle`）

**現行の問題**: ランダム単体移動のため解が浅くなりがち

**新規アルゴリズム**:
1. ソルバー済み状態から開始（変更なし）
2. **スタック移動のみ**でシャッフル（ゲームと同じルール → 解の存在保証）
3. 試行回数を増加:
   - easy: 300〜500回
   - medium: 400〜600回
   - hard: 500〜700回
   - expert: 600〜900回
4. **直前の逆戻り禁止**: 直前のシャッフル手で「移動元だったチューブ index」を記録し、次の手でそのチューブを「移動先」として選ぶことを禁止する（例: 直前に `tubes[2]→tubes[5]` なら、次に `?→tubes[2]` への移動を候補から除外）

シャッフルがスタック移動のみであれば、プレイヤーは必ずその逆順で解ける（解の存在保証）。

---

## ビジュアル設計

### テーマ: Deep Space Glass

**ゲームパネル**:
- 背景: `linear-gradient(160deg, #0a0e1a 0%, #0d1a2e 60%, #0a1020 100%)`
- 角丸: `rounded-2xl`（24px）
- 装飾: 背景に薄いシアン・パープルのグロー光源（`position:absolute` な radial-gradient blob × 2）

### チューブ（Tube コンポーネント）

**通常状態**:
```
border: 1.5px solid rgba(255,255,255,0.2)
background: rgba(255,255,255,0.05)
border-radius: 6px 6px 22px 22px  ← 上端は少し角張り、下端は丸い
box-shadow: 0 4px 20px rgba(0,0,0,0.6)
```

**選択状態**（selectedTube）:
```
border: 2px solid rgba(TOP_COLOR_GLOW, 0.85)
box-shadow: 0 0 20px TOP_COLOR_GLOW, 0 6px 24px rgba(0,0,0,0.7)
transform: translateY(-10px)
```

**完成状態**（チューブが同色TUBE_CAP個で満杯）:
```
border: 2px solid rgba(COLOR_GLOW, 0.9)
box-shadow: 0 0 22px COLOR_GLOW
中央に ✓ アイコン（filter: drop-shadow でグロー）
```

**ガラスハイライト**（全状態共通）:
```
position: absolute, top:0, left:6px
width:8px, height:60%
background: linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)
border-radius: 4px
```

### 液体レイヤー（LiquidLayer コンポーネント）

ボール（丸）を廃止し、チューブ内を液体の層として表示。

**各レイヤー**:
```
height: TUBE_HEIGHT / TUBE_CAP  ← 均等分割（例: 36px × 4段）
background: linear-gradient(180deg, COLOR_LIGHT, COLOR_DARK)
box-shadow: inset 0 0 12px COLOR_GLOW
border-top: 1px solid rgba(255,255,255,0.2)  ← 層の境界線
```

**シャインストライプ**（各レイヤー上部）:
```
position: absolute, top: 4px, left: 5px, right: 5px
height: 3px
background: rgba(255,255,255,0.3)
border-radius: 2px
```

### カラーパレット拡張

各色にベース・グロー・ライトの3値を持つオブジェクト配列に変更:

```typescript
export const PALETTE_DATA = [
  { base: "#ef4444", glow: "rgba(239,68,68,0.7)",   light: "#fca5a5" },  // red
  { base: "#3b82f6", glow: "rgba(59,130,246,0.7)",  light: "#93c5fd" },  // blue
  { base: "#22c55e", glow: "rgba(34,197,94,0.7)",   light: "#86efac" },  // green
  { base: "#eab308", glow: "rgba(234,179,8,0.7)",   light: "#fde68a" },  // yellow
  { base: "#a855f7", glow: "rgba(168,85,247,0.7)",  light: "#d8b4fe" },  // purple
  { base: "#f97316", glow: "rgba(249,115,22,0.7)",  light: "#fed7aa" },  // orange
  { base: "#ec4899", glow: "rgba(236,72,153,0.7)",  light: "#f9a8d4" },  // pink
  { base: "#06b6d4", glow: "rgba(6,182,212,0.7)",   light: "#a5f3fc" },  // cyan
  { base: "#84cc16", glow: "rgba(132,204,22,0.7)",  light: "#d9f99d" },  // lime
  { base: "#f43f5e", glow: "rgba(244,63,94,0.7)",   light: "#fda4af" },  // rose
] as const;

// 後方互換: PALETTE は base[] のまま export
export const PALETTE = PALETTE_DATA.map((p) => p.base);
```

---

## アニメーション

### `@keyframes pour-in`（globals.css に追加）

```css
@keyframes pour-in {
  from { transform: scaleY(0); opacity: 0; }
  to   { transform: scaleY(1); opacity: 1; }
}
.liquid-pour-in {
  transform-origin: bottom;
  animation: pour-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

### React側の実装方針

- 各 LiquidLayer に `key={color + "-" + index + "-" + moveCount}` を付与
- 移動後に加わった新レイヤーが新しい key を持つため、React が新規マウント → CSS アニメーションが自動発火
- 削除アニメーション（流出）は実装しない（状態更新が即時のため難易度高い割に効果薄）
- 選択時の `translateY(-10px)` は既存実装を継続

---

## UIレイアウト変更（ColorSort.tsx）

### 変更点
- ゲームパネル背景を Deep Space Glass グラデーションに変更
- 難易度タブ・統計は現行レイアウトを維持（ページ全体のライトテーマとの調和を保つ）
- アクションボタンをダーク系スタイル（`bg-[#1e293b]`、白文字）に変更（ゲームパネルに馴染む）

### 変更しない点
- ページ全体のレイアウト（ヘッダー・FAQ・howToUse は対象外）
- Confetti コンポーネント（既存のまま）
- Win バナー（既存スタイルを維持）

---

## 実装上の注意

1. `TUBE_CAP = 4` は変更なし（各チューブの容量）
2. `DIFF_CONFIG` の `tubes` 数は変更なし
3. undo履歴は変更なし（スタック移動1回 = 履歴1エントリ）
4. `isSolved` 関数は変更なし
5. `useLocalStorage` のセーブデータ構造は変更なし（互換性維持）
6. グローバルCSS追加は最小限（`@keyframes pour-in` と `.liquid-pour-in` のみ）

---

## 完了条件

- [ ] スタック移動が正しく機能する（上端の同色N個が一括移動）
- [ ] シャッフル後の盤面が直前の逆戻りを含まない
- [ ] 液体レイヤーがチューブ内に均等に積み重なる
- [ ] 選択チューブがグロー枠で浮き上がる
- [ ] 完成チューブがグロー枠＋✓表示になる
- [ ] 新レイヤー追加時に `pour-in` アニメーションが発火する
- [ ] `npm run build` でエラーなし
- [ ] easy〜expert の全難易度で動作確認済み
