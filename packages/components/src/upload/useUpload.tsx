"use client";

import { useState } from "react";
import { useToast } from "../toast";
import { formatBytes, getFileExtension, isFileValid } from "./utils";

export interface UseUploadOptions {
  fileSize: number;
  fileType?: string;
  max: number;
}

export function useUpload({ fileSize, fileType, max }: UseUploadOptions) {
  const [fileList, setFileList] = useState<File[]>([]);
  const { showToast } = useToast();

  const addFile = (file: File) => {
    const extension = getFileExtension(file);
    const { valid, reason } = isFileValid({ file, allowedType: fileType, maxSize: fileSize });

    if (!valid) {
      showToast({
        title: "Geçersiz dosya",
        description: reason === "invalid-type" ? `.${extension} dosya türüne izin verilmiyor.` : `Dosya boyutu çok büyük (${formatBytes(file.size)})`,
        type: "error",
      });
      return;
    }

    if (fileList.length >= max) {
      showToast({ title: "Hata", description: `En fazla ${max} dosya yükleyebilirsiniz.`, type: "error" });
      return;
    }

    setFileList((prev) => [...prev, file]);
  };

  const addFiles = (files: File[]) => {
    const remaining = max - fileList.length;
    files.slice(0, remaining).forEach((file) => addFile(file));
  };

  const deleteFile = (fileToDelete: File) => {
    setFileList((prev) => prev.filter((file) => file !== fileToDelete));
  };

  return { fileList, setFileList, addFile, addFiles, deleteFile };
}
