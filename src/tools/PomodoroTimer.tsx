"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

type Phase = "work" | "shortBreak" | "longBreak";
interface Config { work: number; shortBreak: number; longBreak: number; cycles: number; }

const DEFAULTS: Config = { work: 25, shortBreak: 5, longBreak: 15, cycles: 4 };
const R = 96; const CIRC = 2 * Math.PI * R;
const LIMITS: Record<keyof Config, [number, number]> = {
  work: [1, 90], shortBreak: [1, 30], longBreak: [5, 60], cycles: [2, 8],
};
const THEME = {
  work:       { prog: "stroke-rose-500",   txt: "text-rose-500",   bg: "bg-rose-50",   tab: "bg-rose-500 text-white",   dot: "bg-rose-400",   play: "bg-rose-500 hover:bg-rose-600 shadow-rose-200"   },
  shortBreak: { prog: "stroke-teal-500",   txt: "text-teal-600",   bg: "bg-teal-50",   tab: "bg-teal-500 text-white",   dot: "bg-teal-400",   play: "bg-teal-500 hover:bg-teal-600 shadow-teal-200"   },
  longBreak:  { prog: "stroke-indigo-500", txt: "text-indigo-600", bg: "bg-indigo-50", tab: "bg-indigo-500 text-white", dot: "bg-indigo-400", play: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200" },
} as const;

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
  g.gain.setValueAtTime(0.3, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.5);
  o.start(when); o.stop(when + 0.5);
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
  const [autoStart, setAutoStart] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const onCompleteRef = useRef<() => void>(() => {});
  const autoStartRef = useRef(false);
  autoStartRef.current = autoStart;
  const titleRef = useRef("");

  useEffect(() => {
    titleRef.current = document.title;
    return () => { document.title = titleRef.current; };
  }, []);
  useEffect(() => {
    document.title = running ? `${fmt(secs)} - ${t(`phases.${phase}`)}` : titleRef.current;
  }, [running, secs, phase, t]);

  const gotoPhase = useCallback((p: Phase, c: Config) => {
    setPhase(p); setSecs(phaseSecs(c, p)); setRunning(autoStartRef.current);
  }, []);

  onCompleteRef.current = () => {
    if (audioRef.current) {
      const ctx = audioRef.current, now = ctx.currentTime;
      beep(ctx, 880, now); beep(ctx, 1100, now + 0.5);
    }
    if (notify) {
      try {
        new Notification(
          phase === "work" ? t("notification.workDone") : t("notification.breakDone"),
          { body: phase === "work" ? (task || t("notification.timeToBreak")) : t("notification.backToWork") }
        );
      } catch { /* 通知非対応 */ }
    }
    if (phase === "work") {
      setDone((d) => d + 1);
      const ni = cycleIdx + 1;
      if (ni >= cfg.cycles) { setCycleIdx(0); gotoPhase("longBreak", cfg); }
      else { setCycleIdx(ni); gotoPhase("shortBreak", cfg); }
    } else { gotoPhase("work", cfg); }
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (secs === 0 && running) { setRunning(false); onCompleteRef.current(); }
  }, [secs, running]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault(); setRunning((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  function toggle() { if (!audioRef.current) audioRef.current = new AudioContext(); setRunning((v) => !v); }
  function reset() { setRunning(false); setSecs(phaseSecs(cfg, phase)); }
  function skip() {
    setRunning(false);
    if (phase === "work") {
      const ni = cycleIdx + 1;
      if (ni >= cfg.cycles) { setCycleIdx(0); gotoPhase("longBreak", cfg); }
      else { setCycleIdx(ni); gotoPhase("shortBreak", cfg); }
    } else gotoPhase("work", cfg);
  }
  async function reqNotify() {
    if ("Notification" in window) setNotify((await Notification.requestPermission()) === "granted");
  }
  function updCfg(k: keyof Config, delta: number) {
    const [min, max] = LIMITS[k];
    const next = { ...cfg, [k]: Math.max(min, Math.min(max, cfg[k] + delta)) };
    setCfg(next); if (!running) setSecs(phaseSecs(next, phase));
  }

  const th = THEME[phase];
  const dashOff = CIRC * (1 - secs / phaseSecs(cfg, phase));
  const focusMins = done * cfg.work;

  return (
    <div className="space-y-4 max-w-sm mx-auto select-none">

      {/* フェーズタブ */}
      <div className={`flex rounded-2xl p-1.5 gap-1 transition-colors duration-500 ${th.bg}`}>
        {(["work", "shortBreak", "longBreak"] as Phase[]).map((p) => (
          <button key={p} type="button"
            onClick={() => { setRunning(false); gotoPhase(p, cfg); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
              phase === p ? th.tab + " shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t(`phases.${p}`)}
          </button>
        ))}
      </div>

      {/* タイマーカード */}
      <div className={`rounded-3xl px-6 py-6 flex flex-col items-center gap-5 transition-colors duration-500 ${th.bg}`}>

        {/* タスク入力 */}
        <input type="text" value={task} onChange={(e) => setTask(e.target.value)}
          placeholder={t("taskPlaceholder")}
          className="w-full bg-white/60 text-sm text-center px-4 py-2.5 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/80 placeholder-gray-400 text-gray-700"
        />

        {/* 円形タイマー */}
        <div className="relative">
          <svg width="224" height="224" className="-rotate-90" aria-hidden="true">
            <circle cx="112" cy="112" r={R} fill="none" className="stroke-black/[0.07]" strokeWidth="12" />
            <circle cx="112" cy="112" r={R} fill="none"
              className={`${th.prog} ${running ? "[transition:stroke-dashoffset_1s_linear]" : ""}`}
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={dashOff}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <time className={`text-5xl font-mono font-bold tracking-tight ${th.txt}`}>{fmt(secs)}</time>
            <span className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-widest">{t(`phases.${phase}`)}</span>
          </div>
        </div>

        {/* サイクルドット */}
        <div className="flex gap-2.5 items-center">
          {Array.from({ length: cfg.cycles }).map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${
              i < cycleIdx
                ? `w-2.5 h-2.5 ${th.dot}`
                : i === cycleIdx && phase === "work"
                  ? `w-3.5 h-3.5 ${th.dot} ring-2 ring-white ring-offset-1`
                  : "w-2.5 h-2.5 bg-black/10"
            }`} />
          ))}
        </div>
      </div>

      {/* コントロール */}
      <div className="flex items-center justify-center gap-5">
        <button type="button" onClick={reset} aria-label={t("buttons.reset")}
          className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all hover:scale-105 active:scale-95">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>

        <button type="button" onClick={toggle}
          aria-label={running ? t("buttons.pause") : t("buttons.start")}
          className={`w-[76px] h-[76px] rounded-full text-white flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 ${th.play}`}>
          {running ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 ml-1">
              <path d="M6 3l15 9-15 9z"/>
            </svg>
          )}
        </button>

        <button type="button" onClick={skip} aria-label={t("buttons.skip")}
          className="w-[52px] h-[52px] rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all hover:scale-105 active:scale-95">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M6 4l12 8-12 8z"/>
            <rect x="18" y="4" width="2.5" height="16" rx="1"/>
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">{t("spaceHint")}</p>

      {/* 統計 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 bg-gray-50 text-center">
          <p className="text-2xl font-bold text-gray-800">{done}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t("stats.pomodoros")}</p>
        </div>
        <div className="rounded-2xl p-4 bg-gray-50 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {focusMins >= 60 ? `${Math.floor(focusMins / 60)}h ${focusMins % 60}m` : `${focusMins}m`}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{t("stats.focusTime")}</p>
        </div>
      </div>

      {/* 設定パネル */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <button type="button" onClick={() => setShowCfg((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-600 transition-colors">
          <span>{t("settings.title")}</span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showCfg ? "rotate-180" : ""}`}
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        {showCfg && (
          <div className="p-4 space-y-3 bg-white">
            {([
              { k: "work" as const,       lbl: t("settings.work"),       u: t("settings.min")   },
              { k: "shortBreak" as const, lbl: t("settings.shortBreak"), u: t("settings.min")   },
              { k: "longBreak" as const,  lbl: t("settings.longBreak"),  u: t("settings.min")   },
              { k: "cycles" as const,     lbl: t("settings.cycles"),     u: t("settings.times") },
            ]).map(({ k, lbl, u }) => (
              <div key={k} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-gray-600">{lbl}</span>
                <button type="button" onClick={() => updCfg(k, -1)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-bold flex items-center justify-center transition-colors leading-none">−</button>
                <span className="w-8 text-center text-sm font-semibold text-gray-800">{cfg[k]}</span>
                <button type="button" onClick={() => updCfg(k, +1)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-bold flex items-center justify-center transition-colors leading-none">+</button>
                <span className="w-6 text-xs text-gray-400 shrink-0">{u}</span>
              </div>
            ))}
            {([
              { lbl: t("settings.autoStart"), on: autoStart, fn: () => setAutoStart((v) => !v) },
              { lbl: t("settings.notify"),    on: notify,    fn: notify ? () => setNotify(false) : () => { void reqNotify(); } },
            ] as { lbl: string; on: boolean; fn: () => void }[]).map(({ lbl, on, fn }) => (
              <div key={lbl} className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">{lbl}</span>
                <button type="button" onClick={fn} role="switch" aria-checked={on}
                  className={`relative inline-flex h-5 w-10 rounded-full transition-colors duration-200 ${on ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
