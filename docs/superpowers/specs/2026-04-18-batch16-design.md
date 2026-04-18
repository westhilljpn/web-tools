# Batch 16 — 6ツール追加 設計仕様書

**日付**: 2026-04-18  
**対象**: B16-1〜B16-6（6ツール追加 + B15 toolComponents バグ修正）

---

## 前提: B15 バグ修正（実装前に必須）

`src/lib/toolComponents.tsx` に B15 の 6 コンポーネントが未追加のため、該当ページが「Coming Soon」になっている。  
B16 実装の最初のステップとして修正する。

追加対象:
- `DateCalculator`
- `CalorieCalculator`
- `BodyFatCalculator`
- `SleepCalculator`
- `CssBoxShadow`
- `WcagContrastChecker`

---

## B16-1: `character-counter-jp` — 原稿用紙換算ツール

### 概要
日本語テキスト特有の文字数カウント。原稿用紙・X/Twitter・履歴書の3つのユースケースに特化。

### 機能仕様
| 機能 | 詳細 |
|------|------|
| 基本カウント | 総文字数・改行除く文字数・半角文字数・全角文字数をリアルタイム表示 |
| 原稿用紙換算 | 400字詰め換算枚数（小数1位。例: 1.2枚） |
| X/Twitter カウント | 全角=2・半角=1でカウント（上限140）、残り文字数 + プログレスバー |
| 履歴書目安 | 志望動機・自己PR の推奨文字数帯（100〜300字）をプログレスバーで表示 |

### コンポーネント設計
- ファイル: `src/tools/CharacterCounterJp.tsx`
- 状態: `input: string`（textarea）
- 計算はすべて `useMemo` でリアルタイム
- 半角判定: `/[\x00-\x7F\uFF61-\uFF9F]/` で正規表現マッチ

### 翻訳キー（主要）
`title`, `description`, `keywords`, `placeholder`, `sections.basic`, `sections.genkou`, `sections.twitter`, `sections.resume`, `stats.*`, `howToUse[3]`, `faq[4+]`

### メタ情報
- カテゴリ: `text`
- アイコン: `📃`
- slug: `character-counter-jp`
- 関連ツール: `text-counter`, `word-counter`, `reading-time`

---

## B16-2: `countdown-timer` — カウントダウンタイマー

### 概要
複数イベントを localStorage に保存し、各イベントまでの残り時間を日・時・分・秒でリアルタイム表示。

### 機能仕様
| 機能 | 詳細 |
|------|------|
| イベント追加 | イベント名（必須）+ 目標日時（datetime-local input）|
| 保存件数 | 最大10件（localStorage key: `quicker:countdowns`）|
| リアルタイム更新 | `setInterval(1000ms)` で秒単位更新 |
| 過去イベント | 期日超過後は「〇日〇時間経過」表示 |
| 緊迫感UI | 残り7日以内はアクセントカラー（赤系）でカードをハイライト |
| 削除 | 各カードにゴミ箱ボタン |

### コンポーネント設計
- ファイル: `src/tools/CountdownTimer.tsx`
- `useEffect` で `setInterval` を管理（クリーンアップ必須）
- イベント型: `{ id: string; name: string; target: string; createdAt: string }`
- 計算: `Math.floor((target - now) / 1000)` → 日・時・分・秒に分解

### 翻訳キー（主要）
`title`, `description`, `keywords`, `addEvent`, `eventName`, `targetDate`, `add`, `delete`, `days`, `hours`, `minutes`, `seconds`, `elapsed`, `noEvents`, `maxReached`, `howToUse[3]`, `faq[4+]`

### メタ情報
- カテゴリ: `lifestyle`
- アイコン: `⏳`
- slug: `countdown-timer`
- 関連ツール: `pomodoro-timer`, `age-calculator`, `date-calculator`

---

## B16-3: `number-formatter` — 数値フォーマッター

