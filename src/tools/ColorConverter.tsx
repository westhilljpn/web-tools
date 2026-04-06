"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useClipboard } from "@/lib/hooks/useClipboard";
import Toast from "@/components/Toast";

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface HslColor {
  h: number;
  s: number;
  l: number;
}

interface HsbColor {
  h: number;
  s: number;
  b: number;
}

interface ConvertedColor {
  hex: string;
  rgb: RgbColor;
  hsl: HslColor;
  hsb: HsbColor;
}

// CSSカラー文字列をRGBに解析する
function parseToRgb(input: string): RgbColor | null {
  const s = input.trim();
  if (!s) return null;
  // ブラウザのCSS解析を利用
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#000000";
  ctx.fillStyle = s;
  // 無効な色は変換されずblackのまま
  const computed = ctx.fillStyle;
  if (computed === "#000000" && s !== "#000" && s !== "#000000" && s !== "black") {
    return null;
  }
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  const r = data[0], g = data[1], b = data[2];
  return { r, g, b };
}

function rgbToHex({ r, g, b }: RgbColor): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsb({ r, g, b }: RgbColor): HsbColor {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const bv = max;
  const s = max === 0 ? 0 : (max - min) / max;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), b: Math.round(bv * 100) };
}

function convert(input: string): ConvertedColor | null {
  const rgb = parseToRgb(input);
  if (!rgb) return null;
  return {
    hex: rgbToHex(rgb),
    rgb,
    hsl: rgbToHsl(rgb),
    hsb: rgbToHsb(rgb),
  };
}

export default function ColorConverter() {
  const t = useTranslations("color-converter");
  const { copy } = useClipboard();
  const [input, setInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return convert(input.trim());
  }, [input]);

  async function handleCopy(value: string) {
    await copy(value);
    showToast(t("toast.copied"));
  }

  // カラーピッカーの値が変わったとき
  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  const pickerValue = result?.hex ?? "#000000";

  // 各フォーマットの文字列表現
  const formatValues = result
    ? {
        hex: result.hex,
        rgb: `rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`,
        hsl: `hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)`,
        hsb: `hsb(${result.hsb.h}, ${result.hsb.s}%, ${result.hsb.b}%)`,
      }
    : null;

  return (
    <div className="space-y-5">
      {/* 入力エリア */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("label")}
        </label>
        <div className="flex gap-3 items-center">
          {/* カラーピッカー */}
          <label className="shrink-0 cursor-pointer" title="Color picker">
            <input
              type="color"
              value={pickerValue}
              onChange={handlePickerChange}
              className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer p-0.5"
            />
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            spellCheck={false}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{t("inputHint")}</p>
      </div>

      {/* 入力が無効な場合 */}
      {input.trim() && !result && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          <span className="font-semibold">✗</span>
          <span>{t("toast.invalidColor")}</span>
        </div>
      )}

      {/* カラープレビュー + 変換結果 */}
      {result && formatValues && (
        <div className="space-y-4">
          {/* プレビューバー */}
          <div
            className="w-full h-20 rounded-xl border border-gray-200 shadow-sm"
            style={{ backgroundColor: result.hex }}
          />

          {/* 各フォーマット */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["hex", "rgb", "hsl", "hsb"] as const).map((fmt) => (
              <div
                key={fmt}
                className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                    {t(`results.${fmt}`)}
                  </p>
                  <p className="text-sm font-mono text-gray-800 break-all">
                    {formatValues[fmt]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(formatValues[fmt])}
                  className="shrink-0 btn-secondary text-xs px-3 py-1.5"
                >
                  {t("buttons.copy")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
