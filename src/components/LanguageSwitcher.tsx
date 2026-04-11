"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";

export default function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  // useParams でルートパラメータを直接取得（遷移中のロケールとパスのずれを回避）
  const params = useParams();
  const toolSlug = params["tool-slug"] as string | undefined;

  function switchLocale(nextLocale: string) {
    // ツールページなら /<slug>、トップページなら / を渡す
    const path = toolSlug ? `/${toolSlug}` : "/";
    router.push(path, { locale: nextLocale });
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-gray-400 dark:text-slate-500 text-xs hidden sm:inline">{t("label")}:</span>
      {(["en", "ja"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchLocale(lang)}
          aria-current={locale === lang ? "true" : undefined}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            locale === lang
              ? "bg-primary text-white"
              : "text-gray-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
          }`}
        >
          {t(lang)}
        </button>
      ))}
    </div>
  );
}
