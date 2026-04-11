# CLAUDE.md — SEO便利ツール集サイト

## プロジェクト概要

1ドメインに20〜30のWebツールを集約して運営する**便利ツール集サイト**。
SEOによる自然流入を主な集客手段とする。

**現在のフェーズ: 成長フェーズ（集客強化中）**

3本柱を並行して進める：
1. **ツール追加** — ラインナップを広げ、検索クエリのカバー範囲を拡大する
2. **既存ツール改善** — UX・コンテンツ・SEOの質を継続的に底上げする
3. **マーケティング** — 検索流入・認知拡大・コミュニティへの露出を図る

広告について：
- 広告コードはまだ埋め込まない
- `NEXT_PUBLIC_ADSENSE_ENABLED=false`（デフォルト）の間は広告が**一切表示されない**

---

## 技術スタック

| 項目 | 採用技術 |
|------|----------|
| フレームワーク | Next.js 14（App Router） |
| 言語 | TypeScript（strict mode） |
| スタイリング | Tailwind CSS |
| 国際化（i18n） | next-intl 4.x |
| ホスティング | Vercel（無料枠） |
| 外部API | **原則使用しない**（すべてクライアントサイドで完結） |

---

## コーディングルール

### 必須

- すべてのコンポーネントは TypeScript（`.tsx`）
- `"use client"` は状態管理やイベントハンドラが必要なコンポーネントにのみ付与
- スタイリングは Tailwind CSS で完結。**インラインスタイル禁止**
- 1コンポーネント200行以内を目標
- コンポーネント名・変数名は英語、コメントは日本語OK
- import は `@/` エイリアスを使用

### 禁止

- 外部API呼び出し
- npm パッケージの安易な追加
- `console.log` の本番残し
- `any` 型の使用

### 推奨

- リアルタイム処理には debounce（300ms）
- 10万文字以上でもフリーズしない設計
- コピー完了にはトースト通知
- キーボードショートカット対応

---

## ツール追加時の必須チェックリスト

新しいツールを追加する際は、以下12項目をすべて満たすこと。

1. `src/tools/[ToolName].tsx` にコンポーネント作成
2. `src/lib/toolsRegistry.ts` にツール情報を登録
3. 「使い方」セクションを追加（3〜5ステップ）
4. FAQセクションを追加（3問以上）
5. JSON-LD構造化データを設定（`WebApplication` + `FAQPage` schema）
6. 関連ツールへの内部リンクを設置（最低2つ）
7. レスポンシブ対応確認（375px幅で崩れないこと）
8. `npm run build` でエラーなし
9. 入力例やプレースホルダーで初見でも使い方がわかること
10. `src/messages/en/tools/[slug].json` を作成（英語翻訳）
11. `src/messages/ja/tools/[slug].json` を作成（日本語翻訳）
12. 両言語（/en/[slug] と /ja/[slug]）でページが正常に表示されること

---

## 既存ツール改善方針

ツール追加と並行して、既存ツールの質を継続的に底上げする。

### 改善の優先基準

1. **Google Search Console で表示回数は多いがCTRが低いページ** → タイトル・meta descriptionを改善
2. **FAQ・howToUse が薄いツール** → 実際に検索されそうな質問・ユースケースを追加
3. **UXに問題があるツール** → エラー表示、入力例、操作ステップを見直す

### 改善の種類

| 種類 | 具体例 |
|------|--------|
| コンテンツ改善 | FAQ を検索クエリ起点で書き直す、説明文に具体的なユースケースを追加 |
| UX改善 | プレースホルダーの充実、エラーメッセージの明確化、デフォルト値の見直し |
| SEO改善 | meta description の書き直し、内部リンクの追加、keywords の見直し |

---

## マーケティング方針

### 検索流入（SEO）

- **ロングテールキーワードを意識する**: ツール追加時は「○○ 無料」「○○ オンライン」「○○ 変換 方法」などの検索クエリを想定してFAQ・説明文を書く
- **FAQ は「実際に検索されそうな質問」で書く**: 機能説明より「なぜ？」「○○との違いは？」「○○できますか？」を重視する
- **Google Search Console で週1回チェック**: 表示回数↑・クリック数↓のページ = タイトル/descriptionを改善するサイン

### 認知拡大・コミュニティ

- **新ツール追加時はXで告知する**: 「こんなツールを追加しました」の一言投稿でも積み重ねが重要
- **Zenn/Qiita への記事投稿**: 「○○するならこのツールが便利」「自作した理由」など、ツールへの自然なリンクを含む記事を書く
- **はてなブックマーク**: 便利ツール系はブクマされやすい。記事タイトルをキャッチーにする

### 改善サイクル

ツール追加だけでなく、**月に1回は既存ツールのSEOパフォーマンスを確認**し、改善候補をREADMEの「改善候補」リストに追記する。

---

## ファイル構成

