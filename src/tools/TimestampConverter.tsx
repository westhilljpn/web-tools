"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useClipboard } from "@/lib/hooks/useClipboard";
import Toast from "@/components/Toast";

type Direction = "toDate" | "toTimestamp";
type Unit = "seconds" | "milliseconds";

// Unix タイムスタンプ → Date フィールド に変換
function tsToFields(ts: number, unit: Unit): { iso: string; local: string; utc: string } {
  const ms = unit === "milliseconds" ? ts : ts * 1000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return { iso: "", local: "", utc: "" };
  // YYYY-MM-DDThh:mm (input[type=datetime-local] format)
  const pad = (n: number) => String(n).padStart(2, "0");
  const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return {
    iso: d.toISOString(),
    local: localStr,
    utc: d.toUTCString(),
  };
}

// datetime-local 文字列 → Unix タイムスタンプ
function fieldsToTs(localStr: string, unit: Unit): { seconds: string; milliseconds: string } {
  if (!localStr) return { seconds: "", milliseconds: "" };
  const d = new Date(localStr);
  if (isNaN(d.getTime())) return { seconds: "", milliseconds: "" };
  const ms = d.getTime();
  return {
    seconds: String(Math.floor(ms / 1000)),
    milliseconds: String(ms),
  };
}

export default function TimestampConverter() {
  const t = useTranslations("timestamp-converter");
  const { copy } = useClipboard();
  const [direction, setDirection] = useState<Direction>("toDate");
  const [unit, setUnit] = useState<Unit>("seconds");
  const [tsInput, setTsInput] = useState("");
  const [datetimeInput, setDatetimeInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  // 現在時刻をセット
  function setNow() {
    if (direction === "toDate") {
      const now = unit === "seconds" ? Math.floor(Date.now() / 1000) : Date.now();
      setTsInput(String(now));
    } else {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      setDatetimeInput(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      );
    }
  }

  async function handleCopy(text: string) {
    await copy(text);
    showToast(t("toast.copied"));
  }

  // toDate 方向の結果
  const tsNum = Number(tsInput);
  const toDateResult =
    direction === "toDate" && tsInput.trim() && !isNaN(tsNum)
      ? tsToFields(tsNum, unit)
      : null;

  // toTimestamp 方向の結果
  const toTsResult =
    direction === "toTimestamp" && datetimeInput
      ? fieldsToTs(datetimeInput, unit)
      : null;

  return (
    <div className="space-y-5">
      {/* 方向切替 */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["toDate", "toTimestamp"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                direction === d
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t(`direction.${d}`)}
            </button>
          ))}
        </div>

        {/* 単位切替 */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-xs text-gray-400">{t("unitLabel")}:</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["seconds", "milliseconds"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  unit === u
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t(`unit.${u}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 入力エリア */}
      {direction === "toDate" ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label htmlFor="ts-input" className="text-sm font-medium text-gray-700">
              {t("tsInputLabel")}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={setNow}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                {t("buttons.now")}
              </button>
              <button
                type="button"
                onClick={() => setTsInput("")}
                disabled={!tsInput}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                {t("buttons.clear")}
              </button>
            </div>
          </div>
          <input
            id="ts-input"
            type="text"
            inputMode="numeric"
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder={t("tsPlaceholder")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {tsInput && isNaN(Number(tsInput)) && (
            <p className="mt-1.5 text-xs text-red-500">{t("error.invalidTs")}</p>
          )}
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label htmlFor="dt-input" className="text-sm font-medium text-gray-700">
              {t("dtInputLabel")}
            </label>
            <button
              type="button"
              onClick={setNow}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {t("buttons.now")}
            </button>
          </div>
          <input
            id="dt-input"
            type="datetime-local"
            value={datetimeInput}
            onChange={(e) => setDatetimeInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      )}

      {/* 結果エリア: toDate */}
      {toDateResult && (
        <div className="space-y-3">
          <ResultRow label={t("results.iso")} value={toDateResult.iso} onCopy={handleCopy} copyLabel={t("buttons.copy")} />
          <ResultRow label={t("results.utc")} value={toDateResult.utc} onCopy={handleCopy} copyLabel={t("buttons.copy")} />
          <ResultRow label={t("results.local")} value={toDateResult.local.replace("T", " ")} onCopy={handleCopy} copyLabel={t("buttons.copy")} />
        </div>
      )}

      {/* 結果エリア: toTimestamp */}
      {toTsResult && (
        <div className="space-y-3">
          <ResultRow label={t("results.seconds")} value={toTsResult.seconds} onCopy={handleCopy} copyLabel={t("buttons.copy")} />
          <ResultRow label={t("results.milliseconds")} value={toTsResult.milliseconds} onCopy={handleCopy} copyLabel={t("buttons.copy")} />
        </div>
      )}

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}

interface ResultRowProps {
  label: string;
  value: string;
  onCopy: (v: string) => void;
  copyLabel: string;
}

function ResultRow({ label, value, onCopy, copyLabel }: ResultRowProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <button
          type="button"
          onClick={() => onCopy(value)}
          disabled={!value}
          className="btn-secondary text-xs px-2 py-0.5 shrink-0"
        >
          {copyLabel}
        </button>
      </div>
      <p className="text-sm font-mono text-gray-800 break-all">
        {value || <span className="text-gray-300">—</span>}
      </p>
    </div>
  );
}
