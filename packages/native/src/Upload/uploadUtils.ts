/**
 * Upload'ın saf mantığı — web `upload/utils` ile aynı kurallar, ama tarayıcı
 * `File` yerine seçicinin döndürdüğü düz nesne (`uri`, `name`, `size`,
 * `mimeType`; expo-image-picker / expo-document-picker / react-native-image-picker
 * hepsi bunları verir).
 */

export interface UploadPickedFile {
  uri: string;
  /** Verilmezse `uri`nin son parçası. */
  name?: string;
  /** Bayt. Bilinmiyorsa boyut sınırı denetlenmez. */
  size?: number;
  mimeType?: string;
}

export type UploadRejectReason = "invalid-type" | "size-exceeded" | "max-exceeded";

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  const size = Number.parseFloat((bytes / k ** i).toFixed(i === 0 ? 0 : decimals));
  return `${size.toLocaleString("tr-TR")} ${sizes[i]}`;
}

/** `uri`den dosya adı (sorgu / parça atılır). */
export function nameFromUri(uri: string): string {
  const clean = uri.split(/[?#]/)[0] ?? uri;
  const last = clean.split("/").filter(Boolean).pop() ?? "dosya";
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

const EXTENSION_ALIASES: Record<string, string> = { jpg: "jpeg", jpeg: "jpg", tif: "tiff", tiff: "tif", heic: "heif", heif: "heic" };

/** Görsel mi: MIME önce, yoksa uzantı (iOS fotoğrafları çoğu zaman MIME'sız gelir). */
export function isImageFile(file: { name: string; mimeType?: string }): boolean {
  if (file.mimeType) return file.mimeType.toLowerCase().startsWith("image/");
  return ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "bmp"].includes(extensionOf(file.name));
}

/** Tek bir `accept` belirteci: "image/*", "image/png", ".png" ya da "png". */
function matchesToken(file: { name: string; mimeType?: string }, token: string): boolean {
  const type = (file.mimeType ?? "").toLowerCase();
  if (token.endsWith("/*")) {
    const group = token.slice(0, -2);
    // MIME yoksa uzantıdan tahmin: yalnız görsel grubu güvenilir.
    return type ? type.startsWith(`${group}/`) : group === "image" && isImageFile(file);
  }
  if (token.includes("/")) return type === token;
  const ext = token.replace(/^\./, "");
  const candidates = new Set([extensionOf(file.name), type.split("/")[1] ?? ""]);
  return candidates.has(ext) || candidates.has(EXTENSION_ALIASES[ext] ?? "");
}

/** Web `isFileValid` ile aynı: `fileType` virgüllü accept listesi, `maxSize` bayt. */
export function validateFile(file: { name: string; size?: number; mimeType?: string }, fileType?: string, maxSize?: number): UploadRejectReason | null {
  const tokens = (fileType ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length > 0 && !tokens.some((t) => matchesToken(file, t))) return "invalid-type";
  if (maxSize && file.size !== undefined && file.size > maxSize) return "size-exceeded";
  return null;
}

/** Seçilenleri kabul / ret diye ayırır; kalan yer kadarını kabul eder (sıra korunur). */
export function splitPicked<T extends { name: string; size?: number; mimeType?: string }>(picked: T[], remaining: number, fileType?: string, maxSize?: number): { accepted: T[]; rejected: { file: T; reason: UploadRejectReason }[] } {
  const accepted: T[] = [];
  const rejected: { file: T; reason: UploadRejectReason }[] = [];
  for (const file of picked) {
    const reason = validateFile(file, fileType, maxSize);
    if (reason) rejected.push({ file, reason });
    else if (accepted.length >= remaining) rejected.push({ file, reason: "max-exceeded" });
    else accepted.push(file);
  }
  return { accepted, rejected };
}

/** Kullanıcıya gösterilecek ret açıklaması (Türkçe). */
export function rejectMessage(reason: UploadRejectReason, name: string, opts: { max: number; maxSize?: number; fileType?: string }): string {
  if (reason === "invalid-type") {
    const allowed = opts.fileType ? " (" + opts.fileType + ")" : "";
    return `“${name}” bu türde değil${allowed}.`;
  }
  if (reason === "size-exceeded") return `“${name}” çok büyük (en fazla ${formatBytes(opts.maxSize ?? 0)}).`;
  return `En fazla ${opts.max} dosya eklenebilir.`;
}
