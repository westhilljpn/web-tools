# Speed Checker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 回線速度（ダウンロード専用）をリアルタイムの流体ストリームアニメーションで視覚化するツールを追加する。

**Architecture:** Next.js API ルート (`/api/speedtest`) で 512KB のランダムバイト列を返し、フック (`useSpeedTest`) が 5 ラウンド計測して中央値を算出。UI コンポーネント (`SpeedChecker`) は速度帯に応じた色・アニメーション速度で結果を表示する。

**Tech Stack:** Next.js 14 (App Router), TypeScript strict, Tailwind CSS, next-intl 4.x, Web Fetch API, CSS keyframe animations

---

## ファイル構成

| ファイル | 操作 | 役割 |
|---------|------|------|
| `src/app/api/speedtest/route.ts` | 作成 | 512KB ランダムバイト列を返す Route Handler |
| `src/hooks/useSpeedTest.ts` | 作成 | 5 ラウンド計測・中央値算出・状態管理 |
| `src/styles/globals.css` | 修正 | ストリーム・水滴 CSS アニメーション追加 |
| `src/tools/SpeedChecker.tsx` | 作成 | 4 状態 UI（idle / measuring / done-fast / done-slow） |
| `src/messages/en/tools/speed-checker.json` | 作成 | 英語翻訳 |
| `src/messages/ja/tools/speed-checker.json` | 作成 | 日本語翻訳 |
| `src/lib/toolsRegistry.ts` | 修正 | tools 配列に 1 エントリ追加 |
| `src/lib/toolComponents.tsx` | 修正 | SpeedChecker の dynamic import 追加 |

---

## Task 1: API ルート作成

**Files:**
- Create: `src/app/api/speedtest/route.ts`

- [ ] **Step 1: ディレクトリが存在しないことを確認してから作成**

```bash
ls src/app/api 2>/dev/null || echo "no api dir — creating"
mkdir -p src/app/api/speedtest
```

- [ ] **Step 2: Route Handler を作成**

`src/app/api/speedtest/route.ts` を以下の内容で作成:

```typescript
import { NextResponse } from "next/server";

const PAYLOAD_SIZE = 512 * 1024; // 512 KB

export function GET() {
  const bytes = new Uint8Array(PAYLOAD_SIZE);
  crypto.getRandomValues(bytes);
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
}
```

- [ ] **Step 3: TypeScript 型チェックを通す**

```bash
npx tsc --noEmit 2>&1 | grep "speedtest"
```

期待: エラーなし（出力なし）

- [ ] **Step 4: 開発サーバーで動作確認**

```bash
curl -s -o /dev/null -w "%{size_download}" "http://localhost:3000/api/speedtest?r=test"
```

期待: `524288`（512×1024 バイト）

- [ ] **Step 5: コミット**

```bash
git add src/app/api/speedtest/route.ts
git commit -m "[ツール追加] speedtest APIルート: 512KBランダムバイト列を返すRoute Handler"
```

---

## Task 2: useSpeedTest フック作成

**Files:**
- Create: `src/hooks/useSpeedTest.ts`

- [ ] **Step 1: フックを作成**

`src/hooks/useSpeedTest.ts` を以下の内容で作成:

```typescript
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
```

- [ ] **Step 2: TypeScript 型チェック**

```bash
npx tsc --noEmit 2>&1 | grep "useSpeedTest"
```

期待: エラーなし（出力なし）

- [ ] **Step 3: コミット**

```bash
git add src/hooks/useSpeedTest.ts
git commit -m "[ツール追加] useSpeedTestフック: 5ラウンド計測・中央値算出・AbortController対応"
```

---

## Task 3: CSS アニメーション追加

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: globals.css の末尾に追加**

`src/styles/globals.css` の末尾に以下を追記（既存の `.liquid-pour-in` の後に追加すること）:

```css
/* Speed Checker: stream */
@keyframes sc-stream {
  from { transform: translateX(-100%); }
  to   { transform: translateX(100%); }
}
.sc-stream {
  animation: sc-stream var(--sc-duration, 1s) linear infinite;
}

/* Speed Checker: drip */
@keyframes sc-drip {
  0%   { left: -12px; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { left: calc(100% + 12px); opacity: 0; }
}
.sc-drip {
  position: absolute;
  animation: sc-drip var(--sc-duration, 3s) ease-in-out infinite;
}
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build 2>&1 | tail -5
```

期待: `✓ Compiled successfully` もしくは `Route (app)` 一覧が表示される

- [ ] **Step 3: コミット**

```bash
git add src/styles/globals.css
git commit -m "[ツール追加] globals.css: SpeedChecker用ストリーム・水滴アニメーション追加"
```

---

## Task 4: SpeedChecker コンポーネント作成

**Files:**
- Create: `src/tools/SpeedChecker.tsx`

