import React from "react";
import { cn } from "@mari-ui/core";
import type { SkeletonAvatarProps, SkeletonParagraphProps, SkeletonProps, SkeletonTitleProps } from "./types";
import { getAvatarShapeClass, getAvatarSizeStyleOrClass, getLineClass, widthToStyle } from "./utils";

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
  return isLastRow ? "w-4/5" : "w-full";
}

// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function Skeleton({
  active = false,
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
    <div className={cn("animate-pulse", active && "animate-pulse", className)}>
      <div className="flex gap-4">
        {avatar && (
          <div
            className={cn("bg-mari-border shrink-0", getAvatarShapeClass(avatarProps.shape), avatarSize.className)}
            style={avatarSize.style}
          />
        )}
        <div className="flex-1 space-y-2">
          {title && (
            <div
              className={getLineClass(round, cn("h-4", titleProps.width === undefined && "w-1/2"))}
              style={widthToStyle(titleProps.width)}
            />
          )}
          {paragraph &&
            Array.from({ length: rows }).map((_, i) => {
              const explicitWidth = paragraphWidths[i];
              const fallbackWidthClass = resolveFallbackWidthClass(explicitWidth, i === rows - 1);
              return (
                <div
                  key={i}
                  className={getLineClass(round, cn("h-3", fallbackWidthClass))}
                  style={widthToStyle(explicitWidth)}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
