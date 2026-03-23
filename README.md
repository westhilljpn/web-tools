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

## 登録済みツール（1件）

| # | slug | タイトル | カテゴリ |
|---|------|----------|----------|
| 1 | `text-counter` | 文字数カウンター | テキスト |

---

## ✅ 次にやること（優先順位順）

### バッチ1 — テキスト系ツール（最優先）

> SEO流入が見込めるシンプルなテキスト処理ツールを先に揃える

- [ ] **B1-1** `json-formatter` — JSON整形・バリデーター
- [ ] **B1-2** `base64` — Base64エンコード / デコード
- [ ] **B1-3** `url-encode` — URLエンコード / デコード
- [ ] **B1-4** `case-converter` — 大文字小文字・キャメル・スネーク変換

### バッチ2 — 計算・変換系ツール

- [ ] **B2-1** `unit-converter` — 単位変換（長さ・重さ・温度）
- [ ] **B2-2** `color-converter` — HEX / RGB / HSL 変換
- [ ] **B2-3** `timestamp-converter` — Unix タイムスタンプ ↔ 日付変換
- [ ] **B2-4** `regex-tester` — 正規表現テスター

### バッチ3 — 生活・計算系ツール

- [ ] **B3-1** `age-calculator` — 年齢計算
- [ ] **B3-2** `bmi-calculator` — BMI計算
- [ ] **B3-3** `loan-calculator` — ローン返済シミュレーター
- [ ] **B3-4** `qr-generator` — QRコード生成（ライブラリ選定要）

---

## 🐛 既知バグ・未解決の問題

現時点で確認されている既知バグはありません。

> バグを発見したらここに追記する:
> - `[slug] 現象 / 再現手順 / 優先度（高/中/低）`

---

## 🔧 保留中の改善タスク

| 優先度 | タスク | 理由・背景 |
|--------|--------|-----------|
| 中 | `toolComponents.tsx` を dynamic import に移行 | ツール数が増えたら初期 JS バンドルが膨らむ |
| 中 | Google Analytics 連携 | `.env.local` の `NEXT_PUBLIC_GA_ID` に ID を設定するだけで動く状態にする |
| 低 | `Header` の検索バーをトップページと連携 | 現状はトップページのみフィルター機能が動作している |
| 低 | OGP 画像（og:image）の追加 | SNS シェア時のサムネ改善 |
| 低 | Vercel へのデプロイ設定 | `NEXT_PUBLIC_SITE_URL` を本番 URL に更新してから実施 |

---

## ツール追加手順（クイックリファレンス）

1. `src/tools/[ToolName].tsx` を作成
2. `src/lib/toolsRegistry.ts` にエントリを追加
3. `src/lib/toolComponents.tsx` にコンポーネントをマップ
4. CLAUDE.md の9項目チェックリストを確認
5. `npm run build` が通ることを確認

---

## 技術スタック

| 項目 | 採用技術 |
|------|----------|
| フレームワーク | Next.js 14（App Router） |
| 言語 | TypeScript（strict mode） |
| スタイリング | Tailwind CSS |
| ホスティング | Vercel（無料枠） |

詳細なルール・方針は [CLAUDE.md](./CLAUDE.md) を参照。
