# 便利ツール集

SEOで集客する無料Webツール集サイト。Next.js 14 + TypeScript + Tailwind CSS で構築。

**本番 URL**: https://quicker-app.com（ドメイン設定作業中）  
**旧URL**: https://web-tools-blond-five.vercel.app  
**現在のフェーズ**: 開発・公開フェーズ（収益化前）

---

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # 環境変数を設定
npm run dev                         # http://localhost:3000
```

---

## 登録済みツール（15件）

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
| 13 | `bmi-calculator` | BMI計算ツール | BMI Calculator | calculate |
| 14 | `loan-calculator` | ローン返済シミュレーター | Loan Repayment Calculator | calculate |
| 15 | `pomodoro-timer` | ポモドーロ・集中タイマー | Pomodoro & Focus Timer | lifestyle |

---

## ✅ 次にやること（優先順位順）

### バッチ1 — テキスト系ツール ✅ 完了

- [x] **B1-1** `json-formatter` — JSON整形・バリデーター
- [x] **B1-2** `base64` — Base64エンコード / デコード
- [x] **B1-3** `url-encode` — URLエンコード / デコード
- [x] **B1-4** `case-converter` — 大文字小文字・キャメル・スネーク変換

### バッチ2 — 計算・変換系ツール ✅ 完了

- [x] **B2-1** `unit-converter` — 単位変換（長さ・重量・温度・面積・体積・速度）
- [x] **B2-2** `color-converter` — HEX / RGB / HSL / HSB 変換
- [x] **B2-3** `timestamp-converter` — Unix タイムスタンプ ↔ 日付変換
- [x] **B2-4** `regex-tester` — 正規表現テスター

### バッチ3 — 生活・計算系ツール ✅ 完了

- [x] **B3-1** `age-calculator` — 年齢計算
- [x] **B3-2** `bmi-calculator` — BMI計算
- [x] **B3-3** `loan-calculator` — ローン返済シミュレーター
- [x] **B3-4** `qr-generator` — QRコード生成（qrcode パッケージ使用）
- [x] **B3-5** `password-generator` — パスワード生成（crypto.getRandomValues）
- [x] **B3-6** `pomodoro-timer` — ポモドーロ・集中タイマー（円形プログレス・統計・ブラウザ通知）

### バッチ4 — 開発者向けツール（次フェーズ・最優先）

- [ ] **B4-1** `hash-generator` — SHA-1 / SHA-256 / SHA-512 ハッシュ生成（Web Crypto API で外部ライブラリ不要）
- [ ] **B4-2** `markdown-preview` — Markdownプレビュー（左右ペイン、リアルタイム）
- [ ] **B4-3** `diff-checker` — テキスト差分チェッカー（行単位のdiff表示）

### バッチ5 — 追加候補（B4 完了後に検討）

- [ ] **B5-1** `uuid-generator` — UUID v4 生成（crypto.randomUUID）
- [ ] **B5-2** `lorem-ipsum` — ダミーテキスト生成（日英対応）
- [ ] **B5-3** `number-base-converter` — 2進数 / 8進数 / 10進数 / 16進数 変換
- [ ] **B5-4** `image-resizer` — 画像リサイズ（Canvas API、クライアントサイド完結）

---

## 🐛 既知バグ・未解決の問題

現時点で確認されている既知バグはありません。

> バグを発見したらここに追記する:
> - `[slug] 現象 / 再現手順 / 優先度（高/中/低）`

---

## 🔧 保留中の改善タスク

| 優先度 | タスク | 理由・背景 |
|--------|--------|-----------|
| 高 | Vercel にカスタムドメイン `quicker-app.com` を追加・DNS設定 | Cloudflare DNS → Vercel 接続。`NEXT_PUBLIC_SITE_URL` を `https://quicker-app.com` に更新して再デプロイ |
| 高 | Google Search Console に `quicker-app.com` の新プロパティ登録 | ドメイン型プロパティで作成。CloudflareにTXTレコード追加して認証後、`/sitemap.xml` を再送信 |
| 高 | Google Analytics（GA4）連携 | analytics.google.com でプロパティ作成 → 測定ID（G-XXXXXXXXXX）取得 → Vercel環境変数 `NEXT_PUBLIC_GA_ID` に追加するだけで動く（実装済み） |
| 高 | **B4-1** `hash-generator` の実装 | SHA-256等のハッシュ生成。Web Crypto API で外部パッケージ不要。次回最優先 |
| 中 | **B4-2** `markdown-preview` の実装 | Markdownプレビュー。react-markdown 等のパッケージ追加が必要な点を要検討 |
| 中 | **B4-3** `diff-checker` の実装 | テキスト差分チェッカー。diff ライブラリの追加が必要な点を要検討 |
| 低 | `Header` の検索バーをトップページと連携 | 現状はトップページのみフィルター機能が動作している |
| 低 | OGP 画像（og:image）の追加 | SNS シェア時のサムネ改善 |

### ✅ 完了済み（2026-04-09）
- [x] `pomodoro-timer` 追加（円形タイマー・統計・ブラウザ通知・Web Audio API・スペースキー対応）
- [x] Cloudflare Registrar でのドメイン取得手順書を作成（`cloudflare-domain-setup.txt`）
- [x] `quicker-app.com` を Cloudflare Registrar で購入

### ✅ 完了済み（2026-04-08）
- [x] Vercel デプロイ・本番公開
- [x] `NEXT_PUBLIC_SITE_URL` を正しい本番URLに修正（`web-tools-blond-five.vercel.app`）
- [x] Google Search Console 所有権確認（HTMLファイル方式：`public/googlec6ac4db88b426dc8.html`）
- [x] サイトマップ送信（`/sitemap.xml`、処理待ち）
- [x] Google Search Console 用メタタグを `src/app/[locale]/layout.tsx` に追加

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
