"use client";

import React, { useCallback, useRef } from "react";
import type { UploadProps } from "./types";
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

  const isReview = listType === "review";

  return (
    <div className="flex flex-col gap-2">
      {!isReview && (inputType === "dragDrop" ? <UploadDragDropButton addFiles={addFiles} handleClick={handleClick} /> : <UploadListButton handleClick={handleClick} />)}
      {/* Görsel açıdan hep gizli, programatik olarak `handleClick` ile tetiklenir
          — bu yüzden stillenmiş `Input`a değil, düz native `<input>`'a ihtiyacı var
          (`multiple`/`accept` gibi Input'un desteklemediği native attribute'lar gerekiyor). */}
      <input ref={fileInputRef} className="hidden" type="file" multiple={max > 1} accept={acceptAttr} onChange={handleFileChange} />
      {isReview ? (
        // ant.design'ın "Pictures Wall"ıyla birebir: "ekle" karosu küçük
        // resimlerle AYNI grid'de akar (eskiden ayrı bir satırda,
        // farklı boyutta duruyordu).
        <div className="flex flex-wrap gap-2">
          {fileList.map((item) => (
            <ReviewList key={item.id} item={item} reviewType={reviewType} handleDelete={deleteFile} />
          ))}
          <UploadReviewButton handleClick={handleClick} reviewType={reviewType} />
        </div>
      ) : (
        <ul className="flex flex-col">
          {fileList.map((item) => (
            <UploadList key={item.id} item={item} handleDelete={deleteFile} />
          ))}
        </ul>
      )}
    </div>
  );
}
