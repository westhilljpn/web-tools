"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

// ---- カラー変換ユーティリティ ----

function hexToHsl(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const r = parseInt(m[1].slice(0, 2), 16) / 255;
  const g = parseInt(m[1].slice(2, 4), 16) / 255;
  const b = parseInt(m[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100, ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hslToRgb(h: number, s: number, l: number): string {
  const sl = s / 100, ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)));
  };
  return `rgb(${f(0)}, ${f(8)}, ${f(4)})`;
}

function rotate(h: number, deg: number): number {
  return ((h + deg) % 360 + 360) % 360;
}

interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
}

function makeColor(h: number, s: number, l: number): ColorInfo {
  const hex = hslToHex(h, s, l);
  return {
    hex,
    rgb: hslToRgb(h, s, l),
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
  };
}

// ---- スウォッチコンポーネント ----

interface SwatchProps {
  color: ColorInfo;
  onCopy: (text: string, label: string) => void;
  size?: "sm" | "md";
}

function Swatch({ color, onCopy, size = "md" }: SwatchProps) {
  const [open, setOpen] = useState(false);
  const h = size === "sm" ? "h-12" : "h-16";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`w-full ${h} rounded-lg border border-white/20 shadow-sm hover:scale-105 transition-transform`}
        style={{ backgroundColor: color.hex }}
        title={color.hex}
      />
      <p className="text-center text-xs font-mono mt-1 text-gray-600">{color.hex}</p>
      {open && (
        <div className="absolute z-10 top-full mt-1 left-1/2 -translate-x-1/2 bg-white border border-gray-200
                        rounded-lg shadow-lg p-2 flex flex-col gap-1 min-w-[140px]">
          {(["hex", "rgb", "hsl"] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => { onCopy(color[fmt], fmt.toUpperCase()); setOpen(false); }}
              className="text-xs text-left px-2 py-1 rounded hover:bg-primary/10 hover:text-primary
                         font-mono transition-colors truncate"
            >
              {color[fmt]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- メインコンポーネント ----

export default function ColorPalette() {
  const t = useTranslations("color-palette");
  const [input, setInput] = useState("#3b82f6");
  const [toast, setToast] = useState("");

  const palette = useMemo(() => {
    const hsl = hexToHsl(input);
    if (!hsl) return null;
    const [h, s, l] = hsl;

    const base = makeColor(h, s, l);
    const complementary = [makeColor(rotate(h, 180), s, l)];
    const analogous = [makeColor(rotate(h, -30), s, l), makeColor(rotate(h, 30), s, l)];
    const triadic = [makeColor(rotate(h, 120), s, l), makeColor(rotate(h, 240), s, l)];
    const splitComplementary = [makeColor(rotate(h, 150), s, l), makeColor(rotate(h, 210), s, l)];

    const tints = [10, 20, 30, 40].map((inc) => makeColor(h, s, Math.min(l + inc, 95)));
    const shades = [10, 20, 30, 40].map((dec) => makeColor(h, s, Math.max(l - dec, 5)));

    return { base, complementary, analogous, triadic, splitComplementary, tints, shades };
  }, [input]);

  const handleCopy = (text: string, _label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setToast(text);
    setTimeout(() => setToast(""), 1800);
  };

  const isValid = !!hexToHsl(input);

  return (
    <div className="space-y-6">
      {/* カラー入力 */}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={isValid ? input : "#3b82f6"}
          onChange={(e) => setInput(e.target.value)}
          className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer p-0.5"
        />
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            spellCheck={false}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {input && !isValid && (
            <p className="mt-1 text-xs text-red-500">Invalid HEX color (e.g. #3b82f6)</p>
          )}
        </div>
      </div>

      {!palette && (
        <p className="text-sm text-gray-400 text-center py-4">{t("results.empty")}</p>
      )}

      {palette && (
        <div className="space-y-5">
          {/* ベースカラー */}
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t("labels.baseColor")}
            </p>
            <div className="grid grid-cols-1 w-32">
              <Swatch color={palette.base} onCopy={handleCopy} />
            </div>
          </section>

          {/* ハーモニー */}
          {[
            { key: "complementary",    colors: palette.complementary },
            { key: "analogous",        colors: palette.analogous },
            { key: "triadic",          colors: palette.triadic },
            { key: "splitComplementary", colors: palette.splitComplementary },
          ].map(({ key, colors }) => (
            <section key={key}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t(`labels.${key}`)}
              </p>
              <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))`, maxWidth: `${colors.length * 8}rem` }}>
                {colors.map((c, i) => (
                  <Swatch key={i} color={c} onCopy={handleCopy} />
                ))}
              </div>
            </section>
          ))}

          {/* ティント・シェード */}
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t("labels.tints")}
            </p>
            <div className="grid grid-cols-4 gap-3" style={{ maxWidth: "32rem" }}>
              {palette.tints.map((c, i) => (
                <Swatch key={i} color={c} onCopy={handleCopy} size="sm" />
              ))}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t("labels.shades")}
            </p>
            <div className="grid grid-cols-4 gap-3" style={{ maxWidth: "32rem" }}>
              {palette.shades.map((c, i) => (
                <Swatch key={i} color={c} onCopy={handleCopy} size="sm" />
              ))}
            </div>
          </section>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                        text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50">
          {t("buttons.copied")}
        </div>
      )}
    </div>
  );
}
