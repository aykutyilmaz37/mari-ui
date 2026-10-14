"use client";

import React, { useState } from "react";
import { InboxIcon } from "lucide-react";
import { cn } from "@mari-ui/core";

export interface UploadDragDropButtonProps {
  handleClick: () => void;
  addFiles: (files: File[]) => void;
  disabled?: boolean;
}

/**
 * ant.design'ın sürükle-bırak alanıyla birebir karşılaştırıldı: büyük,
 * renkli bir "gelen kutusu" ikonu + kalın bir ana başlık + soluk bir
 * ikincil ipucu satırı. Eskiden küçük generik bir `UploadIcon` + tek satır
 * metin vardı. Sürükleme sırasında kenarlık primary'e döner (ant'ın
 * `dragover` durumu) — eskiden sadece `hover:` vardı, gerçek sürükleme
 * anında görsel geri bildirim yoktu.
 */
export function UploadDragDropButton({ handleClick, addFiles, disabled = false }: Readonly<UploadDragDropButtonProps>) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
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
      disabled={disabled}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      className={cn(
        "flex w-full min-h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-mari-surface-alt p-6 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring sm:p-8",
        isDragOver ? "border-mari-primary bg-mari-primary-subtle" : "border-mari-input hover:border-mari-primary",
        disabled && "cursor-not-allowed opacity-50 hover:border-mari-input"
      )}
    >
      <InboxIcon size={40} className="text-mari-primary" />
      {/* Dokunmatikte sürükle-bırak yok — metin cihaza göre. */}
      <span className="text-base text-mari-foreground pointer-coarse:hidden">Yüklemek için tıklayın veya dosyayı buraya sürükleyin</span>
      <span className="hidden text-base text-mari-foreground pointer-coarse:inline">Dosya seçmek için dokunun</span>
      <span className="text-sm text-mari-muted">Tek seferde bir veya birden fazla dosya yükleyebilirsiniz.</span>
    </button>
  );
}
