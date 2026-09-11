"use client";

import React, { useState } from "react";
import { InboxIcon } from "lucide-react";
import { cn } from "@mari-ui/core";

export interface UploadDragDropButtonProps {
  handleClick: () => void;
  addFiles: (files: File[]) => void;
}

/**
 * ant.design'ın sürükle-bırak alanıyla birebir karşılaştırıldı: büyük,
 * renkli bir "gelen kutusu" ikonu + kalın bir ana başlık + soluk bir
 * ikincil ipucu satırı. Eskiden küçük generik bir `UploadIcon` + tek satır
 * metin vardı. Sürükleme sırasında kenarlık primary'e döner (ant'ın
 * `dragover` durumu) — eskiden sadece `hover:` vardı, gerçek sürükleme
 * anında görsel geri bildirim yoktu.
 */
export function UploadDragDropButton({ handleClick, addFiles }: UploadDragDropButtonProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      className={cn(
        "flex w-full min-h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-mari-surface-alt p-8 text-center transition-colors",
        isDragOver ? "border-mari-primary-border bg-mari-primary-subtle" : "border-mari-border hover:border-mari-primary-border"
      )}
    >
      <InboxIcon size={40} className="text-mari-primary" />
      <span className="text-base text-mari-foreground">Yüklemek için tıklayın veya dosyayı buraya sürükleyin</span>
      <span className="text-sm text-mari-muted">Tek seferde bir veya birden fazla dosya yükleyebilirsiniz.</span>
    </button>
  );
}
