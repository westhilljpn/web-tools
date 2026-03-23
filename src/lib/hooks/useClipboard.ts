"use client";

import { useState, useCallback } from "react";

interface UseClipboardResult {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

/**
 * クリップボードへのコピー機能を提供するフック
 * コピー後に一定時間 copied フラグを true にする
 */
export function useClipboard(resetDelay = 2000): UseClipboardResult {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
      } catch {
        // クリップボードAPIが使えない場合のフォールバック
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
      }
    },
    [resetDelay]
  );

  return { copied, copy };
}
