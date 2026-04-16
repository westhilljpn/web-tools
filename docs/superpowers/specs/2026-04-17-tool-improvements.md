# ツール改善・追加 実装仕様書

- **日付**: 2026-04-17
- **対象**: 既存ツール改善3件 + 新規ツール追加2件（優先度上位5件）
- **ブランチ**: main

---

## 背景・分析サマリー

52ツールの精査により以下を特定：
- `lifestyle` カテゴリが最も手薄（2ツールのみ）
- `GachaCalculator`・`ReadingTime` はコピーボタンが未実装で統一性が壊れている
- `HashGenerator` は MD5 が欠けており検索需要を取り逃している
- 「日付差計算」「カロリー計算」は高検索ボリュームで未カバー

---

## プロジェクト共通コンテキスト

- **フレームワーク**: Next.js 14 App Router / TypeScript strict / Tailwind CSS
- **i18n**: next-intl 4.x（`useTranslations` / `getTranslations`）
- **カラートークン**: primary=#1D3D5E, accent=#e94d71, sky=#b6dcef, sky-soft=#cbe0eb, surface=#f2f5fd, steel=#7B9098, gold=#9D8C56
- **コピーパターン**: `useState<boolean>` + `navigator.clipboard.writeText` + 2秒後リセット
- **ビルド確認**: 各タスク後 `npm run build` 必須

### 新規ツール追加時の必須ファイル

1. `src/tools/[ComponentName].tsx` — ツール本体
2. `src/messages/ja/tools/[slug].json` — 日本語翻訳
3. `src/messages/en/tools/[slug].json` — 英語翻訳
4. `src/lib/toolsRegistry.ts` — ツール情報追記
5. `src/i18n/request.ts` — メッセージimport追加（末尾の Promise.all 2箇所に追加）

### toolsRegistry.ts の追記パターン

```typescript
{
  slug: "tool-slug",
  category: "calculate",  // or lifestyle/text/dev/convert/image
  icon: "🗓️",
  component: "ComponentName",
  updatedAt: "2026-04-17",
},
```

### request.ts のメッセージimport追記パターン

`src/i18n/request.ts` の `Promise.all` 2箇所（ja版・en版）それぞれに追加：
```typescript
import("../messages/ja/tools/tool-slug.json"),
// → 変数名 toolSlug として受け取る
```
そして `return { messages: { ... "tool-slug": toolSlug.default } }` に追加。

---

## Task 1: GachaCalculator — コピーボタン追加・スライダー上限拡張

**対象ファイル**: `src/tools/GachaCalculator.tsx`

### 変更仕様

**① メイン結果にコピーボタンを追加**

現在の「超大型フォント結果表示」エリア（`text-6xl` などで確率%を表示している箇所）の右上または下に、コピーボタンを追加する。

コピーする内容: `${probability.toFixed(2)}%`（表示されているパーセント値）

コピーボタン実装パターン（他ツールと統一）：
```tsx
const [copied, setCopied] = useState(false);

function handleCopy() {
  navigator.clipboard.writeText(`${result.toFixed(2)}%`);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

// JSX
<button onClick={handleCopy} className="...">
  {copied ? "Copied!" : "Copy"}
</button>
```

**② スライダーの上限を拡張**

| パラメータ | 変更前 | 変更後 |
|---|---|---|
| 確率スライダー max | 50 | 99 |
| 試行回数スライダー max | 500 | 1000 |

数値入力フィールドの `max` 属性も同様に変更する。

### コミット
```
[改善] GachaCalculator: コピーボタン追加・スライダー上限拡張
```

---

## Task 2: ReadingTime — 統計値コピーボタン追加

**対象ファイル**: `src/tools/ReadingTime.tsx`

### 変更仕様

現在4つの統計カード（文字数・単語数・文数・段落数）があり、それぞれの値をコピーできない。

各カードに小さなコピーボタンを追加する。コピーボタンは個別状態管理（コピーされたカードだけ "Copied!" 表示）。

実装パターン：
```tsx
const [copiedKey, setCopiedKey] = useState<string | null>(null);

function handleCopy(key: string, value: string | number) {
  navigator.clipboard.writeText(String(value));
  setCopiedKey(key);
  setTimeout(() => setCopiedKey(null), 2000);
}

// 各カード
<button onClick={() => handleCopy("chars", charCount)} className="...">
  {copiedKey === "chars" ? "Copied!" : "Copy"}
</button>
```

