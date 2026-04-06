# 便利ツール集

SEOで集客する無料Webツール集サイト。Next.js 14 + TypeScript + Tailwind CSS で構築。

**本番 URL**: https://example.com（デプロイ後に更新）
**現在のフェーズ**: 開発・公開フェーズ（収益化前）

---

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # 環境変数を設定
npm run dev                         # http://localhost:3000
```

---

## 登録済みツール（12件）

| # | slug | タイトル（ja） | タイトル（en） | カテゴリ |
|---|------|----------------|----------------|----------|
| 1 | `text-counter` | 文字数カウンター | Character Counter | text |
| 2 | `json-formatter` | JSON整形・バリデーター | JSON Formatter / Validator | text |
| 3 | `base64` | Base64 エンコード / デコード | Base64 Encoder / Decoder | text |
| 4 | `url-encode` | URLエンコード / デコード | URL Encoder / Decoder | text |
| 5 | `case-converter` | 大文字・小文字変換ツール | Case Converter | text |
| 6 | `qr-generator` | QRコード生成ツール | QR Code Generator | image |
| 7 | `color-converter` | カラーコード変換ツール | Color Code Converter | convert |
| 8 | `password-generator` | パスワード生成ツール | Password Generator | lifestyle |
| 9 | `timestamp-converter` | Unixタイムスタンプ変換ツール | Unix Timestamp Converter | convert |
| 10 | `unit-converter` | 単位変換ツール | Unit Converter | convert |
| 11 | `regex-tester` | 正規表現テスター | Regex Tester | dev |
| 12 | `age-calculator` | 年齢計算ツール | Age Calculator | calculate |

---

## ✅ 次にやること（優先順位順）

### バッチ1 — テキスト系ツール（最優先）

> SEO流入が見込めるシンプルなテキスト処理ツールを先に揃える

- [x] **B1-1** `json-formatter` — JSON整形・バリデーター
- [x] **B1-2** `base64` — Base64エンコード / デコード
- [x] **B1-3** `url-encode` — URLエンコード / デコード
- [x] **B1-4** `case-converter` — 大文字小文字・キャメル・スネーク変換

### バッチ2 — 計算・変換系ツール

- [x] **B2-1** `unit-converter` — 単位変換（長さ・重量・温度・面積・体積・速度）
- [x] **B2-2** `color-converter` — HEX / RGB / HSL / HSB 変換
- [x] **B2-3** `timestamp-converter` — Unix タイムスタンプ ↔ 日付変換
- [x] **B2-4** `regex-tester` — 正規表現テスター

### バッチ3 — 生活・計算系ツール

- [x] **B3-1** `age-calculator` — 年齢計算
- [ ] **B3-2** `bmi-calculator` — BMI計算
- [ ] **B3-3** `loan-calculator` — ローン返済シミュレーター
- [x] **B3-4** `qr-generator` — QRコード生成（qrcode パッケージ使用）
- [x] **B3-5** `password-generator` — パスワード生成（crypto.getRandomValues）

### バッチ4 — 開発者向けツール（次フェーズ候補）

- [ ] **B4-1** `hash-generator` — MD5 / SHA-1 / SHA-256 ハッシュ生成
- [ ] **B4-2** `markdown-preview` — Markdownプレビュー
- [ ] **B4-3** `diff-checker` — テキスト差分チェッカー

---

## 🐛 既知バグ・未解決の問題

現時点で確認されている既知バグはありません。

> バグを発見したらここに追記する:
> - `[slug] 現象 / 再現手順 / 優先度（高/中/低）`

---

## 🔧 保留中の改善タスク

| 優先度 | タスク | 理由・背景 |
|--------|--------|-----------|
| 高 | Vercel デプロイ + `NEXT_PUBLIC_SITE_URL` 本番URL設定 | サイトを公開しないとSEO効果ゼロ。手順は `deploy-guide.txt` 参照 |
| 高 | B3-2 `bmi-calculator` の実装 | バッチ3 残り2件のうち優先度高 |
| 高 | B3-3 `loan-calculator` の実装 | バッチ3 残り2件のうち優先度高 |
| 中 | Google Analytics 連携 | `.env.local` の `NEXT_PUBLIC_GA_ID` に ID を設定するだけで動く状態にする |
| 低 | `Header` の検索バーをトップページと連携 | 現状はトップページのみフィルター機能が動作している |
| 低 | OGP 画像（og:image）の追加 | SNS シェア時のサムネ改善 |

---

## ツール追加手順（クイックリファレンス）

1. `src/tools/[ToolName].tsx` を作成（`useTranslations('[slug]')` で翻訳を参照）
2. `src/lib/toolsRegistry.ts` にエントリを追加
3. `src/lib/toolComponents.tsx` にコンポーネントをマップ（dynamic import）
4. `src/messages/en/tools/[slug].json` を作成（英語翻訳）
5. `src/messages/ja/tools/[slug].json` を作成（日本語翻訳）
6. CLAUDE.md の12項目チェックリストを確認
7. `npm run build` が通ることを確認

---

## 技術スタック

| 項目 | 採用技術 |
|------|----------|
| フレームワーク | Next.js 14（App Router） |
| 言語 | TypeScript（strict mode） |
| スタイリング | Tailwind CSS |
| 国際化（i18n） | next-intl 4.x |
| ホスティング | Vercel（無料枠） |

詳細なルール・方針は [CLAUDE.md](./CLAUDE.md) を参照。