### 概要
数値を様々な形式（桁区切り・通貨・日本語万億単位）に即時変換し、全形式を一覧表示。

### 機能仕様
| 機能 | 詳細 |
|------|------|
| 桁区切り | US（1,234,567.89）/ EU（1.234.567,89）/ スペース（1 234 567）|
| 通貨形式 | ¥1,234,567 / $1,234,567.00 / €1.234.567,00（Intl.NumberFormat 使用）|
| 万・億・兆 | `1234万5678`、`12億3456万`、`1兆2345億` の日本語表記 |
| 小数点設定 | 小数点以下桁数（0〜6）をセレクトで選択 |
| 全形式一覧 | 入力後に全フォーマット結果を縦に並べてコピーボタン付きで表示 |

### コンポーネント設計
- ファイル: `src/tools/NumberFormatter.tsx`
- 状態: `input: string`（数値入力）、`decimals: number`
- `Number.isFinite(parseFloat(input))` でバリデーション
- 万単位変換は独自関数 `toJapaneseUnit(n: number): string`

### 翻訳キー（主要）
`title`, `description`, `keywords`, `inputLabel`, `placeholder`, `decimals`, `formats.*`, `copy`, `copied`, `invalid`, `howToUse[3]`, `faq[4+]`

### メタ情報
- カテゴリ: `convert`
- アイコン: `🔢`
- slug: `number-formatter`
- 関連ツール: `unit-converter`, `percentage-calculator`, `tax-calculator`

---

## B16-4: `text-deduplicator` — 重複行削除ツール

### 概要
テキスト行の重複を削除しつつ元の順序を保持。text-sorter との差別化は「ソートしない」点。

### 機能仕様
| 機能 | 詳細 |
|------|------|
| 重複削除 | 出現順序を保持したまま重複行を除去 |
| 大文字小文字 | 区別する / しないを切り替え |
| 空白トリム | 各行の前後空白を削除してから比較 |
| 空行削除 | 空行を除去するオプション |
| 統計表示 | 「入力: N行 → 出力: M行（X行削除）」をリアルタイム表示 |

### コンポーネント設計
- ファイル: `src/tools/TextDeduplicator.tsx`
- 2カラム入力/出力レイアウト（TextSorter と同様）
- `useMemo` で重複検出ロジック: `Set` ベース
- 出力行数と削除行数を stat バッジで表示

### 翻訳キー（主要）
`title`, `description`, `keywords`, `inputLabel`, `outputLabel`, `placeholder`, `options.*`, `stats.*`, `clear`, `copy`, `copied`, `lines`, `howToUse[3]`, `faq[4+]`

### メタ情報
- カテゴリ: `text`
- アイコン: `🧹`
- slug: `text-deduplicator`
- 関連ツール: `text-sorter`, `text-counter`, `word-counter`

---

## B16-5: `exif-viewer` — 画像EXIFデータ閲覧

### 概要
JPEG ファイルのバイナリを DataView API で解析し、EXIF メタデータを表示。外部パッケージ不使用。

### 機能仕様
| 機能 | 詳細 |
|------|------|
| 対応形式 | JPEG（Exif APP1 セグメント、マーカー `0xFFE1`）|
| 解析方法 | `FileReader.readAsArrayBuffer` → `DataView` でバイナリ解析 |
| 表示グループ | カメラ（Make/Model/Software）/ 撮影日時（DateTime）/ 解像度（XResolution/YResolution/PixelX/PixelY）/ 露出（FNumber/ExposureTime/ISO/FocalLength）/ GPS（Latitude/Longitude/Altitude）|
| GPS地図リンク | 緯度経度があれば Google Maps リンクを生成 |
| コピー | タグ値個別コピー + 全データ JSON コピー |
| 未対応形式 | PNG/WebP はメタデータなしのメッセージ表示 |