コピーボタンはカードの右上（`absolute top-1 right-1` または `flex justify-between` レイアウト）に配置。

### コミット
```
[改善] ReadingTime: 統計値カードにコピーボタン追加
```

---

## Task 3: HashGenerator — MD5 追加

**対象ファイル**:
- `src/tools/HashGenerator.tsx`
- `src/lib/md5.ts`（新規作成）

### 変更仕様

**① `src/lib/md5.ts` を新規作成**

Web Crypto API は MD5 非対応のため、純粋 TypeScript で実装する。
以下の関数をエクスポートする：

```typescript
/**
 * MD5 ハッシュを計算する（純粋 TypeScript 実装）
 * セキュリティ目的ではなくチェックサム用途のみ推奨
 */
export function md5(input: string): string { ... }
```

実装は RFC 1321 準拠の標準的な MD5 アルゴリズム。
Uint8Array でバイト処理し、16進数文字列を返す。

**② HashGenerator.tsx に MD5 行を追加**

既存の SHA-1 / SHA-256 / SHA-512 の出力ブロックの**前**（先頭）に MD5 を追加。

MD5 は同期計算（`md5(text)` を直接呼ぶ）。
SHA はすでに非同期（`crypto.subtle.digest`）なので、MD5 は別途 `useEffect` 内で `md5(text)` を呼んで state に保存する。

出力ブロックに注意書きを添える：
- ja: `チェックサム目的のみ。セキュリティ用途には使用しないでください。`
- en: `For checksum purposes only. Do not use for security.`

### コミット
```
[改善] HashGenerator: MD5 ハッシュを追加（純粋TS実装）
```

---

## Task 4: 日付差計算機 — 新規ツール追加

**slug**: `date-calculator`
**カテゴリ**: `calculate`
**アイコン**: `🗓️`
**コンポーネント名**: `DateCalculator`

### 機能仕様

2つの日付（開始日・終了日）を入力し、差分を複数単位で表示する。

**入力**:
- 開始日（date input）・今日ボタン付き
- 終了日（date input）・今日ボタン付き

**出力**（4つの結果カード）:
- 総日数（例: 365日）
- 週数と余り日数（例: 52週 1日）
- 月数と余り日数（例: 12ヶ月 0日）
- 年数と余り日数（例: 1年 0日）

**挙動**:
- 両日付が入力済みの場合にリアルタイム計算
- 開始日 > 終了日の場合は絶対値で計算（またはエラー表示）
- 各結果カードにコピーボタン

**UI レイアウト**:
```
[開始日 input] [今日] → [終了日 input] [今日]
─────────────────────────────────
[ 365日 📋 ] [ 52週 1日 📋 ]
[ 12ヶ月 0日 📋 ] [ 1年 0日 📋 ]
```

### 翻訳ファイル（ja）

```json
{
  "title": "日付差計算機",
  "description": "2つの日付の差を日数・週数・月数・年数で計算します。プロジェクト期間・記念日・期限管理に。",
  "keywords": ["日付 計算", "日数 計算", "何日後", "期間 計算", "日付差"],
  "howToUse": {
    "title": "使い方",
    "steps": [
      { "title": "開始日を入力", "description": "計算の起点となる日付を入力します。「今日」ボタンで本日の日付をすぐに入力できます。" },
      { "title": "終了日を入力", "description": "計算の終点となる日付を入力します。" },
      { "title": "結果を確認", "description": "日数・週数・月数・年数が自動で表示されます。各値はコピーボタンで取得できます。" }
    ]
  },
  "faq": {
    "title": "よくある質問",
    "items": [
      { "question": "今日から〇日後の日付を知りたい場合は？", "answer": "開始日に「今日」を選択し、終了日に目標日を入力すると日数差がわかります。逆に終了日に目標日数から逆算した日付を入力すれば到達日も確認できます。" },
      { "question": "月数・年数の計算方法は？", "answer": "月数は暦月ベースで計算します（30日 = 1ヶ月ではありません）。例えば1月1日〜3月31日は2ヶ月30日です。" },
      { "question": "終了日が開始日より前でも使えますか？", "answer": "はい。日数の絶対値を計算しますので、過去の日付を開始日にしても正しく計算されます。" },
      { "question": "プロジェクト管理や納期計算に使えますか？", "answer": "はい。開始日・終了日を設定するだけで期間が瞬時に計算されます。週数表示もあるため、スプリント計画にも便利です。" }
    ]
  }
}
```

