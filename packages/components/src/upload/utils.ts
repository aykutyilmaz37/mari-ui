export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${size} ${sizes[i] ?? "Bytes"}`;
}

export function getFileExtension(file: File): string {
  return file.type.split("/")[1] ?? "";
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function getFileKey(file: File): string {
  return `${file.lastModified}-${file.name}`;
}

/** Dosya adının uzantısı (küçük harf, noktasız). */
function nameExtension(file: File): string {
  const dot = file.name.lastIndexOf(".");
  return dot > 0 ? file.name.slice(dot + 1).toLowerCase() : "";
}

const EXTENSION_ALIASES: Record<string, string> = { jpg: "jpeg", jpeg: "jpg", tif: "tiff", tiff: "tif" };

/** Tek bir `accept` belirteciyle eşleşme: "image/*", "image/png", ".png" ya da "png". */
function matchesAcceptToken(file: File, token: string): boolean {
  const type = file.type.toLowerCase();
  if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
  if (token.includes("/")) return type === token;
  const ext = token.replace(/^\./, "");
  const candidates = new Set([nameExtension(file), getFileExtension(file).toLowerCase()]);
  return candidates.has(ext) || candidates.has(EXTENSION_ALIASES[ext] ?? "");
}

/*
 * eskiden yalnız TEK bir değer ve MIME alt türüyle karşılaştırma vardı —
 * "image/*" (en yaygın değer) her dosyayı reddediyor ("*" ≠ "png"), ".jpg"
 * MIME'daki "jpeg" ile eşleşmiyor, "image/png,image/jpeg" hiç çalışmıyordu.
 */
/**
 * `allowedType` native `accept` sözdizimini izler: virgülle ayrılmış MIME
 * türleri ("image/png"), joker ("image/*") ve uzantılar (".png" ya da "png").
 */
export function isFileValid({
  file,
  allowedType,
  maxSize,
}: {
  file: File;
  allowedType?: string;
  maxSize?: number;
}): { valid: boolean; reason?: "invalid-type" | "size-exceeded" } {
  const tokens = (allowedType ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length > 0 && !tokens.some((t) => matchesAcceptToken(file, t))) return { valid: false, reason: "invalid-type" };
  if (maxSize && file.size > maxSize) return { valid: false, reason: "size-exceeded" };
  return { valid: true };
}

/** `fileType` → native `accept` özniteliği (çıplak "png" → ".png"; tarayıcı çıplak uzantıyı yok sayar). */
export function toAcceptAttribute(fileType: string | undefined): string | undefined {
  if (!fileType) return undefined;
  return fileType
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.includes("/") || t.startsWith(".") ? t : `.${t}`))
    .join(",");
}
