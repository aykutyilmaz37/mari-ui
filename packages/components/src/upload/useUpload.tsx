"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "../toast";
import { formatBytes, getFileExtension, getFileKey, isFileValid } from "./utils";
import type { UploadFileItem } from "./types";

export interface UseUploadOptions {
  fileSize: number;
  fileType?: string;
  max: number;
}

/**
 * Faz 13 (kullanıcı geri bildirimi — ant.design ile birebir karşılaştırma):
 * eskiden burada sadece çıplak `File[]` tutuluyordu, her dosya HEP "hazır"
 * durumundaydı — ant'ın dosya listesinin/picture-card'ının asıl karakteri
 * olan "yükleniyor" (ilerleme çubuğu) → "tamamlandı" geçişi hiç yoktu, tüm
 * dosyalar aynı anda statik görünüyordu. Gerçek bir sunucu/`action` prop'u
 * olmadığı için ilerleme SİMÜLE ediliyor (ant'ın kendi dokümantasyon
 * demoları da aynısını yapıyor) — ama durum modeli gerçek: her dosya
 * `uploading` → `done` arasında geçiş yapıyor, UI bunu render ediyor.
 */
export function useUpload({ fileSize, fileType, max }: UseUploadOptions) {
  const [fileList, setFileList] = useState<UploadFileItem[]>([]);
  const { showToast } = useToast();
  const timersRef = useRef<Set<ReturnType<typeof setInterval>>>(new Set());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearInterval);
    };
  }, []);

  // Sabit bir artışla ilerliyor (rastgele değil) — güvenlik açısından hassas
  // olmayan salt görsel bir simülasyon için bile `Math.random()` SonarJS'in
  // "pseudo-random" uyarısını tetikliyor; deterministik artış hem uyarıyı
  // ortadan kaldırıyor hem test edilebilirliği artırıyor. `setInterval`'ın
  // içine doğrudan iç içe yazmak yerine (SonarJS'in izin verdiği içiçe
  // fonksiyon derinliğini aşıyordu) ayrı, adlandırılmış bir fonksiyon.
  const PROGRESS_STEP = 22;
  const TICK_MS = 250;
  // 100/22 ≈ 5 tick'te tamamlanır; interval'i temizlemek için biraz payla.
  const TICKS_TO_COMPLETE = Math.ceil(100 / PROGRESS_STEP) + 1;

  const advanceItem = (item: UploadFileItem, targetId: string): UploadFileItem => {
    if (item.id !== targetId || item.status !== "uploading") return item;
    const nextProgress = Math.min(100, item.progress + PROGRESS_STEP);
    return nextProgress >= 100 ? { ...item, progress: 100, status: "done" } : { ...item, progress: nextProgress };
  };

  const advanceFileList = (prev: UploadFileItem[], targetId: string): UploadFileItem[] => prev.map((item) => advanceItem(item, targetId));

  const simulateUpload = (id: string) => {
    const tick = () => setFileList((prev) => advanceFileList(prev, id));
    const interval = setInterval(tick, TICK_MS);
    timersRef.current.add(interval);

    const stop = () => {
      clearInterval(interval);
      timersRef.current.delete(interval);
    };
    setTimeout(stop, TICK_MS * TICKS_TO_COMPLETE);
  };

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

    const id = getFileKey(file);
    setFileList((prev) => [...prev, { file, id, status: "uploading", progress: 0 }]);
    simulateUpload(id);
  };

  const addFiles = (files: File[]) => {
    const remaining = max - fileList.length;
    files.slice(0, remaining).forEach((file) => addFile(file));
  };

  const deleteFile = (id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  return { fileList, setFileList, addFile, addFiles, deleteFile };
}
