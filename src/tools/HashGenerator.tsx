"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import Toast from "@/components/Toast";
import { md5 } from "@/lib/md5";

type Algorithm = "SHA-1" | "SHA-256" | "SHA-512";
const ALGORITHMS: Algorithm[] = ["SHA-1", "SHA-256", "SHA-512"];

async function digest(algorithm: Algorithm, text: string): Promise<string> {
  const buf = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashGenerator() {
  const t = useTranslations("hash-generator");
  const [input, setInput] = useState("");
  const [md5Hash, setMd5Hash] = useState("");
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({
    "SHA-1": "", "SHA-256": "", "SHA-512": "",
  });
  const [isUpper, setIsUpper] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!input) {
      setMd5Hash("");
      setHashes({ "SHA-1": "", "SHA-256": "", "SHA-512": "" });
      return;
    }
    setMd5Hash(md5(input));
    timerRef.current = setTimeout(async () => {
      const entries = await Promise.all(
        ALGORITHMS.map(async (a) => [a, await digest(a, input)] as const)
      );
      setHashes(Object.fromEntries(entries) as Record<Algorithm, string>);
    }, 200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [input]);

  const show = (h: string) => (isUpper ? h.toUpperCase() : h);

  const handleCopy = async (algo: Algorithm) => {
    const h = hashes[algo];
    if (!h) return;
    await navigator.clipboard.writeText(show(h));
    showToast(t("toast.copied"));
  };

  const handleCopyMd5 = async () => {
    if (!md5Hash) return;
    await navigator.clipboard.writeText(show(md5Hash));
    showToast(t("toast.copied"));
  };

  const hasOutput = Boolean(md5Hash) || ALGORITHMS.some((a) => hashes[a]);

  return (
    <div className="space-y-6">
      {/* 入力エリア */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="hash-input" className="text-sm font-medium text-gray-700">
            {t("label")}
          </label>
          <button
            type="button"
            onClick={() => setInput("")}
            disabled={!input}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            {t("buttons.clear")}
          </button>
        </div>
        <textarea
          id="hash-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          rows={5}
          spellCheck={false}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
        />
      </div>

      {/* 大文字 / 小文字 切り替え */}
      <div className="flex gap-2">
        {([false, true] as const).map((upper) => (
          <button
            key={String(upper)}
            type="button"
            onClick={() => setIsUpper(upper)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isUpper === upper
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:border-primary"
            }`}
          >
            {upper ? t("buttons.uppercase") : t("buttons.lowercase")}
          </button>
        ))}
      </div>

      {/* ハッシュ出力 */}
      {!hasOutput ? (
        <p className="text-sm text-gray-400 text-center py-8">{t("results.empty")}</p>
      ) : (
        <div className="space-y-3">
          {/* MD5 */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 font-mono tracking-wider">
                  MD5
                </span>
                <span className="text-[10px] text-gray-400">
                  チェックサム用途のみ / For checksum only
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyMd5}
                disabled={!md5Hash}
                className="text-xs text-primary hover:text-primary/70 font-medium disabled:opacity-30 transition-colors"
              >
                {t("buttons.copy")}
              </button>
            </div>
            <div className="px-4 py-3 bg-white">
              <p className="text-xs font-mono break-all leading-relaxed select-all text-gray-800">
                {show(md5Hash) || "—"}
              </p>
            </div>
          </div>
          {ALGORITHMS.map((algo) => (
            <div key={algo} className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-500 font-mono tracking-wider">
                  {algo}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(algo)}
                  disabled={!hashes[algo]}
                  className="text-xs text-primary hover:text-primary/70 font-medium disabled:opacity-30 transition-colors"
                >
                  {t("buttons.copy")}
                </button>
              </div>
              <div className="px-4 py-3 bg-white">
                <p className="text-xs font-mono break-all leading-relaxed select-all text-gray-800">
                  {show(hashes[algo]) || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
