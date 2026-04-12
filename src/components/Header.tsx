"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const t = useTranslations("header");
  const tSite = useTranslations("site");
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ホームページから離れたら入力値をクリア
  useEffect(() => {
    if (!isHome) setQuery("");
  }, [isHome]);

  // スクロール量を検知してシャドウを制御
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header
      className={`bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* サイト名 */}
        <Link
          href="/"
          className="text-xl font-bold text-primary whitespace-nowrap shrink-0"
        >
          {tSite("name")}
        </Link>

        {/* 検索フォーム（スマホでは非表示） */}
        <form onSubmit={handleSubmit} className="hidden sm:block flex-1 max-w-md">
          <label htmlFor="tool-search" className="sr-only">
            {t("searchLabel")}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-slate-500">
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
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg
                         bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100
                         placeholder-gray-400 dark:placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </form>

        {/* 言語切替 + テーマ切替 */}
        <div className="flex items-center gap-1 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
