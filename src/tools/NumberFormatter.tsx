"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function toJapaneseUnit(n: number): string {
  const abs = Math.floor(Math.abs(n));
  const sign = n < 0 ? "-" : "";

  const CHOU = 1_000_000_000_000;
  const OKU = 100_000_000;
  const MAN = 10_000;

  if (abs >= CHOU) {
    const chouPart = Math.floor(abs / CHOU);
    const okuPart = Math.floor((abs % CHOU) / OKU);
    return okuPart > 0 ? `${sign}${chouPart}兆${okuPart}億` : `${sign}${chouPart}兆`;
  }

  if (abs >= OKU) {
    const okuPart = Math.floor(abs / OKU);
    const manPart = Math.floor((abs % OKU) / MAN);
    return manPart > 0 ? `${sign}${okuPart}億${manPart}万` : `${sign}${okuPart}億`;
  }

  if (abs >= MAN) {
    const manPart = Math.floor(abs / MAN);
    const remainder = abs % MAN;
    return remainder > 0 ? `${sign}${manPart}万${remainder}` : `${sign}${manPart}万`;
  }

  return `${sign}${abs}`;
}

type FormatItem = { key: string; label: string; value: string };

export default function NumberFormatter() {
  const t = useTranslations("number-formatter");
  const [input, setInput] = useState("");
  const [decimals, setDecimals] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const raw = input.replace(/,/g, "").replace(/\s/g, "");
  const n = parseFloat(raw);
  const isValid = raw !== "" && Number.isFinite(n);

  const formats: FormatItem[] = useMemo(() => {
    if (!isValid) return [];
    const opt = { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
    return [
      {
        key: "us",
        label: t("formats.us"),
        value: new Intl.NumberFormat("en-US", opt).format(n),
      },
      {
        key: "eu",
        label: t("formats.eu"),
        value: new Intl.NumberFormat("de-DE", opt).format(n),
      },
      {
        key: "space",
        label: t("formats.space"),
        value: new Intl.NumberFormat("fr-FR", opt).format(n).replace(/\u202F/g, " "),
      },
      {
        key: "jpy",
        label: t("formats.jpy"),
        value: new Intl.NumberFormat("ja-JP", {
          style: "currency",
          currency: "JPY",
        }).format(n),
      },
      {
        key: "usd",
        label: t("formats.usd"),
        value: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(n),
      },
      {
        key: "eur",
        label: t("formats.eur"),
        value: new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(n),
      },
      {
        key: "jpUnit",
        label: t("formats.jpUnit"),
        value: toJapaneseUnit(n),
      },
    ];
  }, [n, decimals, isValid, t]);

  async function handleCopy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard access denied
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("inputLabel")}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("decimals")}
          </label>
          <select
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {raw && !isValid && (
        <p className="text-sm text-red-500">{t("invalid")}</p>
      )}

      {isValid && (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          {formats.map(({ key, label, value }) => (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-500 w-36 shrink-0">{label}</span>
              <span className="text-sm font-mono font-medium flex-1 text-center px-2">
                {value}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(value, key)}
                className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors shrink-0"
              >
                {copied === key ? t("copied") : t("copy")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
