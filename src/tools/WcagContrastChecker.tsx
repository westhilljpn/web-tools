"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

// WCAG 2.1 相対輝度計算
function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return null;
  const l1 = relativeLuminance(c1.r, c1.g, c1.b);
  const l2 = relativeLuminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

interface CheckResult {
  label: string;
  aa: boolean;
  aaa: boolean;
  aaThreshold: number;
  aaaThreshold: number;
}

export default function WcagContrastChecker() {
  const t = useTranslations("wcag-contrast-checker");

  const [textColor, setTextColor] = useState("#1D3D5E");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [textHex, setTextHex] = useState("#1D3D5E");
  const [bgHex, setBgHex] = useState("#FFFFFF");
  const [copied, setCopied] = useState(false);

  const ratio = useMemo(
    () => contrastRatio(textColor, bgColor),
    [textColor, bgColor]
  );

  const checks: CheckResult[] = ratio !== null
    ? [
        { label: t("labels.normalText"),  aa: ratio >= 4.5, aaa: ratio >= 7,   aaThreshold: 4.5, aaaThreshold: 7 },
        { label: t("labels.largeText"),   aa: ratio >= 3,   aaa: ratio >= 4.5, aaThreshold: 3,   aaaThreshold: 4.5 },
        { label: t("labels.uiComponents"),aa: ratio >= 3,   aaa: false,        aaThreshold: 3,   aaaThreshold: Infinity },
      ]
    : [];

  function ratioColor(r: number): string {
    if (r >= 7) return "text-green-600 dark:text-green-400";
    if (r >= 4.5) return "text-green-500 dark:text-green-400";
    if (r >= 3) return "text-amber-600 dark:text-amber-400";
    return "text-accent";
  }

  function handleSwap() {
    setTextColor(bgColor);
    setBgColor(textColor);
    setTextHex(bgHex);
    setBgHex(textHex);
  }

  function handleCopyRatio() {
    if (ratio === null) return;
    navigator.clipboard.writeText(`${ratio}:1`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function syncColor(
    hex: string,
    setHex: (v: string) => void,
    setColor: (v: string) => void
  ) {
    setHex(hex);
    if (/^#[0-9a-f]{6}$/i.test(hex)) setColor(hex);
  }

  const colorInputClass =
    "flex-1 px-3 py-2 border border-sky-soft dark:border-sky/20 rounded-lg text-sm font-mono uppercase " +
    "bg-white dark:bg-primary/5 text-primary dark:text-sky " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="space-y-6">
      {/* カラー入力 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        {/* テキスト色 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
            {t("labels.textColor")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                setTextHex(e.target.value);
              }}
              className="w-10 h-10 rounded border border-sky-soft dark:border-sky/20 cursor-pointer p-0.5 bg-white dark:bg-primary/5 shrink-0"
            />
            <input
              type="text"
              value={textHex}
              maxLength={7}
              onChange={(e) => syncColor(e.target.value, setTextHex, setTextColor)}
              className={colorInputClass}
            />
          </div>
        </div>

        {/* 入れ替えボタン */}
        <button
          type="button"
          onClick={handleSwap}
          className="self-end sm:self-auto shrink-0 px-3 py-2.5 rounded-lg border border-sky-soft dark:border-sky/20
                     bg-white dark:bg-primary/5 text-steel dark:text-sky/70
                     hover:bg-sky hover:text-primary dark:hover:bg-sky/20 transition-colors text-sm"
          title={t("ui.swap")}
        >
          ⇄ {t("ui.swap")}
        </button>

        {/* 背景色 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
            {t("labels.bgColor")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => {
                setBgColor(e.target.value);
                setBgHex(e.target.value);
              }}
              className="w-10 h-10 rounded border border-sky-soft dark:border-sky/20 cursor-pointer p-0.5 bg-white dark:bg-primary/5 shrink-0"
            />
            <input
              type="text"
              value={bgHex}
              maxLength={7}
              onChange={(e) => syncColor(e.target.value, setBgHex, setBgColor)}
              className={colorInputClass}
            />
          </div>
        </div>
      </div>

      {/* コントラスト比 */}
      <div className="bg-surface dark:bg-primary/10 border border-sky-soft dark:border-sky/20 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-steel dark:text-sky/70 mb-0.5">
            {t("labels.contrastRatio")}
          </p>
          <p className={`text-4xl font-bold font-mono ${ratio !== null ? ratioColor(ratio) : "text-steel"}`}>
            {ratio !== null ? `${ratio}:1` : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyRatio}
          disabled={ratio === null}
          className="text-xs px-3 py-1.5 rounded-lg border border-sky-soft dark:border-sky/20
                     bg-white dark:bg-primary/5 text-steel dark:text-sky/70
                     hover:bg-sky hover:text-primary dark:hover:bg-sky/20 transition-colors
                     disabled:opacity-30"
        >
          {copied ? t("ui.copied") : t("ui.copy")}
        </button>
      </div>

      {/* プレビュー */}
      <div>
        <p className="text-sm font-medium text-primary dark:text-sky mb-2">
          {t("labels.preview")}
        </p>
        <div
          className="rounded-xl px-6 py-8 text-center space-y-2 border border-sky-soft dark:border-sky/20"
          style={{ backgroundColor: bgColor }}
        >
          <p className="text-2xl font-bold" style={{ color: textColor }}>
            {t("labels.previewText")}
          </p>
          <p className="text-base" style={{ color: textColor }}>
            {t("labels.previewText")}
          </p>
          <p className="text-sm" style={{ color: textColor }}>
            {t("labels.previewText")}
          </p>
        </div>
      </div>

      {/* WCAG判定 */}
      {checks.length > 0 && (
        <div>
          <p className="text-sm font-medium text-primary dark:text-sky mb-3">
            {t("labels.levels")}
          </p>
          <div className="rounded-xl border border-sky-soft dark:border-sky/20 overflow-hidden">
            <div className="grid grid-cols-3 bg-surface dark:bg-primary/10 px-4 py-2 border-b border-sky-soft dark:border-sky/20">
              <span className="text-xs font-medium text-steel dark:text-sky/70"></span>
              <span className="text-xs font-semibold text-center text-steel dark:text-sky/70">AA</span>
              <span className="text-xs font-semibold text-center text-steel dark:text-sky/70">AAA</span>
            </div>
            {checks.map(({ label, aa, aaa, aaThreshold, aaaThreshold }) => (
              <div
                key={label}
                className="grid grid-cols-3 px-4 py-3 border-b border-sky-soft dark:border-sky/10 last:border-0 items-center"
              >
                <span className="text-xs text-steel dark:text-sky/70 pr-2">{label}</span>
                <PassBadge pass={aa} threshold={aaThreshold} t={t} />
                {aaaThreshold === Infinity ? (
                  <span className="text-xs text-steel/40 dark:text-sky/30 text-center">—</span>
                ) : (
                  <PassBadge pass={aaa} threshold={aaaThreshold} t={t} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PassBadge({
  pass,
  threshold,
  t,
}: {
  pass: boolean;
  threshold: number;
  t: (k: string) => string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          pass
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "bg-red-100 dark:bg-red-900/30 text-accent"
        }`}
      >
        {pass ? t("labels.pass") : t("labels.fail")}
      </span>
      <span className="text-[10px] text-steel/60 dark:text-sky/30">≥ {threshold}:1</span>
    </div>
  );
}
