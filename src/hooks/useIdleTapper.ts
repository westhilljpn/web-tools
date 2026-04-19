"use client";
import { useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Upgrade = {
  id: string;
  name: string;
  cost: number;
  effect: "click" | "auto";
  value: number;
  description: string;
};

export type SaveData = {
  stars: number;
  totalClicks: number;
  purchased: string[];
};

export const UPGRADES: Upgrade[] = [
  { id: "click-1", name: "Star Burst",      cost: 10,   effect: "click", value: 2,  description: "Double tap power" },
  { id: "click-2", name: "Stellar Touch",   cost: 50,   effect: "click", value: 2,  description: "Double tap power again" },
  { id: "auto-1",  name: "Star Drone",      cost: 100,  effect: "auto",  value: 1,  description: "+1 star/sec" },
  { id: "auto-2",  name: "Star Factory",    cost: 500,  effect: "auto",  value: 5,  description: "+5 stars/sec" },
  { id: "auto-3",  name: "Galactic Engine", cost: 2000, effect: "auto",  value: 20, description: "+20 stars/sec" },
];

const INITIAL: SaveData = { stars: 0, totalClicks: 0, purchased: [] };

export function useIdleTapper() {
  const [save, setSave] = useLocalStorage<SaveData>("idle-tapper-save", INITIAL);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clickPower = UPGRADES.filter(
    (u) => u.effect === "click" && save.purchased.includes(u.id)
  ).reduce((p, u) => p * u.value, 1);

  const autoRate = UPGRADES.filter(
    (u) => u.effect === "auto" && save.purchased.includes(u.id)
  ).reduce((s, u) => s + u.value, 0);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRate > 0) {
      intervalRef.current = setInterval(() => {
        setSave((prev) => ({ ...prev, stars: prev.stars + autoRate }));
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRate]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = useCallback(() => {
    setSave((prev) => ({
      ...prev,
      stars: prev.stars + clickPower,
      totalClicks: prev.totalClicks + 1,
    }));
  }, [clickPower, setSave]);

  const buyUpgrade = useCallback((id: string) => {
    const upgrade = UPGRADES.find((u) => u.id === id);
    if (!upgrade || save.purchased.includes(id) || save.stars < upgrade.cost) return;
    setSave((prev) => ({
      ...prev,
      stars: prev.stars - upgrade.cost,
      purchased: [...prev.purchased, id],
    }));
  }, [save.purchased, save.stars, setSave]);

  const resetGame = useCallback(() => {
    setSave(INITIAL);
  }, [setSave]);

  return { stars: save.stars, totalClicks: save.totalClicks, purchased: save.purchased, clickPower, autoRate, tap, buyUpgrade, resetGame };
}
