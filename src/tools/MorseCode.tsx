"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

const MORSE: Record<string, string> = {
  A:".-", B:"-...", C:"-.-.", D:"-..", E:".", F:"..-.", G:"--.", H:"....",
  I:"..", J:".---", K:"-.-", L:".-..", M:"--", N:"-.", O:"---", P:".--.",
  Q:"--.-", R:".-.", S:"...", T:"-", U:"..-", V:"...-", W:".--", X:"-..-",
  Y:"-.--", Z:"--..",
  "0":"-----","1":".----","2":"..---","3":"...--","4":"....-",
  "5":".....","6":"-....","7":"--...","8":"---..","9":"----.",
  ".":".-.-.-",",":"--..--","?":"..--..","!":"-.-.--",
  "/":"-..-.","@":".--.-.","&":".-...",":":"---...",
  "'":".----.","\"":".-..-.","(":"-.--.",")":"-.--.-",
};
const REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k])
);

function textToMorse(text: string): string {
  return text.toUpperCase().split("").map(c => {
    if (c === " ") return "/";
    return MORSE[c] ?? "?";
  }).join(" ");
}

function morseToText(morse: string): string {
  return morse.trim().split(/\s*\/\s*/).map(word =>
    word.trim().split(/\s+/).map(code => REVERSE[code] ?? "?").join("")
  ).join(" ");
}

// Web Audio API でモールス音を再生
async function playMorse(morse: string, wpm: number): Promise<void> {
  const ctx = new AudioContext();
  const unit = 1200 / wpm / 1000; // 1単位の秒数
  let t = ctx.currentTime + 0.05;

  function beep(duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 700;
    osc.type = "sine";
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.005);
    gain.gain.setValueAtTime(0.5, t + duration - 0.005);
    gain.gain.linearRampToValueAtTime(0, t + duration);
    osc.start(t);
    osc.stop(t + duration);
    t += duration;
  }

  for (let i = 0; i < morse.length; i++) {
    const ch = morse[i];
    if (ch === ".") { beep(unit); t += unit * 1; }
    else if (ch === "-") { beep(unit * 3); t += unit * 1; }
    else if (ch === " ") {
      const next = morse[i + 1];
      if (next === "/") { t += unit * 7; i++; }
      else { t += unit * 3; }
    }
  }
  // コンテキストを再生終了後に閉じる
  return new Promise(resolve => setTimeout(() => { ctx.close(); resolve(); }, (t - ctx.currentTime) * 1000 + 200));
}

type Tab = "encode" | "decode";

export default function MorseCode() {
  const t = useTranslations("morse-code");
  const [tab, setTab] = useState<Tab>("encode");
  const [textInput, setTextInput] = useState("");
  const [morseInput, setMorseInput] = useState("");
  const [wpm, setWpm] = useState(15);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const stopRef = useRef(false);

  const morseOutput = textInput ? textToMorse(textInput) : "";
  const textOutput = morseInput.trim() ? morseToText(morseInput) : "";

  async function handlePlay() {
    const code = tab === "encode" ? morseOutput : morseInput.trim();
    if (!code || playing) return;
    stopRef.current = false;
    setPlaying(true);
    try {
      await playMorse(code, wpm);
    } finally {
      setPlaying(false);
    }
  }

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, []);

  const activeCode = tab === "encode" ? morseOutput : morseInput.trim();

  return (
    <div className="space-y-5">
      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["encode", "decode"] as Tab[]).map(k => (
          <button
            key={k}
            type="button"
            onClick={() => { setTab(k); setCopied(false); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === k ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t(`tabs.${k}`)}
          </button>
        ))}
      </div>

      {tab === "encode" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("textLabel")}
            </label>
            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder={t("textPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>
          {morseOutput && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-sm text-gray-800 leading-relaxed break-all">{morseOutput}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(morseOutput)}
                  className="shrink-0 text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                >
                  {copied ? t("copied") : t("copy")}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("morseLabel")}
            </label>
            <textarea
              value={morseInput}
              onChange={e => setMorseInput(e.target.value)}
              placeholder={t("morsePlaceholder")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">{t("morseHint")}</p>
          </div>
          {textOutput && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-primary">{textOutput}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(textOutput)}
                  className="shrink-0 text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                >
                  {copied ? t("copied") : t("copy")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 音声再生コントロール */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">{t("wpmLabel")}</label>
          <input
            type="range"
            min={5} max={30} step={1}
            value={wpm}
            onChange={e => setWpm(Number(e.target.value))}
            className="w-24 accent-primary"
          />
          <span className="text-sm font-mono text-gray-700 w-8">{wpm}</span>
        </div>
        <button
          type="button"
          onClick={handlePlay}
          disabled={!activeCode || playing}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-40"
        >
          {playing ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("playing")}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {t("play")}
            </>
          )}
        </button>
      </div>

      {/* モールス信号表 */}
      <details className="border border-gray-200 rounded-xl overflow-hidden">
        <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 select-none">
          {t("tableTitle")}
        </summary>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Object.entries(MORSE).map(([char, code]) => (
            <div key={char} className="flex items-center gap-2 text-xs">
              <span className="w-6 font-bold text-primary text-center">{char}</span>
              <span className="font-mono text-gray-600">{code}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
