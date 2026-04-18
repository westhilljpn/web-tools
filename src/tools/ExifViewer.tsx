"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// ── EXIF Parser ────────────────────────────────────────────────────────────

const IFD0_TAGS: Record<number, string> = {
  0x010f: "Make", 0x0110: "Model", 0x0131: "Software",
  0x0132: "DateTime", 0x013b: "Artist",
  0x011a: "XResolution", 0x011b: "YResolution", 0x0128: "ResolutionUnit",
  0x0112: "Orientation",
  0x8769: "__ExifIFD", 0x8825: "__GPSIFD",
};
const EXIF_TAGS: Record<number, string> = {
  0x9000: "ExifVersion", 0x9003: "DateTimeOriginal", 0x9004: "DateTimeDigitized",
  0xa002: "PixelXDimension", 0xa003: "PixelYDimension",
  0x829a: "ExposureTime", 0x829d: "FNumber", 0x8827: "ISOSpeedRatings",
  0x920a: "FocalLength", 0x9209: "Flash", 0x8822: "ExposureProgram",
  0x9201: "ShutterSpeedValue", 0x9202: "ApertureValue", 0x9204: "ExposureBiasValue",
  0xa001: "ColorSpace", 0xa217: "SensingMethod", 0x9207: "MeteringMode",
};
const GPS_TAGS: Record<number, string> = {
  0x0001: "GPSLatitudeRef", 0x0002: "GPSLatitude",
  0x0003: "GPSLongitudeRef", 0x0004: "GPSLongitude",
  0x0005: "GPSAltitudeRef", 0x0006: "GPSAltitude",
  0x001d: "GPSDateStamp",
};

type ExifResult = Record<string, string | number>;

const TYPE_SIZE = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8];

function readASCII(view: DataView, offset: number, count: number): string {
  let s = "";
  for (let i = 0; i < count - 1; i++) {
    const b = view.getUint8(offset + i);
    if (b === 0) break;
    s += String.fromCharCode(b);
  }
  return s.trim();
}

function readRational(view: DataView, offset: number, le: boolean, signed = false): number {
  const n = signed ? view.getInt32(offset, le) : view.getUint32(offset, le);
  const d = signed ? view.getInt32(offset + 4, le) : view.getUint32(offset + 4, le);
  return d === 0 ? 0 : n / d;
}

function readValue(
  view: DataView, type: number, count: number, valueOff: number, le: boolean
): string | number {
  switch (type) {
    case 1:  return view.getUint8(valueOff);
    case 2:  return readASCII(view, valueOff, count);
    case 3:  return view.getUint16(valueOff, le);
    case 4:  return view.getUint32(valueOff, le);
    case 5:  return readRational(view, valueOff, le);
    case 9:  return view.getInt32(valueOff, le);
    case 10: return readRational(view, valueOff, le, true);
    default: return `[${count}B]`;
  }
}

function readGPSCoord(view: DataView, valueOff: number, le: boolean): string {
  const deg = readRational(view, valueOff, le);
  const min = readRational(view, valueOff + 8, le);
  const sec = readRational(view, valueOff + 16, le);
  return `${deg}° ${min}' ${sec.toFixed(2)}"`;
}

function readIFD(
  view: DataView, ifdOffset: number, le: boolean,
  tags: Record<number, string>, out: ExifResult,
  isGPS = false
): { exifIFD?: number; gpsIFD?: number } {
  if (ifdOffset + 2 > view.byteLength) return {};
  const count = view.getUint16(ifdOffset, le);
  let exifIFD: number | undefined, gpsIFD: number | undefined;
  for (let i = 0; i < count; i++) {
    const base = ifdOffset + 2 + i * 12;
    if (base + 12 > view.byteLength) break;
    const tag = view.getUint16(base, le);
    const type = view.getUint16(base + 2, le);
    const cnt = view.getUint32(base + 4, le);
    const typeSize = type < TYPE_SIZE.length ? (TYPE_SIZE[type] ?? 1) : 1;
    const valSize = typeSize * cnt;
    const valOff = valSize <= 4 ? base + 8 : view.getUint32(base + 8, le);
    if (tags[tag] === "__ExifIFD") { exifIFD = view.getUint32(base + 8, le); continue; }
    if (tags[tag] === "__GPSIFD")  { gpsIFD  = view.getUint32(base + 8, le); continue; }
    if (!tags[tag]) continue;
    try {
      if (isGPS && type === 5 && cnt === 3) {
        out[tags[tag]] = readGPSCoord(view, valOff, le);
      } else {
        out[tags[tag]] = readValue(view, type, cnt, valOff, le);
      }
    } catch {}
  }
  return { exifIFD, gpsIFD };
}

