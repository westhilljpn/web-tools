# 便利ツール集

SEOで集客する無料Webツール集サイト。Next.js 14 + TypeScript + Tailwind CSS で構築。

**本番 URL**: https://www.quicker-app.com  
**現在のフェーズ**: 成長フェーズ（集客強化中） — ツール追加 / 既存改善 / マーケティングを並行

---

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # 環境変数を設定
npm run dev                         # http://localhost:3000
```

---

## 登録済みツール（52件）

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
| 33 | `css-gradient-generator` | CSSグラデーション生成ツール | CSS Gradient Generator | image |
| 34 | `json-csv-converter` | JSON ↔ CSV 変換ツール | JSON ↔ CSV Converter | convert |
| 35 | `sql-formatter` | SQL整形ツール | SQL Formatter | dev |
| 36 | `unicode-font-generator` | Unicodeフォントジェネレーター | Unicode Font Generator | text |
| 37 | `text-repeater` | テキスト繰り返し生成 | Text Repeater | text |
| 38 | `markdown-table-generator` | Markdownテーブル生成 | Markdown Table Generator | dev |
| 39 | `code-minifier` | コードミニファイア | Code Minifier | dev |
| 40 | `ip-info` | IPアドレス確認ツール | IP Address Info | dev |
| 41 | `paper-size` | 用紙サイズ一覧 | Paper Size Reference | calculate |
| 42 | `gacha-calculator` | ガチャ確率計算機 | Gacha Probability Calculator | calculate |
| 43 | `investment-calculator` | 積立投資シミュレーター | Compound Investment Calculator | calculate |
| 44 | `mojibake-fixer` | 文字化け修復ツール | Mojibake / Encoding Fixer | text |
| 45 | `text-sorter` | テキスト行並び替えツール | Text Line Sorter | text |
| 46 | `roman-numerals` | ローマ数字変換ツール | Roman Numeral Converter | convert |
| 47 | `html-to-markdown` | HTML → Markdown変換ツール | HTML to Markdown Converter | text |
| 48 | `image-compressor` | 画像圧縮ツール | Image Compressor | image |
| 49 | `morse-code` | モールス信号変換ツール | Morse Code Translator | convert |
| 50 | `color-mixer` | カラーミキサー | Color Mixer | image |
| 51 | `tax-calculator` | 消費税計算ツール | Consumption Tax Calculator | calculate |
| 52 | `reading-time` | 読了時間計算ツール | Reading Time Calculator | text |

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

### サイト改善 — ダークモード ✅ 完了

- [x] **DM** ダークモード実装（Tailwind `class` モード・ThemeToggle・FOIT防止・globals.css上書きで全36ツール対応）

### バッチ9 ✅ 完了

- [x] **B9-1** `css-gradient-generator` — linear/radial/conic・カラーストップUI・プレビュー・CSSコードコピー・プリセット6種
- [x] **B9-2** `json-csv-converter` — JSON↔CSV 2カラムUI・スワップ機能・RFC 4180準拠CSV解析
- [x] **B9-3** `sql-formatter` — 外部パッケージなし・トークナイザー実装・キーワード大文字化・インデントオプション
- [x] **修正** `cron-parser` — `buildDescription()` が英語固定だったのを `useLocale()` で i18n 対応
- [x] **B9-4** `unicode-font-generator` — Bold/Italic/Script/Fraktur/Double-Struck 等 12スタイル・Unicodeコードポイント演算

### バッチ10 ✅ 完了

- [x] **B10-1** `text-repeater` — テキスト繰り返し生成（繰り返し回数・区切り文字設定）
- [x] **B10-2** `markdown-table-generator` — Markdownテーブル生成（行列入力・コピー）
- [x] **B10-3** `code-minifier` — JS/CSS/HTMLミニファイア（外部パッケージなし・正規表現ベース）
- [x] **B10-4** `ip-info` — ローカルIPアドレス表示（外部API不要・WebRTC or navigator）

> ⚠️ `ip-lookup`（外部IP検索）は外部API必須のため除外（CLAUDE.md：外部API呼び出し禁止）

### バッチ11 ✅ 完了

- [x] **B11-1** `paper-size` — 用紙サイズ一覧（A/B/JIS-B/US/写真サイズ・mm/cm/inch切替）
- [x] **B11-2** `gacha-calculator` — ガチャ確率計算機（確率テーブル・天井回数逆算）
- [x] **B11-3** `investment-calculator` — 積立投資シミュレーター（複利計算・CSSバーチャート）
- [x] **B11-4** `mojibake-fixer` — 文字化け修復ツール（Win1252/Latin-1→UTF-8/Shift_JIS/EUC-JP・TextDecoder API）

### サイト改善 ✅ 完了（2026-04-12）

- [x] サイト名を **Quicker** に変更（`site.name` en/ja common.json）
- [x] **おすすめツール機能** — `featured?: boolean` フラグ・`getFeaturedTools()`・ホームに横スクロールセクション
- [x] **最近使ったツール機能** — `RecentTracker` コンポーネント（localStorage）・ホームに横スクロールセクション
- [x] `scrollbar-hide` ユーティリティを globals.css に追加
- [x] ShareButtons 追加（X/LINE/はてブ/URLコピー・全ツールページに配置）
- [x] Lighthouse 改善（Google Fonts @import → `<link>` タグ・GA lazyOnload・viewport export・FAQPage重複JSON-LD削除・ARIA属性）
- [x] ヘッダー検索バーをスマホで非表示（`hidden sm:block`）

### バッチ12 ✅ 完了

- [x] **B12-1** `text-sorter` — テキスト行並び替えツール（昇順/降順/ランダム・重複削除・空行削除）
- [x] **B12-2** `image-compressor` — 画像圧縮ツール（Canvas API・品質スライダー・圧縮率表示）
- [x] **B12-3** `html-to-markdown` — HTML→Markdown変換（DOMParser・再帰ツリー変換・GFMテーブル対応）
- [x] **B12-4** `roman-numerals` — ローマ数字変換（算用数字↔ローマ数字・内訳表示）

### コンテンツ改善 ✅ 完了（2026-04-12）

- [x] `text-counter` FAQ書き直し — 検索クエリ起点（X/Twitter・Word違い・履歴書・バイト数・SEO meta description）
- [x] `json-formatter` FAQ書き直し — 検索クエリ起点（1行展開・エラー修正・APIレスポンス・JSONとは・JSONC/JSON5）

### サイト改善 — デザインリファクタリング ✅ 完了（2026-04-12）

参考: [awesome-design-md-jp](https://github.com/kzhrknt/awesome-design-md-jp) / [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)（Notion・Linear・Vercel・Raycast の DESIGN.md）

- [x] **D1** 日本語タイポグラフィ（awesome-design-md-jp 準拠）: フォントスタック拡充・`line-height: 1.8`・`letter-spacing: 0.04em`・`word-break: auto-phrase`・OpenType `palt/kern`
- [x] **D2** カードのシャドウ as ボーダー + 3層シャドウスタック（Vercel/Notion 準拠）: `border` 廃止 → `box-shadow: 0 0 0 1px rgba(0,0,0,0.08), ...`
- [x] **D3** ダークモードのボーダーを半透明ホワイトに統一（Linear/Raycast 準拠）: `rgba(255,255,255,0.08〜0.12)`
- [x] **D4** FAQSection: `▼` テキスト → SVG シェブロン + `max-height` CSS トランジション
- [x] **D5** ToolCard: 左ボーダーアクセント（`hover:border-l-primary`）+ 背景色ホバー演出
- [x] **D6** Header: スクロール量を検知して `shadow-md` を動的付与
- [x] **D7** ボタン: `min-h-[44px]`（WCAG AA タッチターゲット）+ `hover:scale(1.02)` / `active:scale(0.97)` アニメーション
- [x] **D8** 見出しに `tracking-tight` 追加（`h1` text-2xl 以上・`h2` text-xl 以上）
- [x] **D9** `:focus-visible` グローバル統一（2px primary outline・ダークモードは blue-400）

### バッチ13 ✅ 完了（2026-04-14）

- [x] **B13-1** `morse-code` — モールス信号変換（テキスト↔モールス・Web Audio API音声再生・WPMスライダー・一覧表）
- [x] **B13-2** `color-mixer` — カラーミキサー（線形RGB混合・5段階グラデーションプレビュー・HEX/RGBコピー）
- [x] **B13-3** `tax-calculator` — 消費税計算ツール（税抜→税込 / 税込→税抜 / 消費税額逆算・10%/8%切替）
- [x] **B13-4** `reading-time` — 読了時間計算ツール（文字数・単語数・文数・段落数・日英WPMカスタム設定）

### バッチ14 — 次回ツール追加候補（優先度順）

- [ ] **B14-1** `character-counter-jp` — 原稿用紙換算ツール（文字数→400字詰め枚数・X/Twitter文字数・履歴書文字数）
- [ ] **B14-2** `countdown-timer` — カウントダウンタイマー（日付指定・イベントカウントダウン）
- [ ] **B14-3** `number-formatter` — 数値フォーマッター（桁区切り・通貨形式・各国形式）
- [ ] **B14-4** `text-deduplicator` — 重複行削除ツール（ソートなし・大小文字区別設定）

### マーケティング施策 — 次のアクション

- [ ] **M1** Google Search Console でCTR確認 — 表示回数↑クリック↓のページを洗い出し、titleとmeta descriptionを改善
- [ ] **M2** Zenn/Qiita への記事投稿 — 「自作した理由」「使えるツール紹介」系でサイトへ自然にリンク
- [ ] **M3** X（Twitter）での新ツール告知を習慣化 — ツール追加のたびに1投稿
- [x] **M4** 既存ツールのFAQ改善 — `text-counter`・`json-formatter` 完了（検索クエリ起点で5問に刷新）

### SEO修正 — 次のアクション

- [ ] **S0** ⚠️ **Vercel環境変数を修正**（canonical / sitemap / hreflang の www なし問題）  
  Vercel Dashboard → Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` を  
  `https://quicker-app.com` → **`https://www.quicker-app.com`** に変更してリデプロイ
