import React from "react";
import type { ParagraphProps, TextProps, TitleProps } from "./types";
import { getParagraphClass, getTextClass, getTitleClass } from "./utils";

// Hook yok, browser API yok — üçü de saf sunum, "use client" gerekmiyor.

export function Text({ children, className, color, weight, muted, ...props }: TextProps) {
  return (
    <span className={getTextClass(color, weight, muted, className)} {...props}>
      {children}
    </span>
  );
}

export function Paragraph({ children, className, color, muted, ...props }: ParagraphProps) {
  return (
    <p className={getParagraphClass(color, muted, className)} {...props}>
      {children}
    </p>
  );
}

export function Title({ level = 1, children, className, color, ...props }: TitleProps) {
  const Heading = `h${level}` as React.ElementType;
  return (
    <Heading className={getTitleClass(level, color, className)} {...props}>
      {children}
    </Heading>
  );
}
