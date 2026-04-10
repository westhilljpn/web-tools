"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import Toast from "@/components/Toast";

type PageSize = "a4" | "letter" | "original";

// 96DPIでピクセルをmmに変換
const PX_TO_MM = 25.4 / 96;

const PAGE_DIMS_MM: Record<Exclude<PageSize, "original">, [number, number]> = {
  a4: [210, 297],
  letter: [215.9, 279.4],
};

const MARGIN_OPTIONS = [0, 5, 10, 15, 20];

interface PDFImage {
  id: string;
  file: File;
  name: string;
  dataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}

async function loadImageData(file: File): Promise<PDFImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = () =>
        resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          name: file.name,
          dataUrl,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImagesToPdf() {
  const t = useTranslations("images-to-pdf");
  const [images, setImages] = useState<PDFImage[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [marginMm, setMarginMm] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  // ドラッグによる並び替え用
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropCounterRef = useRef(0);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setIsLoading(true);
    try {
      const loaded = await Promise.all(imageFiles.map(loadImageData));
      setImages((prev) => [...prev, ...loaded]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ファイルドロップゾーンのドラッグイベント
  const handleDropZoneDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dropCounterRef.current++;
    setIsDragOver(true);
  };
  const handleDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dropCounterRef.current--;
    if (dropCounterRef.current === 0) setIsDragOver(false);
  };
  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDropZoneDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dropCounterRef.current = 0;
      setIsDragOver(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  // 画像リストの並び替えドラッグイベント
  const handleItemDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDragIdx(idx);
  };
  const handleItemDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  };
  const handleItemDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIndex) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleItemDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleGenerate = async () => {
    if (images.length === 0 || isGenerating) return;
    setIsGenerating(true);

    try {
      const { jsPDF } = await import("jspdf");

      // 最初のページのサイズを決定
      let firstW: number;
      let firstH: number;
      if (pageSize === "original") {
        firstW = images[0].naturalWidth * PX_TO_MM + marginMm * 2;
        firstH = images[0].naturalHeight * PX_TO_MM + marginMm * 2;
      } else {
        [firstW, firstH] = PAGE_DIMS_MM[pageSize];
      }
      const firstOrientation = firstW >= firstH ? "l" : "p";

      const pdf = new jsPDF({
        orientation: firstOrientation,
        unit: "mm",
        format: pageSize === "original" ? [firstW, firstH] : pageSize,
      });

      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        if (i > 0) {
          let pgW: number;
          let pgH: number;
          if (pageSize === "original") {
            pgW = img.naturalWidth * PX_TO_MM + marginMm * 2;
            pgH = img.naturalHeight * PX_TO_MM + marginMm * 2;
          } else {
            [pgW, pgH] = PAGE_DIMS_MM[pageSize];
          }
          const pgOr = pgW >= pgH ? "l" : "p";
          pdf.addPage(
            pageSize === "original" ? [pgW, pgH] : pageSize,
            pgOr
          );
        }

        const pgWidth = pdf.internal.pageSize.getWidth();
        const pgHeight = pdf.internal.pageSize.getHeight();
        const availW = pgWidth - marginMm * 2;
        const availH = pgHeight - marginMm * 2;

        const imgWmm = img.naturalWidth * PX_TO_MM;
        const imgHmm = img.naturalHeight * PX_TO_MM;

        // アスペクト比を保ちながら収まるようにスケール
        const scale = Math.min(availW / imgWmm, availH / imgHmm, 1);
        const drawW = imgWmm * scale;
        const drawH = imgHmm * scale;

        // ページ中央に配置
        const x = marginMm + (availW - drawW) / 2;
        const y = marginMm + (availH - drawH) / 2;

        const imgFormat = img.file.type.includes("png") ? "PNG" : "JPEG";
        pdf.addImage(img.dataUrl, imgFormat, x, y, drawW, drawH);
      }

      pdf.save("images.pdf");
      showToast(t("toast.generated"));
    } catch {
      showToast(t("toast.error"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ドロップゾーン */}
      <div
        onDragEnter={handleDropZoneDragEnter}
        onDragLeave={handleDropZoneDragLeave}
        onDragOver={handleDropZoneDragOver}
        onDrop={handleDropZoneDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors select-none ${
          isDragOver
            ? "border-primary bg-blue-50"
            : "border-gray-300 hover:border-primary hover:bg-gray-50"
        }`}
      >
        <p className="text-3xl mb-2" aria-hidden="true">📷</p>
        <p className="text-sm font-medium text-gray-700">{t("dropzone.title")}</p>
        <p className="text-xs text-gray-400 mt-1">{t("dropzone.hint")}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) {
              addFiles(Array.from(e.target.files));
              e.target.value = "";
            }
          }}
        />
      </div>

      {isLoading && (
        <p className="text-center text-sm text-gray-400">{t("loading")}</p>
      )}

      {/* 画像リスト（並び替え対応） */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {t("imageList.title", { count: images.length })}
            </p>
            <p className="text-xs text-gray-400">{t("imageList.dragHint")}</p>
          </div>
          <ul className="space-y-2">
            {images.map((img, idx) => (
              <li
                key={img.id}
                draggable
                onDragStart={(e) => handleItemDragStart(e, idx)}
                onDragOver={(e) => handleItemDragOver(e, idx)}
                onDrop={(e) => handleItemDrop(e, idx)}
                onDragEnd={handleItemDragEnd}
                className={`flex items-center gap-3 p-3 rounded-lg border bg-white transition-all ${
                  dragOverIdx === idx && dragIdx !== idx
                    ? "border-primary bg-blue-50"
                    : "border-gray-200"
                } ${dragIdx === idx ? "opacity-40" : "opacity-100"}`}
              >
                {/* サムネイル */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                />
                <span className="text-gray-300 cursor-grab text-lg flex-shrink-0" aria-hidden="true">
                  ⠿
                </span>
                <p className="flex-1 text-sm font-medium text-gray-800 truncate min-w-0">
                  {idx + 1}. {img.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                  aria-label={t("buttons.remove")}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 設定パネル */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          {/* ページサイズ */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {t("settings.pageSizeLabel")}
            </p>
            <div className="flex gap-2">
              {(["a4", "letter", "original"] as PageSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPageSize(s)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    pageSize === s
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-300 hover:border-primary"
                  }`}
                >
                  {t(`settings.pageSizes.${s}`)}
                </button>
              ))}
            </div>
          </div>
          {/* 余白 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {t("settings.marginLabel", { mm: marginMm })}
            </p>
            <div className="flex gap-1.5">
              {MARGIN_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMarginMm(m)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    marginMm === m
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-300 hover:border-primary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PDF生成ボタン */}
      {images.length > 0 && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-primary w-full py-3 text-sm font-medium disabled:opacity-50"
        >
          {isGenerating
            ? t("buttons.generating")
            : t("buttons.generate", { count: images.length })}
        </button>
      )}

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
