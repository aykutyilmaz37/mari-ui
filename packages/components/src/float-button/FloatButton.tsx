"use client";

import React, { createContext, useContext } from "react";
import { cn } from "@mari-ui/core";
import { Badge } from "../badge";
import { bgSolidClass, bgSolidHoverClass, textSolidContrastClass } from "../lib/colorClasses";
import { elevationClass } from "../lib/elevationClass";
import { skeletonBoxProps } from "../lib/skeleton";
import { Tooltip } from "../tooltip";
import type { FloatButtonPlacement, FloatButtonProps, FloatButtonShape } from "./types";
import { PLACEMENT_CLASS } from "./utils";

export type { FloatButtonProps };

/** Grup içindeki düğmeler sabit konumlanmaz; şekil gruptan gelir. */
export const FloatGroupContext = createContext<{ shape: FloatButtonShape; joined: boolean; skeleton?: boolean } | null>(null);

const SHAPE_CLASS: Record<FloatButtonShape, string> = { circle: "rounded-full", square: "rounded-lg" };

/** Birleşik (kare) grupta düğmeler grubun genişliğine yayılır — açıklamasız olan da diğerleriyle hizalı. */
function boxClass(hasDescription: boolean, joined: boolean) {
  if (hasDescription) return joined ? "min-h-14 w-full min-w-14 px-1 py-2" : "min-h-14 w-14 px-1 py-2";
  return joined ? "h-10 w-full min-w-10" : "size-10";
}

export function floatButtonClass({ color, shape, joined, hasDescription }: { color?: FloatButtonProps["color"]; shape: FloatButtonShape; joined: boolean; hasDescription: boolean }) {
  return cn(
    "relative inline-flex shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 outline-none transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
    // Dokunmatikte 44px (görsel 40px; görünmez katman — Faz 15 kuralı).
    "pointer-coarse:before:absolute pointer-coarse:before:-inset-0.5",
    boxClass(hasDescription, joined),
    joined ? "rounded-none" : SHAPE_CLASS[shape],
    color
      ? cn(bgSolidClass[color], bgSolidHoverClass[color], textSolidContrastClass[color])
      : cn("bg-mari-surface text-mari-foreground hover:bg-mari-surface-alt", !joined && "border border-mari-border")
  );
}

/**
 * Faz 16.6 — yapı ant.design FloatButton'dan: sayfanın köşesinde sabit,
 * içerikten bağımsız eylem düğmesi (yardım, sohbet, yeni oluştur). İkon +
 * (kare şekilde) kısa açıklama, ipucu, rozet, bağlantı. Grup içinde konumu
 * grup belirler.
 *
 * Erişilebilirlik: gerçek `<button>`/`<a>`; ikon-yalnız düğmede ad
 * `aria-label` ya da `tooltip` (düz metinse) — ipucu tek başına ad değildir,
 * metni ada da yazılır. Dokunmatikte 44px hedef. Sayfanın içeriğini örtmemesi
 * tüketicinin işi: alttaki son öğeye yeterli boşluk bırakın.
 */
function resolveLabel(ariaLabel: string | undefined, hasDescription: boolean, tooltip: React.ReactNode): string | undefined {
  if (ariaLabel) return ariaLabel;
  if (hasDescription) return undefined;
  return typeof tooltip === "string" ? tooltip : undefined;
}

/** İpucu ekranın içine doğru: grupta yana, tek başına dikeyde. */
function tooltipPlacement(placement: FloatButtonPlacement, inGroup: boolean) {
  if (inGroup) return placement.endsWith("right") ? "left" : "right";
  return placement.startsWith("bottom") ? "top" : "bottom";
}

function FloatControl({ href, target, label, onClick, className, children }: Readonly<{ href?: string; target?: React.HTMLAttributeAnchorTarget; label?: string; onClick?: FloatButtonProps["onClick"]; className: string; children: React.ReactNode }>) {
  if (href) {
    return (
      <a href={href} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined} aria-label={label} onClick={onClick} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

/**
 * Faz 16.6 — yapı ant.design FloatButton'dan: sayfanın köşesinde sabit,
 * içerikten bağımsız eylem düğmesi (yardım, sohbet, yeni oluştur). İkon +
 * (kare şekilde) kısa açıklama, ipucu, rozet, bağlantı. Grup içinde konumu
 * grup belirler.
 *
 * Erişilebilirlik: gerçek `<button>`/`<a>`; ikon-yalnız düğmede ad
 * `aria-label` ya da `tooltip` (düz metinse) — ipucu tek başına ad değildir,
 * metni ada da yazılır. Dokunmatikte 44px hedef. Sayfanın içeriğini örtmemesi
 * tüketicinin işi: alttaki son öğeye yeterli boşluk bırakın.
 */
export function FloatButton({
  icon,
  description,
  tooltip,
  color,
  shape: ownShape = "circle",
  badge,
  href,
  target,
  onClick,
  placement = "bottom-right",
  "aria-label": ariaLabel,
  className,
  skeleton = false,
}: Readonly<FloatButtonProps>) {
  const group = useContext(FloatGroupContext);
  const shape = group?.shape ?? ownShape;
  const joined = !!group?.joined;
  const hasDescription = shape === "square" && description !== undefined && description !== null;
  const label = resolveLabel(ariaLabel, hasDescription, tooltip);
  if (process.env.NODE_ENV !== "production" && !label && !hasDescription) {
    console.warn("[@mari-ui/components] FloatButton: ikon-yalnız düğmeye `aria-label` (ya da düz metin `tooltip`) verin.");
  }
  const positioned = group ? undefined : cn("fixed z-mari-sticky", PLACEMENT_CLASS[placement]);
  const shapeClass = joined ? "rounded-none" : SHAPE_CLASS[shape];

  // Grubun iskeleti içindeki düğmelere de geçer (tek prop).
  if (skeleton || group?.skeleton) {
    return <span {...skeletonBoxProps(cn("block", hasDescription ? "min-h-14 w-14" : "size-10", shapeClass, positioned, className))} />;
  }

  let control: React.ReactElement = (
    <FloatControl href={href} target={target} label={label} onClick={onClick} className={floatButtonClass({ color, shape, joined, hasDescription })}>
      {icon && (
        <span aria-hidden className="flex items-center justify-center [&_svg]:size-5">
          {icon}
        </span>
      )}
      {hasDescription && <span className="max-w-full truncate text-xs leading-tight">{description}</span>}
    </FloatControl>
  );
  if (badge) {
    control = (
      <Badge count={badge.count} dot={badge.dot} color={badge.color ?? "error"}>
        {control}
      </Badge>
    );
  }
  if (tooltip) control = <Tooltip content={tooltip} placement={tooltipPlacement(placement, !!group)} trigger={control} />;
  if (!positioned) return control;
  return <div className={cn(positioned, elevationClass.lg, shapeClass, className)}>{control}</div>;
}
