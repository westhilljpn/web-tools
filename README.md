# 便利ツール集

SEOで集客する無料Webツール集サイト。Next.js 14 + TypeScript + Tailwind CSS で構築。

**本番 URL**: https://quicker-app.com  
**現在のフェーズ**: 開発・公開フェーズ（収益化前）

---

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # 環境変数を設定
npm run dev                         # http://localhost:3000
```

---

## 登録済みツール（32件）

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
| 16 | `image-converter` | 画像フォーマット変換 | Image Format Converter | image |
| 17 | `images-to-pdf` | 画像→PDF変換 | Images to PDF Converter | convert |
| 18 | `hash-generator` | ハッシュ生成ツール | Hash Generator | dev |
| 19 | `markdown-preview` | Markdownプレビュー | Markdown Preview | dev |
| 20 | `diff-checker` | テキスト差分チェッカー | Text Diff Checker | dev |
| 21 | `uuid-generator` | UUID生成ツール | UUID Generator | dev |
| 22 | `lorem-ipsum` | ダミーテキスト生成 | Lorem Ipsum Generator | text |
| 23 | `number-base-converter` | 進数変換ツール | Number Base Converter | convert |
| 24 | `image-resizer` | 画像リサイズツール | Image Resizer | image |
| 25 | `text-to-slug` | テキスト→スラッグ変換 | Text to Slug Converter | text |
| 26 | `jwt-decoder` | JWTデコーダー | JWT Decoder | dev |
| 27 | `word-counter` | ワードカウンター | Word Counter | text |
| 28 | `percentage-calculator` | パーセント計算ツール | Percentage Calculator | calculate |
| 29 | `color-palette` | カラーパレット生成ツール | Color Palette Generator | image |
| 30 | `cron-parser` | cron式パーサー | Cron Expression Parser | dev |
| 31 | `aspect-ratio` | アスペクト比計算ツール | Aspect Ratio Calculator | calculate |
| 32 | `html-encoder` | HTMLエンティティ エンコード/デコード | HTML Entity Encoder / Decoder | dev |

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

### バッチ4 — ファイル変換ツール ✅ 完了

- [x] **B4-1** `image-converter` — 画像フォーマット変換（PNG/JPG/WebP/BMP/HEIC、一括変換+ZIP）
- [x] **B4-2** `images-to-pdf` — 画像→PDF変換（並び替え・ページサイズ・余白設定、jsPDF）

### バッチ5 — 開発者向けツール ✅ 完了

- [x] **B5-1** `hash-generator` — SHA-1 / SHA-256 / SHA-512 ハッシュ生成（Web Crypto API）
- [x] **B5-2** `markdown-preview` — Markdownプレビュー（左右ペイン・リアルタイム・marked）
- [x] **B5-3** `diff-checker` — テキスト差分チェッカー（LCSアルゴリズム・行番号・変更行フィルター）

### バッチ6 — 追加候補 ✅ 完了

- [x] **B6-1** `uuid-generator` — UUID v4 生成（crypto.randomUUID）
- [x] **B6-2** `lorem-ipsum` — ダミーテキスト生成（日英対応）
- [x] **B6-3** `number-base-converter` — 2進数 / 8進数 / 10進数 / 16進数 変換
- [x] **B6-4** `image-resizer` — 画像リサイズ（Canvas API、クライアントサイド完結）

### バッチ7 — 追加候補 ✅ 完了

- [x] **B7-1** `text-to-slug` — テキスト→URLスラッグ変換（スペース/特殊文字除去・kebab-case化）
- [x] **B7-2** `jwt-decoder` — JWTトークンのデコード・ペイロード表示（Base64デコード、外部パッケージ不要）
- [x] **B7-3** `word-counter` — 英語ワードカウンター（単語/文/段落・読了時間推定）
- [x] **B7-4** `percentage-calculator` — パーセント計算ツール（割合・増減率・逆算）

### バッチ8 — 追加候補 ✅ 完了

- [x] **B8-1** `color-palette` — カラーパレット生成（補色・類似色・三色・分裂補色・ティント/シェード）
- [x] **B8-2** `cron-parser` — cron式パーサー（次回実行時刻10件・人間向け説明・プリセット8種）
- [x] **B8-3** `aspect-ratio` — アスペクト比計算（比率算出・サイズ計算・黄金比参考）
- [x] **B8-4** `html-encoder` — HTML エンティティエンコード/デコード（特殊文字/全文字2モード）

### バッチ9 — 次回ツール追加候補

- [ ] **B9-1** `ip-lookup` — IPアドレス情報取得
- [ ] **B9-2** `text-diff` — テキスト比較（単語レベル差分）
- [ ] **B9-3** `css-minifier` — CSS圧縮ツール
- [ ] **B9-4** `svg-optimizer` — SVG最適化ツール

---

## 🐛 既知バグ・未解決の問題

現時点で確認されている既知バグはありません。

> バグを発見したらここに追記する:
> - `[slug] 現象 / 再現手順 / 優先度（高/中/低）`

---

## 🔧 保留中の改善タスク

| 優先度 | タスク | 理由・背景 |
|--------|--------|-----------|
| 低 | サイトマップの `lastmod` 動的更新 | 現状は `toolsRegistry.ts` の `updatedAt` 固定値。ツール更新時に手動更新が必要 |

### ✅ 完了済み（2026-04-11）
- [x] `color-palette` 追加（HEX入力・カラーピッカー・補色/類似色/三色/分裂補色・ティント/シェード4段階・HEX/RGB/HSLコピー）
- [x] `cron-parser` 追加（5フィールドパース・次回実行10件・人間向け説明・DOM/DOW OR条件・プリセット8種）
- [x] `aspect-ratio` 追加（寸法→比率モード・比率+片辺→寸法モード・黄金比参考）
- [x] `html-encoder` 追加（特殊文字エンコード/全文字エンコード/デコード・swap機能）
- [x] `text-to-slug` 追加（テキスト→URLスラッグ・ハイフン/アンダースコア・アクセント文字変換）
- [x] `jwt-decoder` 追加（Base64url デコード・ヘッダー/ペイロード/署名・有効期限ステータス色分け）
- [x] `word-counter` 追加（単語/文字/文/段落・読了時間・スピーチ時間・頻出単語 TOP5）
- [x] `percentage-calculator` 追加（基本%・何%か・増減率・逆算の4モード）
- [x] Header 検索バーをトップページと連携（ホームページでは debounce リアルタイム更新・他ページは Enter で遷移）
- [x] OGP 画像（og:image）追加（`/og` Edge Route・ツール名＋絵文字アイコンで 1200×630px 動的生成）
- [x] `uuid-generator` 追加（UUID v4・件数一括生成・大文字/ハイフントグル・crypto.randomUUID）
- [x] `lorem-ipsum` 追加（段落/文/単語・ラテン語/日本語・startWithLoremオプション）
- [x] `number-base-converter` 追加（2/8/10/16進数リアルタイム変換・負数対応）
- [x] `image-resizer` 追加（Canvas API・アスペクト比維持・PNG/JPG/WebP出力・品質調整）
- [x] `hash-generator` 追加（SHA-1/SHA-256/SHA-512・Web Crypto API・大文字小文字切り替え）
- [x] `markdown-preview` 追加（2ペインリアルタイムプレビュー・marked・グローバルCSSスタイル）
- [x] `diff-checker` 追加（LCSアルゴリズム・行番号表示・変更行フィルター・入れ替えボタン）
- [x] `image-converter` 追加（PNG/JPG/WebP/BMP/HEIC 相互変換・一括変換・ZIP DL・heic2any）
- [x] `images-to-pdf` 追加（複数画像→PDF・並び替え・A4/レター/元サイズ・余白設定・jsPDF）
- [x] お問い合わせ先を `westhilljpn@gmail.com` に変更（Footer・プライバシーポリシー・利用規約）
- [x] 関連ツールリンクの言語バグ修正（`/ja/` ページから `/en/` に飛ばされる問題）— `setRequestLocale` 追加 + `Link` コンポーネントに `locale` 明示

### ✅ 完了済み（2026-04-10）
- [x] Vercel カスタムドメイン `quicker-app.com` 接続・`NEXT_PUBLIC_SITE_URL` 更新
- [x] Google Search Console: `quicker-app.com` ドメイン型プロパティ登録・認証・サイトマップ送信
- [x] Google Analytics（GA4）: プロパティ作成・`NEXT_PUBLIC_GA_ID` を Vercel 環境変数に設定
- [x] 言語切替が画面遷移のたびに英語にリセットされるバグを修正（`localeCookie: true` を routing.ts に追加）
- [x] `NextIntlClientProvider` に `locale` を明示的に渡すよう修正（layout.tsx）
- [x] `pomodoro-timer` の翻訳が `request.ts` に未登録だったバグを修正
- [x] `pomodoro-timer` UI 全面再設計（フェーズ別カラーカード・円形プレイボタン・+/−スピナー・トグルスイッチ）

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
