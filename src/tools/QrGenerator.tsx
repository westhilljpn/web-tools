"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import Toast from "@/components/Toast";

type ErrorLevel = "L" | "M" | "Q" | "H";
type SizeOption = 200 | 300 | 400 | 512;

const SIZE_OPTIONS: SizeOption[] = [200, 300, 400, 512];

export default function QrGenerator() {
  const t = useTranslations("qr-generator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [input, setInput] = useState("");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [size, setSize] = useState<SizeOption>(300);
  const [hasQr, setHasQr] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const src = input.trim();
    if (!src) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setHasQr(false);
      return;
    }
    QRCode.toCanvas(canvas, src, {
      width: size,
      errorCorrectionLevel: errorLevel,
      margin: 2,
    })
      .then(() => setHasQr(true))
      .catch(() => {
        showToast(t("toast.error"));
        setHasQr(false);
      });
  }, [input, errorLevel, size, showToast, t]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast(t("toast.downloaded"));
  }

  function handleClear() {
    setInput("");
  }

  return (
    <div className="space-y-5">
      {/* 入力エリア */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">{t("label")}</label>
          <button
            type="button"
            onClick={handleClear}
            disabled={!input}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            {t("buttons.clear")}
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          rows={4}
          spellCheck={false}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     resize-y"
        />
      </div>

      {/* 設定 */}
      <div className="flex flex-wrap gap-5">
        {/* サイズ選択 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">{t("settings.size")}</p>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {SIZE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  size === s
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 誤り訂正レベル */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">{t("settings.errorLevel")}</p>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["L", "M", "Q", "H"] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setErrorLevel(level)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  errorLevel === level
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t(`settings.errorLevels.${level}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QRコードプレビュー */}
      <div className="flex flex-col items-center gap-4 py-6 bg-gray-50 rounded-xl border border-gray-200">
        <canvas
          ref={canvasRef}
          className={`rounded-lg ${!hasQr ? "opacity-0 h-0" : ""}`}
        />
        {!hasQr && (
          <p className="text-sm text-gray-400">{t("results.empty")}</p>
        )}
        {hasQr && (
          <button
            type="button"
            onClick={handleDownload}
            className="btn-primary text-sm px-5 py-2"
          >
            {t("buttons.download")}
          </button>
        )}
      </div>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
