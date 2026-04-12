"use client";

import { useEffect } from "react";

const STORAGE_KEY = "quicker:recentTools";
const MAX_RECENT = 8;

interface Props {
  slug: string;
}

// ツールページ訪問時に localStorage に slug を記録する（表示なし）
export default function RecentTracker({ slug }: Props) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: string[] = raw ? JSON.parse(raw) : [];
      // 先頭に追加し、重複と上限を除去
      const updated = [slug, ...existing.filter((s) => s !== slug)].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage が使えない環境では何もしない
    }
  }, [slug]);

  return null;
}
