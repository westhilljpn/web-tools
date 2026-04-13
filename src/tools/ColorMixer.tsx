"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
}

// 線形RGB空間で混合（物理的に正確）
function mixColors(
  [r1, g1, b1]: [number, number, number],
  [r2, g2, b2]: [number, number, number],
  ratio: number // 0=color1, 1=color2
): [number, number, number] {
  // sRGB → linear
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  // linear → sRGB
  const srgb = (v: number) => {
    const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, c)) * 255);
  };
  return [
    srgb(lin(r1) * (1 - ratio) + lin(r2) * ratio),
    srgb(lin(g1) * (1 - ratio) + lin(g2) * ratio),
    srgb(lin(b1) * (1 - ratio) + lin(b2) * ratio),
  ];
}

function Steps({
  c1, c2, rgb1, rgb2,
}: {
  c1: string; c2: string;
  rgb1: [number,number,number]; rgb2: [number,number,number];
}) {
  const steps = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="flex rounded-xl overflow-hidden h-10">
      {steps.map(r => {
        const [mr, mg, mb] = mixColors(rgb1, rgb2, r);
        const hex = rgbToHex(mr, mg, mb);
        return <div key={r} className="flex-1" style={{ backgroundColor: hex }} title={hex} />;
      })}
    </div>
  );
}

export default function ColorMixer() {
  const t = useTranslations("color-mixer");
  const [color1, setColor1] = useState("#1D3D5E");
  const [color2, setColor2] = useState("#e94d71");
  const [ratio, setRatio] = useState(50);
  const [copied, setCopied] = useState("");

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const mixed =
    rgb1 && rgb2 ? mixColors(rgb1, rgb2, ratio / 100) : null;
  const mixedHex = mixed ? rgbToHex(...mixed) : "";

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(""), 2000);
  }, []);

  return (
    <div className="space-y-6">
      {/* 2色選択 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Color 1 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t("color1")}</label>
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-300 cursor-pointer shrink-0">
              <input
                type="color"
                value={color1}
                onChange={e => setColor1(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full h-full rounded-lg" style={{ backgroundColor: color1 }} />
            </div>
            <input
              type="text"
              value={color1}
              onChange={e => setColor1(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          {rgb1 && (
            <p className="text-xs text-gray-400 font-mono">
              rgb({rgb1[0]}, {rgb1[1]}, {rgb1[2]})
            </p>
          )}
        </div>

        {/* Color 2 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t("color2")}</label>
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-300 cursor-pointer shrink-0">
              <input
                type="color"
                value={color2}
                onChange={e => setColor2(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full h-full rounded-lg" style={{ backgroundColor: color2 }} />
            </div>
            <input
              type="text"
              value={color2}
              onChange={e => setColor2(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          {rgb2 && (
            <p className="text-xs text-gray-400 font-mono">
              rgb({rgb2[0]}, {rgb2[1]}, {rgb2[2]})
            </p>
          )}
        </div>
      </div>

      {/* グラデーションプレビュー（5段階）*/}
      {rgb1 && rgb2 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">{t("gradient")}</p>
          <Steps c1={color1} c2={color2} rgb1={rgb1} rgb2={rgb2} />
        </div>
      )}

      {/* 割合スライダー */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t("color1")} {100 - ratio}%</span>
          <span>{t("color2")} {ratio}%</span>
        </div>
        <input
          type="range"
          min={0} max={100} step={1}
          value={ratio}
          onChange={e => setRatio(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* 混合結果 */}
      {mixedHex && mixed && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="h-24" style={{ backgroundColor: mixedHex }} />
          <div className="bg-gray-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-gray-800">{t("result")}</p>
              <p className="font-mono text-sm text-gray-600">{mixedHex.toUpperCase()}</p>
              <p className="font-mono text-xs text-gray-400">rgb({mixed[0]}, {mixed[1]}, {mixed[2]})</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCopy(mixedHex.toUpperCase())}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                {copied === mixedHex.toUpperCase() ? t("copied") : t("copyHex")}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(`rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`)}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                {copied === `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})` ? t("copied") : t("copyRgb")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
