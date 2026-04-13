// ルートパス（/）はミドルウェアがブラウザ言語に基づき /en または /ja にリダイレクトする。
// ミドルウェアが動作しない環境向けのフォールバック。
// ルートパス（/）はミドルウェアがブラウザ言語に基づき /en または /ja にリダイレクトする。
// ミドルウェアが動作しない環境向けのフォールバック。
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

// Googleに「このURLはインデックス不要」と伝える
// ミドルウェアがリダイレクトを処理するため、このページ自体はコンテンツを持たない
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootPage() {
  // permanentRedirect → HTTP 308: Googleが「/は恒久的に/enへ移動済み」と認識し代替ページ扱いを解消
  permanentRedirect("/en");
}
