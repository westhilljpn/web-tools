"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface BrowserInfo {
  browser: string;
  os: string;
  language: string;
  timezone: string;
  screen: string;
  viewport: string;
  cookieEnabled: boolean;
  online: boolean;
  userAgent: string;
}

function parseUA(ua: string): { browser: string; os: string } {
  let browser = "Unknown";
  if      (ua.includes("Edg/"))    browser = "Edge "    + (ua.match(/Edg\/([\d.]+)/)?.[1]     ?? "");
  else if (ua.includes("Firefox/"))browser = "Firefox " + (ua.match(/Firefox\/([\d.]+)/)?.[1]  ?? "");
  else if (ua.includes("Chrome/")) browser = "Chrome "  + (ua.match(/Chrome\/([\d.]+)/)?.[1]   ?? "");
  else if (ua.includes("Safari/")) browser = "Safari "  + (ua.match(/Version\/([\d.]+)/)?.[1]  ?? "");

  let os = "Unknown";
  if      (ua.includes("Windows NT"))  os = "Windows " + (ua.match(/Windows NT ([\d.]+)/)?.[1] ?? "");
  else if (ua.includes("iPhone OS"))   os = "iOS "     + (ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, ".") ?? "");
  else if (ua.includes("Android"))     os = "Android " + (ua.match(/Android ([\d.]+)/)?.[1]   ?? "");
  else if (ua.includes("Mac OS X"))    os = "macOS "   + (ua.match(/Mac OS X ([\d_.]+)/)?.[1]?.replace(/_/g, ".") ?? "");
  else if (ua.includes("Linux"))       os = "Linux";

  return { browser, os };
}

async function getLocalIP(): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel("");
      pc.createOffer()
        .then((o) => pc.setLocalDescription(o))
        .catch(() => resolve(null));

      const timer = setTimeout(() => { pc.close(); resolve(null); }, 2500);

      pc.onicecandidate = (e) => {
        if (!e.candidate) { clearTimeout(timer); pc.close(); resolve(null); return; }
        const m = e.candidate.candidate.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
        if (m && m[1] !== "0.0.0.0") {
          clearTimeout(timer); pc.close(); resolve(m[1]);
        }
      };
    } catch {
      resolve(null);
    }
  });
}

export default function IpInfo() {
  const t = useTranslations("ip-info");
  const [info, setInfo] = useState<BrowserInfo | null>(null);
  const [localIP, setLocalIP] = useState<string | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const { browser, os } = parseUA(ua);
    setInfo({
      browser,
      os,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width} × ${screen.height} (×${window.devicePixelRatio})`,
      viewport: `${window.innerWidth} × ${window.innerHeight}`,
      cookieEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      userAgent: ua,
    });
    getLocalIP().then((ip) => setLocalIP(ip));
  }, []);

  const handleCopy = async () => {
    if (!info) return;
    const ipStr = localIP === undefined ? "…" : localIP ?? t("notAvailable");
    const lines = [
      `${t("fields.browser")}: ${info.browser}`,
      `${t("fields.os")}: ${info.os}`,
      `${t("fields.language")}: ${info.language}`,
      `${t("fields.timezone")}: ${info.timezone}`,
      `${t("fields.screen")}: ${info.screen}`,
      `${t("fields.viewport")}: ${info.viewport}`,
      `${t("fields.cookies")}: ${info.cookieEnabled ? t("yes") : t("no")}`,
      `${t("fields.online")}: ${info.online ? t("yes") : t("no")}`,
      `${t("fields.localIP")}: ${ipStr}`,
      `${t("fields.userAgent")}: ${info.userAgent}`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!info) {
    return <p className="text-sm text-gray-400 text-center py-8">{t("loading")}</p>;
  }

  const ipDisplay =
    localIP === undefined ? t("checking") :
    localIP              ? localIP :
    t("notAvailable");

  const rows: [string, string, boolean?][] = [
    [t("fields.browser"),  info.browser],
    [t("fields.os"),       info.os],
    [t("fields.language"), info.language],
    [t("fields.timezone"), info.timezone],
    [t("fields.screen"),   info.screen],
    [t("fields.viewport"), info.viewport],
    [t("fields.cookies"),  info.cookieEnabled ? t("yes") : t("no")],
    [t("fields.online"),   info.online ? t("yes") : t("no")],
    [t("fields.localIP"),  ipDisplay],
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={handleCopy}
          className="text-sm text-primary hover:underline">
          {copied ? t("copied") : t("copyAll")}
        </button>
      </div>

      {/* 情報テーブル */}
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-4 px-4 py-2.5 hover:bg-gray-50">
            <span className="text-sm font-medium text-gray-500 shrink-0 w-28">{label}</span>
            <span className="text-sm text-gray-800 break-all">{value}</span>
          </div>
        ))}
      </div>

      {/* User Agent（別枠） */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">{t("fields.userAgent")}</p>
        <p className="text-xs text-gray-600 font-mono bg-gray-50 border border-gray-200
                      rounded-lg px-3 py-2 break-all leading-relaxed">
          {info.userAgent}
        </p>
      </div>

      <p className="text-xs text-gray-400">{t("note")}</p>
    </div>
  );
}
