# フロントエンドデザイン改善 設計仕様

- **日付**: 2026-04-16
- **方向性**: ボールド・インパクト ＋ ソフィスティケート（Navy → Sky Blue）
- **実施エリア**: A（ホームページ）→ B（ツール個別ページ）→ C（ToolCard）→ D（色の一貫性）
- **実施順序**: D → C → A → B（依存関係により順序を入れ替え）
  - D（色修正）は最も基盤的で他エリアに影響するため先行
  - C（ToolCard）は A（ホームページ）で使われるため先行
  - A と B は独立

---

## カラーパレット（変更なし・参照用）

現行 `tailwind.config.ts` の7色がそのまま設計の根拠。外部カラー（tailwind組み込みの blue-*/purple-* 等）は使わない。

| 変数名 | HEX | 用途 |
|---|---|---|
| `primary` | `#1D3D5E` | テキスト見出し・ヘッダー背景・アクティブタブ |
| `accent` | `#e94d71` | CTA・ホバー・開発カテゴリアクセント |
| `sky` | `#b6dcef` | ダークモードテキスト・アイコン背景（テキスト系）・ヒーロー終点 |
| `sky-soft` | `#cbe0eb` | ボーダー・アイコン背景（変換系）・カテゴリバッジ |
| `surface` | `#f2f5fd` | ページ背景・非アクティブタブ背景 |
| `steel` | `#7B9098` | セカンダリテキスト・変換カテゴリアクセント |
| `gold` | `#9D8C56` | おすすめラベル・計算カテゴリアクセント |

---

## エリア D：色の一貫性修正（最初に実施）

**対象ファイル**: `src/app/[locale]/[tool-slug]/page.tsx`・`src/components/HowToUse.tsx`・`src/components/FAQSection.tsx`

### 置換ルール

| ファイル | 修正前 | 修正後 | 用途 |
|---|---|---|---|
| `[tool-slug]/page.tsx` | `text-gray-900 dark:text-slate-100` | `text-primary dark:text-sky` | H1見出し |
| `[tool-slug]/page.tsx` | `text-gray-500 dark:text-slate-400` | `text-steel dark:text-sky/60` | ページ説明文 |
| `HowToUse.tsx` | `text-gray-900 dark:text-slate-100` | `text-primary dark:text-sky` | セクション見出し・ステップラベル |
| `HowToUse.tsx` | `text-gray-600 dark:text-slate-400` | `text-steel dark:text-sky/60` | ステップ説明文 |
| `FAQSection.tsx` | `text-gray-900 dark:text-slate-100` | `text-primary dark:text-sky` | FAQ質問文・セクション見出し |
| `FAQSection.tsx` | `text-gray-400 dark:text-slate-500` | `text-steel/60` | シェブロンアイコン |
| `FAQSection.tsx` | `text-gray-600 dark:text-slate-400` | `text-steel dark:text-sky/60` | FAQ回答文 |

---

## エリア C：ToolCard リニューアル

**対象ファイル**: `src/components/ToolCard.tsx`

### カテゴリ別スタイル定義

各カテゴリに対し、以下の2要素をパレット7色のみで定義する。

| カテゴリ | トップボーダーグラデーション | アイコン背景色 | バッジ色 |
|---|---|---|---|
| `text` | `#1D3D5E` → `#b6dcef` | `rgba(182,220,239,0.45)` sky系 | `bg-sky/40 text-primary` |
| `convert` | `#7B9098` → `#cbe0eb` | `rgba(203,224,235,0.6)` sky-soft系 | `bg-sky-soft/80 text-steel` |
| `image` | `#1D3D5E` → `#7B9098` | `rgba(29,61,94,0.1)` primary淡色 | `bg-primary/10 text-primary` |
| `calculate` | `#9D8C56` → `#c8b87a` | `rgba(157,140,86,0.12)` gold系 | `bg-gold/10 text-gold` |
| `lifestyle` | `#b6dcef` → `#f2f5fd` | `rgba(182,220,239,0.3)` sky淡色 | `bg-sky/20 text-steel` |
| `dev` | `#e94d71` → `rgba(233,77,113,0.3)` | `rgba(233,77,113,0.12)` accent系 | `bg-accent/10 text-accent` |

### レイアウト変更

```
変更前:
  border-l-4 border-l-transparent / hover:border-l-accent

変更後:
  position: relative; overflow: hidden;
  ::before: absolute top-0 left-0 right-0 h-[3px]
            background: カテゴリ別グラデーション（上記テーブル）

アイコン:
  変更前: text-3xl（絵文字のみ）
  変更後: w-8 h-8 rounded-lg flex items-center justify-center text-lg
          background: カテゴリ別アイコン背景色

カテゴリバッジ:
  変更前: bg-sky/30 text-primary dark:bg-sky/10 dark:text-sky
  変更後: カテゴリ別バッジ色（上記テーブル）
```

---

## エリア A：ホームページ リニューアル

**対象ファイル**: `src/components/HomepageClient.tsx`

### 1. グラデーションヒーローセクション

**新設コンポーネント**: `HomepageHero`（HomepageClient.tsx 内の関数として定義）

