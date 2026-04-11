"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function base64urlDecode(str: string): string {
  // Base64url → Base64 に変換してデコード
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length % 4 || 4) - 1);
  try {
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return atob(padded);
  }
}

function formatTimestamp(unix: number): string {
  try {
    return new Date(unix * 1000).toLocaleString();
  } catch {
    return String(unix);
  }
}

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function parseJwt(token: string): JwtParts | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(base64urlDecode(parts[0])) as Record<string, unknown>;
    const payload = JSON.parse(base64urlDecode(parts[1])) as Record<string, unknown>;
    return { header, payload, signature: parts[2] };
  } catch {
    return null;
  }
}

function JsonBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <pre className="text-xs font-mono text-gray-800 leading-relaxed whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function JwtDecoder() {
  const t = useTranslations("jwt-decoder");
  const [input, setInput] = useState("");
  const [toast, setToast] = useState("");

  const parsed = useMemo(() => parseJwt(input), [input]);
  const isInvalid = input.trim() && !parsed;

  const exp = parsed?.payload?.exp;
  const now = Math.floor(Date.now() / 1000);
  const isExpired = typeof exp === "number" && exp < now;
  const hasExp = typeof exp === "number";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    showToast(t("results.copied"));
  };

  return (
    <div className="space-y-5">
      {/* 入力エリア */}
      <div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          spellCheck={false}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono
                     leading-relaxed resize-y
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        {isInvalid && (
          <p className="mt-1 text-xs text-red-500">{t("results.invalid")}</p>
        )}
      </div>

      {/* クリアボタン */}
      {input && (
        <button
          type="button"
          onClick={() => setInput("")}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          {t("buttons.clear")}
        </button>
      )}

      {/* デコード結果 */}
      {parsed && (
        <div className="space-y-4">
          {/* ステータス */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500">{t("labels.status")}:</span>
            {hasExp ? (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isExpired
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {isExpired ? t("results.expired") : t("results.valid")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {t("results.noExpiry")}
              </span>
            )}
          </div>

          {/* タイムスタンプ概要 */}
          {(typeof parsed.payload.iat === "number" ||
            typeof parsed.payload.exp === "number" ||
            typeof parsed.payload.nbf === "number") && (
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {typeof parsed.payload.iat === "number" && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <dt className="text-gray-500 font-medium mb-0.5">{t("labels.issuedAt")}</dt>
                  <dd className="text-gray-800 font-mono">{formatTimestamp(parsed.payload.iat)}</dd>
                </div>
              )}
              {typeof parsed.payload.exp === "number" && (
                <div className={`rounded-lg px-3 py-2 border ${isExpired ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                  <dt className={`font-medium mb-0.5 ${isExpired ? "text-red-500" : "text-green-600"}`}>{t("labels.expiresAt")}</dt>
                  <dd className="text-gray-800 font-mono">{formatTimestamp(parsed.payload.exp)}</dd>
                </div>
              )}
              {typeof parsed.payload.nbf === "number" && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <dt className="text-gray-500 font-medium mb-0.5">{t("labels.notBefore")}</dt>
                  <dd className="text-gray-800 font-mono">{formatTimestamp(parsed.payload.nbf)}</dd>
                </div>
              )}
            </dl>
          )}

          {/* Header */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-purple-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                {t("labels.header")}
              </span>
              <button
                type="button"
                onClick={() => copyText(JSON.stringify(parsed.header, null, 2))}
                className="text-xs text-gray-500 hover:text-primary transition-colors"
              >
                {t("buttons.copy")}
              </button>
            </div>
            <div className="px-4 py-3 bg-white overflow-x-auto">
              <JsonBlock data={parsed.header} />
            </div>
          </section>

          {/* Payload */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                {t("labels.payload")}
              </span>
              <button
                type="button"
                onClick={() => copyText(JSON.stringify(parsed.payload, null, 2))}
                className="text-xs text-gray-500 hover:text-primary transition-colors"
              >
                {t("buttons.copyPayload")}
              </button>
            </div>
            <div className="px-4 py-3 bg-white overflow-x-auto">
              <JsonBlock data={parsed.payload} />
            </div>
          </section>

          {/* Signature */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                {t("labels.signature")}
              </span>
              <button
                type="button"
                onClick={() => copyText(parsed.signature)}
                className="text-xs text-gray-500 hover:text-primary transition-colors"
              >
                {t("buttons.copy")}
              </button>
            </div>
            <div className="px-4 py-3 bg-white overflow-x-auto">
              <code className="text-xs font-mono text-gray-500 break-all">{parsed.signature}</code>
            </div>
          </section>
        </div>
      )}

      {!input && (
        <p className="text-sm text-gray-400 text-center py-6">{t("results.empty")}</p>
      )}

      {/* トースト */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                        text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
