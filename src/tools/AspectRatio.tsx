"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function gcd(a: number, b: number): number {
  return b < 0.5 ? a : gcd(b, a % b);
}

function simplify(w: number, h: number): [number, number] {
  const d = gcd(Math.round(w), Math.round(h));
  return [Math.round(w) / d, Math.round(h) / d];
}

const COMMON_RATIOS = [
  { label: "16:9",   w: 16,  h: 9   },
  { label: "4:3",    w: 4,   h: 3   },
  { label: "1:1",    w: 1,   h: 1   },
  { label: "21:9",   w: 21,  h: 9   },
  { label: "3:2",    w: 3,   h: 2   },
  { label: "9:16",   w: 9,   h: 16  },
  { label: "2:3",    w: 2,   h: 3   },
  { label: "5:4",    w: 5,   h: 4   },
];

const GOLDEN = 1.6180339887;

type Mode = "fromDimensions" | "fromRatio";

export default function AspectRatio() {
  const t = useTranslations("aspect-ratio");
  const [mode, setMode] = useState<Mode>("fromDimensions");

  // モード1: 縦横から計算
  const [w1, setW1] = useState("");
  const [h1, setH1] = useState("");

  // モード2: 比率 + 片方から計算
  const [rw, setRw] = useState("16");
  const [rh, setRh] = useState("9");
  const [knownSide, setKnownSide] = useState<"w" | "h">("w");
  const [knownVal, setKnownVal] = useState("");

  const [toast, setToast] = useState("");

  const result1 = useMemo(() => {
    const nw = parseFloat(w1);
    const nh = parseFloat(h1);
    if (!nw || !nh || nw <= 0 || nh <= 0) return null;
    const [sw, sh] = simplify(nw, nh);
    const decimal = nw / nh;
    // 最も近い一般的比率
    const nearest = COMMON_RATIOS.reduce((best, r) => {
      const diff = Math.abs(decimal - r.w / r.h);
      const bestDiff = Math.abs(decimal - best.w / best.h);
      return diff < bestDiff ? r : best;
    });
    return { simplified: `${sw}:${sh}`, decimal: decimal.toFixed(4), nearest };
  }, [w1, h1]);

  const result2 = useMemo(() => {
    const nrw = parseFloat(rw);
    const nrh = parseFloat(rh);
    const nKnown = parseFloat(knownVal);
    if (!nrw || !nrh || !nKnown || nrw <= 0 || nrh <= 0 || nKnown <= 0) return null;
    if (knownSide === "w") {
      const calcH = Math.round(nKnown * (nrh / nrw));
      return { calcW: Math.round(nKnown), calcH };
    } else {
      const calcW = Math.round(nKnown * (nrw / nrh));
      return { calcW, calcH: Math.round(nKnown) };
    }
  }, [rw, rh, knownSide, knownVal]);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setToast(text);
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <div className="space-y-6">
      {/* モードタブ */}
      <div className="flex gap-2 flex-wrap">
        {(["fromDimensions", "fromRatio"] as Mode[]).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === m
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:border-primary hover:text-primary"
            }`}
          >
            {t(`modes.${m}`)}
          </button>
        ))}
      </div>

      {/* モード1: 縦横から計算 */}
      {mode === "fromDimensions" && (
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.width")} ({t("labels.px")})</label>
              <input type="number" value={w1} onChange={(e) => setW1(e.target.value)} placeholder="1920"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <span className="text-gray-400 pb-2.5 text-lg font-light">×</span>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.height")} ({t("labels.px")})</label>
              <input type="number" value={h1} onChange={(e) => setH1(e.target.value)} placeholder="1080"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>

          {result1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={() => copy(result1.simplified)}
                className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-left hover:bg-primary/10 transition-colors group">
                <p className="text-xs text-gray-500 mb-1">{t("labels.simplifiedRatio")}</p>
                <p className="text-2xl font-bold text-primary">{result1.simplified}</p>
                <p className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100">{t("buttons.copy")}</p>
              </button>
              <button onClick={() => copy(result1.decimal)}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-100 transition-colors group">
                <p className="text-xs text-gray-500 mb-1">{t("labels.decimalRatio")}</p>
                <p className="text-2xl font-bold text-gray-800">{result1.decimal}</p>
                <p className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100">{t("buttons.copy")}</p>
              </button>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t("labels.commonRatios")}</p>
                <p className="text-2xl font-bold text-gray-800">{result1.nearest.label}</p>
                <p className="text-xs text-gray-400 mt-1">nearest match</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">{t("results.empty")}</p>
          )}
        </div>
      )}

      {/* モード2: 比率 + 片方から計算 */}
      {mode === "fromRatio" && (
        <div className="space-y-4">
          {/* 比率入力 */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.ratio")} W</label>
              <input type="number" value={rw} onChange={(e) => setRw(e.target.value)} placeholder="16"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <span className="text-gray-400 pb-2.5 text-xl font-light">:</span>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.ratio")} H</label>
              <input type="number" value={rh} onChange={(e) => setRh(e.target.value)} placeholder="9"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>

          {/* クイック比率 */}
          <div className="flex flex-wrap gap-2">
            {COMMON_RATIOS.map((r) => (
              <button key={r.label} type="button" onClick={() => { setRw(String(r.w)); setRh(String(r.h)); }}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  rw === String(r.w) && rh === String(r.h)
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                }`}>
                {r.label}
              </button>
            ))}
          </div>

          {/* 既知の辺 */}
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">Known side</label>
              <div className="flex gap-2">
                {(["w", "h"] as const).map((side) => (
                  <label key={side} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                    <input type="radio" name="knownSide" value={side} checked={knownSide === side}
                      onChange={() => setKnownSide(side)} className="accent-primary" />
                    {side === "w" ? t("labels.width") : t("labels.height")}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                {knownSide === "w" ? t("labels.width") : t("labels.height")} ({t("labels.px")})
              </label>
              <input type="number" value={knownVal} onChange={(e) => setKnownVal(e.target.value)} placeholder="1920"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>

          {result2 ? (
            <button onClick={() => copy(`${result2.calcW} × ${result2.calcH}`)}
              className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 text-left
                         hover:bg-primary/10 transition-colors">
              <p className="text-xs text-gray-500 mb-1">{t("labels.width")} × {t("labels.height")}</p>
              <p className="text-2xl font-bold text-primary">
                {result2.calcW} × {result2.calcH}
              </p>
            </button>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">{t("results.empty")}</p>
          )}
        </div>
      )}

      {/* 黄金比 参考 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
        <span className="font-semibold">Golden ratio φ</span>: {GOLDEN.toFixed(6)} : 1 ≈ 1.618 : 1
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                        text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50">
          {t("results.copied")}
        </div>
      )}
    </div>
  );
}
