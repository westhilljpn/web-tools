"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export default function CssBoxShadow() {
  const t = useTranslations("css-box-shadow");

  const [offsetX, setOffsetX] = useState(4);
  const [offsetY, setOffsetY] = useState(6);
  const [blur, setBlur] = useState(12);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(25);
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);

  const shadowValue = useMemo(() => {
    const rgb = hexToRgb(color);
    const alpha = (opacity / 100).toFixed(2);
    const colorStr = rgb
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
      : `rgba(0, 0, 0, ${alpha})`;
    const parts = [
      inset ? "inset" : null,
      `${offsetX}px`,
      `${offsetY}px`,
      `${blur}px`,
      `${spread}px`,
      colorStr,
    ].filter(Boolean);
    return parts.join(" ");
  }, [offsetX, offsetY, blur, spread, color, opacity, inset]);

  function handleCopy() {
    navigator.clipboard
      .writeText(`box-shadow: ${shadowValue};`)
      .catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sliderClass = "flex-1 accent-primary h-2";
  const numInputClass =
    "w-16 px-2 py-1 text-sm border border-sky-soft dark:border-sky/20 rounded text-right " +
    "bg-white dark:bg-primary/5 text-primary dark:text-sky " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  type SliderRow = {
    label: string;
    value: number;
    set: (v: number) => void;
    min: number;
    max: number;
    step: number;
    unit: string;
  };

  const sliders: SliderRow[] = [
    { label: t("labels.offsetX"),  value: offsetX,  set: setOffsetX,  min: -100, max: 100, step: 1, unit: "px" },
    { label: t("labels.offsetY"),  value: offsetY,  set: setOffsetY,  min: -100, max: 100, step: 1, unit: "px" },
    { label: t("labels.blur"),     value: blur,     set: setBlur,     min: 0,    max: 100, step: 1, unit: "px" },
    { label: t("labels.spread"),   value: spread,   set: setSpread,   min: -50,  max: 50,  step: 1, unit: "px" },
    { label: t("labels.opacity"),  value: opacity,  set: setOpacity,  min: 0,    max: 100, step: 1, unit: "%"  },
  ];

  return (
    <div className="space-y-6">
      {/* スライダー群 */}
      <div className="space-y-4">
        {sliders.map(({ label, value, set, min, max, step, unit }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-primary dark:text-sky">
                {label}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={value}
                  min={min}
                  max={max}
                  step={step}
                  onChange={(e) =>
                    set(Math.min(max, Math.max(min, parseFloat(e.target.value) || 0)))
                  }
                  className={numInputClass}
                />
                <span className="text-xs text-steel dark:text-sky/70">{unit}</span>
              </div>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => set(parseFloat(e.target.value))}
              className={sliderClass}
            />
          </div>
        ))}
      </div>

      {/* 色選択 */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-primary dark:text-sky">
          {t("labels.color")}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded border border-sky-soft dark:border-sky/20 cursor-pointer p-0.5 bg-white dark:bg-primary/5"
          />
          <span className="text-sm font-mono text-steel dark:text-sky/70 uppercase">
            {color}
          </span>
        </div>
        {/* inset トグル */}
        <label className="flex items-center gap-2 ml-auto cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inset}
            onChange={(e) => setInset(e.target.checked)}
            className="accent-primary w-4 h-4"
          />
          <span className="text-sm text-primary dark:text-sky">{t("labels.inset")}</span>
        </label>
      </div>

      {/* プレビュー */}
      <div>
        <p className="text-sm font-medium text-primary dark:text-sky mb-3">
          {t("labels.preview")}
        </p>
        <div className="flex items-center justify-center h-40 bg-surface dark:bg-primary/10 rounded-xl border border-sky-soft dark:border-sky/20">
          <div
            className="w-24 h-24 bg-white dark:bg-primary/20 rounded-xl"
            style={{ boxShadow: shadowValue }}
          />
        </div>
      </div>

      {/* CSSコード */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-primary dark:text-sky">
            {t("labels.cssCode")}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs px-3 py-1.5 rounded-lg border border-sky-soft dark:border-sky/20
                       bg-white dark:bg-primary/5 text-steel dark:text-sky/70
                       hover:bg-sky hover:text-primary dark:hover:bg-sky/20 transition-colors font-medium"
          >
            {copied ? t("ui.copied") : t("ui.copy")}
          </button>
        </div>
        <div className="bg-primary dark:bg-primary/80 rounded-lg px-4 py-3">
          <code className="text-sm font-mono text-sky break-all">
            box-shadow: {shadowValue};
          </code>
        </div>
      </div>
    </div>
  );
}