### 翻訳ファイル（en）

```json
{
  "title": "Date Difference Calculator",
  "description": "Calculate the difference between two dates in days, weeks, months, and years. Perfect for project planning, anniversaries, and deadline tracking.",
  "keywords": ["date calculator", "days between dates", "date difference", "how many days", "date counter"],
  "howToUse": {
    "title": "How to Use",
    "steps": [
      { "title": "Enter start date", "description": "Enter the starting date. Click 'Today' to quickly fill in today's date." },
      { "title": "Enter end date", "description": "Enter the ending date." },
      { "title": "View results", "description": "The difference in days, weeks, months, and years is calculated automatically. Use the copy buttons to grab any value." }
    ]
  },
  "faq": {
    "title": "FAQ",
    "items": [
      { "question": "How do I find a date X days from now?", "answer": "Set the start date to today using the 'Today' button, then enter your target date as the end date to see the number of days between them." },
      { "question": "How are months and years calculated?", "answer": "Months and years are calculated on a calendar basis, not by fixed day counts. For example, Jan 1 to Mar 31 is 2 months and 30 days." },
      { "question": "Can I use dates in the past?", "answer": "Yes. The calculator always returns the absolute difference, so you can enter dates in any order." },
      { "question": "Is this useful for project management?", "answer": "Absolutely. Use it to calculate sprint lengths, project durations, or deadline countdowns. The week display is especially useful for sprint planning." }
    ]
  }
}
```

### コミット
```
[ツール追加] date-calculator: 日付差計算機
```

---

## Task 5: カロリー計算機 — 新規ツール追加

**slug**: `calorie-calculator`
**カテゴリ**: `lifestyle`
**アイコン**: `🔥`
**コンポーネント名**: `CalorieCalculator`

### 機能仕様

Mifflin-St Jeor 式を使用して基礎代謝（BMR）と1日必要カロリーを計算する。

**入力**:
- 性別（男性 / 女性）
- 年齢（歳）
- 身長（cm）
- 体重（kg）
- 活動レベル（5段階選択）:
  - ほぼ動かない（×1.2）
  - 軽い運動（週1〜3日）（×1.375）
  - 中程度の運動（週3〜5日）（×1.55）
  - 激しい運動（週6〜7日）（×1.725）
  - 非常に激しい運動 / 肉体労働（×1.9）

**計算式（Mifflin-St Jeor）**:
```
男性 BMR = 10 × 体重(kg) + 6.25 × 身長(cm) − 5 × 年齢 + 5
女性 BMR = 10 × 体重(kg) + 6.25 × 身長(cm) − 5 × 年齢 − 161
TDEE = BMR × 活動係数
```

**出力**（3つの結果カード + 目標別カロリー）:
- 基礎代謝（BMR）: XXX kcal
- 1日必要カロリー（TDEE）: XXX kcal
- 目標別カロリー表:
  - 減量（−500 kcal）: TDEE - 500
  - 維持（±0）: TDEE
  - 増量（+500 kcal）: TDEE + 500

**UI レイアウト**:
```
[男性 | 女性]  年齢: [  ]歳  身長: [  ]cm  体重: [  ]kg
活動レベル: [セレクト]
─────────────────────────────────
[ 基礎代謝 1,650 kcal 📋 ] [ 必要カロリー 2,558 kcal 📋 ]
        減量: 2,058  維持: 2,558  増量: 3,058
```

注意書き: 「この計算は目安です。医療・栄養指導の代替ではありません。」

### 翻訳ファイル（ja）

