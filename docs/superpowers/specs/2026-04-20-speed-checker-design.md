# Speed Checker 設計仕様書

## 概要

ネットワーク回線速度をビジュアルで体感できるダウンロード速度チェッカー。  
「速いと速く見える、遅いと遅く見える」流体ストリームアニメーションで差別化する。

---

## Section 1: アーキテクチャ

### 計測方式

- **内部APIルート** (`/api/speedtest`) から約 500KB のランダムペイロードを取得し、  
  転送時間を計測して Mbps を算出する
- **5ラウンド**実行し、外れ値を除いた**中央値**を最終結果とする
- キャッシュ回避のため URL に `?r=<random>` クエリを付与
- アップロード計測はなし（ダウンロード専用）

### ファイル構成

| ファイル | 役割 |
|---------|------|
| `src/app/api/speedtest/route.ts` | ランダムペイロード生成（Next.js Route Handler） |
| `src/hooks/useSpeedTest.ts` | 計測ロジック・状態管理 |
| `src/tools/SpeedChecker.tsx` | UIコンポーネント（流体ストリームビジュアル） |
| `src/app/[locale]/speed-checker/page.tsx` | ページラッパー（SEOメタデータ） |
| `src/messages/en/tools/speed-checker.json` | 英語翻訳 |
| `src/messages/ja/tools/speed-checker.json` | 日本語翻訳 |
| `src/lib/toolsRegistry.ts` | ツール登録（1エントリ追加） |

### フック型定義

```typescript
type TestPhase = 'idle' | 'measuring' | 'done';

type SpeedTier = 'slow' | 'standard' | 'fast' | 'ultra';

interface SpeedTestState {
  phase: TestPhase;
  currentMbps: number;      // 計測中のリアルタイム値（最新ラウンドの値）
  finalMbps: number | null; // 全ラウンド完了後の中央値
  round: number;            // 完了ラウンド数（0〜5）
  tier: SpeedTier | null;
  error: string | null;
}

interface UseSpeedTestReturn extends SpeedTestState {
  start: () => void;
  reset: () => void;
}
```

### APIルート仕様

- `GET /api/speedtest?r=<random>` → 500KB のランダムバイト列を返す
- `Cache-Control: no-store` ヘッダー必須
- `Content-Type: application/octet-stream`
- ペイロードサイズ: 512 × 1024 バイト = 524,288 バイト

### 計測アルゴリズム

```
for i in 1..5:
  t0 = performance.now()
  fetch("/api/speedtest?r=" + random())
  await response.arrayBuffer()  // 全バイト受信まで待機
  elapsed = performance.now() - t0  // ミリ秒
  mbps = (524288 * 8) / (elapsed / 1000) / 1_000_000
  rounds.push(mbps)
  state.currentMbps = mbps
  state.round = i

finalMbps = median(rounds)
```

---

## Section 2: ビジュアル設計

### 速度帯・配色

| 帯 | 閾値 | 色 | バッジ |
|----|------|-----|-------|
| 低速 | < 5 Mbps | `#ef4444` (赤) | 🐢 低速 |
| 標準 | 5〜25 Mbps | `#f59e0b` (橙) | 📶 標準 |
| 高速 | 25〜100 Mbps | `#22c55e` (緑) | ✅ 高速 |
| 超高速 | > 100 Mbps | `#06b6d4` (シアン) | ⚡ 超高速 |

### UIの4状態

#### State 1: アイドル
- 📡 アイコン（80px円形、ネイビーグラデーション）
- 「計測開始」ボタン（青→シアングラデーション、pill形状）
- サブテキスト: 「広告なし・アカウント不要 / データは端末内で完結」

#### State 2: 計測中
- リアルタイムMbps数値（大きな青グラデーション文字、タブレット数字）
- 流体ストリームパイプ（速度に比例した速さで流れる光）
- プログレスバー（例: ラウンド 3/5 の進捗）
- 「500KB × 5ラウンド計測中」のサブテキスト

#### State 3a: 結果（高速）
- 大きな緑/シアン数値（グロー付き）
- 速い三重ストリーム（3本のグラデーション帯が高速で流れる）
- 速度帯バッジ（⚡ 超高速 / ✅ 高速）
- 用途ヒント（「4K動画・大容量DL・ゲームも快適」など）
- 「🔁 もう一度」「📤 シェア」ボタン

#### State 3b: 結果（低速）
- 大きな赤数値（グロー付き）
- 水滴アニメーション（遅い単一の水滴がゆっくり流れる）
- 速度帯バッジ（🐢 低速 / 📶 標準）
- 用途ヒント（「SD動画・メール・軽いWebは利用可」など）
- 「🔁 もう一度」「📤 シェア」ボタン

