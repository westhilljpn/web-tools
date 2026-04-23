"use client";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { useSpeedTest } from "@/hooks/useSpeedTest";
import type { SpeedTier } from "@/hooks/useSpeedTest";

const ROUNDS = 5;

const TIER_COLOR: Record<SpeedTier, string> = {
  slow:     "#ef4444",
  standard: "#f59e0b",
  fast:     "#22c55e",
  ultra:    "#06b6d4",
};

const TIER_GLOW: Record<SpeedTier, string> = {
  slow:     "rgba(239,68,68,0.5)",
  standard: "rgba(245,158,11,0.4)",
  fast:     "rgba(34,197,94,0.5)",
  ultra:    "rgba(6,182,212,0.5)",
};

const TIER_EMOJI: Record<SpeedTier, string> = {
  slow:     "🐢",
  standard: "📶",
  fast:     "✅",
  ultra:    "⚡",
};

function streamDuration(mbps: number): string {
  const dur = Math.max(0.2, 3 / Math.pow(Math.max(mbps, 0.1), 0.4));
  return `${dur.toFixed(2)}s`;
}

interface StreamPipeProps {
  mbps: number;
  tier: SpeedTier | null;
}

function StreamPipe({ mbps, tier }: StreamPipeProps) {
  const color = tier ? TIER_COLOR[tier] : "#3b82f6";
  const dur = streamDuration(mbps);
  const isSlow = tier === "slow";

  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{ width: 220, height: 36, background: "#0f172a", border: "2px solid #334155" }}
    >
      {isSlow ? (
        <div
          className="sc-drip"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            width: 20,
            height: 20,
            background: `${color}B3`,
            borderRadius: "50%",
            "--sc-duration": dur,
          } as CSSProperties}
        />
      ) : (
        [0, 0.1, 0.2].map((delay, i) => (
          <div
            key={i}
            className="sc-stream absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${color}80 30%, ${color} 50%, ${color}80 70%, transparent 100%)`,
              animationDelay: `${delay}s`,
              "--sc-duration": dur,
            } as CSSProperties}
          />
        ))
      )}
    </div>
  );
}

export default function SpeedChecker() {
  const t = useTranslations("speed-checker");
  const { phase, currentMbps, finalMbps, round, tier, error, start, reset } =
    useSpeedTest();

  const color = tier ? TIER_COLOR[tier] : "#3b82f6";
  const glow  = tier ? TIER_GLOW[tier]  : "rgba(59,130,246,0.4)";

  async function handleShare() {
    if (finalMbps === null || tier === null) return;
    const text = `回線速度: ${finalMbps.toFixed(1)} Mbps（${t(`tiers.${tier}`)}）\n計測: Web Tools Speed Checker`;
    if (navigator.share) {
      await navigator.share({ title: "Speed Checker", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col items-center gap-6 py-10 px-6"
      style={{ background: "linear-gradient(160deg, #0a0e1a 0%, #0d1a2e 60%, #0a1020 100%)" }}
    >
      {/* 背景グロー */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{ width: 140, height: 140, top: -30, left: 10, background: "rgba(6,182,212,0.08)", filter: "blur(40px)" }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{ width: 100, height: 100, bottom: 10, right: 10, background: "rgba(168,85,247,0.08)", filter: "blur(30px)" }}
      />

      {/* ── IDLE ── */}
      {phase === "idle" && (
        <>
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full text-5xl"
              style={{ width: 80, height: 80, background: "linear-gradient(135deg, #1e3a5f, #1e293b)", border: "2px solid #334155" }}
            >
              📡
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-100">{t("ui.title")}</p>
              <p className="text-xs text-slate-500 mt-1">{t("ui.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={start}
            className="px-8 py-3 rounded-full font-bold text-white text-base cursor-pointer"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", boxShadow: "0 0 20px rgba(59,130,246,0.4)" }}
          >
            {t("ui.start")}
          </button>
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <p className="text-xs text-slate-600 text-center whitespace-pre-line">
            {t("ui.dataNote")}
          </p>
        </>
      )}

      {/* ── MEASURING ── */}
      {phase === "measuring" && (
        <>
          <div className="text-center" aria-live="polite">
            <p
              className="font-black tabular-nums leading-none"
              style={{ fontSize: 64, background: "linear-gradient(135deg, #3b82f6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {currentMbps > 0 ? currentMbps.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-slate-500 tracking-widest mt-1">Mbps</p>
          </div>
          <StreamPipe mbps={Math.max(currentMbps, 1)} tier={null} />
          <div className="rounded-full overflow-hidden" style={{ width: 220, height: 4, background: "#1e293b" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(round / ROUNDS) * 100}%`, background: "linear-gradient(90deg, #3b82f6, #06b6d4)", boxShadow: "0 0 8px #06b6d4" }}
            />
          </div>
          <p className="text-xs text-slate-500">{t("ui.roundLabel", { round })}</p>
        </>
      )}

      {/* ── DONE ── */}
      {phase === "done" && finalMbps !== null && tier !== null && (
        <>
          <div className="text-center">
            <p
              className="font-black tabular-nums leading-none"
              style={{ fontSize: 72, color, textShadow: `0 0 30px ${glow}` }}
            >
              {finalMbps >= 10 ? finalMbps.toFixed(0) : finalMbps.toFixed(1)}
            </p>
            <p className="text-sm text-slate-500 tracking-widest mt-1">Mbps Download</p>
            <div
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold mt-2"
              style={{ background: `${color}26`, border: `1px solid ${color}66`, color }}
            >
              {TIER_EMOJI[tier]} {t(`tiers.${tier}`)}
            </div>
          </div>
          <StreamPipe mbps={finalMbps} tier={tier} />
          <p className="text-xs text-center" style={{ color, opacity: 0.8 }}>
            {t(`hints.${tier}`)}
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <button
              onClick={reset}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              🔁 {t("ui.retry")}
            </button>
            <button
              onClick={handleShare}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              📤 {t("ui.share")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