- [ ] **S1** Search Console → サイトマップを再送信（`/sitemap.xml`）← S0のデプロイ後に実施
- [ ] **S2** URL検査ツールで主要ツールページのインデックス登録をリクエスト（31件の「検出・インデックス未登録」を解消）
  - 優先: `text-counter`・`json-formatter`・`password-generator`・`qr-generator`・`unit-converter`
- [ ] **S3** 「クロール済み・インデックス未登録」1件 → 修正デプロイ後に URL検査で再確認

---

## 🐛 既知バグ・未解決の問題

現時点で確認されている既知バグはありません。

> バグを発見したらここに追記する:
> - `[slug] 現象 / 再現手順 / 優先度（高/中/低）`

**注意事項（デザインリファクタリング後）**

- `word-break: auto-phrase` は Chrome 119+ / Safari 17+ のみ対応。旧ブラウザでは `normal` にフォールバックするが、表示崩れは起きない
- ToolCard の `hover:border-l-accent` は `border-l-4` が常時 4px 幅を確保するため、ホバー前後でレイアウトシフトは発生しない
- カラーパレット変更後、一部のツールコンポーネント内でハードコードされた `text-gray-*` 系クラスが残存している可能性あり（ダークモードは globals.css 一括上書きで対応済み）

---

## 🔧 保留中の改善タスク

