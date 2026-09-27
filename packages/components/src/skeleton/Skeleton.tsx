import React from "react";
import { cn } from "@mari-ui/core";
import type { SkeletonAvatarProps, SkeletonBlockProps, SkeletonParagraphProps, SkeletonProps, SkeletonTitleProps } from "./types";
import { getAvatarShapeClass, getAvatarSizeStyleOrClass, getLineClass, skeletonFill, widthToStyle } from "./utils";

export type { SkeletonProps };

/** İç içe ternary yerine ayrık fonksiyon (Faz 8, SonarJS `no-nested-conditional`). */
function resolveParagraphWidths(width: SkeletonParagraphProps["width"], rows: number): (string | number | undefined)[] {
  if (Array.isArray(width)) return width;
  if (width !== undefined) return [...Array(rows - 1).fill(undefined), width];
  return [];
}

/** İç içe ternary yerine ayrık fonksiyon (Faz 8, SonarJS `no-nested-conditional`). */
function resolveFallbackWidthClass(explicitWidth: string | number | undefined, isLastRow: boolean): string | undefined {
  if (explicitWidth !== undefined) return undefined;
  return isLastRow ? "w-3/5" : "w-full";
}

// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function Skeleton({
  active = false,
  label,
  avatar = false,
  loading,
  paragraph = true,
  round = false,
  title = true,
  className,
  children,
}: SkeletonProps) {
  if (loading === false) return <>{children}</>;

  const avatarProps: SkeletonAvatarProps = typeof avatar === "boolean" ? {} : avatar;
  const titleProps: SkeletonTitleProps = typeof title === "boolean" ? {} : title;
  const paragraphProps: SkeletonParagraphProps = typeof paragraph === "boolean" ? {} : paragraph;

  const rows = paragraphProps.rows ?? 3;
  const paragraphWidths = resolveParagraphWidths(paragraphProps.width, rows);

  const avatarSize = getAvatarSizeStyleOrClass(avatarProps.size);

  return (
    // Faz 13.6: eskiden `animate-pulse` `active`ten bağımsız HER ZAMAN vardı.
    <div
      className={className}
      {...(label ? { role: "status", "aria-label": label, "aria-busy": true } : { "aria-hidden": true })}
    >
      <div className="flex gap-4">
        {avatar && (
          <div
            className={cn("shrink-0", skeletonFill(avatarProps.active ?? active), getAvatarShapeClass(avatarProps.shape), avatarSize.className)}
            style={avatarSize.style}
          />
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <div
              className={getLineClass(round, cn("h-4", titleProps.width === undefined && "w-2/5"), active)}
              style={widthToStyle(titleProps.width)}
            />
          )}
          {paragraph && (
            <div className={cn("space-y-2.5", title && "mt-4")}>
              {Array.from({ length: rows }).map((_, i) => {
                const explicitWidth = paragraphWidths[i];
                const fallbackWidthClass = resolveFallbackWidthClass(explicitWidth, i === rows - 1);
                return (
                  <div
                    key={i}
                    className={getLineClass(round, cn("h-3", fallbackWidthClass), active)}
                    style={widthToStyle(explicitWidth)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Serbest şekilli iskelet parçası — kendi yerleşiminizi (kart ızgarası, tablo
 * satırı) gerçek bileşenin ölçüleriyle kurmak için. Görsel; `aria-hidden`.
 */
export function SkeletonBlock({ width, height = "1rem", radius = "md", active = false, className }: SkeletonBlockProps) {
  const radiusClass = { none: "rounded-none", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", full: "rounded-full" }[radius];
  return (
    <div
      aria-hidden
      className={cn("shrink-0", skeletonFill(active), radiusClass, width === undefined && "w-full", className)}
      style={{ width: typeof width === "number" ? `${width}px` : width, height: typeof height === "number" ? `${height}px` : height }}
    />
  );
}
