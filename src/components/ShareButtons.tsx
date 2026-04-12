"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  const tweetText = t("tweetText", { title });
  const twitterHref = `https://twitter.com/intent/tweet?text=${enc(tweetText)}&url=${enc(url)}`;
  const lineHref = `https://social-plugins.line.me/lineit/share?url=${enc(url)}`;
  const hatenaHref = `https://b.hatena.ne.jp/entry/panel/?url=${enc(url)}&btitle=${enc(title)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 非対応環境では何もしない
    }
  };

  const btnBase =
    "w-8 h-8 rounded border border-gray-200 dark:border-slate-700 flex items-center justify-center transition-colors";
  const btnIdle =
    "text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600";
  const btnCopied =
    "text-green-500 dark:text-green-400 border-green-300 dark:border-green-700";

  return (
    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-gray-500 dark:text-slate-400 select-none">
        {t("label")}:
      </span>

      {/* X (Twitter) */}
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} ${btnIdle}`}
        title={t("twitter")}
        aria-label={t("twitter")}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* LINE */}
      <a
        href={lineHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} ${btnIdle}`}
        title={t("line")}
        aria-label={t("line")}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      </a>

      {/* はてなブックマーク */}
      <a
        href={hatenaHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} ${btnIdle}`}
        title={t("hatena")}
        aria-label={t("hatena")}
      >
        <span className="text-xs font-bold leading-none tracking-tighter">B!</span>
      </a>

      {/* URLコピー */}
      <button
        type="button"
        onClick={handleCopy}
        className={`${btnBase} ${copied ? btnCopied : btnIdle}`}
        title={t("copy")}
        aria-label={t("copy")}
      >
        {copied ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
    </div>
  );
}
