"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const LOREM_SENTENCES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus.",
  "Nulla gravida orci a odio, et tempus feugiat.",
  "Nullam varius, turpis molestie pretium suscipit, quam neque interdum nisl.",
  "Nam egestas sem sit amet lectus volutpat, vel egestas arcu fringilla.",
  "Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue.",
  "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
  "Proin egestas, arcu vel dictum molestie, lectus risus facilisis libero.",
  "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  "Fusce viverra neque at purus laoreet, vel feugiat velit volutpat.",
  "Donec aliquam erat ac ipsum fermentum, eu ultrices arcu sagittis.",
];

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "eiusmod", "tempor", "incididunt", "labore", "dolore", "magna", "aliqua",
  "enim", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris",
  "nisi", "aliquip", "commodo", "consequat", "duis", "aute", "irure", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "proident", "culpa", "officia", "deserunt", "mollit",
];

const JA_SENTENCES = [
  "吾輩は猫である。名前はまだ無い。",
  "どこで生れたかとんと見当がつかぬ。",
  "何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。",
  "吾輩はここで始めて人間というものを見た。",
  "しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。",
  "この書生というのは時々我々を捕えて煮て食うという話である。",
  "しかし当時は何という考えもなかったから別段恐しいとも思わなかった。",
  "ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。",
  "掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。",
  "この時妙なものだと思った感じが今でも残っている。",
  "第一毛をもって装飾されべきはずの顔がつるつるしてまるで薬缶だ。",
  "その後猫にもだいぶ逢ったがこんな片輪には一度も出会わした事がない。",
  "のみならず顔の真中があまりに突起している。",
  "そうしてその穴の中から時々ぷうぷうと煙を吹く。",
  "どうも咽せぽくて実に弱った。",
];

const JA_WORDS = [
  "吾輩", "猫", "名前", "見当", "記憶", "人間", "書生", "獰悪", "種族", "煮る",
  "恐しい", "掌", "感じ", "顔", "装飾", "突起", "煙", "咽せ", "薄暗い", "じめじめ",
  "始めて", "落ちつく", "妙", "片輪", "出会う", "真中", "弱る", "泣く", "捕える",
];

type UnitType = "paragraphs" | "sentences" | "words";
type LangType = "latin" | "japanese";

function generateParagraphs(count: number, sentences: string[], startWithLorem: boolean): string {
  const paras: string[] = [];
  for (let p = 0; p < count; p++) {
    const sentCount = 3 + Math.floor(Math.random() * 4);
    const sentList: string[] = [];
    const pool = [...sentences];
    for (let s = 0; s < sentCount; s++) {
      sentList.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    if (p === 0 && startWithLorem) sentList[0] = sentences[0];
    paras.push(sentList.join(" "));
  }
  return paras.join("\n\n");
}

function generateSentences(count: number, sentences: string[], startWithLorem: boolean): string {
  const pool = sentences;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  if (startWithLorem && result.length > 0) result[0] = pool[0];
  return result.join(" ");
}

function generateWords(count: number, words: string[], startWithLorem: boolean): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  if (startWithLorem && result.length > 0) result[0] = words[0];
  return result.join(" ");
}

export default function LoremIpsum() {
  const t = useTranslations("lorem-ipsum");
  const [unit, setUnit] = useState<UnitType>("paragraphs");
  const [count, setCount] = useState(3);
  const [lang, setLang] = useState<LangType>("latin");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");
  const [toast, setToast] = useState(false);

  const handleGenerate = () => {
    const sentences = lang === "latin" ? LOREM_SENTENCES : JA_SENTENCES;
    const words = lang === "latin" ? LOREM_WORDS : JA_WORDS;
    const n = Math.max(1, Math.min(200, count));
    let text = "";
    if (unit === "paragraphs") text = generateParagraphs(n, sentences, startWithLorem);
    else if (unit === "sentences") text = generateSentences(n, sentences, startWithLorem);
    else text = generateWords(n, words, startWithLorem);
    setOutput(text);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setToast(true);
    setTimeout(() => setToast(false), 1800);
  };

  return (
    <div className="space-y-5">
      {/* オプション行 */}
      <div className="flex flex-wrap items-end gap-4">
        {/* 単位 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">{t("options.type")}</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as UnitType)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          >
            <option value="paragraphs">{t("options.paragraphs")}</option>
            <option value="sentences">{t("options.sentences")}</option>
            <option value="words">{t("options.words")}</option>
          </select>
        </div>

        {/* 件数 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">{t("options.count")}</label>
          <input
            type="number"
            min={1}
            max={200}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(200, Number(e.target.value))))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* 言語 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">{t("options.language")}</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as LangType)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          >
            <option value="latin">{t("options.latin")}</option>
            <option value="japanese">{t("options.japanese")}</option>
          </select>
        </div>
      </div>

      {/* Lorem で始めるオプション */}
      {lang === "latin" && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-gray-700">{t("options.startWithLorem")}</span>
        </label>
      )}

      {/* ボタン */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleGenerate} className="btn-primary text-sm px-4 py-2">
          {t("buttons.generate")}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!output}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
        >
          {t("buttons.copy")}
        </button>
        <button
          type="button"
          onClick={() => setOutput("")}
          disabled={!output}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
        >
          {t("buttons.clear")}
        </button>
      </div>

      {/* 出力テキストエリア */}
      {output ? (
        <textarea
          readOnly
          value={output}
          rows={10}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm leading-relaxed
                     resize-y focus:outline-none bg-gray-50 font-mono"
        />
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">{t("results.empty")}</p>
      )}

      {/* トースト */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                        text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50">
          {t("results.copied")}
        </div>
      )}
    </div>
  );
}
