"use client";

import React, { useEffect, useState } from "react";
import { CircleXIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../../button";
import { getFileExtension, getFileKey, isImageFile } from "../utils";
import type { ReviewType } from "../types";

export interface ReviewListProps {
  fileItem: File;
  reviewType: ReviewType;
  handleDelete: (fileToDelete: File) => void;
}

/** `next/image` kaldırıldı — bu paket bir Next.js uygulaması değil. */
export function ReviewList({ fileItem, reviewType, handleDelete }: ReviewListProps) {
  const extension = getFileExtension(fileItem).toLocaleUpperCase();
  const isImage = isImageFile(fileItem);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(fileItem);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fileItem, isImage]);

  return (
    <div
      key={getFileKey(fileItem)}
      className={cn(
        "group relative flex items-center justify-center border-2 border-mari-border border-dashed bg-mari-surface-alt p-2 rounded-lg hover:border-mari-info-border hover:text-mari-info",
        reviewType === "square" && "rounded-lg h-28 w-32",
        reviewType === "circle" && "rounded-full h-32 w-32"
      )}
    >
      {isImage && objectUrl ? (
        <img src={objectUrl} alt={fileItem.name} className={cn("object-cover w-full h-full", reviewType === "square" && "rounded", reviewType === "circle" && "rounded-full")} />
      ) : (
        <span className="text-mari-primary font-bold text-2xl">{extension}</span>
      )}
      <div
        className={cn(
          "group-hover:opacity-100 opacity-0 flex items-center justify-center w-full h-full bg-black/20 absolute top-0 left-0 z-10 transition-all duration-300 ease-in-out",
          reviewType === "square" && "rounded-lg",
          reviewType === "circle" && "rounded-full"
        )}
      >
        <Button variant="ghost" color="error" className="p-0 text-white" onClick={() => handleDelete(fileItem)}>
          <CircleXIcon size={20} />
        </Button>
      </div>
    </div>
  );
}
