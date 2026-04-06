// ルートパス（/）はミドルウェアがブラウザ言語に基づき /en または /ja にリダイレクトする。
// ミドルウェアが動作しない環境向けのフォールバック。
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
