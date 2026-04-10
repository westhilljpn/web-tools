"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import Toast from "@/components/Toast";

type OutputFormat = "jpeg" | "png" | "webp";

interface ConversionItem {
  id: string;
  file: File;
  status: "pending" | "converting" | "done" | "error";
  resultBlob?: Blob;
  resultName?: string;
  errorMsg?: string;
}

const OUTPUT_FORMATS: OutputFormat[] = ["jpeg", "png", "webp"];
const VALID_EXTS = ["png", "jpg", "jpeg", "webp", "bmp", "heic", "heif"];

function getBaseName(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

function isHeic(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (
    ext === "heic" ||
    ext === "heif" ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
}

async function convertWithCanvas(file: File, format: OutputFormat): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error("Canvas not supported"));
      }
      // JPEGは透明背景が黒になるため白で塗りつぶし
      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("toBlob failed"));
        },
        format === "jpeg" ? "image/jpeg" : `image/${format}`,
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}

async function convertHeicFile(file: File, format: OutputFormat): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const mimeType = format === "jpeg" ? "image/jpeg" : `image/${format}`;
  const result = await heic2any({ blob: file, toType: mimeType, quality: 0.92 });
  return Array.isArray(result) ? result[0] : result;
}

export default function ImageConverter() {
  const t = useTranslations("image-converter");
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      return VALID_EXTS.includes(ext) || f.type.startsWith("image/");
    });
    if (valid.length === 0) return;
    setItems((prev) => [
      ...prev,
      ...valid.map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file: f,
        status: "pending" as const,
      })),
    ]);
  }, []);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragOver(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragOver(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleConvert = async () => {
    const pending = items.filter((i) => i.status === "pending");
    if (pending.length === 0 || isConverting) return;
    setIsConverting(true);

    const ext = format === "jpeg" ? "jpg" : format;
    const results = new Map<string, Partial<ConversionItem>>();

    await Promise.all(
      pending.map(async (item) => {
        try {
          const blob = isHeic(item.file)
            ? await convertHeicFile(item.file, format)
            : await convertWithCanvas(item.file, format);
          results.set(item.id, {
            status: "done",
            resultBlob: blob,
            resultName: `${getBaseName(item.file.name)}.${ext}`,
          });
        } catch {
          results.set(item.id, {
            status: "error",
            errorMsg: t("errors.conversionFailed"),
          });
        }
      })
    );

    setItems((prev) =>
      prev.map((item) =>
        results.has(item.id) ? { ...item, ...results.get(item.id) } : item
      )
    );
    setIsConverting(false);
    showToast(t("toast.converted"));
  };

  const handleDownloadSingle = (item: ConversionItem) => {
    if (!item.resultBlob || !item.resultName) return;
    const url = URL.createObjectURL(item.resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.resultName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadAll = async () => {
    const done = items.filter((i) => i.status === "done" && i.resultBlob);
    if (done.length === 0) return;

    if (done.length === 1) {
      handleDownloadSingle(done[0]);
      return;
    }

    setIsZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const item of done) {
        zip.file(item.resultName!, item.resultBlob!);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted-images.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(t("toast.downloaded"));
    } finally {
      setIsZipping(false);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => setItems([]);

  const doneCount = items.filter((i) => i.status === "done").length;
  const pendingCount = items.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* 出力フォーマット選択 */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          {t("settings.formatLabel")}
        </p>
        <div className="flex gap-2">
          {OUTPUT_FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={`px-5 py-2 rounded-lg border text-sm font-medium transition-colors ${
                format === f
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ドロップゾーン */}
      <div
        role="region"
        aria-label={t("dropzone.label")}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors select-none ${
          isDragOver
            ? "border-primary bg-blue-50"
            : "border-gray-300 hover:border-primary hover:bg-gray-50"
        }`}
      >
        <p className="text-3xl mb-2" aria-hidden="true">🖼️</p>
        <p className="text-sm font-medium text-gray-700">{t("dropzone.title")}</p>
        <p className="text-xs text-gray-400 mt-1">{t("dropzone.hint")}</p>
        <p className="text-xs text-gray-400 mt-0.5">{t("dropzone.formats")}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.bmp,.heic,.heif,image/*"
          multiple
          className="sr-only"
          onChange={handleFileInput}
          aria-label={t("dropzone.label")}
        />
      </div>

      {/* プライバシーバナー */}
      <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
        <span className="text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true">🔒</span>
        <p className="text-xs text-green-700">{t("privacy")}</p>
      </div>

      {/* ファイルリスト */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {t("fileList.title", { count: items.length })}
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {t("buttons.clearAll")}
            </button>
          </div>
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3 bg-white">
                <span className="text-lg flex-shrink-0" aria-hidden="true">
                  {item.status === "done"
                    ? "✅"
                    : item.status === "error"
                    ? "❌"
                    : item.status === "converting"
                    ? "⏳"
                    : "📄"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.file.name}
                  </p>
                  {item.status === "error" && (
                    <p className="text-xs text-red-500 mt-0.5">{item.errorMsg}</p>
                  )}
                  {item.status === "done" && item.resultName && (
                    <p className="text-xs text-green-600 mt-0.5">
                      {t("fileList.readyAs", { name: item.resultName })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.status === "done" && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      {t("buttons.download")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    aria-label={t("buttons.remove")}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* アクションボタン */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={handleConvert}
              disabled={isConverting}
              className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50"
            >
              {isConverting
                ? t("buttons.converting")
                : t("buttons.convertAll", { count: pendingCount })}
            </button>
          )}
          {doneCount > 0 && (
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={isZipping}
              className="btn-secondary text-sm px-5 py-2.5 disabled:opacity-50"
            >
              {isZipping
                ? t("buttons.zipping")
                : doneCount === 1
                ? t("buttons.downloadFile")
                : t("buttons.downloadZip", { count: doneCount })}
            </button>
          )}
        </div>
      )}

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