**前提知識:**
- `useTranslations("speed-checker")` でネームスペース `speed-checker` のキーを取得する
- `t("ui.start")` → "計測開始"、`t("tiers.ultra")` → "超高速" のように参照する
- CSS クラス `sc-stream` / `sc-drip` は globals.css で定義済み（Task 3）
- CSS 変数 `--sc-duration` でアニメーション速度を制御する
- 速度帯の色・グロー色は固定値なので Tailwind 任意値で表現できない部分は inline style を使用する

- [ ] **Step 1: コンポーネントを作成**

`src/tools/SpeedChecker.tsx` を以下の内容で作成:

```tsx
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

```

- [ ] **Step 2: TypeScript 型チェック**

```bash
npx tsc --noEmit 2>&1 | grep "SpeedChecker"
```

期待: エラーなし（出力なし）

- [ ] **Step 3: コミット**

```bash
git add src/tools/SpeedChecker.tsx
git commit -m "[ツール追加] SpeedCheckerコンポーネント: 4状態UI・流体ストリームビジュアル"
```

---

## Task 5: 翻訳ファイル作成（英語・日本語）

**Files:**
- Create: `src/messages/en/tools/speed-checker.json`
- Create: `src/messages/ja/tools/speed-checker.json`

- [ ] **Step 1: 英語翻訳ファイルを作成**

`src/messages/en/tools/speed-checker.json`:

```json
{
  "title": "Internet Speed Checker",
  "description": "Check your download speed instantly with a fluid stream animation that visually shows how fast your connection is. 5-round median measurement. No signup, no ads.",
  "keywords": [
    "internet speed test",
    "connection speed checker",
    "download speed test",
    "Mbps checker",
    "Wi-Fi speed test",
    "network speed",
    "broadband speed test",
    "online speed test free"
  ],
  "label": "", "placeholder": "", "buttons": {}, "results": {},
  "limitCheck": { "title": "", "unit": "", "over": "" }, "toast": {},
  "ui": {
    "title": "Connection Speed Checker",
    "subtitle": "Press the button to start measuring",
    "start": "Start Test",
    "retry": "Try Again",
    "share": "Share",
    "roundLabel": "Round {round} / 5",
    "dataNote": "No ads · No account required\nAll data stays in your browser"
  },
  "tiers": {
    "slow":     "Slow",
    "standard": "Standard",
    "fast":     "Fast",
    "ultra":    "Ultra Fast"
  },
  "hints": {
    "slow":     "OK for email, light browsing, and SD video",
    "standard": "Suitable for HD video and video calls",
    "fast":     "Great for 4K video and large downloads",
    "ultra":    "Handles 4K, gaming, and multiple devices easily"
  },
  "howToUse": [
    { "label": "Press Start", "description": "Tap the 'Start Test' button. The measurement begins immediately — no waiting." },
    { "label": "Wait for 5 rounds", "description": "The tool fetches 500 KB of data 5 times and measures each transfer. This takes about 5–15 seconds depending on your speed." },
    { "label": "Read your result", "description": "The median of 5 rounds is displayed as your final speed. The colour and animation reflect your connection speed — green/cyan is fast, red is slow." }
  ],
  "faq": [
    {
      "question": "How accurate is this speed test?",
      "answer": "The tool uses the median of 5 measurement rounds, which reduces the effect of temporary network spikes. Results are a useful guide but may vary with server load and time of day."
    },
    {
      "question": "How much data does one test use?",
      "answer": "Each test downloads approximately 2.5 MB (500 KB × 5 rounds). Be mindful if you are on a limited mobile data plan."
    },
    {
      "question": "Why is my result different from other speed test sites?",
      "answer": "Results vary by server location, measurement method, and the number of simultaneous connections. Use this tool as a quick reference rather than a precise benchmark."
    },
    {
      "question": "What is a typical home Wi-Fi speed?",
      "answer": "Fibre broadband typically delivers 100–600 Mbps, while public Wi-Fi ranges from 5–50 Mbps. Mobile 4G averages around 20–50 Mbps."
    },
    {
      "question": "Is upload speed measured?",
      "answer": "Only download speed is measured. Upload measurement requires sending data to the server, which this tool does not do."
    }
  ]
}
```

- [ ] **Step 2: 日本語翻訳ファイルを作成**

`src/messages/ja/tools/speed-checker.json`:

```json
{
  "title": "回線速度チェッカー",
  "description": "インターネット回線のダウンロード速度を即座に計測。速さが視覚的にわかる流体アニメーション付き。5回計測の中央値で安定した結果を表示。登録不要・広告なし。",
  "keywords": [
    "回線速度",
    "速度測定",
    "ネット速度",
    "Mbps",
    "スピードテスト",
    "Wi-Fi 速度確認",
    "インターネット速度 計測",
    "ダウンロード速度 テスト"
  ],
  "label": "", "placeholder": "", "buttons": {}, "results": {},
  "limitCheck": { "title": "", "unit": "", "over": "" }, "toast": {},
  "ui": {
    "title": "回線速度チェッカー",
    "subtitle": "ボタンを押してすぐ計測開始",
    "start": "計測開始",
    "retry": "もう一度",
    "share": "シェア",
    "roundLabel": "ラウンド {round} / 5",
    "dataNote": "広告なし・アカウント不要\nデータは端末内で完結"
  },
  "tiers": {
    "slow":     "低速",
    "standard": "標準",
    "fast":     "高速",
    "ultra":    "超高速"
  },
  "hints": {
    "slow":     "SD動画・メール・軽いWebは利用可",
    "standard": "HD動画・ビデオ通話が快適",
    "fast":     "4K動画・大容量ダウンロードも快適",
    "ultra":    "4K動画・ゲーム・複数端末同時利用も余裕"
  },
  "howToUse": [
    { "label": "計測開始", "description": "「計測開始」ボタンを押すと即座に計測が始まります。アカウント登録や設定は不要です。" },
    { "label": "5ラウンド自動計測", "description": "500KB のデータを5回ダウンロードして各回の速度を計測します。回線速度により5〜15秒程度かかります。" },
    { "label": "結果を確認", "description": "5回の中央値が最終結果として表示されます。アニメーションの速さと色（緑・シアン=高速、赤=低速）で速度を直感的に確認できます。" }
  ],
  "faq": [
    {
      "question": "計測結果はどのくらい正確ですか？",
      "answer": "5回計測の中央値を使用するため、単発計測より安定しています。ただしサーバー負荷や時間帯によって変動します。目安としてご活用ください。"
    },
    {
      "question": "計測中にデータ通信量は消費されますか？",
      "answer": "1回の計測で約2.5MB（500KB × 5ラウンド）のデータをダウンロードします。モバイル通信でご利用の場合はご注意ください。"
    },
    {
      "question": "他のスピードテストサイトと結果が異なるのはなぜですか？",
      "answer": "計測に使うサーバーの距離・計測回数・並列接続数の違いにより数値が変わります。簡易的な参考値としてご利用ください。"
    },
    {
      "question": "一般的な家庭用Wi-Fiの速度はどのくらいですか？",
      "answer": "家庭用の光回線（フレッツ光など）は100〜600Mbps、公共Wi-Fiは5〜50Mbps程度が目安です。スマホの4G通信は20〜50Mbps前後が一般的です。"
    },
    {
      "question": "アップロード速度は計測できますか？",
      "answer": "現在はダウンロード速度のみ対応しています。アップロード計測にはサーバーへのデータ送信が必要なため、現バージョンでは省略しています。"
    }
  ]
}
```

- [ ] **Step 3: コミット**

```bash
git add src/messages/en/tools/speed-checker.json src/messages/ja/tools/speed-checker.json
git commit -m "[ツール追加] speed-checker翻訳ファイル: en/ja両言語"
```

---

## Task 6: ツール登録（toolsRegistry + toolComponents）

**Files:**
- Modify: `src/lib/toolsRegistry.ts`
- Modify: `src/lib/toolComponents.tsx`

- [ ] **Step 1: toolsRegistry.ts の tools 配列末尾（`color-sort` の後）に追加**

`src/lib/toolsRegistry.ts` の `block-puzzle` エントリの直後、配列の `];` の直前に以下を追加:

```typescript
  {
    slug: "speed-checker",
    category: "dev",
    icon: "📡",
    component: "SpeedChecker",
    updatedAt: "2026-04-20",
  },
```

- [ ] **Step 2: toolComponents.tsx の末尾 `};` の直前に追加**

`src/lib/toolComponents.tsx` の `BlockPuzzle` エントリの後、`};` の直前に以下を追加:

```typescript
  SpeedChecker: dynamic(() => import("@/tools/SpeedChecker"), { loading: Loading }),
```

- [ ] **Step 3: TypeScript 型チェック**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

期待: エラーなし

- [ ] **Step 4: コミット**

```bash
git add src/lib/toolsRegistry.ts src/lib/toolComponents.tsx
git commit -m "[ツール追加] speed-checkerをtoolsRegistry・toolComponentsに登録"
```

---

## Task 7: ビルド確認・動作検証

**Files:** (変更なし — 検証のみ)

- [ ] **Step 1: フルビルドを実行**

```bash
npm run build 2>&1 | tail -20
```

期待: エラーなし。`/en/speed-checker` および `/ja/speed-checker` が静的ページとしてリストされる。

- [ ] **Step 2: dev サーバーで日本語ページを確認**

```bash
npm run dev &
```

`http://localhost:3000/ja/speed-checker` を開いて以下を確認:
- 「回線速度チェッカー」のタイトルが表示される
- 「計測開始」ボタンが表示される
- ボタンを押すとカウンターが動き出す
- 5ラウンド後に結果数値とストリームアニメーションが表示される
- 「もう一度」で idle 状態に戻る

- [ ] **Step 3: 英語ページを確認**

`http://localhost:3000/en/speed-checker` を開いて以下を確認:
- "Internet Speed Checker" のタイトルが表示される
- "Start Test" ボタンが表示される

- [ ] **Step 4: コミット（変更がある場合のみ）**

ビルドや動作確認で修正が生じた場合:

```bash
git add -p
git commit -m "[修正] speed-checker: ビルド確認で発覚した問題を修正"
```
