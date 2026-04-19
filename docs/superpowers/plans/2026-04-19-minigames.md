# Minigames Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 browser games (2048, Minesweeper, Idle Tapper) plus a games hub page to Quicker, using the existing tool infrastructure.

**Architecture:** Each game is split into a logic hook (`src/hooks/`) + UI component (`src/tools/`). Games are registered in toolsRegistry as category "game". Scores persist via a shared `useLocalStorage` hook. The games hub page at `/[locale]/games` filters toolsRegistry by category.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, next-intl 4.x, localStorage (no npm additions)

---

## File Map

### New Files
- `src/hooks/useLocalStorage.ts` — generic typed localStorage hook
- `src/hooks/use2048.ts` — 2048 game logic (useReducer)
- `src/hooks/useMinesweeper.ts` — Minesweeper logic (reveal, flag, flood-fill)
- `src/hooks/useIdleTapper.ts` — Idle Tapper logic (click power, auto-production, upgrades)
- `src/tools/Game2048.tsx` — 2048 UI (grid, keyboard, swipe)
- `src/tools/Minesweeper.tsx` — Minesweeper UI (grid, flag, timer)
- `src/tools/IdleTapper.tsx` — Idle Tapper UI (star button, upgrades panel)
- `src/app/[locale]/games/page.tsx` — Games hub page
- `src/messages/en/tools/game-2048.json`
- `src/messages/ja/tools/game-2048.json`
- `src/messages/en/tools/minesweeper.json`
- `src/messages/ja/tools/minesweeper.json`
- `src/messages/en/tools/idle-tapper.json`
- `src/messages/ja/tools/idle-tapper.json`

### Modified Files
- `src/lib/toolsRegistry.ts` — add "game" to ToolCategory, register 3 games
- `src/lib/toolComponents.tsx` — add 3 dynamic imports
- `src/i18n/request.ts` — import 3 game JSON files for both locales
- `src/messages/en/common.json` — add categories.game + gamesHub
- `src/messages/ja/common.json` — add categories.game + gamesHub
- `src/app/[locale]/page.tsx` — add "game" to categoryKeys
- `src/app/[locale]/[tool-slug]/page.tsx` — GameApplication for game category
- `src/app/sitemap.ts` — add games hub URL

---

## Task 1: useLocalStorage hook

**Files:** Create `src/hooks/useLocalStorage.ts`

- [ ] Create `src/hooks/useLocalStorage.ts`:

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {}
  }, [key]);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key]
  );

  return [value, set];
}
```

- [ ] Commit: `git commit -m "[ゲーム] useLocalStorageフック追加"`

---

## Task 2: Registry & infrastructure

**Files:** Modify toolsRegistry.ts, toolComponents.tsx, common.json (en/ja), page.tsx (home), page.tsx (tool-slug), sitemap.ts

- [ ] In `src/lib/toolsRegistry.ts`, change `ToolCategory` type line 6 to:
```typescript
  | "game";
```
Then add 3 entries at the end of the `tools` array (before `];`):
```typescript
  {
    slug: "game-2048",
    category: "game",
    icon: "🔢",
    component: "Game2048",
    updatedAt: "2026-04-19",
    featured: true,
  },
  {
    slug: "minesweeper",
    category: "game",
    icon: "💣",
    component: "Minesweeper",
    updatedAt: "2026-04-19",
    featured: true,
  },
  {
    slug: "idle-tapper",
    category: "game",
    icon: "⭐",
    component: "IdleTapper",
    updatedAt: "2026-04-19",
    featured: true,
  },
```

- [ ] In `src/lib/toolComponents.tsx`, add 3 lines before `};`:
```typescript
  Game2048: dynamic(() => import("@/tools/Game2048"), { loading: Loading }),
  Minesweeper: dynamic(() => import("@/tools/Minesweeper"), { loading: Loading }),
  IdleTapper: dynamic(() => import("@/tools/IdleTapper"), { loading: Loading }),