```
背景グラデーション: linear-gradient(135deg, #1D3D5E 0%, #1e5080 45%, #2a7aaa 75%, #b6dcef 100%)
装飾要素:
  - 右上: w-40 h-40 rounded-full bg-sky/18（絶対配置）
  - 左下: w-24 h-24 rounded-full bg-accent/6（絶対配置）

構成要素（上から）:
  1. eyebrow バッジ: "✨ Free Online Tools"
     - bg-sky/20 border border-sky/40 text-sky rounded-full px-3 py-0.5
     - text-[10px] font-semibold tracking-widest uppercase
  2. H1: "いつでも、すぐ使える\n無料ツール集"（ja） / "Always Ready.\nFree Online Tools"（en）
     - text-2xl sm:text-3xl font-extrabold text-white leading-tight
     - "すぐ使える" / "Free Online Tools" 部分: text-sky
  3. 説明文: text-white/60 text-sm
  4. 検索バー: bg-white rounded-full px-4 py-2.5 shadow-xl w-72 max-w-full
     - 虫眼鏡アイコン（text-steel）+ placeholder text-steel/60
  5. 統計バッジ: bg-white/12 border border-white/22 rounded-full px-3 py-0.5 text-white/88
     - 「{tools.length} ツール」「完全無料」「登録不要」/ "Free" "No Sign-up"
```

### 2. カテゴリタブ

```
変更前: rounded-full text-sm px-4 py-1.5
変更後: 同形状を維持しつつアイコン追加

アクティブ: bg-primary text-white shadow-sm（accent → primary に変更）
非アクティブ: 既存と同様

カテゴリアイコンマッピング:
  all: なし / text: 📝 / convert: 🔄 / image: 🖼️ / calculate: 🧮 / lifestyle: 🌿 / dev: 💻
```

### 3. CompactToolCard（おすすめ・最近使ったツール）

変更なし。

### 4. ホームページ文字列（i18n）

**対象ファイル**: `src/messages/ja/common.json`・`src/messages/en/common.json`

```json
"home": {
  ...既存キー維持...,
  "eyebrow": "Free Online Tools",
  "statsTools": "{count} ツール",
  "statsFree": "完全無料",
  "statsNoSignup": "登録不要"
}
```

英語版:
```json
"statsTools": "{count} Tools",
"statsFree": "100% Free",
"statsNoSignup": "No Sign-up"
```

---

## エリア B：ツール個別ページ

**対象ファイル**: `src/app/[locale]/[tool-slug]/page.tsx`・`src/components/HowToUse.tsx`・`src/components/FAQSection.tsx`

### page.tsx の変更

```
H1 クラス:
  変更前: text-gray-900 dark:text-slate-100
  変更後: text-primary dark:text-sky

説明文クラス:
  変更前: text-gray-500 dark:text-slate-400
  変更後: text-steel dark:text-sky/60
```

### HowToUse.tsx の変更

```
セクション見出し（h2）:
  変更前: text-gray-900 dark:text-slate-100
  変更後: text-primary dark:text-sky
  追加: 右側に区切り線（JSX実装）
    <h2 className="... flex items-center gap-3">
      {title}
      <span className="flex-1 h-px bg-sky-soft dark:bg-sky/20" aria-hidden="true" />
    </h2>

ステップラベル（p.font-medium）:
  変更前: text-gray-900 dark:text-slate-100
  変更後: text-primary dark:text-sky

ステップ説明（p.text-sm）:
  変更前: text-gray-600 dark:text-slate-400
  変更後: text-steel dark:text-sky/60
```

### FAQSection.tsx の変更

```
セクション見出し（h2）:
  変更前: text-gray-900 dark:text-slate-100
  変更後: text-primary dark:text-sky
  追加: HowToUse と同様の区切り線（同一JSXパターン: flex items-center gap-3 + span.flex-1.h-px）

質問テキスト:
  変更前: text-gray-900 dark:text-slate-100 hover:text-primary dark:hover:text-blue-400
  変更後: text-primary dark:text-sky hover:text-accent dark:hover:text-accent

シェブロンアイコン:
  変更前: text-gray-400 dark:text-slate-500
  変更後: text-steel/60

回答テキスト:
  変更前: text-gray-600 dark:text-slate-400
  変更後: text-steel dark:text-sky/60
```

---

## 実施順序とコミット戦略

```
Step 1: [スタイル] D — gray-*/slate-* をデザインシステム色に統一
         対象: [tool-slug]/page.tsx, HowToUse.tsx, FAQSection.tsx

Step 2: [スタイル] C — ToolCard カテゴリ別グラデーション・アイコン背景リニューアル
         対象: ToolCard.tsx

Step 3: [改善] A — ホームページ グラデーションヒーロー実装
         対象: HomepageClient.tsx, messages/ja/common.json, messages/en/common.json

Step 4: [改善] B — ツール個別ページ セクション見出し区切り線・色統一
         対象: [tool-slug]/page.tsx (minor), HowToUse.tsx, FAQSection.tsx

各 Step 完了後に npm run build を実行しエラーがないことを確認してコミット。
```

---

## 制約・注意事項

- **外部カラー禁止**: tailwind 組み込みの `blue-*`・`purple-*`・`teal-*` 等は使わない。パレット7色 + white + transparent のみ。
- **インラインスタイル禁止**: グラデーションのみ `style` 属性を使用（Tailwind では任意値が必要なため）。それ以外は Tailwind クラスで完結。
- **ダークモード**: 既存のダークモード CSS（`globals.css`）と干渉しないよう確認する。
- **`npm run build` 必須**: 各 Step 完了後に実行。TypeScript エラーがある場合は即修正。
- **翻訳ハードコード禁止**: eyebrow・stats のテキストは必ず i18n 経由で追加。
