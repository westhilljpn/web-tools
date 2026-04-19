# ミニゲームページ設計書

**日付**: 2026-04-19  
**ステータス**: 承認済み

---

## 概要

Quicker サイトに「ゲーム」カテゴリを新設し、ゲームハブページ + 3本のミニゲームを追加する。  
すべてのゲームは言語依存なし（グローバル向け）・クライアントサイド完結・外部API不使用。

---

## スコープ（Phase 1）

| ゲーム | slug | コンポーネント |
|--------|------|--------------|
| 2048 | `game-2048` | `Game2048` |
| マインスイーパ | `minesweeper` | `Minesweeper` |
| Idle Tapper（⭐スター収集アイドルゲーム） | `idle-tapper` | `IdleTapper` |

---

## アーキテクチャ

### 方針: ロジックフック分離（B案）

各ゲームを「ロジックフック」と「UIコンポーネント」に分離する。  
理由: 1コンポーネント200行以内ルール準拠、ロジックの独立性確保。

### ゲームカテゴリ統合方針

- toolsRegistry.ts に `"game"` カテゴリを追加
- 各ゲームを既存ツールと同じ `/[locale]/[slug]` URLで配信
- ゲームハブ `/[locale]/games` を新規ルートとして追加（カテゴリフィルタ）
- 既存の toolPage レイアウト（HowToUse・FAQ・RelatedTools）をそのまま活用

### localStorage 永続化

- `src/hooks/useLocalStorage.ts` に汎用フック実装（npm追加なし）
- 2048: ベストスコア
- マインスイーパ: 難易度別ベストタイム
- Idle Tapper: スター数・購入済みアップグレード・総クリック数

---

## ファイル構成

### 新規ファイル

