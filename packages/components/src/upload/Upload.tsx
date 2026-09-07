"use client";

import React, { useCallback, useRef } from "react";
import { cn } from "@mari-ui/core";
import { Input } from "../input";
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
  const { fileList, addFile, deleteFile, addFiles } = useUpload({ fileSize, fileType, max });

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    addFile(file);
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
      <Input ref={fileInputRef} className="hidden" type="file" onChange={handleFileChange} />
      {listType === "review" ? (
        <div className="grid grid-cols-5 gap-1 shrink-0">{fileList.map((file) => renderFilePreview(file, listType))}</div>
      ) : (
        <ul>{fileList.map((file) => renderFilePreview(file, listType))}</ul>
      )}
    </div>
  );
}