```

- [ ] In `src/messages/en/common.json`, add `"game": "Game"` to `categories` and add `gamesHub` section:
```json
"categories": {
  "all": "All",
  "text": "Text",
  "convert": "Convert",
  "image": "Image",
  "calculate": "Calculate",
  "lifestyle": "Lifestyle",
  "dev": "Dev",
  "game": "Game"
},
"gamesHub": {
  "title": "Free Online Games",
  "description": "Play free browser games. No download, no login. Everything runs in your browser."
},
```

- [ ] In `src/messages/ja/common.json`, add same keys in Japanese:
```json
"categories": {
  ...existing...,
  "game": "ゲーム"
},
"gamesHub": {
  "title": "無料ブラウザゲーム",
  "description": "無料でブラウザゲームが遊べます。ダウンロード不要・ログイン不要。"
},
```

- [ ] In `src/app/[locale]/page.tsx`, update `categoryKeys` line to include "game":
```typescript
const categoryKeys = ["all", "text", "convert", "image", "calculate", "lifestyle", "dev", "game"] as const;
```

- [ ] In `src/app/[locale]/[tool-slug]/page.tsx`, change `applicationCategory` in `webAppSchema`:
```typescript
applicationCategory: tool.category === "game" ? "GameApplication" : "UtilityApplication",
```

- [ ] In `src/app/sitemap.ts`, add games hub pages to `staticPages`:
```typescript
...locales.map((locale) => ({
  url: `${siteUrl}/${locale}/games`,
  lastModified: new Date(),
  changeFrequency: "weekly" as const,
  priority: 0.9,
})),
```

- [ ] Commit: `git commit -m "[ゲーム] toolsRegistry・共通設定にgameカテゴリ追加"`

---

## Task 3: Translation files — 2048

**Files:** Create en/ja JSON for game-2048

- [ ] Create `src/messages/en/tools/game-2048.json`:
```json
{
  "title": "2048",
  "description": "Play 2048 online for free. Slide tiles to combine numbers and reach the 2048 tile. No download needed — runs in your browser.",
  "keywords": ["2048", "2048 game", "2048 online", "number puzzle", "tile game", "free game"],
  "label": "",
  "placeholder": "",
  "buttons": {},
  "results": {},
  "limitCheck": { "title": "", "unit": "", "over": "" },
  "toast": {},
  "score": "Score",
  "best": "Best",
  "newGame": "New Game",
  "won": "You Win!",
  "gameOver": "Game Over",
  "continue": "Keep Going",
  "tryAgain": "Try Again",
  "hint": "Arrow keys or swipe to move tiles",
  "howToUse": [
    { "label": "Start", "description": "The board starts with two tiles (2 or 4). A new tile appears after each move." },
    { "label": "Move tiles", "description": "Use arrow keys on desktop or swipe on mobile to slide all tiles in one direction." },
    { "label": "Merge", "description": "When two tiles with the same number collide, they merge into one tile with their combined value." },
    { "label": "Reach 2048", "description": "Keep merging until you create a 2048 tile to win. You can choose to keep playing after winning." }
  ],
  "faq": [
    { "question": "What is 2048?", "answer": "2048 is a sliding tile puzzle. You move tiles on a 4x4 grid to merge matching numbers, aiming to create a tile with the value 2048." },
    { "question": "How do I control the tiles?", "answer": "Use arrow keys on a keyboard, or swipe left, right, up, or down on a touchscreen." },
    { "question": "Is my best score saved?", "answer": "Yes. Your best score is automatically saved in your browser's local storage and will be there when you return." },
    { "question": "What happens when the board fills up?", "answer": "If there are no empty cells and no adjacent tiles with the same number, the game ends." },
    { "question": "Can I keep playing after reaching 2048?", "answer": "Yes. When you reach 2048 you can choose to keep going and aim for 4096 or beyond." }
  ]
}
```

- [ ] Create `src/messages/ja/tools/game-2048.json`:
```json
{
  "title": "2048",
  "description": "ブラウザで無料プレイできる2048ゲーム。タイルをスライドして数字を合体させ、2048を目指そう。インストール不要。",
  "keywords": ["2048", "2048ゲーム", "2048 オンライン", "数字パズル", "タイルゲーム", "無料ゲーム"],
  "label": "",
  "placeholder": "",
  "buttons": {},
  "results": {},
  "limitCheck": { "title": "", "unit": "", "over": "" },
  "toast": {},
  "score": "スコア",
  "best": "ベスト",
  "newGame": "新しいゲーム",
  "won": "クリア！",
  "gameOver": "ゲームオーバー",
  "continue": "続ける",
  "tryAgain": "もう一度",
  "hint": "矢印キーまたはスワイプでタイルを移動",
  "howToUse": [
    { "label": "スタート", "description": "4×4のボードに2または4のタイルが2枚表示された状態でゲームが始まります。" },
    { "label": "タイルを動かす", "description": "PCでは矢印キー、スマホではスワイプ操作でタイルを一方向に全て動かします。" },
    { "label": "合体", "description": "同じ数字のタイルが隣り合うと合体し、2倍の数字になります。" },
    { "label": "2048を目指す", "description": "合体を繰り返して2048のタイルを作ればクリア。クリア後も続けてより高い数字を目指せます。" }
  ],
  "faq": [
    { "question": "2048とはどんなゲームですか？", "answer": "4×4グリッド上のタイルを上下左右にスライドさせ、同じ数字のタイルを合体させて2048を目指すパズルゲームです。" },
    { "question": "どうやって操作しますか？", "answer": "PCでは矢印キー、スマートフォンやタブレットでは画面のスワイプ操作でタイルを動かせます。" },
    { "question": "ベストスコアは保存されますか？", "answer": "はい。ブラウザのローカルストレージに自動保存され、次回アクセス時にも引き継がれます。" },
    { "question": "ボードが埋まったらどうなりますか？", "answer": "空きマスがなく、隣り合う同じ数字のタイルもない場合はゲームオーバーです。" },
    { "question": "2048を作った後も続けられますか？", "answer": "はい。2048タイルが完成したときに「続ける」を選ぶと、さらに高い数字を目指してプレイできます。" }
  ]
}
```

- [ ] Commit: `git commit -m "[ゲーム] 2048翻訳ファイル追加"`

---

## Task 4: Translation files — Minesweeper

- [ ] Create `src/messages/en/tools/minesweeper.json`:
```json
{
  "title": "Minesweeper",
  "description": "Play Minesweeper free online. Clear the board without hitting mines. Three difficulty levels. Runs entirely in your browser.",
  "keywords": ["minesweeper", "minesweeper online", "minesweeper free", "mine game", "logic game"],
  "label": "",
  "placeholder": "",
  "buttons": {},
  "results": {},
  "limitCheck": { "title": "", "unit": "", "over": "" },
  "toast": {},
  "easy": "Easy",
  "medium": "Medium",
  "hard": "Hard",
  "minesLeft": "Mines",
  "time": "Time",
  "best": "Best",
  "won": "You Win! 🎉",
  "lost": "Boom! 💥",
  "newGame": "New Game",
  "hint": "Left-click to reveal · Right-click or long-press to flag",
  "howToUse": [
    { "label": "Choose difficulty", "description": "Select Easy (9×9, 10 mines), Medium (16×16, 40 mines), or Hard (16×30, 99 mines)." },
    { "label": "Reveal cells", "description": "Left-click (or tap) a cell to reveal it. Numbers show how many mines are adjacent." },
    { "label": "Flag mines", "description": "Right-click (or long-press on mobile) to place or remove a flag on a suspected mine." },
    { "label": "Win", "description": "Reveal all non-mine cells to win. The first click is always safe." }
  ],
  "faq": [
    { "question": "Is the first click always safe?", "answer": "Yes. Mines are placed after your first click, guaranteeing the first cell and its neighbors are mine-free." },
    { "question": "What do the numbers mean?", "answer": "Each number shows how many of the 8 surrounding cells contain a mine. Use this to deduce safe cells and mine locations." },
    { "question": "How do I flag a mine on mobile?", "answer": "Long-press a cell (hold for about half a second) to place or remove a flag." },
    { "question": "Is my best time saved?", "answer": "Yes. Your best time for each difficulty is saved in your browser's local storage." },
    { "question": "What happens if I hit a mine?", "answer": "All mines are revealed and the game ends. Click New Game to start over." }
  ]
}
```

- [ ] Create `src/messages/ja/tools/minesweeper.json`:
```json
{
  "title": "マインスイーパー",
  "description": "ブラウザで無料プレイできるマインスイーパー。地雷を避けてすべてのマスを開こう。難易度3段階。インストール不要。",
  "keywords": ["マインスイーパー", "マインスイーパ オンライン", "地雷 ゲーム", "無料ゲーム", "ロジックゲーム"],
  "label": "",
  "placeholder": "",
  "buttons": {},
  "results": {},
  "limitCheck": { "title": "", "unit": "", "over": "" },
  "toast": {},
  "easy": "かんたん",
  "medium": "ふつう",
  "hard": "むずかしい",
  "minesLeft": "地雷",
  "time": "タイム",
  "best": "ベスト",
  "won": "クリア！🎉",
  "lost": "ドカン！💥",
  "newGame": "新しいゲーム",
  "hint": "クリックでマスを開く・右クリックまたは長押しで旗を立てる",
  "howToUse": [
    { "label": "難易度を選ぶ", "description": "かんたん（9×9・地雷10）、ふつう（16×16・地雷40）、むずかしい（16×30・地雷99）から選択します。" },
    { "label": "マスを開く", "description": "マスをクリック（またはタップ）して開きます。数字は隣接するマスにある地雷の数を示します。" },
    { "label": "旗を立てる", "description": "地雷と思われるマスを右クリック（スマホでは長押し）すると旗を立てられます。" },
    { "label": "クリア", "description": "地雷以外のすべてのマスを開けばクリア。最初のクリックは必ず安全です。" }
  ],
  "faq": [
    { "question": "最初のクリックは安全ですか？", "answer": "はい。地雷は最初のクリック後に配置されるため、最初に開いたマスとその周囲に地雷は置かれません。" },
    { "question": "数字は何を意味しますか？", "answer": "その数字は、隣接する8マスの中に地雷がいくつあるかを示しています。数字を手がかりに安全なマスや地雷の位置を推理します。" },
    { "question": "スマホで旗を立てるには？", "answer": "マスを長押し（約0.5秒）すると旗を立てたり取り外したりできます。" },
    { "question": "ベストタイムは保存されますか？", "answer": "はい。各難易度のベストタイムがブラウザのローカルストレージに保存され、次回アクセス時にも引き継がれます。" },
    { "question": "地雷を踏んだらどうなりますか？", "answer": "すべての地雷が表示されゲームオーバーになります。「新しいゲーム」ボタンでやり直せます。" }
  ]
}
```

- [ ] Commit: `git commit -m "[ゲーム] マインスイーパー翻訳ファイル追加"`

---

## Task 5: Translation files — Idle Tapper

- [ ] Create `src/messages/en/tools/idle-tapper.json`:
```json
{
  "title": "Idle Tapper",
  "description": "A free idle clicker game. Tap to collect stars, buy upgrades, and watch your star count grow automatically. No login needed.",
  "keywords": ["idle game", "clicker game", "idle tapper", "tap game", "free idle game", "browser game"],
  "label": "",
  "placeholder": "",
  "buttons": {},
  "results": {},
  "limitCheck": { "title": "", "unit": "", "over": "" },
  "toast": {},
  "stars": "Stars",
  "perSecond": "/sec",
  "totalClicks": "Total Taps",
  "tap": "Tap!",
  "upgrades": "Upgrades",
  "purchased": "Purchased",
  "clickPower": "Tap Power",
  "autoLabel": "Auto",
  "resetButton": "Reset",
  "resetConfirm": "Reset all progress? This cannot be undone.",
  "howToUse": [
    { "label": "Tap the star", "description": "Click or tap the large ⭐ button to earn stars. Each tap earns stars based on your tap power." },
    { "label": "Buy upgrades", "description": "Spend stars on upgrades to multiply your tap power or unlock automatic star production." },
    { "label": "Go idle", "description": "Auto-production upgrades generate stars every second — even when you're not clicking." },
    { "label": "Progress is saved", "description": "Your stars and upgrades are saved automatically. Return anytime to pick up where you left off." }
  ],
  "faq": [
    { "question": "Is my progress saved?", "answer": "Yes. Your stars and purchased upgrades are automatically saved in your browser's local storage. Close the tab and come back later — your progress will be there." },
    { "question": "What are auto-production upgrades?", "answer": "Some upgrades (Star Drone, Star Factory, Galactic Engine) generate stars every second without clicking. Stack them to grow your count faster." },
    { "question": "How do I reset my progress?", "answer": "Click the Reset button at the bottom. You will be asked to confirm before all progress is cleared." },
    { "question": "Does this game send data anywhere?", "answer": "No. All data is stored locally in your browser using localStorage. Nothing is sent to any server." },
    { "question": "What is the maximum tap power?", "answer": "Buying both tap upgrades (Star Burst and Stellar Touch) multiplies your tap power to ×4 per click." }
  ]
}
```

- [ ] Create `src/messages/ja/tools/idle-tapper.json`:
```json
{
  "title": "アイドルタッパー",
  "description": "無料のアイドルクリッカーゲーム。タップしてスターを集め、アップグレードを買って自動生産を解放しよう。ログイン不要。",
  "keywords": ["アイドルゲーム", "クリッカーゲーム", "放置ゲーム", "無料ゲーム", "ブラウザゲーム", "タップゲーム"],
  "label": "",
  "placeholder": "",
  "buttons": {},
  "results": {},
  "limitCheck": { "title": "", "unit": "", "over": "" },
  "toast": {},
  "stars": "スター",
  "perSecond": "/秒",
  "totalClicks": "累計タップ",
  "tap": "タップ！",
  "upgrades": "アップグレード",
  "purchased": "購入済み",
  "clickPower": "タップ倍率",
  "autoLabel": "自動",
  "resetButton": "リセット",
  "resetConfirm": "すべての進捗をリセットしますか？この操作は取り消せません。",
  "howToUse": [
    { "label": "スターをタップ", "description": "大きな⭐ボタンをクリック（またはタップ）するとスターを獲得できます。タップ倍率に応じた数のスターが加算されます。" },
    { "label": "アップグレードを購入", "description": "貯めたスターでアップグレードを購入し、タップ倍率を上げたり自動生産を解放したりできます。" },
    { "label": "放置する", "description": "自動生産系アップグレードを買うと、タップしなくても毎秒スターが増えていきます。" },
    { "label": "進捗は自動保存", "description": "スター数とアップグレードの状態は自動的に保存されます。ブラウザを閉じても続きから再開できます。" }
  ],
  "faq": [
    { "question": "進捗は保存されますか？", "answer": "はい。スター数と購入済みアップグレードはブラウザのローカルストレージに自動保存されます。タブを閉じて後で戻っても続きから遊べます。" },
    { "question": "自動生産アップグレードとは何ですか？", "answer": "「スタードローン」「スターファクトリー」「ギャラクティックエンジン」は、タップしなくても毎秒スターを自動的に生産します。重ねて買うほど生産速度が上がります。" },
    { "question": "リセットするにはどうすればいいですか？", "answer": "画面下の「リセット」ボタンをクリックします。確認ダイアログが表示され、OKすると全進捗が消去されます。" },
    { "question": "データはどこかに送られますか？", "answer": "いいえ。すべてのデータはブラウザのlocalStorageにのみ保存されます。サーバーには一切送信されません。" },
    { "question": "タップ倍率はどこまで上がりますか？", "answer": "タップ系アップグレード（スターバーストとステラータッチ）を両方購入すると、1タップで×4倍のスターを獲得できます。" }
  ]
}
```

- [ ] Commit: `git commit -m "[ゲーム] アイドルタッパー翻訳ファイル追加"`

---

## Task 6: request.ts — register game translations

**Files:** Modify `src/i18n/request.ts`

- [ ] Add 3 variable declarations to the destructure list and both `Promise.all` arrays and `messages` return — see full diff in implementation notes.

- [ ] Commit: `git commit -m "[ゲーム] request.tsに3ゲームの翻訳インポートを追加"`

---

## Task 7: use2048 hook

**Files:** Create `src/hooks/use2048.ts`

- [ ] Create the file with useReducer-based game logic (rotate-to-left algorithm, spawnTile, hasWon, isOver checks).

- [ ] Commit: `git commit -m "[ゲーム] use2048フック実装"`

---

## Task 8: Game2048 UI component

**Files:** Create `src/tools/Game2048.tsx`

- [ ] Create the UI with: score/best header, 4×4 grid with tile colors, keyboard handler, touch swipe handler, won/game-over overlay.

- [ ] Commit: `git commit -m "[ゲーム] Game2048コンポーネント実装"`

---

## Task 9: useMinesweeper hook

**Files:** Create `src/hooks/useMinesweeper.ts`

- [ ] Create with: createEmptyGrid, placeMines (first-click safe), floodReveal (iterative stack), checkWin, timer via setInterval ref.

- [ ] Commit: `git commit -m "[ゲーム] useMinesweeperフック実装"`

---

## Task 10: Minesweeper UI component

**Files:** Create `src/tools/Minesweeper.tsx`

- [ ] Create with: difficulty tabs, emoji face button, timer display, scrollable grid container, right-click + long-press flagging.

- [ ] Commit: `git commit -m "[ゲーム] Minesweeperコンポーネント実装"`

---

## Task 11: useIdleTapper hook

**Files:** Create `src/hooks/useIdleTapper.ts`

- [ ] Create with: 5 upgrade tiers, click power calc, auto-production via setInterval, localStorage persistence via useLocalStorage.

- [ ] Commit: `git commit -m "[ゲーム] useIdleTapperフック実装"`

---

## Task 12: IdleTapper UI component

**Files:** Create `src/tools/IdleTapper.tsx`

- [ ] Create with: large tap button with press animation, star count (K/M format), upgrades panel with affordability highlight, reset button with confirm.

- [ ] Commit: `git commit -m "[ゲーム] IdleTapperコンポーネント実装"`

---

## Task 13: Games hub page

**Files:** Create `src/app/[locale]/games/page.tsx`

- [ ] Create page that filters toolsRegistry by category "game", localizes cards, generates SEO metadata with hreflang.

- [ ] Commit: `git commit -m "[ゲーム] ゲームハブページ追加"`

---

## Task 14: Build check

- [ ] Run `npm run build` and fix any TypeScript or Next.js errors.
- [ ] Final commit if fixes needed.
