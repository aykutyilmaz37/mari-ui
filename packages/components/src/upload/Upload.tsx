"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { cn } from "@mari-ui/core";
import { skeletonBoxProps } from "../lib/skeleton";
import { Button } from "../button";
import type { UploadProps } from "./types";
import { ReviewList } from "./_components/ReviewList";
import { UploadList } from "./_components/List";
import { UploadListButton } from "./_components/UploadListButton";
import { UploadDragDropButton } from "./_components/UploadDragDropButton";
import { UploadReviewButton } from "./_components/UploadReviewButton";
import { useUpload } from "./useUpload";
import { toAcceptAttribute } from "./utils";

export type { UploadProps };

export function Upload({
  inputType = "button",
  fileSize = 5 * 1024 * 1024,
  fileType,
  max = 5,
  listType = "list",
  reviewType = "square",
  onChange,
  disabled = false,
  skeleton = false,
}: Readonly<UploadProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fileList, deleteFile, addFiles } = useUpload({ fileSize, fileType, max });

  // İlk (boş) render'da değil, liste gerçekten değişince bildir.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    onChangeRef.current?.(
      fileList.map((item) => item.file),
      fileList
    );
  }, [fileList]);

  const handleClick = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  if (skeleton) {
    if (listType === "review") return <div {...skeletonBoxProps(cn("h-28 w-28", reviewType === "circle" ? "rounded-full" : "rounded-lg"))} />;
    if (inputType === "dragDrop") return <div {...skeletonBoxProps("min-h-52 w-full rounded-lg")} />;
    return (
      <Button skeleton variant="outline" icon={<span className="size-4" />}>
        Yüklemek için tıklayın
      </Button>
    );
  }

  // Native `accept` çıplak uzantıyı ("png") yok sayar — ".png"ye çevrilir.
  const acceptAttr = toAcceptAttribute(fileType);

  /*
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
      {!isReview && (inputType === "dragDrop" ? <UploadDragDropButton addFiles={addFiles} handleClick={handleClick} disabled={disabled} /> : <UploadListButton handleClick={handleClick} disabled={disabled} />)}
      {/* Görsel açıdan hep gizli, programatik olarak `handleClick` ile tetiklenir
          — bu yüzden stillenmiş `Input`a değil, düz native `<input>`'a ihtiyacı var
          (`multiple`/`accept` gibi Input'un desteklemediği native attribute'lar gerekiyor). */}
      <input ref={fileInputRef} className="hidden" type="file" multiple={max > 1} accept={acceptAttr} onChange={handleFileChange} disabled={disabled} />
      {isReview ? (
        // ant.design'ın "Pictures Wall"ıyla birebir: "ekle" karosu küçük
        // resimlerle AYNI grid'de akar (eskiden ayrı bir satırda,
        // farklı boyutta duruyordu).
        <div className="flex flex-wrap gap-2">
          {fileList.map((item) => (
            <ReviewList key={item.id} item={item} reviewType={reviewType} handleDelete={deleteFile} />
          ))}
          {fileList.length < max && <UploadReviewButton handleClick={handleClick} reviewType={reviewType} disabled={disabled} />}
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
