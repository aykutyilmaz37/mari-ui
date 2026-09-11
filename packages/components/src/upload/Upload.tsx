"use client";

import React, { useCallback, useRef } from "react";
import { cn } from "@mari-ui/core";
import type { UploadProps, ListType } from "./types";
import { ReviewList } from "./_components/ReviewList";
import { UploadList } from "./_components/List";
import { UploadListButton } from "./_components/UploadListButton";
import { UploadDragDropButton } from "./_components/UploadDragDropButton";
import { UploadReviewButton } from "./_components/UploadReviewButton";
import { useUpload } from "./useUpload";

export type { UploadProps };

export function Upload({ inputType = "button", fileSize = 5 * 1024 * 1024, fileType, max = 5, listType = "list", reviewType = "square" }: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fileList, deleteFile, addFiles } = useUpload({ fileSize, fileType, max });

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // `fileType` burada bir uzantı ("png"), native `accept` ise ya bir MIME
  // türü ("image/png") ya da başında nokta olan bir uzantı (".png") bekler
  // — çıplak "png" tarayıcı tarafından sessizce yok sayılır. İç içe ternary
  // yerine ayrık if (Faz 8, SonarJS `no-nested-conditional`).
  let acceptAttr: string | undefined;
  if (fileType) acceptAttr = fileType.includes("/") ? fileType : `.${fileType}`;

  /**
   * Eskiden sadece `files?.[0]` alınıyordu — `max > 1` olsa bile "gözat"
   * butonuyla asla birden fazla dosya SEÇİLEMİYORDU (native input `multiple`
   * taşımadığı için OS diyaloğu da tek seçime kilitliydi). Sürükle-bırak
   * (`addFiles`) zaten çoklu dosyayı destekliyordu — gerçek eksiklik sadece
   * tıklayarak-gözat yolundaydı.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) return;
    addFiles(Array.from(files));
    // Aynı dosyayı ard arda seçince `onChange` tekrar tetiklensin diye sıfırla.
    event.target.value = "";
  };

  const renderFilePreview = (fileItem: File, type: ListType) =>
    type === "review" ? <ReviewList key={fileItem.name} fileItem={fileItem} reviewType={reviewType} handleDelete={deleteFile} /> : <UploadList key={fileItem.name} fileItem={fileItem} handleDelete={deleteFile} />;

  const renderUploadButton = () => {
    switch (inputType) {
      case "button":
        return <UploadListButton handleClick={handleClick} />;
      case "dragDrop":
        return <UploadDragDropButton addFiles={addFiles} handleClick={handleClick} />;
      case "review":
        return <UploadReviewButton handleClick={handleClick} reviewType={reviewType} />;
    }
  };

  return (
    <div className={cn("flex gap-2", listType === "review" ? "flex-row" : "flex-col")}>
      {renderUploadButton()}
      {/* Görsel açıdan hep gizli, programatik olarak `handleClick` ile tetiklenir
          — bu yüzden stillenmiş `Input`a değil, düz native `<input>`'a ihtiyacı var
          (`multiple`/`accept` gibi Input'un desteklemediği native attribute'lar gerekiyor). */}
      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        multiple={max > 1}
        accept={acceptAttr}
        onChange={handleFileChange}
      />
      {listType === "review" ? (
        <div className="grid grid-cols-5 gap-1 shrink-0">{fileList.map((file) => renderFilePreview(file, listType))}</div>
      ) : (
        <ul>{fileList.map((file) => renderFilePreview(file, listType))}</ul>
      )}
    </div>
  );
}
