"use client";

import React, { useEffect, useState } from "react";
import { EyeIcon, XIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../../button";
import { getFileExtension, isImageFile } from "../utils";
import type { ReviewType, UploadFileItem } from "../types";

export interface ReviewListProps {
  item: UploadFileItem;
  reviewType: ReviewType;
  handleDelete: (id: string) => void;
}

/*
 * ant.design'ın "Pictures Wall" (picture-card) karosuyla birebir
 * karşılaştırıldı: `uploading` durumunda küçük resim yerine "Yükleniyor..."
 * + ince bir ilerleme çubuğu gösterilir; tamamlanınca gerçek küçük resme
 * geçer ve hover'da önizleme (yeni sekmede aç) + sil ikonları belirir
 * (eskiden sadece sil vardı). `next/image` kaldırıldı — bu paket bir
 * Next.js uygulaması değil.
 */
export function ReviewList({ item, reviewType, handleDelete }: Readonly<ReviewListProps>) {
  const { file, status, progress } = item;
  const extension = getFileExtension(file).toLocaleUpperCase();
  const isImage = isImageFile(file);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const isUploading = status === "uploading";

  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  const shapeClass = reviewType === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <div
      className={cn(
        "group relative flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1.5 border border-mari-border bg-mari-surface-alt p-2",
        shapeClass
      )}
    >
      {isUploading ? (
        <div className="flex w-full flex-col items-center gap-2 px-2">
          <span className="text-xs text-mari-muted">Yükleniyor...</span>
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-mari-border" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-mari-primary-solid transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <>
          {isImage && objectUrl ? (
            <img src={objectUrl} alt={file.name} className={cn("h-full w-full object-cover", shapeClass)} />
          ) : (
            <span className="text-2xl font-bold text-mari-primary">{extension}</span>
          )}
          <div
            className={cn(
              "absolute inset-0 z-10 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100",
              // Dokunmatikte hover yok: karartma yerine köşede hep görünür küçük butonlar.
              "pointer-coarse:items-start pointer-coarse:justify-end pointer-coarse:gap-1 pointer-coarse:bg-transparent pointer-coarse:p-1 pointer-coarse:opacity-100",
              shapeClass
            )}
          >
            {isImage && objectUrl && (
              <Button
                variant="ghost"
                shape="circle"
                size="sm"
                className="text-white hover:text-white pointer-coarse:bg-black/55"
                aria-label={`${file.name} dosyasını önizle`}
                onClick={() => window.open(objectUrl, "_blank", "noopener,noreferrer")}
              >
                <EyeIcon size={18} />
              </Button>
            )}
            <Button
              variant="ghost"
              shape="circle"
              size="sm"
              className="text-white hover:text-white pointer-coarse:bg-black/55"
              aria-label={`${file.name} dosyasını kaldır`}
              onClick={() => handleDelete(item.id)}
            >
              <XIcon size={18} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