function parseExif(buffer: ArrayBuffer): ExifResult | null {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;
  let off = 2;
  while (off + 4 <= view.byteLength) {
    const marker = view.getUint16(off);
    const segLen = view.getUint16(off + 2);
    if (marker === 0xffe1 && off + 10 <= view.byteLength) {
      const e = view.getUint8(off + 4);
      const x = view.getUint8(off + 5);
      const i = view.getUint8(off + 6);
      const f = view.getUint8(off + 7);
      if (e === 0x45 && x === 0x78 && i === 0x69 && f === 0x66) {
        const tiffStart = off + 10;
        const tiffLen = segLen - 8;
        if (tiffLen <= 0 || tiffStart + tiffLen > view.byteLength) return null;
        const tv = new DataView(buffer, tiffStart, tiffLen);
        const bo = tv.getUint16(0);
        const le = bo === 0x4949;
        if (tv.getUint16(2, le) !== 42) return null;
        const ifd0Off = tv.getUint32(4, le);
        const result: ExifResult = {};
        const { exifIFD, gpsIFD } = readIFD(tv, ifd0Off, le, IFD0_TAGS, result);
        if (exifIFD !== undefined) readIFD(tv, exifIFD, le, EXIF_TAGS, result);
        if (gpsIFD  !== undefined) readIFD(tv, gpsIFD,  le, GPS_TAGS,  result, true);
        return Object.keys(result).length > 0 ? result : null;
      }
    }
    if ((marker & 0xff00) !== 0xff00 || segLen < 2) break;
    off += 2 + segLen;
  }
  return null;
}

// ── Formatting helpers ────────────────────────────────────────────────────

function formatTagValue(tag: string, val: string | number): string {
  if (typeof val === "string") return val;
  if (tag === "FNumber") return `f/${val.toFixed(1)}`;
  if (tag === "ExposureTime") return val < 1 ? `1/${Math.round(1 / val)}s` : `${val}s`;
  if (tag === "FocalLength") return `${val.toFixed(1)}mm`;
  if (tag === "Flash") return val === 0 ? "No flash" : val === 1 ? "Flash fired" : `0x${val.toString(16)}`;
  if (tag === "Orientation") {
    return (["", "Normal", "Flip H", "180°", "Flip V", "Transpose", "90° CW", "Transverse", "270° CW"])[val as number] ?? String(val);
  }
  if (tag === "ResolutionUnit") return val === 2 ? "inch" : val === 3 ? "cm" : String(val);
  if (tag === "ExposureProgram") {
    return (["Not defined", "Manual", "Normal", "Aperture priority", "Shutter priority", "Creative", "Action", "Portrait", "Landscape"])[val as number] ?? String(val);
  }
  if (tag === "MeteringMode") {
    return (["Unknown", "Average", "Center-weighted", "Spot", "Multi-spot", "Multi-segment", "Partial"])[val as number] ?? String(val);
  }
  if (tag === "ColorSpace") return val === 1 ? "sRGB" : val === 65535 ? "Uncalibrated" : String(val);
  if (tag === "GPSAltitudeRef") return val === 0 ? "Sea level" : "Below sea level";
  if (typeof val === "number") return Number.isInteger(val) ? String(val) : val.toFixed(4);
  return String(val);
}

type GroupKey = "camera" | "datetime" | "image" | "exposure" | "gps";

const TAG_GROUP: Record<string, GroupKey> = {
  Make: "camera", Model: "camera", Software: "camera", Artist: "camera",
  DateTime: "datetime", DateTimeOriginal: "datetime", DateTimeDigitized: "datetime",
  XResolution: "image", YResolution: "image", ResolutionUnit: "image",
  PixelXDimension: "image", PixelYDimension: "image", Orientation: "image",
  ColorSpace: "image", ExifVersion: "image",
  ExposureTime: "exposure", FNumber: "exposure", ISOSpeedRatings: "exposure",
  FocalLength: "exposure", Flash: "exposure", ExposureProgram: "exposure",
  ShutterSpeedValue: "exposure", ApertureValue: "exposure",
  ExposureBiasValue: "exposure", MeteringMode: "exposure",
  GPSLatitude: "gps", GPSLatitudeRef: "gps", GPSLongitude: "gps",
  GPSLongitudeRef: "gps", GPSAltitude: "gps", GPSAltitudeRef: "gps",
  GPSDateStamp: "gps",
};

