"use client";
import { useState, useRef, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Phase = "idle" | "waiting" | "ready" | "result" | "early";

export function useReactionTime() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [bestMs, setBestMs] = useLocalStorage<number | null>("reaction-time-best", null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(0);

  const start = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("waiting");
    setLastMs(null);
    const delay = 1500 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      setPhase("ready");
      startRef.current = performance.now();
    }, delay);
  }, []);

  const click = useCallback(() => {
    if (phase === "idle" || phase === "result" || phase === "early") {
      start();
      return;
    }
    if (phase === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("early");
      return;
    }
    if (phase === "ready") {
      const ms = Math.round(performance.now() - startRef.current);
      setLastMs(ms);
      setPhase("result");
      setHistory((prev) => [...prev.slice(-4), ms]);
      setBestMs((prev) => (prev === null || ms < prev ? ms : prev));
    }
  }, [phase, start, setBestMs]);

  const avg =
    history.length > 0
      ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
      : null;

  return { phase, lastMs, bestMs, history, avg, click };
}
