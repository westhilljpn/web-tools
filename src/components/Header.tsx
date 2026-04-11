"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
  const t = useTranslations("header");
  const tSite = useTranslations("site");
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ホームページから離れたら入力値をクリア
  useEffect(() => {
    if (!isHome) setQuery("");
  }, [isHome]);

  function pushQuery(val: string) {
    if (val.trim()) {
      router.push(`/?q=${encodeURIComponent(val.trim())}`);
    } else {
      router.push("/");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    // ホームページにいる場合のみリアルタイムでURLを更新（300ms debounce）
    if (isHome) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => pushQuery(val), 300);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    pushQuery(query);
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* サイト名 */}
        <Link
          href="/"
          className="text-xl font-bold text-primary whitespace-nowrap shrink-0"
        >
          {tSite("name")}
        </Link>

        {/* 検索フォーム */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-md">
          <label htmlFor="tool-search" className="sr-only">
            {t("searchLabel")}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
            </span>
            <input
              id="tool-search"
              type="search"
              value={query}
              onChange={handleChange}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </form>

        {/* 言語切替 */}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
