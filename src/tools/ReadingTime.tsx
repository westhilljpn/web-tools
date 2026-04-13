"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function countSentences(text: string): number {
  return text.split(/[。！？.!?]+/).filter(s => s.trim().length > 0).length;
}

function formatTime(minutes: number): { value: string; unit: string } {
  if (minutes < 1) {
    const secs = Math.round(minutes * 60);
    return { value: String(secs), unit: "sec" };
  }
  if (minutes < 60) {
    return { value: String(Math.round(minutes)), unit: "min" };
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return { value: m > 0 ? `${h}h ${m}m` : `${h}h`, unit: "" };
}

type Lang = "ja" | "en";

export default function ReadingTime() {
  const t = useTranslations("reading-time");
  const [text, setText] = useState("");
  const [lang, setLang] = useState<Lang>("ja");
  const [jaWpm, setJaWpm] = useState(500);
  const [enWpm, setEnWpm] = useState(200);

  const stats = useMemo(() => {
    const chars = text.length;
    const words = countWords(text);
    const sentences = countSentences(text);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    const wpm = lang === "ja" ? jaWpm : enWpm;
    const unit = lang === "ja" ? chars : words;
    const readMin = unit > 0 ? unit / wpm : 0;
    const speechMin = lang === "ja" ? chars / 300 : words / 130;

    return { chars, words, sentences, paragraphs, readMin, speechMin };
  }, [text, lang, jaWpm, enWpm]);

  const readFmt = formatTime(stats.readMin);
  const speechFmt = formatTime(stats.speechMin);

  return (
    <div className="space-y-5">
      {/* 言語選択 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["ja", "en"] as Lang[]).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                lang === l ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t(`lang.${l}`)}
            </button>
          ))}
        </div>
        {/* WPM設定 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t("wpmLabel")}:</span>
          <input
            type="number"
            min={50} max={2000}
            value={lang === "ja" ? jaWpm : enWpm}
            onChange={e => {
              const v = Number(e.target.value);
              if (lang === "ja") setJaWpm(v); else setEnWpm(v);
            }}
            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm text-center
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <span className="text-xs text-gray-400">{lang === "ja" ? t("unit.ja") : t("unit.en")}</span>
        </div>
      </div>

      {/* テキスト入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("inputLabel")}</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t("placeholder")}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t("stats.chars"), value: stats.chars.toLocaleString() },
          { label: t("stats.words"), value: stats.words.toLocaleString() },
          { label: t("stats.sentences"), value: stats.sentences.toLocaleString() },
          { label: t("stats.paragraphs"), value: stats.paragraphs.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-primary font-mono">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* 読了時間・スピーチ時間 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-sky/20 border border-sky-soft rounded-xl px-4 py-4 flex items-center gap-4">
          <span className="text-3xl">📖</span>
          <div>
            <p className="text-xs text-steel">{t("readingTime")}</p>
            <p className="text-2xl font-bold text-primary font-mono">
              {stats.readMin === 0 ? "—" : `${readFmt.value}${readFmt.unit ? ` ${t(`timeUnit.${readFmt.unit}`)}` : ""}`}
            </p>
          </div>
        </div>
        <div className="bg-sky/20 border border-sky-soft rounded-xl px-4 py-4 flex items-center gap-4">
          <span className="text-3xl">🎙️</span>
          <div>
            <p className="text-xs text-steel">{t("speechTime")}</p>
            <p className="text-2xl font-bold text-primary font-mono">
              {stats.speechMin === 0 ? "—" : `${speechFmt.value}${speechFmt.unit ? ` ${t(`timeUnit.${speechFmt.unit}`)}` : ""}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
