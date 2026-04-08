"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

type Phase = "work" | "shortBreak" | "longBreak";
interface Config { work: number; shortBreak: number; longBreak: number; cycles: number; }

const DEFAULTS: Config = { work: 25, shortBreak: 5, longBreak: 15, cycles: 4 };
const RADIUS = 88;
const CIRC = 2 * Math.PI * RADIUS;

function phaseSecs(c: Config, p: Phase) {
  return (p === "work" ? c.work : p === "shortBreak" ? c.shortBreak : c.longBreak) * 60;
}

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function beep(ctx: AudioContext, freq: number, when: number) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.value = freq; o.type = "sine";
  g.gain.setValueAtTime(0.25, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.4);
  o.start(when); o.stop(when + 0.4);
}

export default function PomodoroTimer() {
  const t = useTranslations("pomodoro-timer");
  const [cfg, setCfg] = useState<Config>(DEFAULTS);
  const [phase, setPhase] = useState<Phase>("work");
  const [secs, setSecs] = useState(DEFAULTS.work * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [task, setTask] = useState("");
  const [showCfg, setShowCfg] = useState(false);
  const [notify, setNotify] = useState(false);
  const aRef = useRef<AudioContext | null>(null);
  const onCompleteRef = useRef<() => void>(() => {});

  const gotoPhase = useCallback((p: Phase, c: Config) => {
    setPhase(p); setSecs(phaseSecs(c, p)); setRunning(false);
  }, []);

  // 完了ハンドラーを毎レンダーで最新化（stale closure 回避）
  onCompleteRef.current = () => {
    if (aRef.current) {
      const ctx = aRef.current, now = ctx.currentTime;
      beep(ctx, 880, now); beep(ctx, 1100, now + 0.5);
    }
    if (notify) {
      try {
        new Notification(
          phase === "work" ? t("notification.workDone") : t("notification.breakDone"),
          { body: phase === "work" ? (task || t("notification.timeToBreak")) : t("notification.backToWork") }
        );
      } catch { /* 通知が許可されていない場合は無視 */ }
    }
    if (phase === "work") {
      setDone((d) => d + 1);
      const ni = cycleIdx + 1;
      if (ni >= cfg.cycles) { setCycleIdx(0); gotoPhase("longBreak", cfg); }
      else { setCycleIdx(ni); gotoPhase("shortBreak", cfg); }
    } else {
      gotoPhase("work", cfg);
    }
  };

  // タイマー（1秒デクリメント）
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  // 完了検知
  useEffect(() => {
    if (secs === 0 && running) { setRunning(false); onCompleteRef.current(); }
  }, [secs, running]);

  // スペースキーでスタート / ポーズ
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault(); setRunning((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  function toggle() { if (!aRef.current) aRef.current = new AudioContext(); setRunning((v) => !v); }
  function reset() { setRunning(false); setSecs(phaseSecs(cfg, phase)); }
  function skip() {
    setRunning(false);
    if (phase === "work") {
      const ni = cycleIdx + 1;
      if (ni >= cfg.cycles) { setCycleIdx(0); gotoPhase("longBreak", cfg); }
      else { setCycleIdx(ni); gotoPhase("shortBreak", cfg); }
    } else { gotoPhase("work", cfg); }
  }
  async function reqNotify() {
    if (!("Notification" in window)) return;
    setNotify((await Notification.requestPermission()) === "granted");
  }
  function updCfg(k: keyof Config, v: number) {
    const next = { ...cfg, [k]: v };
    setCfg(next);
    if (!running) setSecs(phaseSecs(next, phase));
  }

  const COLOR = {
    work:       { stroke: "#ef4444", cls: "text-red-500",   bg: "bg-red-50"   },
    shortBreak: { stroke: "#22c55e", cls: "text-green-500", bg: "bg-green-50" },
    longBreak:  { stroke: "#3b82f6", cls: "text-blue-500",  bg: "bg-blue-50"  },
  }[phase];

  const dashOff = CIRC * (1 - secs / phaseSecs(cfg, phase));
  const focusMins = done * cfg.work;

  return (
    <div className="space-y-5 max-w-sm mx-auto">
      {/* フェーズタブ */}
      <div className="flex gap-2 justify-center flex-wrap">
        {(["work", "shortBreak", "longBreak"] as Phase[]).map((p) => (
          <button key={p} type="button" onClick={() => { setRunning(false); gotoPhase(p, cfg); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              phase === p ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {t(`phases.${p}`)}
          </button>
        ))}
      </div>

      {/* タスク名 */}
      <input type="text" value={task} onChange={(e) => setTask(e.target.value)}
        placeholder={t("taskPlaceholder")}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-300"
      />

      {/* 円形タイマー */}
      <div className="flex justify-center">
        <div className="relative inline-block">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle cx="110" cy="110" r={RADIUS} fill="none"
              stroke={COLOR.stroke} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={dashOff}
              className={running ? "[transition:stroke-dashoffset_1s_linear]" : ""}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-mono font-bold ${COLOR.cls}`}>{fmt(secs)}</span>
            <span className="text-xs text-gray-400 mt-1">{t(`phases.${phase}`)}</span>
          </div>
        </div>
      </div>

      {/* サイクルドット */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: cfg.cycles }).map((_, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i < cycleIdx ? "bg-red-400" : "bg-gray-200"
          }`} />
        ))}
      </div>

      {/* コントロール */}
      <div className="flex gap-3 justify-center">
        <button type="button" onClick={reset}
          className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium transition-colors">
          {t("buttons.reset")}
        </button>
        <button type="button" onClick={toggle}
          className={`px-8 py-3 rounded-xl text-white text-sm font-bold transition-colors shadow-sm ${
            running ? "bg-gray-600 hover:bg-gray-700" : "bg-gray-800 hover:bg-gray-900"
          }`}>
          {running ? t("buttons.pause") : t("buttons.start")}
        </button>
        <button type="button" onClick={skip}
          className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium transition-colors">
          {t("buttons.skip")}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">{t("spaceHint")}</p>

      {/* 統計 */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-4 text-center ${COLOR.bg}`}>
          <p className="text-2xl font-bold text-gray-800">{done}</p>
          <p className="text-xs text-gray-500 mt-1">{t("stats.pomodoros")}</p>
        </div>
        <div className={`rounded-xl p-4 text-center ${COLOR.bg}`}>
          <p className="text-2xl font-bold text-gray-800">
            {focusMins >= 60 ? `${Math.floor(focusMins / 60)}h ${focusMins % 60}m` : `${focusMins}m`}
          </p>
          <p className="text-xs text-gray-500 mt-1">{t("stats.focusTime")}</p>
        </div>
      </div>

      {/* 設定パネル */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <button type="button" onClick={() => setShowCfg((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 transition-colors">
          <span className="font-medium">{t("settings.title")}</span>
          <span className="text-gray-400 text-xs">{showCfg ? "▲" : "▼"}</span>
        </button>
        {showCfg && (
          <div className="p-4 space-y-3">
            {([
              { k: "work" as const,       lbl: t("settings.work"),       min: 1, max: 90, u: t("settings.min") },
              { k: "shortBreak" as const, lbl: t("settings.shortBreak"), min: 1, max: 30, u: t("settings.min") },
              { k: "longBreak" as const,  lbl: t("settings.longBreak"),  min: 5, max: 60, u: t("settings.min") },
              { k: "cycles" as const,     lbl: t("settings.cycles"),     min: 2, max: 8,  u: t("settings.times") },
            ]).map(({ k, lbl, min, max, u }) => (
              <div key={k} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-gray-600">{lbl}</span>
                <input type="number" value={cfg[k]} min={min} max={max}
                  onChange={(e) => updCfg(k, Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
                  className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <span className="text-xs text-gray-400 w-10 shrink-0">{u}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">{t("settings.notify")}</span>
              <button type="button" onClick={notify ? () => setNotify(false) : reqNotify}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  notify ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {notify ? t("settings.notifyOn") : t("settings.notifyOff")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
