// ツール一覧の単一ソース。新規ツール追加・削除はこのファイルだけ編集する。

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolStep {
  label: string;
  description: string;
}

export interface Tool {
  slug: string;
  title: string;
  /** メタディスクリプション（120文字以内） */
  description: string;
  keywords: string[];
  category: "テキスト" | "変換" | "画像" | "計算" | "生活" | "開発";
  icon: string;
  /** src/tools/ 内のコンポーネントファイル名（拡張子なし） */
  component: string;
  faq: ToolFAQ[];
  howToUse: ToolStep[];
  /** ISO 8601 形式（サイトマップ用） */
  updatedAt: string;
}

// ツール一覧
const tools: Tool[] = [
  {
    slug: "text-counter",
    title: "文字数カウンター",
    description:
      "テキストの文字数・単語数・行数をリアルタイムでカウント。スペースの有無や全角半角も判別できる無料オンラインツール。",
    keywords: [
      "文字数カウント",
      "文字数",
      "単語数",
      "行数",
      "テキスト",
      "カウンター",
      "文字数チェック",
    ],
    category: "テキスト",
    icon: "📝",
    component: "TextCounter",
    howToUse: [
      {
        label: "テキストを入力する",
        description:
          "テキストエリアに文章を入力、または「ペースト」ボタンでクリップボードから貼り付けます。",
      },
      {
        label: "リアルタイムで結果を確認する",
        description:
          "入力と同時に文字数・単語数・行数などが自動更新されます。",
      },
      {
        label: "文字数制限チェックを活用する",
        description:
          "Twitter・Instagram・note の文字数制限に対してどのくらい使用しているかをプログレスバーで確認できます。",
      },
      {
        label: "必要に応じてコピー・クリアする",
        description:
          "「コピー」ボタンでテキストをクリップボードに保存、「クリア」ボタンで入力内容を消去します。",
      },
    ],
    faq: [
      {
        question: "全角と半角はどのようにカウントされますか？",
        answer:
          "全角文字（日本語・全角英数など）と半角文字（半角英数・半角カナ）をそれぞれ別にカウントします。文字数の合計は全角・半角を区別せず1文字として数えます。",
      },
      {
        question: "入力したテキストはサーバーに送信されますか？",
        answer:
          "いいえ。すべての処理はお使いのブラウザ内で完結しており、テキストが外部に送信されることは一切ありません。",
      },
      {
        question: "最大何文字まで入力できますか？",
        answer:
          "技術的な上限はありませんが、10万文字程度までは快適に動作するよう設計しています。それ以上の場合でも動作しますが、処理に若干の遅延が生じる場合があります。",
      },
      {
        question: "単語数はどのように計算されますか？",
        answer:
          "スペース・改行などで区切られたトークンを単語として数えます。日本語のような分かち書きをしない言語では、スペースで区切られた文節を1単語としてカウントします。",
      },
    ],
    updatedAt: "2026-03-24",
  },
];

export default tools;

/** slug からツール情報を取得する */
export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

/** カテゴリでフィルタリングする */
export function getToolsByCategory(category: Tool["category"]): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

/** 関連ツールを取得する（同カテゴリから指定ツールを除いた最大 N 件） */
export function getRelatedTools(slug: string, limit = 5): Tool[] {
  const current = getToolBySlug(slug);
  if (!current) return [];
  return tools
    .filter((t) => t.slug !== slug && t.category === current.category)
    .slice(0, limit);
}