```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト（children を返すだけ）
│   ├── page.tsx                # / → /en にフォールバックリダイレクト
│   ├── sitemap.ts              # サイトマップ自動生成（全ロケール含む）
│   └── [locale]/               # 言語別ルーティング（en / ja）
│       ├── layout.tsx          # ロケールレイアウト（html, NextIntlClientProvider）
│       ├── page.tsx            # トップページ（ツール一覧）
│       ├── [tool-slug]/
│       │   └── page.tsx        # 各ツールページ
│       ├── privacy/
│       │   └── page.tsx        # プライバシーポリシー
│       └── terms/
│           └── page.tsx        # 利用規約
├── i18n/
│   ├── routing.ts              # next-intl ルーティング設定
│   └── request.ts              # next-intl サーバーサイド設定
├── messages/
│   ├── en/
│   │   ├── common.json         # 共通UI文字列（英語）
│   │   └── tools/
│   │       └── text-counter.json
│   └── ja/
│       ├── common.json         # 共通UI文字列（日本語）
│       └── tools/
│           └── text-counter.json
├── components/                 # 共通UIコンポーネント
├── tools/                      # 各ツール実装
└── lib/
    └── toolsRegistry.ts        # ツール一覧の単一ソース（ここだけ編集）
```

`src/lib/toolsRegistry.ts` がツール情報の**唯一の管理場所**。
新規ツール追加・削除はここを起点にする。
**翻訳文字列（title, description, faq 等）は `src/messages/[locale]/tools/[slug].json` で管理。**

---

## SEOルール

- **titleフォーマット**: `[ツール名] - 無料オンラインツール | [サイト名]`（ja）/ `[Tool Name] - Free Online Tool | [Site]`（en）
- **meta description**: 120文字以内
- **H1**: ページ内に1つだけ
- **canonical URL**: 全ページに設定（例: `https://example.com/ja/text-counter`）
- **hreflang**: 全ページに en / ja / x-default を設定
- **内部リンク**: 関連ツール同士で相互に張る

---

## 国際化（i18n）ルール

- **ライブラリ**: next-intl 4.x
- **対応言語**: 英語（en）・日本語（ja）、デフォルトは英語
- **URL構造**: `/en/[slug]`（英語）、`/ja/[slug]`（日本語）。`/` はブラウザ言語でリダイレクト
- **ハードコード禁止**: 日本語・英語問わずハードコードされた文字列は禁止。必ず翻訳ファイル経由で表示
- **ツール別翻訳**: `src/messages/[locale]/tools/[slug].json` に配置（title, description, keywords, howToUse, faq 等）
- **共通翻訳**: `src/messages/[locale]/common.json` に配置（header, footer, categories, ui 等）
- **新ツール追加時**: 必ず en/ja 両方の翻訳ファイルを作成すること
- **hreflang**: 全ページに `alternates.languages` で en / ja / x-default を設定
- **ナビゲーション**: `Link`, `useRouter`, `usePathname` は `@/i18n/routing` からインポート（ロケール自動付与）
- **翻訳の取得方法**:
  - サーバーコンポーネント → `getTranslations({ locale, namespace })` from `'next-intl/server'`
  - クライアントコンポーネント → `useTranslations(namespace)` from `'next-intl'`（NextIntlClientProvider が必要、layout.tsx で設定済み）

---

## 広告枠の準備（現段階）

- `NEXT_PUBLIC_ADSENSE_ENABLED=true` の場合のみ AdSense スクリプトを読み込む
- `false`（デフォルト）では何も表示しない・読み込まない

### 将来的な広告配置位置

1. ヘッダー直下
2. ツール出力結果の下
3. FAQの前
4. サイドバー

> 広告と操作UIの間には**最低24pxの余白**を確保すること。

---

## Gitコミットルール

**形式**: `[カテゴリ] 内容`（日本語）

| カテゴリ | 用途 |
|----------|------|
| `[ツール追加]` | 新規ツールの追加 |
| `[修正]` | バグ修正 |
| `[改善]` | 既存ツールの機能・UX改善 |
| `[コンテンツ]` | FAQ・説明文・howToUseの加筆修正 |
| `[スタイル]` | デザイン・レイアウト変更 |
| `[SEO]` | メタデータ・構造化データ・内部リンクの改善 |
| `[設定]` | 設定・環境変数の変更 |
| `[ドキュメント]` | ドキュメント更新 |

**例**:
```
[ツール追加] unicode-font-generator
[改善] json-formatter にサイズ上限警告を追加
[コンテンツ] text-counter のFAQを検索クエリ起点で書き直し
[SEO] timestamp-converter のmeta descriptionを改善
```

---

## 特殊事情・開発方針

- 開発者は**本業との並行**で時間が限られる
- 別アプリ開発と並行しているため、作業は断続的になる
- 各ツールは**独立性を保つ設計**にする（他ツールへの依存を最小化）
- `README.md` の「次にやること」リストを**常に最新化**する

### 断続的開発を支えるための原則

- 作業再開時にすぐ状況把握できるよう `README.md` を丁寧に更新する
- 未完成の実装は `TODO:` コメントで明示する
- 1セッションで完結できる小さなタスクに分解して進める
