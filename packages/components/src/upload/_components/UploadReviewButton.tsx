import React from "react";
import { UploadIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../../button";
import type { ReviewType } from "../types";

export interface UploadReviewButtonProps {
  handleClick: () => void;
  reviewType: ReviewType;
}

export function UploadReviewButton({ handleClick, reviewType }: UploadReviewButtonProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={handleClick}
        variant="ghost"
        color="neutral"
        className={cn(
          "h-28 w-32 border-2 border-mari-border border-dashed bg-mari-surface-alt p-2 hover:border-mari-info-border hover:text-mari-info shrink-0",
          reviewType === "square" && "rounded-lg h-28 w-32",
          reviewType === "circle" && "rounded-full h-32 w-32"
        )}
      >
        <span className="flex flex-col items-center justify-center">
          <UploadIcon />
          <span>Yüklemek için tıklayın</span>
        </span>
      </Button>
    </div>
  );
}
