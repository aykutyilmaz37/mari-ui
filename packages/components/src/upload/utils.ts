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

/**
 * `allowedType` hem bir uzantı ("png") hem bir MIME türü ("image/png")
 * olarak dokümante edilmiş/kullanılmıştı (bkz. Upload.stories.tsx'in
 * `fileType` argType açıklaması ve `WithCustomFileType` örneği) ama burada
 * her zaman ÇIPLAK uzantıyla (`getFileExtension`) karşılaştırılıyordu —
 * "image/png" verilince `"png" !== "image/png"` hep true çıkıyor, yani
 * dokümante edilen kullanım her dosyayı GEÇERSİZ sayıyordu. İkisini de
 * uzantıya normalize ediyoruz.
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
  const extension = getFileExtension(file);
  const allowedExtension = allowedType?.includes("/") ? allowedType.split("/")[1] : allowedType;
  if (allowedExtension && extension !== allowedExtension) return { valid: false, reason: "invalid-type" };
  if (maxSize && file.size > maxSize) return { valid: false, reason: "size-exceeded" };
  return { valid: true };
}
