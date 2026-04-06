import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

// ブラウザの言語設定に基づき /en または /ja にリダイレクト
export default createMiddleware(routing);

export const config = {
  // 静的ファイル・API ルート・Next.js 内部パスを除いたすべてのパスに適用
  matcher: ["/((?!_next|_vercel|api|.*\\..*).*)"],
};