const GROUP_ORDER: GroupKey[] = ["camera", "datetime", "image", "exposure", "gps"];

function dmsToDecimal(dms: string, ref: string): number | null {
  const m = dms.match(/([\d.]+)°\s*([\d.]+)'\s*([\d.]+)"/);
  if (!m) return null;
  const dec = parseFloat(m[1]) + parseFloat(m[2]) / 60 + parseFloat(m[3]) / 3600;
  return (ref === "S" || ref === "W") ? -dec : dec;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function ExifViewer() {
  const t = useTranslations("exif-viewer");
  const [exif, setExif] = useState<ExifResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<"notJpeg" | "noExif" | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [dragging, setDragging] = useState(false);

  function processFile(file: File) {
    if (!file.type.includes("jpeg") && !file.type.includes("jpg") && !file.name.toLowerCase().endsWith(".jpg") && !file.name.toLowerCase().endsWith(".jpeg")) {
      setError("notJpeg"); setExif(null); setFileName(file.name); return;
    }
    setFileName(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buf = e.target?.result as ArrayBuffer;
      const result = parseExif(buf);
      if (!result) { setError("noExif"); setExif(null); }
      else { setExif(result); setError(null); }
    };
    reader.onerror = () => { setError("noExif"); setExif(null); };
    reader.readAsArrayBuffer(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  async function copyTag(tag: string, val: string) {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedTag(tag); setTimeout(() => setCopiedTag(null), 2000);
    } catch {}
  }

  async function copyAll() {
    if (!exif) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(exif, null, 2));
      setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000);
    } catch {}
  }

  // GPS マップリンク生成
  let mapsUrl: string | null = null;
  if (exif?.GPSLatitude && exif?.GPSLongitude) {
    const lat = dmsToDecimal(String(exif.GPSLatitude), String(exif.GPSLatitudeRef));
    const lng = dmsToDecimal(String(exif.GPSLongitude), String(exif.GPSLongitudeRef));
    if (lat !== null && lng !== null) {
      mapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
    }
  }

  // グループ分け
  const grouped: Partial<Record<GroupKey, Array<{ tag: string; val: string }>>> = {};
  if (exif) {
    for (const [tag, raw] of Object.entries(exif)) {
      const group = TAG_GROUP[tag] ?? "camera";
      if (!grouped[group]) grouped[group] = [];
      grouped[group]!.push({ tag, val: formatTagValue(tag, raw) });
    }
  }

  return (
    <div className="space-y-4">
      {/* ドロップゾーン */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl
                    p-8 cursor-pointer transition-colors ${
                      dragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
                    }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,.jpg,.jpeg"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />
        <span className="text-3xl mb-2">📷</span>
        <p className="text-sm font-medium text-gray-700">{t("dropLabel")}</p>
        <p className="text-xs text-gray-400 mt-1">{t("browseLabel")}</p>
      </label>

      {fileName && (
        <p className="text-xs text-gray-500 text-center">📄 {fileName}</p>
      )}

      {error === "notJpeg" && (
        <p className="text-sm text-center text-amber-600 bg-amber-50 rounded-lg py-3 px-4">
          {t("notSupported")}
        </p>
      )}
      {error === "noExif" && (
        <p className="text-sm text-center text-gray-500 bg-gray-50 rounded-lg py-3 px-4">
          {t("noExif")}
        </p>
      )}

      {exif && (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={copyAll}
              className="text-xs px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
            >
              {copiedAll ? t("copied") : t("copyAll")}
            </button>
          </div>

          {GROUP_ORDER.map((group) => {
            const items = grouped[group];
            if (!items?.length) return null;
            return (
              <div key={group} className="tool-card overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t(`groups.${group}`)}
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map(({ tag, val }) => (
                    <div key={tag} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 gap-3">
                      <span className="text-xs text-gray-500 w-36 shrink-0">{tag}</span>
                      <span className="text-sm font-mono flex-1 truncate">{val}</span>
                      <button
                        type="button"
                        onClick={() => copyTag(tag, val)}
                        className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors shrink-0"
                      >
                        {copiedTag === tag ? "✓" : t("copy")}
                      </button>
                    </div>
                  ))}
                  {group === "gps" && mapsUrl && (
                    <div className="px-4 py-2.5">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        🗺️ {t("mapsLink")}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
