"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

type CEvent = {
  id: string;
  name: string;
  target: string; // ISO 8601 datetime string
};

type TimeLeft = {
  elapsed: boolean;
  d: number;
  h: number;
  m: number;
  s: number;
  totalMs: number;
};

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();
  const abs = Math.abs(diff);
  const totalSec = Math.floor(abs / 1000);
  return {
    elapsed: diff < 0,
    totalMs: abs,
    d: Math.floor(totalSec / 86400),
    h: Math.floor((totalSec % 86400) / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
  };
}

const STORAGE_KEY = "quicker:countdowns";
const MAX_EVENTS = 10;

export default function CountdownTimer() {
  const t = useTranslations("countdown-timer");
  const [events, setEvents] = useState<CEvent[]>([]);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEvents(JSON.parse(stored) as CEvent[]);
    } catch {}
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  void tick;

  function persist(next: CEvent[]) {
    setEvents(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function handleAdd() {
    if (!name.trim() || !target || events.length >= MAX_EVENTS) return;
    persist([
      ...events,
      { id: crypto.randomUUID(), name: name.trim(), target },
    ]);
    setName("");
    setTarget("");
  }

  function handleDelete(id: string) {
    persist(events.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* 追加フォーム */}
      <div className="tool-card p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{t("addEvent")}</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={t("namePlaceholder")}
            maxLength={50}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <input
            type="datetime-local"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim() || !target || events.length >= MAX_EVENTS}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium
                       hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            {t("add")}
          </button>
        </div>
        {events.length >= MAX_EVENTS && (
          <p className="text-xs text-gray-400 mt-2">{t("maxReached")}</p>
        )}
      </div>

      {/* イベント一覧 */}
      {events.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">{t("noEvents")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((ev) => {
            const tl = calcTimeLeft(ev.target);
            const urgent = !tl.elapsed && tl.totalMs < 7 * 24 * 3600 * 1000;
            return (
              <div
                key={ev.id}
                className={`tool-card p-4 relative ${urgent ? "border-l-4 border-l-accent" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => handleDelete(ev.id)}
                  className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center
                             text-gray-400 hover:text-gray-600 rounded text-xs"
                  aria-label={t("delete")}
                >
                  ✕
                </button>
                <p className="font-semibold text-sm truncate pr-8">{ev.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(ev.target).toLocaleString()}
                </p>

                {tl.elapsed ? (
                  <p className="mt-3 text-sm text-gray-500">
                    {t("elapsed", { days: tl.d })}
                  </p>
                ) : (
                  <div className="mt-3 flex gap-4">
                    {(
                      [
                        { val: tl.d, key: "days" },
                        { val: tl.h, key: "hours" },
                        { val: tl.m, key: "minutes" },
                        { val: tl.s, key: "seconds" },
                      ] as const
                    ).map(({ val, key }) => (
                      <div key={key} className="text-center">
                        <div
                          className={`text-2xl font-bold tabular-nums ${
                            urgent ? "text-accent" : "text-primary"
                          }`}
                        >
                          {String(val).padStart(2, "0")}
                        </div>
                        <div className="text-xs text-gray-400">{t(key)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
