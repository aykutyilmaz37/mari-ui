"use client";

import React, { useId, useMemo } from "react";
import { CircleCheckIcon, Loader2Icon, RotateCwIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { neutralRamp } from "@mari-ui/tokens";
import { skeletonBoxProps } from "../lib/skeleton";
import type { QRCodeProps, QRStatus } from "./types";
import { buildQRModel } from "./utils";

export type { QRCodeProps };

const DEFAULT_COLOR = neutralRamp[950];

function StatusLayer({ status, onRefresh }: Readonly<{ status: Exclude<QRStatus, "active">; onRefresh?: () => void }>) {
  if (status === "loading") {
    return (
      <>
        <Loader2Icon size={28} aria-hidden className="animate-spin text-mari-primary motion-reduce:animate-none" />
        <span className="text-sm text-mari-muted">Hazırlanıyor…</span>
      </>
    );
  }
  if (status === "scanned") {
    return (
      <>
        <CircleCheckIcon size={28} aria-hidden className="text-mari-success" />
        <span className="text-sm font-medium text-mari-foreground">Tarandı</span>
        <span className="text-xs text-mari-muted">Telefonunuzdan onaylayın</span>
      </>
    );
  }
  return (
    <>
      <span className="text-sm font-medium text-mari-foreground">QR kodun süresi doldu</span>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="relative inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-mari-primary transition-colors hover:bg-mari-primary-subtle focus-visible:outline-2 focus-visible:outline-mari-ring pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-1.5"
        >
          <RotateCwIcon size={14} aria-hidden />
          Yenile
        </button>
      )}
    </>
  );
}

/**
 * Faz 16.3 — yapı ant.design QRCode'dan (değer, boyut, hata düzeltme, renk,
 * ikon, kenarlık, durum katmanı: loading/expired/scanned + Yenile), çizim
 * kullanıcının `qr-code-generator` projesindeki renderer'dan (nokta stilleri,
 * köşe şekilleri, gradyan, logo). Tek bağımlılık `qrcode-generator` (MIT, sıfır
 * bağımlılık). Saf SVG → SSR'da da çizilir, her çözünürlükte keskin.
 *
 * Varsayılan renkler temadan bağımsız koyu-üstü-açık: bazı okuyucular ters
 * (açık-üstü-koyu) QR'ı çözemez. Erişilebilirlik: `role="img"` + ad; kodun
 * içeriğini (URL) görünür metin olarak da verin — görme engelli kullanıcı
 * QR'ı okutamaz. Durum katmanı `role="status"` ile duyurulur.
 */
export function QRCode({
  value,
  size = "10rem",
  errorLevel,
  color = DEFAULT_COLOR,
  colorEnd,
  bgColor = "#ffffff",
  cornerColor,
  dotType = "square",
  cornerSquareType = "square",
  cornerDotType = "square",
  icon,
  iconSize = 0.22,
  margin = 2,
  bordered = true,
  status = "active",
  onRefresh,
  statusRender,
  "aria-label": ariaLabel = "QR kod",
  className,
  skeleton = false,
}: Readonly<QRCodeProps>) {
  const gradientId = useId();
  const level = errorLevel ?? (icon ? "H" : "M");
  const model = useMemo(
    () => buildQRModel({ value, errorLevel: level, margin, dotType, cornerSquareType, cornerDotType }),
    [value, level, margin, dotType, cornerSquareType, cornerDotType]
  );

  const fill = colorEnd ? `url(#${gradientId})` : color;
  const cornerFill = cornerColor ?? fill;
  const iconEdge = model.size * Math.min(Math.max(iconSize, 0.1), 0.3);
  const iconPos = (model.size - iconEdge) / 2;
  const iconPad = iconEdge * 0.08;
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      aria-busy={skeleton || status === "loading" || undefined}
      className={cn("relative inline-flex shrink-0", bordered && "rounded-lg border border-mari-border bg-mari-surface p-2", className)}
    >
      {skeleton ? (
        <span {...skeletonBoxProps("block rounded-md")} style={{ width: dimension, height: dimension }} />
      ) : (
        <svg
          role="img"
          aria-label={ariaLabel}
          viewBox={`0 0 ${model.size} ${model.size}`}
          width={dimension}
          height={dimension}
          // Yalnız TAMAMEN kare kodda: crispEdges yuvarlak/kalp köşe işaretlerini
          // tırtıklı çizip okunamaz yapıyordu (jsQR ile ölçüldü).
          shapeRendering={dotType === "square" && cornerSquareType === "square" && cornerDotType === "square" ? "crispEdges" : undefined}
          className={cn("block rounded-md", status !== "active" && "opacity-10")}
        >
          {colorEnd && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={colorEnd} />
              </linearGradient>
            </defs>
          )}
          {bgColor !== "transparent" && <rect width={model.size} height={model.size} fill={bgColor} />}
          <path d={model.dataPath} fill={fill} />
          {model.corners.map((c, i) => (
            // Üç konum işareti sabit sırada.
            <g key={i} fill={cornerFill}>
              <path fillRule="evenodd" d={c.ring} />
              <path d={c.dot} />
            </g>
          ))}
          {icon && (
            <>
              <rect
                x={iconPos - iconPad}
                y={iconPos - iconPad}
                width={iconEdge + iconPad * 2}
                height={iconEdge + iconPad * 2}
                rx={iconPad * 2}
                fill={bgColor === "transparent" ? "#ffffff" : bgColor}
              />
              <image href={icon} x={iconPos} y={iconPos} width={iconEdge} height={iconEdge} preserveAspectRatio="xMidYMid meet" />
            </>
          )}
        </svg>
      )}
      {!skeleton && status !== "active" && (
        <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-lg p-2 text-center">
          {statusRender ? statusRender(status) : <StatusLayer status={status} onRefresh={onRefresh} />}
        </div>
      )}
    </div>
  );
}
