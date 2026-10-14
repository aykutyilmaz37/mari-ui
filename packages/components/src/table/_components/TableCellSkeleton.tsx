import React from "react";
import { cn } from "@mari-ui/core";
import { SkeletonBlock } from "../../skeleton";

/**
 * Tek satırlık hücre yer tutucusu. Kutu `h-5` = gövdenin `text-sm` satır
 * yüksekliği (20px): veri yokken çizilen sahte satırlar gerçek tek satırlık
 * bir satırla aynı yükseklikte olur. `justify` hücre hizasını izler.
 */
export function TableCellSkeleton({ width, height = "0.75rem", className }: Readonly<{ width: string; height?: string; className?: string }>) {
  return (
    <div className={cn("flex h-5 items-center", className)}>
      <SkeletonBlock active width={width} height={height} radius="sm" />
    </div>
  );
}
