"use client";

import { useState, useEffect } from "react";

/**
 * 入力値を指定した遅延時間でデバウンスするフック
 * リアルタイム処理のパフォーマンス最適化に使用する
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
