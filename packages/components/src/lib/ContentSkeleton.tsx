"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@mari-ui/core";
import { skeletonFill } from "./skeleton";

interface Block {
  left: number;
  top: number;
  width: number;
  height: number;
  radius: string;
}

/** Tek başına tek blok olan öğeler (içine inilmez). */
const CONTROL_SELECTOR =
  'input:not([type="hidden"]), textarea, select, button, img, svg, video, canvas, [role="button"], [role="checkbox"], [role="switch"], [role="radio"], [role="slider"], [role="img"]';

/** Bundan küçük kutular (ör. `sr-only` native input'lar) atlanır. */
const MIN_SIZE = 4;

function isTransparent(color: string): boolean {
  return color === "transparent" || /rgba?\([^)]*,\s*0\)$/.test(color) || color.endsWith(" / 0)");
}

/**
 * Metinsiz ve dört kenarı çerçeveli (ya da dolgulu) kutu: Input'un kenarlıklı
 * sarmalayıcısı, Checkbox'ın kutusu gibi. İçindeki native input yerine bu
 * kutunun kendisi (radius'uyla) tek blok olur.
 */
function isVisualBox(el: Element, style: CSSStyleDeclaration): boolean {
  if (el.textContent?.trim()) return false;
  const framed = ["Top", "Right", "Bottom", "Left"].every((side) => parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0);
  return framed || !isTransparent(style.backgroundColor);
}

function measure(root: HTMLElement): Block[] {
  const origin = root.getBoundingClientRect();
  // `getBoundingClientRect` atalardaki transform'u içerir: Modal açılırken
  // `scale(0.98)`den başlar ve ölçüm o anda yapılır — bloklar %2 dar kalıyordu
  // (transform değişimi ResizeObserver'ı tetiklemez). Ölçek çarpanıyla
  // düzeltilir; bloklar transform'un İÇİNDE çizildiği için yerel px gerekir.
  const scale = root.offsetWidth > 0 && origin.width > 0 ? origin.width / root.offsetWidth : 1;
  const blocks: Block[] = [];
  /** Viewport koordinatlı kutu → bölgeye göreli, ölçeksiz blok. */
  const push = (x: number, y: number, w: number, h: number, radius: string) => {
    const left = Math.max(x - origin.left, 0) / scale;
    // `truncate`lı metnin satır kutusu kırpılan kısmı da kapsar — bölgeye sığdır.
    const width = Math.min(x + w - origin.left, origin.width) / scale - left;
    const height = h / scale;
    if (width < MIN_SIZE || height < MIN_SIZE) return;
    blocks.push({ left, top: (y - origin.top) / scale, width, height, radius });
  };

  /** Satır başına bir çubuk; yüksekliği yazı boyuna göre (satır aralığı değil). */
  const pushTextLines = (text: Node, parent: Element) => {
    if (!text.textContent?.trim()) return;
    const range = document.createRange();
    range.selectNodeContents(text);
    // jsdom'da yok → blok üretilmez, `fallback` devreye girer.
    if (typeof range.getClientRects !== "function") return;
    const fontSize = parseFloat(getComputedStyle(parent).fontSize) || 16;
    for (const line of Array.from(range.getClientRects())) {
      const height = Math.min(line.height, fontSize * 0.8);
      push(line.left, line.top + (line.height - height) / 2, line.width, height, "0.25rem");
    }
  };

  const walk = (el: Element) => {
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) pushTextLines(node, el);
      else if (node instanceof Element) visit(node);
    }
  };

  const visit = (el: Element) => {
    const style = getComputedStyle(el);
    if (style.display === "none") return;
    if (!el.matches(CONTROL_SELECTOR) && !isVisualBox(el, style)) {
      walk(el);
      return;
    }
    const rect = el.getBoundingClientRect();
    push(rect.left, rect.top, rect.width, rect.height, style.borderRadius || "0.375rem");
  };

  walk(root);
  return blocks;
}

export interface ContentSkeletonProps {
  on: boolean;
  /** Ölçülecek içerik yoksa (veri henüz gelmedi) gösterilecek genel iskelet. */
  fallback: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Faz 15.6 — serbest içeriğin (Drawer/Modal gövdesi) KENDİ şeklinde iskeleti.
 * Gerçek içerik görünmez olarak yerinde çizilir (yükseklik korunur, yüklenince
 * zıplama olmaz), sonra her metin satırının ve her kontrolün (input, düğme,
 * checkbox kutusu…) kutusu ölçülüp üstüne bir blok konur. Genel "6 satır
 * paragraf" iskeleti bir formun yanında yarım kalmış görünüyordu.
 *
 * Ölçülecek bir şey yoksa (içerik boş ya da jsdom gibi yerleşimsiz ortam)
 * `fallback` gösterilir. Boyut değişince (pencere, çekmece genişliği)
 * `ResizeObserver` ile yeniden ölçülür.
 */
export function ContentSkeleton({ on, fallback, className, children }: ContentSkeletonProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useState<Block[] | null>(null);

  const remeasure = useCallback(() => {
    if (contentRef.current) setBlocks(measure(contentRef.current));
  }, []);

  useLayoutEffect(() => {
    if (!on) {
      setBlocks(null);
      return;
    }
    remeasure();
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(remeasure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [on, children, remeasure]);

  if (!on) return <>{children}</>;

  const empty = blocks !== null && blocks.length === 0;
  return (
    <div aria-hidden data-skeleton="" className={cn("pointer-events-none relative select-none", className)}>
      <div ref={contentRef} className={cn("invisible", empty && "absolute inset-x-0 top-0")}>
        {children}
      </div>
      {empty
        ? fallback
        : blocks?.map((block, i) => (
            <span
              // Bloklar her ölçümde baştan üretilir; sıra kararlı.
              key={i}
              className={cn("absolute", skeletonFill(true))}
              style={{ left: block.left, top: block.top, width: block.width, height: block.height, borderRadius: block.radius }}
            />
          ))}
    </div>
  );
}
