import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "ja"],
  defaultLocale: "en",
  // 言語選択をクッキーに保存し、次回アクセス時も維持する
  localeCookie: true,
});

// ロケールを自動付与するナビゲーションユーティリティ
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
