import React from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../../button";
import type { ReviewType } from "../types";

export interface UploadReviewButtonProps {
  handleClick: () => void;
  reviewType: ReviewType;
  disabled?: boolean;
}

/**
 * ant.design'ın "Pictures Wall" karosuyla AYNI boyutta (`h-28 w-28`) —
 * eskiden ayrı bir satırda/boyutta duruyordu, artık küçük resimlerle AYNI
 * grid'e (bkz. `Upload.tsx`) akıp aynı boyutta bir "ekle" karosu oluyor.
 */
export function UploadReviewButton({ handleClick, reviewType, disabled }: Readonly<UploadReviewButtonProps>) {
  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant="ghost"
      color="neutral"
      icon={<PlusIcon size={18} />}
      className={cn(
        "h-28 w-28 shrink-0 flex-col gap-1 border border-dashed border-mari-border bg-mari-surface-alt hover:border-mari-primary-border hover:text-mari-primary",
        reviewType === "circle" ? "rounded-full" : "rounded-lg"
      )}
    >
      <span className="text-xs">Yükle</span>
    </Button>
  );
}
