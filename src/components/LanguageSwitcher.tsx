"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(nextLocale: string) {
    router.push(pathname, { locale: nextLocale });
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-gray-400 text-xs hidden sm:inline">{t("label")}:</span>
      {(["en", "ja"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchLocale(lang)}
          aria-current={locale === lang ? "true" : undefined}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            locale === lang
              ? "bg-primary text-white"
              : "text-gray-500 hover:text-primary hover:bg-blue-50"
          }`}
        >
          {t(lang)}
        </button>
      ))}
    </div>
  );
}