```
src/
├── hooks/
│   ├── useLocalStorage.ts
│   ├── use2048.ts
│   ├── useMinesweeper.ts
│   └── useIdleTapper.ts
├── tools/
│   ├── Game2048.tsx
│   ├── Minesweeper.tsx
│   └── IdleTapper.tsx
├── app/[locale]/
│   └── games/
│       └── page.tsx
└── messages/
    ├── en/tools/
    │   ├── game-2048.json
    │   ├── minesweeper.json
    │   └── idle-tapper.json
    └── ja/tools/
        ├── game-2048.json
        ├── minesweeper.json
        └── idle-tapper.json
```

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/lib/toolsRegistry.ts` | `"game"` をToolCategoryに追加、3ゲーム登録 |
| `src/lib/toolComponents.tsx` | 3コンポーネントのマッピング追加 |
| `src/messages/en/common.json` | `categories.game: "Game"` 追加 |
| `src/messages/ja/common.json` | `categories.game: "ゲーム"` 追加 |

---

## 各ゲーム詳細仕様

### 2048 (`game-2048`)

**フック: `use2048.ts`**
- 状態: `grid: number[][]`（4×4）、`score: number`、`bestScore: number`（localStorage）、`status: "playing"|"won"|"over"`
- アクション: `move(direction)`, `reset()`
- ロジック: スライド→マージ→ランダムタイル追加（2: 90%, 4: 10%）→ゲームオーバー判定

**UI: `Game2048.tsx`**
- タイル色: 値に応じたTailwind背景色（2→bg-amber-100, 4→bg-amber-200, ... 2048→bg-yellow-500）
- 操作: `keydown` イベント（矢印キー）+ `touchstart/touchend` スワイプ判定（50px閾値）
- オーバーレイ: クリア・ゲームオーバー時に半透明オーバーレイ表示
- スコア表示: 現在スコア + ベストスコア（ヘッダー部）

### マインスイーパ (`minesweeper`)

**フック: `useMinesweeper.ts`**
- 難易度設定:
  - Easy: 9×9, 10地雷
  - Medium: 16×16, 40地雷
  - Hard: 16×30, 99地雷
- 状態: `grid: Cell[][]`、`status: "idle"|"playing"|"won"|"lost"`、`flagCount`、`elapsed`、`bestTime`（難易度別localStorage）
- `Cell`: `{ isMine, isRevealed, isFlagged, adjacentMines }`
- 初手保証: 最初のクリック座標周囲3×3を除いた位置に地雷配置
- 数字0の自動展開: 再帰的フラッドフィル（スタックオーバーフロー対策でイテレータ実装）

**UI: `Minesweeper.tsx`**
- 難易度セレクタ（タブ形式）
- 絵文字顔ボタン: 😊（プレイ中）/ 😵（負け）/ 😎（勝ち）
- タイマー表示（ゲーム開始後カウントアップ）
- 右クリック・長押し（500ms）でフラグ切り替え
- Hard難易度はスクロール対応（横スクロールコンテナ）

### Idle Tapper (`idle-tapper`)

**テーマ**: ⭐スターを集めるオリジナルアイドルゲーム（既存IPとは無関係）

**フック: `useIdleTapper.ts`**
- 状態: `stars: number`、`totalClicks: number`、`upgrades: UpgradeState[]`（localStorage一括保存）
- アップグレード定義（5段階）:

| ID | 名前 | コスト | 効果 |
|----|------|--------|------|
| click-power-1 | Star Burst | 10 | クリック倍率 ×2 |
| click-power-2 | Stellar Touch | 50 | クリック倍率 ×2 |
| auto-1 | Star Drone | 100 | 毎秒+1 |
| auto-2 | Star Factory | 500 | 毎秒+5 |
| auto-3 | Galactic Engine | 2000 | 毎秒+20 |

- 自動生産: `setInterval(1000ms)` で purchased な auto系アップグレードの合計を加算
- 保存: `stars`・`upgrades購入状態`・`totalClicks` をlocalStorageに自動保存（クリック・購入のたびに）

**UI: `IdleTapper.tsx`**
- 大きな⭐ボタン（クリックでスター獲得、押下アニメーション）
- スター数表示（大きなフォント、K/M単位省略）
- アップグレードパネル（購入済みはグレーアウト、購入可能はハイライト）
- 毎秒生産レート表示
- リセットボタン（確認ダイアログ付き）

---

## ゲームハブページ (`/[locale]/games`)

- `src/app/[locale]/games/page.tsx` として新規作成
- toolsRegistry から `category === "game"` でフィルタしたツール一覧を表示
- 既存のツールカードコンポーネントを流用
- SEOメタデータ: title・description・hreflang（en/ja）を設定
- 翻訳: `common.json` の `gamesHub` キーに title・description を追加

---

## i18n 方針

- ゲームページの title・description・keywords・howToUse・faq は既存ツールと同様に翻訳ファイルで管理
- ゲームUI内のテキスト（スコア表示・ボタンラベル等）も翻訳ファイル経由
- ゲームの**プレイ体験自体は言語非依存**（数字・絵文字のみ）

---

## SEO構造化データ

- 既存 toolPage の `WebApplication` + `FAQPage` + `BreadcrumbList` スキーマをそのまま活用
- `applicationCategory`: `src/app/[locale]/[tool-slug]/page.tsx` 内で `tool.category === "game"` なら `"GameApplication"`、それ以外は `"UtilityApplication"` に分岐
- 変更対象: `page.tsx` の `webAppSchema` 生成部分のみ（1行追加）

---

## 制約・ルール遵守

| ルール | 対応 |
|--------|------|
| 外部API不使用 | すべてクライアントサイド完結 ✓ |
| npm追加禁止 | localStorageフックは自前実装 ✓ |
| 200行以内 | フック/UIに分離して各ファイル200行以内 ✓ |
| any型禁止 | 全コンポーネントにTypeScript型定義 ✓ |
| Tailwind限定 | インラインスタイル不使用 ✓ |
| ハードコード禁止 | ゲームUIテキストもすべて翻訳ファイル経由 ✓ |
| 「特定タイトル名」の単語 | コード・コメント・翻訳ファイルに一切含めない ✓ |

---

## 実装順序（推奨）

1. `useLocalStorage.ts` フック
2. toolsRegistry + toolComponents 更新（カテゴリ追加・3ゲーム登録）
3. common.json 更新
4. `game-2048`（フック → UI → 翻訳ファイル）
5. `minesweeper`（フック → UI → 翻訳ファイル）
6. `idle-tapper`（フック → UI → 翻訳ファイル）
7. ゲームハブページ
8. `npm run build` 確認
