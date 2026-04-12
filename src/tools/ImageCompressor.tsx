"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

type Format = "jpeg" | "webp" | "png";

interface Result {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  url: string;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function compressImage(file: File, format: Format, quality: number): Promise<Result> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      // JPEGは透明背景を白で塗りつぶす
      if (format === "jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objUrl);
      canvas.toBlob(
        blob => {
          if (!blob) return reject(new Error("Compression failed"));
          resolve({
            id: crypto.randomUUID(),
            name: file.name.replace(/\.[^.]+$/, "") + "." + format,
            originalSize: file.size,
            compressedSize: blob.size,
            url: URL.createObjectURL(blob),
          });
        },
        `image/${format}`,
        format === "png" ? undefined : quality / 100
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = objUrl;
  });
}

export default function ImageCompressor() {
  const t = useTranslations("image-compressor");
  const [format, setFormat] = useState<Format>("webp");
  const [quality, setQuality] = useState(80);
  const [results, setResults] = useState<Result[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const images = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!images.length) return;
    setProcessing(true);
    // 前回分のオブジェクトURLを解放
    setResults(prev => { prev.forEach(r => URL.revokeObjectURL(r.url)); return []; });
    try {
      const compressed = await Promise.all(images.map(f => compressImage(f, format, quality)));
      setResults(compressed);
    } catch {
      // 失敗したファイルは無視
    } finally {
      setProcessing(false);
    }
  }, [format, quality]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-5">
      {/* 設定 */}
      <div className="flex flex-wrap gap-5 items-end">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">{t("formatLabel")}</p>
          <div className="flex gap-1">
            {(["webp", "jpeg", "png"] as Format[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium uppercase transition-colors ${
                  format === f ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {format !== "png" && (
          <div className="flex-1 min-w-48">
            <p className="text-xs font-medium text-gray-500 mb-1.5">
              {t("qualityLabel")} — {quality}%
            </p>
            <input
              type="range" min={10} max={100} step={5}
              value={quality}
              onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        )}
      </div>

      {/* ドロップゾーン */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-blue-50 dark:bg-blue-950/20"
            : "border-gray-300 hover:border-primary hover:bg-gray-50 dark:hover:bg-slate-700/30"
        }`}
      >
        <p className="text-4xl mb-2">🖼️</p>
        <p className="text-sm font-medium text-gray-700">{t("dropZone")}</p>
        <p className="text-xs text-gray-400 mt-1">{t("accepts")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {processing && (
        <p className="text-sm text-center text-gray-400 animate-pulse">{t("processing")}</p>
      )}

      {/* 結果 */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map(r => {
            const ratio = Math.round((1 - r.compressedSize / r.originalSize) * 100);
            return (
              <div key={r.id}
                className="border border-gray-200 dark:border-slate-600 rounded-xl p-4
                           flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                    {r.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{t("original")}: {fmtSize(r.originalSize)}</span>
                    <span>→</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {fmtSize(r.compressedSize)}
                    </span>
                    {ratio > 0 && (
                      <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400
                                       px-1.5 py-0.5 rounded font-bold">
                        -{ratio}%
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={r.url}
                  download={r.name}
                  className="shrink-0 btn-primary text-xs px-4 py-2 rounded-lg text-center"
                >
                  {t("download")}
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
