import React from "react";
import { cn } from "@mari-ui/core";
import { skeletonBoxProps, skeletonFill } from "../lib/skeleton";
import type { ParagraphProps, TextProps, TitleProps } from "./types";
import { getParagraphClass, getTextClass, getTitleBaseClass, getTitleClass, PARAGRAPH_BASE_CLASS } from "./utils";

// Hook yok, browser API yok — üçü de saf sunum, "use client" gerekmiyor.

/**
 * İskelet satırı: kutu yüksekliği tam bir satır (`1lh`) — metin yüklenince
 * blok zıplamaz; dolgu çubuğu satırın ortasında, yazı gövdesi kadar kalın.
 */
function SkeletonLine({ width }: Readonly<{ width: string }>) {
  return (
    <span className="flex h-[1lh] items-center">
      <span className={cn("h-[0.7em] rounded-sm", skeletonFill(true), width)} />
    </span>
  );
}

export function Text({ children, className, color, weight, muted, ellipsis, skeleton = false, ...props }: Readonly<TextProps>) {
  if (skeleton) {
    // Metin varsa şeffaf olarak yerinde kalır → iskelet tam o genişlikte. `w-fit`:
    // flex sütununda span bloklaşıp tam genişliğe uzamasın.
    return <span {...skeletonBoxProps(cn(getTextClass(undefined, weight, false, undefined, ellipsis), "w-fit max-w-full rounded-sm", className))}>{children ?? " ".repeat(16)}</span>;
  }
  return (
    <span className={getTextClass(color, weight, muted, className, ellipsis)} {...props}>
      {children}
    </span>
  );
}

export function Paragraph({ children, className, color, muted, ellipsis, skeleton = false, skeletonRows = 3, ...props }: Readonly<ParagraphProps>) {
  if (skeleton) {
    return (
      <div aria-hidden data-skeleton="" className={cn(PARAGRAPH_BASE_CLASS, className)}>
        {Array.from({ length: skeletonRows }, (_, i) => (
          <SkeletonLine key={i} width={i === skeletonRows - 1 && skeletonRows > 1 ? "w-3/5" : "w-full"} />
        ))}
      </div>
    );
  }
  return (
    <p className={getParagraphClass(color, muted, className, ellipsis)} {...props}>
      {children}
    </p>
  );
}

export function Title({ level = 1, children, className, color, ellipsis, skeleton = false, ...props }: Readonly<TitleProps>) {
  if (skeleton) {
    return (
      <div aria-hidden data-skeleton="" className={cn(getTitleBaseClass(level), className)}>
        <SkeletonLine width="w-2/5" />
      </div>
    );
  }
  const Heading = `h${level}` as React.ElementType;
  return (
    <Heading className={getTitleClass(level, color, className, ellipsis)} {...props}>
      {children}
    </Heading>
  );
}