### コンポーネント設計
- ファイル: `src/tools/ExifViewer.tsx`
- EXIF パーサーを同ファイル内のユーティリティ関数として実装
- 対応 TIFF タグ: 約25タグ（IFD0 + ExifSubIFD + GPS IFD）
- バイトオーダー（リトルエンディアン/ビッグエンディアン）を TIFF ヘッダーから自動判定

### 翻訳キー（主要）
`title`, `description`, `keywords`, `dropLabel`, `browseLabel`, `groups.*`, `tags.*`, `noExif`, `notSupported`, `copyAll`, `copy`, `copied`, `mapsLink`, `howToUse[3]`, `faq[4+]`

### メタ情報
- カテゴリ: `image`
- アイコン: `🔬`
- slug: `exif-viewer`
- 関連ツール: `image-converter`, `image-resizer`, `image-compressor`

---

## B16-6: `char-frequency` — 文字頻度分析

### 概要
テキストの文字・単語の出現頻度を集計し、Top20 を CSS 棒グラフで可視化。タブ切り替えで文字/単語を切り替え。

### 機能仕様
| 機能 | 詳細 |
|------|------|
| タブ切り替え | 文字頻度 / 単語頻度（2タブ）|
| 表示件数 | Top 20、それ以上は「全件表示」ボタンで展開 |
| CSS 棒グラフ | 最頻出を 100% として相対幅の横棒。カウント数を右端に表示 |
| 統計サマリ | 総文字数・ユニーク文字数・ユニーク単語数・最頻出文字/単語 |
| 文字種フィルター | 空白・記号・数字を含める/除くオプション |
| 単語分割 | 英語: スペース区切り。日本語: 文字ベースで解析 |

### コンポーネント設計
- ファイル: `src/tools/CharFrequency.tsx`
- 状態: `input: string`, `tab: "char" | "word"`, `showAll: boolean`, `excludeSpaces: boolean`, `excludePunct: boolean`
- 計算: `useMemo` で Map を構築しソート
- CSS グラフ: `style={{ width: \`${(count/max)*100}%\` }}` のインラインスタイルは禁止 → Tailwind `[width:X%]` 任意値クラスも不可。`style` プロパティでの幅指定はグラフ描画の例外として許容（他の箇所ではインラインスタイル禁止を維持）

### 翻訳キー（主要）
`title`, `description`, `keywords`, `tabs.*`, `stats.*`, `options.*`, `rank`, `count`, `showAll`, `showLess`, `placeholder`, `howToUse[3]`, `faq[4+]`

### メタ情報
- カテゴリ: `text`
- アイコン: `📊`
- slug: `char-frequency`
- 関連ツール: `text-counter`, `word-counter`, `reading-time`

---

## 実装順序

1. **B15 バグ修正**: `toolComponents.tsx` に 6 エントリ追加（最初に実施）
2. **B16-4** `text-deduplicator` — 最もシンプル。実装パターンの確認
3. **B16-1** `character-counter-jp` — 計算ロジックのみ
4. **B16-3** `number-formatter` — 万億変換関数
5. **B16-6** `char-frequency` — Map 集計 + CSS グラフ
6. **B16-2** `countdown-timer` — setInterval + localStorage
7. **B16-5** `exif-viewer` — バイナリ解析（最複雑）

## 各ツール共通の実装チェックリスト（CLAUDE.md 準拠）

各ツールで以下をすべて満たすこと:
1. `src/tools/[ComponentName].tsx` 作成
2. `src/lib/toolsRegistry.ts` にエントリ追加
3. `src/lib/toolComponents.tsx` にエントリ追加
4. `src/messages/ja/tools/[slug].json` 作成（howToUse 3+, faq 4+）
5. `src/messages/en/tools/[slug].json` 作成
6. 関連ツール内部リンク（2つ以上、同カテゴリから自動取得）
7. JSON-LD は `page.tsx` 側で自動生成されるため個別対応不要
8. レスポンシブ対応（375px 幅）
9. `npm run build` エラーなし
