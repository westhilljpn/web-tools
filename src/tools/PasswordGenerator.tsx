"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useClipboard } from "@/lib/hooks/useClipboard";
import Toast from "@/components/Toast";

const CHARSET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CHARSET_LOWER = "abcdefghijklmnopqrstuvwxyz";
const CHARSET_NUMBERS = "0123456789";
const CHARSET_SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";
const AMBIGUOUS = new Set(["0", "O", "l", "I"]);

interface Options {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

function buildCharset(opts: Options): string {
  let chars = "";
  if (opts.upper) chars += CHARSET_UPPER;
  if (opts.lower) chars += CHARSET_LOWER;
  if (opts.numbers) chars += CHARSET_NUMBERS;
  if (opts.symbols) chars += CHARSET_SYMBOLS;
  if (opts.excludeAmbiguous) {
    chars = chars.split("").filter((c) => !AMBIGUOUS.has(c)).join("");
  }
  return chars;
}

function generatePassword(opts: Options): string {
  const charset = buildCharset(opts);
  if (!charset) return "";
  const array = new Uint32Array(opts.length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => charset[n % charset.length]).join("");
}

function calcEntropy(opts: Options): number {
  const charset = buildCharset(opts);
  if (!charset) return 0;
  return Math.floor(opts.length * Math.log2(charset.length));
}

type StrengthKey = "veryWeak" | "weak" | "fair" | "strong" | "veryStrong";

function getStrength(entropy: number): StrengthKey {
  if (entropy < 28) return "veryWeak";
  if (entropy < 36) return "weak";
  if (entropy < 60) return "fair";
  if (entropy < 80) return "strong";
  return "veryStrong";
}

const STRENGTH_COLORS: Record<StrengthKey, string> = {
  veryWeak: "bg-red-500",
  weak: "bg-orange-400",
  fair: "bg-yellow-400",
  strong: "bg-green-400",
  veryStrong: "bg-green-600",
};

const STRENGTH_BAR_WIDTH: Record<StrengthKey, string> = {
  veryWeak: "w-1/5",
  weak: "w-2/5",
  fair: "w-3/5",
  strong: "w-4/5",
  veryStrong: "w-full",
};

export default function PasswordGenerator() {
  const t = useTranslations("password-generator");
  const { copy } = useClipboard();
  const [password, setPassword] = useState("");
  const [opts, setOpts] = useState<Options>({
    length: 16,
    upper: true,
    lower: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: false,
  });
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const generate = useCallback(() => {
    const charset = buildCharset(opts);
    if (!charset) {
      showToast(t("toast.noCharset"));
      return;
    }
    setPassword(generatePassword(opts));
  }, [opts, showToast, t]);

  // 初回・オプション変更時に自動生成
  useEffect(() => {
    generate();
  }, [generate]);

  async function handleCopy() {
    if (!password) return;
    await copy(password);
    showToast(t("toast.copied"));
  }

  function toggle(key: keyof Omit<Options, "length" | "excludeAmbiguous">) {
    setOpts((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const entropy = calcEntropy(opts);
  const strengthKey = getStrength(entropy);

  return (
    <div className="space-y-5">
      {/* パスワード表示 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("label")}
        </label>
        <div className="flex gap-2">
          <input
            readOnly
            value={password}
            placeholder={t("placeholder")}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono
                       bg-gray-50 text-gray-800 select-all tracking-wide"
          />
          <button
            type="button"
            onClick={handleCopy}
            disabled={!password}
            className="btn-secondary text-sm px-4 py-2 shrink-0"
          >
            {t("buttons.copy")}
          </button>
          <button
            type="button"
            onClick={generate}
            className="btn-primary text-sm px-4 py-2 shrink-0"
          >
            {t("buttons.refresh")}
          </button>
        </div>
      </div>

      {/* 強度インジケーター */}
      {password && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {t("results.strength")}: <span className="font-semibold text-gray-700">{t(`strength.${strengthKey}`)}</span>
            </span>
            <span>
              {t("results.entropy")}: <span className="font-semibold text-gray-700">{entropy} bits</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${STRENGTH_COLORS[strengthKey]} ${STRENGTH_BAR_WIDTH[strengthKey]}`}
            />
          </div>
        </div>
      )}

      {/* 設定 */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        {/* 文字数スライダー */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium text-gray-700">
              {t("settings.length")}
            </label>
            <span className="text-sm font-mono font-semibold text-primary w-8 text-right">
              {opts.length}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            value={opts.length}
            onChange={(e) => setOpts((prev) => ({ ...prev, length: Number(e.target.value) }))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* チェックボックス群 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(
            [
              { key: "upper", label: t("settings.uppercase") },
              { key: "lower", label: t("settings.lowercase") },
              { key: "numbers", label: t("settings.numbers") },
              { key: "symbols", label: t("settings.symbols") },
            ] as const
          ).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={opts[key]}
                onChange={() => toggle(key)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        {/* 紛らわしい文字除外 */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={opts.excludeAmbiguous}
            onChange={() => setOpts((prev) => ({ ...prev, excludeAmbiguous: !prev.excludeAmbiguous }))}
            className="w-4 h-4 accent-primary rounded"
          />
          <span className="text-sm text-gray-700">{t("settings.excludeAmbiguous")}</span>
        </label>
      </div>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
