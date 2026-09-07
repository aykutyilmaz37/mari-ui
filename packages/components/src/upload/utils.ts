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
  if (allowedType && extension !== allowedType) return { valid: false, reason: "invalid-type" };
  if (maxSize && file.size > maxSize) return { valid: false, reason: "size-exceeded" };
  return { valid: true };
}
