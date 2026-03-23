"use client";

import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState("");
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "便利ツール集";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* サイト名 */}
        <Link
          href="/"
          className="text-xl font-bold text-primary whitespace-nowrap shrink-0"
        >
          {siteName}
        </Link>

        {/* 検索バー */}
        <div className="flex-1 max-w-md">
          <label htmlFor="tool-search" className="sr-only">
            ツールを検索
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
              placeholder="ツールを検索..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
