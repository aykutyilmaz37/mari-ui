import React from "react";
import { cn } from "@mari-ui/core";
import type { SkeletonAvatarProps, SkeletonParagraphProps, SkeletonProps, SkeletonTitleProps } from "./types";
import { getAvatarShapeClass, getAvatarSizeStyleOrClass, getLineClass, widthToStyle } from "./utils";

export type { SkeletonProps };

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
  const paragraphWidths: (string | number | undefined)[] = Array.isArray(paragraphProps.width)
    ? paragraphProps.width
    : paragraphProps.width !== undefined
      ? [...Array(rows - 1).fill(undefined), paragraphProps.width]
      : [];

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
              const fallbackWidthClass = explicitWidth === undefined ? (i === rows - 1 ? "w-4/5" : "w-full") : undefined;
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