### ストリームアニメーション仕様

流体パイプ（幅220px、高さ36px、pill形状）の中を光の帯が流れる。

```
アニメーション速度 = 速度[Mbps] に比例
- 1 Mbps → animation-duration: 3.0s（ゆっくり）
- 10 Mbps → animation-duration: 1.2s
- 100 Mbps → animation-duration: 0.48s（速い）
- 500 Mbps → animation-duration: 0.2s（超高速、下限）

計算式: duration = max(0.2, 3 / Math.pow(mbps, 0.4)) 秒
```

高速時は3本の光帯を位相をずらして重ねる（0s, 0.1s, 0.2s delay）。  
低速時（<5Mbps）は水滴アニメーション（単一の円が端から端へゆっくり移動）。

### カラーテーマ

背景: `#0f172a`（深ネイビー）  
カード: `#1e293b`  
ボーダー: `#334155`  
計測数値: 速度帯の色でグロー付きテキスト

---

## Section 3: SEO・i18n

### スラッグ

`speed-checker`（URL: `/en/speed-checker` / `/ja/speed-checker`）

### メタデータ（日本語）

- title: `回線速度チェッカー - 無料オンラインツール | Web Tools`
- description: `インターネット回線のダウンロード速度を即座に計測。速さが視覚的にわかる流体アニメーション付き。登録不要・広告なし。`
- keywords: `回線速度, 速度測定, ネット速度, Mbps, スピードテスト, Wi-Fi 速度確認`

### メタデータ（英語）

- title: `Internet Speed Checker - Free Online Tool | Web Tools`
- description: `Check your download speed instantly with a fluid stream animation that visually shows how fast your connection is. No signup, no ads.`
- keywords: `internet speed test, connection speed, Mbps checker, download speed, Wi-Fi speed test`

### 翻訳キー（両言語共通構造）

```json
{
  "title": "...",
  "description": "...",
  "keywords": "...",
  "howToUse": {
    "title": "使い方",
    "steps": [
      "「計測開始」ボタンを押す",
      "5回の計測が自動で実行される（約5〜10秒）",
      "結果画面で回線速度と用途の目安を確認する"
    ]
  },
  "faq": [
    { "q": "...", "a": "..." }
  ],
  "ui": {
    "start": "計測開始",
    "measuring": "計測中...",
    "retry": "もう一度",
    "share": "シェア",
    "roundLabel": "ラウンド {round} / 5",
    "dataNote": "広告なし・アカウント不要\nデータは端末内で完結"
  },
  "tiers": {
    "slow": "低速",
    "standard": "標準",
    "fast": "高速",
    "ultra": "超高速"
  },
  "hints": {
    "slow": "SD動画・メール・軽いWebは利用可",
    "standard": "HD動画・ビデオ通話が快適",
    "fast": "4K動画・大容量ダウンロードも快適",
    "ultra": "4K動画・ゲーム・複数端末同時利用も余裕"
  }
}
```

### FAQ（日本語、最低3問）

1. Q: 計測結果はどのくらい正確ですか？  
   A: 5回計測の中央値を使用するため、単発計測より安定しています。ただしサーバー負荷や時間帯によって変動します。

2. Q: 計測中にデータ通信量は消費されますか？  
   A: 1回の計測で約2.5MB（500KB × 5ラウンド）のデータを使用します。モバイル通信の場合はご注意ください。

3. Q: 一般的なWi-Fiの速度はどのくらいですか？  
   A: 家庭用の光回線（フレッツ光など）は100〜600Mbps、公共Wi-Fiは5〜50Mbps程度が目安です。

4. Q: 他のスピードテストサイトと結果が異なるのはなぜですか？  
   A: 計測に使うサーバーの距離や、計測回数・方式の違いにより数値が変わります。目安としてご活用ください。

5. Q: アップロード速度は計測できますか？  
   A: 現在はダウンロード速度のみ対応しています。

---

## Section 4: 実装メモ

### シェア機能

Web Share API を使用し、フォールバックとしてクリップボードコピー。

```typescript
const shareText = `回線速度: ${finalMbps.toFixed(1)} Mbps（${tierLabel}）\n計測: Web Tools Speed Checker`;
```

### アクセシビリティ

- 計測中は `aria-live="polite"` で数値読み上げ
- ストリームアニメーションは `prefers-reduced-motion` でフェードのみに切り替え

### エラーハンドリング

- ネットワークエラー → エラーメッセージ表示 + 「再試行」ボタン
- タイムアウト（10秒）→ 同上

### 関連ツール

- `src/tools/` 内の他のツールへの内部リンク（最低2つ）を結果画面下部に設置
