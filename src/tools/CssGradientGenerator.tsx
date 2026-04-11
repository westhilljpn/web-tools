"use client";

import { useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";

type GradientType = "linear" | "radial" | "conic";

interface Stop {
  id: number;
  color: string;
  pos: number;
}

const PRESETS: Array<{
  nameKey: string;
  type: GradientType;
  angle: number;
  stops: Omit<Stop, "id">[];
}> = [
  { nameKey: "p_sunset",  type: "linear", angle: 135, stops: [{ color: "#ff6b6b", pos: 0 }, { color: "#feca57", pos: 100 }] },
  { nameKey: "p_ocean",   type: "linear", angle: 135, stops: [{ color: "#667eea", pos: 0 }, { color: "#764ba2", pos: 100 }] },
  { nameKey: "p_aurora",  type: "linear", angle: 135, stops: [{ color: "#0cebeb", pos: 0 }, { color: "#20e3b2", pos: 50 }, { color: "#29ffc6", pos: 100 }] },
  { nameKey: "p_fire",    type: "radial",  angle: 0,  stops: [{ color: "#f12711", pos: 0 }, { color: "#f5af19", pos: 100 }] },
  { nameKey: "p_sky",     type: "linear", angle: 180, stops: [{ color: "#2196F3", pos: 0 }, { color: "#21CBF3", pos: 100 }] },
  { nameKey: "p_neon",    type: "linear", angle: 90,  stops: [{ color: "#fc00ff", pos: 0 }, { color: "#00dbde", pos: 100 }] },
];

export default function CssGradientGenerator() {
  const t = useTranslations("css-gradient-generator");
  const nextId = useRef(3);
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    { id: 1, color: "#6366f1", pos: 0 },
    { id: 2, color: "#a855f7", pos: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const gradientValue = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.pos - b.pos);
    const stopsStr = sorted.map((s) => `${s.color} ${s.pos}%`).join(", ");
    if (type === "linear") return `linear-gradient(${angle}deg, ${stopsStr})`;
    if (type === "radial") return `radial-gradient(circle, ${stopsStr})`;
    return `conic-gradient(from ${angle}deg, ${stopsStr})`;
  }, [type, angle, stops]);

  const cssCode = `background: ${gradientValue};`;

  function updateStop(id: number, field: "color" | "pos", value: string | number) {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function addStop() {
    const sorted = [...stops].sort((a, b) => a.pos - b.pos);
    // 最も離れた2つのストップの中間に追加
    let maxGap = 0;
    let newPos = 50;
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].pos - sorted[i].pos;
      if (gap > maxGap) {
        maxGap = gap;
        newPos = Math.round((sorted[i].pos + sorted[i + 1].pos) / 2);
      }
    }
    setStops((prev) => [...prev, { id: nextId.current++, color: "#ffffff", pos: newPos }]);
  }

  function removeStop(id: number) {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  }

  function applyPreset(p: (typeof PRESETS)[number]) {
    setType(p.type);
    setAngle(p.angle);
    setStops(p.stops.map((s, i) => ({ ...s, id: nextId.current++ + i })));
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const sortedStops = [...stops].sort((a, b) => a.pos - b.pos);

  return (
    <div className="space-y-5">
      {/* プレビュー */}
      <div
        className="w-full h-40 rounded-xl shadow-inner border border-gray-200 transition-all duration-300"
        style={{ background: gradientValue }}
        aria-hidden="true"
      />

      {/* プリセット */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">{t("presets")}</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.nameKey}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600
                         hover:border-primary hover:text-primary transition-colors"
            >
              {t(p.nameKey)}
            </button>
          ))}
        </div>
      </div>

      {/* タイプ + アングル */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">{t("type")}</p>
          <div className="flex gap-1">
            {(["linear", "radial", "conic"] as const).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setType(tp)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                  type === tp
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
                }`}
              >
                {t(tp)}
              </button>
            ))}
          </div>
        </div>

        {(type === "linear" || type === "conic") && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">
              {t("angle")}: <span className="font-mono">{angle}°</span>
            </p>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        )}
      </div>

      {/* カラーストップ */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500">{t("colorStops")}</p>
          <button
            type="button"
            onClick={addStop}
            className="text-xs text-primary hover:text-blue-700 font-medium"
          >
            + {t("addStop")}
          </button>
        </div>
        <div className="space-y-2">
          {sortedStops.map((stop) => (
            <div key={stop.id} className="flex items-center gap-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                className="h-8 w-10 rounded border border-gray-300 cursor-pointer p-0.5 shrink-0"
              />
              <input
                type="text"
                value={stop.color}
                onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                className="w-24 shrink-0 px-2 py-1 text-xs font-mono border border-gray-300 rounded
                           focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={stop.pos}
                onChange={(e) => updateStop(stop.id, "pos", Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-xs text-gray-500 w-9 text-right shrink-0">{stop.pos}%</span>
              <button
                type="button"
                onClick={() => removeStop(stop.id)}
                disabled={stops.length <= 2}
                className="text-gray-300 hover:text-red-400 disabled:opacity-30 transition-colors text-xl leading-none shrink-0"
                aria-label={t("removeStop")}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CSSコード出力 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">{t("cssCode")}</p>
        <div className="flex gap-2 items-start">
          <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5
                           text-xs font-mono text-gray-800 break-all leading-relaxed">
            {cssCode}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="btn-secondary text-xs px-3 py-2 shrink-0"
          >
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </div>
    </div>
  );
}
