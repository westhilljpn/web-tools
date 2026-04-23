"use client";
import { useState, useCallback, useRef } from "react";

export type TestPhase = "idle" | "measuring" | "done";
export type SpeedTier = "slow" | "standard" | "fast" | "ultra";

export interface SpeedTestState {
  phase: TestPhase;
  currentMbps: number;
  finalMbps: number | null;
  round: number;
  tier: SpeedTier | null;
  error: string | null;
}

const PAYLOAD_BYTES = 512 * 1024;
const ROUNDS = 5;
const TIMEOUT_MS = 10_000;

function toMbps(bytes: number, ms: number): number {
  return (bytes * 8) / (ms / 1000) / 1_000_000;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function getTier(mbps: number): SpeedTier {
  if (mbps < 5) return "slow";
  if (mbps < 25) return "standard";
  if (mbps < 100) return "fast";
  return "ultra";
}

const INITIAL_STATE: SpeedTestState = {
  phase: "idle",
  currentMbps: 0,
  finalMbps: null,
  round: 0,
  tier: null,
  error: null,
};

export function useSpeedTest() {
  const [state, setState] = useState<SpeedTestState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setState({ ...INITIAL_STATE, phase: "measuring" });

    const results: number[] = [];
    try {
      for (let i = 0; i < ROUNDS; i++) {
        const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
        const t0 = performance.now();
        const res = await fetch(`/api/speedtest?r=${Math.random()}`, {
          signal: ac.signal,
        });
        await res.arrayBuffer();
        clearTimeout(timer);
        const elapsed = performance.now() - t0;
        const mbps = toMbps(PAYLOAD_BYTES, elapsed);
        results.push(mbps);
        setState((s) => ({ ...s, currentMbps: mbps, round: i + 1 }));
      }
      const finalMbps = median(results);
      setState((s) => ({
        ...s,
        phase: "done",
        finalMbps,
        tier: getTier(finalMbps),
      }));
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setState({
          ...INITIAL_STATE,
          error: "計測に失敗しました。もう一度お試しください。",
        });
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL_STATE);
  }, []);

  return { ...state, start, reset };
}
