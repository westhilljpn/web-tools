"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";
const FORMAT_OPTIONS: { value: OutputFormat; label: string; ext: string }[] = [
  { value: "image/png",  label: "PNG",  ext: "png"  },
  { value: "image/jpeg", label: "JPG",  ext: "jpg"  },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ImageResizer() {
  const t = useTranslations("image-resizer");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(90);
  const [previewUrl, setPreviewUrl] = useState("");
  const [resizedUrl, setResizedUrl] = useState("");
  const [resizedSize, setResizedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const aspectRatio = originalWidth > 0 ? originalWidth / originalHeight : 1;

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setOriginalFile(file);
    setResizedUrl("");
    setResizedSize(0);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    };
  }, [previewUrl, resizedUrl]);

  const handleFile = (file: File) => loadImage(file);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && originalHeight > 0) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && originalWidth > 0) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const handleResize = () => {
    if (!originalFile || !previewUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          if (resizedUrl) URL.revokeObjectURL(resizedUrl);
          const url = URL.createObjectURL(blob);
          setResizedUrl(url);
          setResizedSize(blob.size);
        },
        format,
        format === "image/png" ? undefined : quality / 100
      );
    };
    img.src = previewUrl;
  };

  const handleDownload = () => {
    if (!resizedUrl || !originalFile) return;
    const ext = FORMAT_OPTIONS.find((f) => f.value === format)?.ext ?? "png";
    const baseName = originalFile.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = resizedUrl;
    a.download = `${baseName}_${width}x${height}.${ext}`;
    a.click();
  };

  const handleClear = () => {
    setOriginalFile(null);
    setPreviewUrl("");
    setResizedUrl("");
    setResizedSize(0);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth(0);
    setHeight(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      {/* アップロードエリア */}
      {!originalFile && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
            ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500">{t("results.empty")}</p>
          <p className="text-xs text-gray-400 mt-1">PNG / JPG / WebP / GIF</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}

      {/* 設定 + プレビュー */}
      {originalFile && (
        <>
          {/* サイズ設定 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 幅 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.width")}</label>
              <input
                type="number"
                min={1}
                value={width}
                onChange={(e) => handleWidthChange(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            {/* 高さ */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.height")}</label>
              <input
                type="number"
                min={1}
                value={height}
                onChange={(e) => handleHeightChange(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {/* アスペクト比ロック */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lockAspect}
              onChange={(e) => setLockAspect(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm text-gray-700">{t("labels.lockAspectRatio")}</span>
          </label>

          {/* フォーマット & 品質 */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">{t("labels.outputFormat")}</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as OutputFormat)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {format !== "image/png" && (
              <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                <label className="text-xs font-medium text-gray-500">
                  {t("labels.quality")}: {quality}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleResize} className="btn-primary text-sm px-4 py-2">
              {t("labels.resized")}
            </button>
            {resizedUrl && (
              <button type="button" onClick={handleDownload} className="btn-secondary text-sm px-4 py-2">
                {t("buttons.download")}
              </button>
            )}
            <button type="button" onClick={handleClear} className="btn-secondary text-sm px-4 py-2">
              {t("buttons.clear")}
            </button>
          </div>

          {/* 情報パネル */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="font-semibold text-gray-500 mb-1">{t("labels.original")}</p>
              <p className="text-gray-700">{t("labels.dimensions")}: {originalWidth} × {originalHeight}</p>
              <p className="text-gray-700">{t("labels.fileSize")}: {formatBytes(originalFile.size)}</p>
            </div>
            {resizedUrl && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="font-semibold text-green-600 mb-1">{t("labels.resized")}</p>
                <p className="text-gray-700">{t("labels.dimensions")}: {width} × {height}</p>
                <p className="text-gray-700">{t("labels.fileSize")}: {formatBytes(resizedSize)}</p>
              </div>
            )}
          </div>

          {/* プレビュー */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">{t("labels.original")}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="original" className="max-h-48 w-auto rounded border border-gray-200" />
            </div>
            {resizedUrl && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">{t("labels.resized")}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resizedUrl} alt="resized" className="max-h-48 w-auto rounded border border-gray-200" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