| 優先度 | タスク | 理由・背景 |
|--------|--------|-----------|
| **最高** | **Vercel環境変数 `NEXT_PUBLIC_SITE_URL` を www ありに修正（S0）** | canonical/sitemap/hreflangが全て非wwwを指しているがサイトはwwwで配信中。SEO上の重大な不一致 |
| 高 | GSCのインデックス未登録31件を手動申請（S2） | S0デプロイ後に Search Console → URL検査で申請。主要ツールから優先 |
| 高 | GSCでCTR低ページのtitle/description改善 | 月1サイクルで実施。表示回数↑クリック↓のページが最優先 |
| 中 | B14 ツール追加（character-counter-jp / countdown-timer など） | ラインナップ拡充。52件→56件を目標 |
| 中 | おすすめツールの選定見直し | 現状は暫定8件。GSCデータが蓄積されたら人気ツールに差し替える |
| 低 | サイトマップの `lastmod` 動的更新 | 現状は `toolsRegistry.ts` の `updatedAt` 固定値。ツール更新時に手動更新が必要 |
| 低 | 各ツールの FAQ を検索クエリ起点で書き直し | `text-counter`・`json-formatter` 完了済み。他の人気ツールにも順次適用 |

### ✅ 完了済み（2026-04-14 — SEO改善セッション）