```json
{
  "title": "カロリー計算機",
  "description": "基礎代謝（BMR）と1日の必要カロリー（TDEE）を計算します。Mifflin-St Jeor式を使用。ダイエット・増量・維持カロリーの目安に。",
  "keywords": ["カロリー 計算", "基礎代謝 計算", "TDEE 計算", "ダイエット カロリー", "必要カロリー"],
  "howToUse": {
    "title": "使い方",
    "steps": [
      { "title": "基本情報を入力", "description": "性別・年齢・身長・体重を入力します。" },
      { "title": "活動レベルを選択", "description": "日常の運動量に近いレベルを選択します。迷ったら「軽い運動」から始めてみてください。" },
      { "title": "結果を確認", "description": "基礎代謝と1日の必要カロリーが表示されます。目標に応じて減量・維持・増量のカロリー目安も確認できます。" }
    ]
  },
  "faq": {
    "title": "よくある質問",
    "items": [
      { "question": "基礎代謝（BMR）とは何ですか？", "answer": "何もせず安静にしているだけで消費されるカロリーです。呼吸・体温維持・臓器の動きなど生命維持に必要な最低限のエネルギー量です。" },
      { "question": "Mifflin-St Jeor式とは？", "answer": "1990年に開発された基礎代謝の計算式で、現在最も精度が高いとされています。Harris-Benedict式より新しく、研究による検証も多数あります。" },
      { "question": "活動レベルはどれを選べばよいですか？", "answer": "デスクワーク中心で運動習慣がない方は「ほぼ動かない」、週2〜3回の軽い運動をする方は「軽い運動」が目安です。実際の体重変化を見ながら調整してください。" },
      { "question": "計算結果はどのくらい正確ですか？", "answer": "あくまで統計式による推定値です。個人差・体組成・健康状態によって実際の必要カロリーは異なります。医療・栄養指導の代替にはなりません。" },
      { "question": "ダイエット中の目標カロリーは？", "answer": "一般的に1日500kcal の減少（週あたり約0.5kgの減量ペース）が無理のない範囲とされています。急激な制限は基礎代謝を下げる可能性があります。" }
    ]
  }
}
```

### 翻訳ファイル（en）

```json
{
  "title": "Calorie Calculator",
  "description": "Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor formula. Find your target calories for weight loss, maintenance, or gain.",
  "keywords": ["calorie calculator", "BMR calculator", "TDEE calculator", "daily calorie needs", "weight loss calories"],
  "howToUse": {
    "title": "How to Use",
    "steps": [
      { "title": "Enter your details", "description": "Input your gender, age, height, and weight." },
      { "title": "Select activity level", "description": "Choose the option that best matches your typical weekly activity. When in doubt, start with 'Light exercise'." },
      { "title": "View your results", "description": "Your BMR and daily calorie needs (TDEE) are calculated instantly. Use the target section to see calories for weight loss, maintenance, or gain." }
    ]
  },
  "faq": {
    "title": "FAQ",
    "items": [
      { "question": "What is BMR (Basal Metabolic Rate)?", "answer": "BMR is the number of calories your body burns at complete rest — just to keep you alive. It accounts for breathing, circulation, cell production, and other basic functions." },
      { "question": "What is the Mifflin-St Jeor formula?", "answer": "Developed in 1990, the Mifflin-St Jeor equation is considered the most accurate BMR formula for most people. It has been validated by multiple studies and is preferred over the older Harris-Benedict formula." },
      { "question": "Which activity level should I choose?", "answer": "Choose 'Sedentary' for desk jobs with no exercise, 'Light exercise' for 1-3 days of exercise per week, and 'Moderate exercise' for 3-5 days. Adjust based on your actual weight changes." },
      { "question": "How accurate are these results?", "answer": "The results are estimates based on population averages. Individual factors such as body composition, genetics, and health conditions affect actual calorie needs. This tool is not a substitute for medical or nutritional advice." },
      { "question": "How many calories should I cut to lose weight?", "answer": "A deficit of 500 kcal per day typically leads to about 0.5 kg (1 lb) of weight loss per week, which is generally considered a sustainable rate. Avoid extreme deficits as they can lower your metabolism." }
    ]
  }
}
```

### コミット
```
[ツール追加] calorie-calculator: カロリー計算機
```

---

## 実施順序

1. Task 1: GachaCalculator 改善（小規模・1ファイル）
2. Task 2: ReadingTime 改善（小規模・1ファイル）
3. Task 3: HashGenerator MD5追加（中規模・2ファイル）
4. Task 4: date-calculator 新規追加（中規模・5ファイル）
5. Task 5: calorie-calculator 新規追加（中規模・5ファイル）
