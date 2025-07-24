export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${size} ${sizes[i]}`;
};

export const getFileExtension = (file: File) => file.type.split("/")[1];

export const isImageFile = (file: File) => file.type.startsWith("image/");

export const getFileKey = (file: File) => `${file.lastModified}-${file.name}`;

export const isFileValid = ({
  file,
  allowedType,
  maxSize,
}: {
  file: File;
  allowedType?: string;
  maxSize?: number;
}) => {
  const extension = getFileExtension(file);

  if (allowedType && extension !== allowedType) {
    return { valid: false, reason: "invalid-type" };
  }

  if (maxSize && file.size > maxSize) {
    return { valid: false, reason: "size-exceeded" };
  }

  return { valid: true };
};