- [x] **トップページ SSG 修正**（重大 SEO バグ）: `HomepageClient` の `useSearchParams()` + `<Suspense>` の組み合わせによりツール一覧が初期 HTML に含まれなかった問題を修正 → ツールリンク **0件 → 62件** に改善
- [x] **トップページ title にサイト名追加**: `「無料Webツール集」` → `「Quicker - 無料Webツール集」`（og:title / OGPカード画像も統一）
- [x] **canonical / sitemap の www 問題を調査**: サイトは `www.quicker-app.com` で配信されているが `NEXT_PUBLIC_SITE_URL` が非 www のため不一致 → Vercel 環境変数の修正が必要（コード側は修正済み・`.env.local.example` に注記追加）
- [x] カラーパレット全面リデザイン（Light Blue + Blue パレット準拠）: primary=#1D3D5E / accent=#e94d71 / sky=#b6dcef / surface=#f2f5fd / steel=#7B9098 / gold=#9D8C56 — Header・Footer・ToolCard・HomepageClient・globals.css・tailwind.config.ts を一括更新
- [x] SEO修正（GSCインデックス問題対応）: ルート `/` を `permanentRedirect`（HTTP 308）+ `robots: noindex` に変更 → 「代替ページ（canonical あり）」問題を解消
- [x] dead code 削除: `alternateLocale` 未使用変数を `[locale]/page.tsx` と `[locale]/[tool-slug]/page.tsx` から削除
- [x] CLAUDE.md に開発ワークフロー原則を追加（NotebookLM → Claude Code 2段階フロー）
- [x] Claude Code プラグイン導入: `superpowers@claude-plugins-official`（v5.0.7）・`example-skills@anthropic-agent-skills`（frontend-design 含む）

### ✅ 完了済み（2026-04-12）
- [x] デザインリファクタリング完了（D1〜D9: 日本語タイポグラフィ・多層シャドウ・半透明ボーダー・FAQアニメーション・ToolCard左ボーダー・Headerシャドウ・ボタンスケール・tracking-tight・フォーカスリング）
- [x] B12完了: `text-sorter`・`roman-numerals`・`html-to-markdown`・`image-compressor`
- [x] `text-counter`・`json-formatter` FAQ書き直し（検索クエリ起点・各5問）
- [x] サイト名を **Quicker** に変更（en/ja common.json `site.name`）
- [x] おすすめツール機能（`featured` フラグ・`getFeaturedTools()`・ホームページ横スクロールセクション）
- [x] 最近使ったツール機能（`RecentTracker` コンポーネント・localStorage `quicker:recentTools`・最大8件）
- [x] `mojibake-fixer` 追加（Win1252/Latin-1バイト逆変換→TextDecoder・4戦略・日本語自動検出）
- [x] `paper-size` 追加（A/B/JIS-B/US/写真サイズ・mm/cm/inch単位切替）
- [x] `gacha-calculator` 追加（累積確率テーブル・天井回数逆算）
- [x] `investment-calculator` 追加（複利シミュレーター・CSSスタックバーチャート）
- [x] ShareButtons 追加（X/LINE/はてブ/URLコピー・全ツールページに挿入）
- [x] Lighthouse 改善（Fonts CDN @import排除・GA lazyOnload・viewport export・FAQPage重複JSON-LD修正・ARIA）
- [x] B10完了: `text-repeater`・`markdown-table-generator`・`code-minifier`・`ip-info`

### ✅ 完了済み（2026-04-11 追記）
- [x] ダークモード実装（`tailwind.config.ts` `darkMode: class`・`ThemeToggle.tsx`・FOIT防止インラインスクリプト・globals.css一括上書きで全32ツール対応）

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
