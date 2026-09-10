import React from "react";
import { cn } from "@mari-ui/core";
import type { DividerProps } from "./types";
import { getBaseClass, getLabelClass, getLabelMarginStyle, getLineClass } from "./utils";

/**
 * Hook yok, browser API yok — saf sunum. Eski kodda gereksiz yere
 * `"use client"` taşıyordu (bkz. plan Faz 3 denetimi); kaldırıldı.
 */
export function Divider({
  children,
  className,
  lineStyle = "solid",
  orientation = "horizontal",
  labelAlign = "center",
  labelMargin,
  plain = true,
  style,
  size,
  // Dikey divider varsayılan yüksekliği — `rem` (4K ekranlarda `px` kök
  // font'la ölçeklenmiyordu). Sayı verilirse `px` kabul edilir (kaçış).
  height = "3rem",
}: DividerProps) {
  const isHorizontal = orientation === "horizontal";
  const baseClass = getBaseClass(isHorizontal, size, className);
  const labelClass = getLabelClass(plain, isHorizontal);
  const marginStyle = getLabelMarginStyle(labelAlign, labelMargin, isHorizontal);

  // Çizgi stili (solid/dashed/dotted) DOĞRUDAN çizgiyi çizen elemana
  // uygulanır — `border-style` CSS'te KALITILMAZ, bu yüzden eskiden
  // kapsayıcıya konunca hep solid görünüyordu.
  const lineClass = cn("border-mari-border", getLineClass(lineStyle));

  if (!isHorizontal) {
    return (
      <div className={baseClass} style={style} role="separator" aria-orientation="vertical">
        <span
          className={cn("inline-block border-l", lineClass)}
          style={{ height: typeof height === "number" ? `${height}px` : height }}
        />
      </div>
    );
  }

  if (!children) {
    return (
      <div className={baseClass} style={style} role="separator">
        <span className={cn("flex-1 border-t", lineClass)} />
      </div>
    );
  }

  // Etiketli yatay divider: etiketin iki yanındaki çizgi parçaları.
  // `labelAlign` etiketi bir kenara yaslamak için o kenardaki parçayı
  // kısaltır (`w-6` = 1.5rem), diğerini `flex-1` ile uzatır.
  const startLineClass = cn("border-t", lineClass, labelAlign === "start" ? "w-6 flex-none" : "flex-1");
  const endLineClass = cn("border-t", lineClass, labelAlign === "end" ? "w-6 flex-none" : "flex-1");

  return (
    <div className={baseClass} style={style} role="separator">
      <span className={startLineClass} />
      <span className={labelClass} style={marginStyle}>
        {children}
      </span>
      <span className={endLineClass} />
    </div>
  );
}
