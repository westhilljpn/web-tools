"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/lib/hooks/useDebounce";

// ---- 変換ロジック ----

function mapper(
  uBase: number, lBase: number, dBase: number | null,
  exc: Record<string, number> = {}
) {
  return (ch: string): string => {
    if (exc[ch] !== undefined) return String.fromCodePoint(exc[ch]);
    const c = ch.codePointAt(0)!;
    if (c >= 65 && c <= 90)  return String.fromCodePoint(uBase + c - 65);
    if (c >= 97 && c <= 122) return String.fromCodePoint(lBase + c - 97);
    if (dBase !== null && c >= 48 && c <= 57) return String.fromCodePoint(dBase + c - 48);
    return ch;
  };
}

const SMALL_CAPS: Record<string, string> = {
  a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",
  m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"q",r:"ʀ",s:"ꜱ",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ",
  A:"ᴀ",B:"ʙ",C:"ᴄ",D:"ᴅ",E:"ᴇ",F:"ꜰ",G:"ɢ",H:"ʜ",I:"ɪ",J:"ᴊ",K:"ᴋ",L:"ʟ",
  M:"ᴍ",N:"ɴ",O:"ᴏ",P:"ᴘ",Q:"Q",R:"ʀ",S:"ꜱ",T:"ᴛ",U:"ᴜ",V:"ᴠ",W:"ᴡ",X:"X",Y:"ʏ",Z:"ᴢ",
};

type Conv = (ch: string) => string;

const STYLES: { key: string; fn: Conv }[] = [
  { key: "bold",
    fn: mapper(0x1D400, 0x1D41A, 0x1D7CE) },
  { key: "italic",
    fn: mapper(0x1D434, 0x1D44E, null, { h: 0x210E }) },
  { key: "bold_italic",
    fn: mapper(0x1D468, 0x1D482, null) },
  { key: "script",
    fn: mapper(0x1D49C, 0x1D4B6, null,
      { B:0x212C,E:0x2130,F:0x2131,H:0x210B,I:0x2110,L:0x2112,M:0x2133,R:0x211B,
        e:0x212F,g:0x210A,o:0x2134 }) },
  { key: "fraktur",
    fn: mapper(0x1D504, 0x1D51E, null,
      { C:0x212D,H:0x210C,I:0x2111,R:0x211C,Z:0x2128 }) },
  { key: "double_struck",
    fn: mapper(0x1D538, 0x1D552, 0x1D7D8,
      { C:0x2102,H:0x210D,N:0x2115,P:0x2119,Q:0x211A,R:0x211D,Z:0x2124 }) },
  { key: "sans",
    fn: mapper(0x1D5A0, 0x1D5BA, 0x1D7E2) },
  { key: "sans_bold",
    fn: mapper(0x1D5D4, 0x1D5EE, 0x1D7EC) },
  { key: "monospace",
    fn: mapper(0x1D670, 0x1D68A, 0x1D7F6) },
  { key: "fullwidth",
    fn: mapper(0xFF21, 0xFF41, 0xFF10) },
  { key: "small_caps",
    fn: (ch) => SMALL_CAPS[ch] ?? ch },
  { key: "circled",
    fn: (ch) => {
      const c = ch.codePointAt(0)!;
      if (c >= 65 && c <= 90)  return String.fromCodePoint(0x24B6 + c - 65);
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x24D0 + c - 97);
      if (ch === "0") return "\u24EA";
      if (c >= 49 && c <= 57)  return String.fromCodePoint(0x2460 + c - 49);
      return ch;
    } },
];

function convert(text: string, fn: Conv): string {
  return Array.from(text).map(fn).join("");
}

// ---- コンポーネント ----

export default function UnicodeFontGenerator() {
  const t = useTranslations("unicode-font-generator");
  const [input, setInput] = useState("Hello World 123");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const debouncedInput = useDebounce(input, 300);

  const results = useMemo(
    () => STYLES.map(({ key, fn }) => ({ key, text: convert(debouncedInput, fn) })),
    [debouncedInput]
  );

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch { }
  };

  return (
    <div className="space-y-5">
      {/* 入力 */}
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <p className="mt-1 text-xs text-gray-400">{t("note")}</p>
      </div>

      {/* スタイル一覧 */}
      {input ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map(({ key, text }) => (
            <div key={key} className="border border-gray-200 rounded-lg px-4 py-3 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-500">{t(`styles.${key}`)}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(text, key)}
                  className="text-xs text-gray-400 hover:text-primary transition-colors shrink-0"
                >
                  {copiedKey === key ? t("copied") : t("copy")}
                </button>
              </div>
              <p className="text-base break-all leading-relaxed text-gray-800 select-all">{text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">{t("empty")}</p>
      )}
    </div>
  );
}
