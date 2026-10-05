"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import { skeletonFill } from "../../lib/skeleton";

/**
 * Grafik iskeletleri — tek düz kutu yerine grafiğin KENDİ şekli (çubuklar,
 * çizgi, dilim halkası, gösterge yayı) ve yüklü haldeki yerleşim (eksen
 * etiketleri, lejant). Yüklenince hiçbir şey kaymaz; okuyucu ne geleceğini
 * şekilden anlar. Parıltı ortak `skeletonFill` — SVG şekiller için dolgu bir
 * `<div>`e verilip şekil CSS maskesiyle kesilir (SVG'de gradyan kaydırmak
 * yerine aynı parıltı).
 */

/** SVG işaretlemesini maske görseline çevirir (kutuya gerilir). */
export function svgMask(svg: string): React.CSSProperties {
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  return { maskImage: url, WebkitMaskImage: url, maskSize: "100% 100%", WebkitMaskSize: "100% 100%", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" };
}

/** Kutuya gerilen dalga; çizgi kalınlığı gerilmez (`non-scaling-stroke`). */
export function waveMask(strokeWidth: number): React.CSSProperties {
  return svgMask(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M1 72 C 12 70, 16 48, 27 52 S 42 74, 53 58 S 68 22, 80 30 S 94 40, 99 18" fill="none" stroke="black" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`
  );
}

/** Metin satırı yer tutucusu: kutu bir satır yüksekliğinde, çubuk yazı gövdesi kadar. */
function TextStub({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block h-2 rounded-sm", skeletonFill(true), className)} />;
}

/** Ad yer tutucuları dönüşümlü iki uzunlukta — tek tip çubuk dizisi gibi görünmesin. */
const categoryStubWidth = (i: number) => (i % 2 ? "w-10" : "w-14");

export function LegendSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="flex h-4 items-center gap-1.5">
          <span className={cn("size-2.5 rounded-sm", skeletonFill(true))} />
          <TextStub className={categoryStubWidth(i)} />
        </span>
      ))}
    </div>
  );
}

/** Çubuk boyları — sabit, rastgele değil (her render aynı; SSR ile uyumlu). */
const BAR_HEIGHTS = [0.55, 0.8, 0.4, 0.95, 0.65, 0.75, 0.5, 0.85, 0.6, 0.7, 0.45, 0.9];

export type CartesianSkeletonShape = "bar" | "barHorizontal" | "line";

/**
 * Kartezyen iskelet: `plotBox` ile aynı boşluklar (sol değer etiketleri,
 * alt kategori etiketleri; üst 0.5rem, sağ 0.75rem, alt 1.75rem).
 */
export function CartesianSkeleton({ shape, count }: { shape: CartesianSkeletonShape; count: number }) {
  const n = Math.max(3, Math.min(12, count));
  const horizontal = shape === "barHorizontal";
  return (
    <div className="absolute inset-0">
      {/* Sol etiketler: dikeyde değerler (kısa), yatayda kategori adları (uzun). */}
      <div className={cn("absolute top-2 bottom-7 left-0 flex flex-col items-end", horizontal ? "w-16 justify-around" : "w-8 justify-between")}>
        {Array.from({ length: horizontal ? n : 4 }, (_, i) => (
          <TextStub key={i} className={horizontal ? categoryStubWidth(i) : "w-6"} />
        ))}
      </div>
      <div className={cn("absolute top-2 right-3 bottom-7", horizontal ? "left-18" : "left-10")}>
        {!horizontal && (
          <div className="absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className="h-px bg-mari-border/70" />
            ))}
          </div>
        )}
        {shape === "line" && <div className={cn("absolute inset-0", skeletonFill(true))} style={waveMask(2)} />}
        {shape === "bar" && (
          <div className="absolute inset-0 flex items-end justify-around">
            {Array.from({ length: n }, (_, i) => (
              <span key={i} className={cn("w-[min(1.5rem,6%)] rounded-t-sm", skeletonFill(true))} style={{ height: `${BAR_HEIGHTS[i % BAR_HEIGHTS.length]! * 100}%` }} />
            ))}
          </div>
        )}
        {horizontal && (
          <div className="absolute inset-0 flex flex-col justify-around border-l border-mari-border/70">
            {Array.from({ length: n }, (_, i) => (
              <span key={i} className={cn("rounded-r-sm", skeletonFill(true))} style={{ width: `${BAR_HEIGHTS[i % BAR_HEIGHTS.length]! * 100}%`, height: `min(1.5rem, ${60 / n}%)` }} />
            ))}
          </div>
        )}
      </div>
      {/* Alt etiketler: dikeyde kategoriler, yatayda değerler. */}
      <div className={cn("absolute right-3 bottom-0 flex h-5 items-center justify-around", horizontal ? "left-18" : "left-10")}>
        {Array.from({ length: horizontal ? 4 : Math.min(n, 6) }, (_, i) => (
          <TextStub key={i} className="w-8" />
        ))}
      </div>
    </div>
  );
}

/**
 * Boş durum — tüm grafiklerde aynı: arkada grafiğin iskelet şekli (aynı
 * eksenler/işaretler) bulanık ve SABİT (parıltı yok: yüklenmiyor, veri yok),
 * önde uyarı. Okuyucu burada ne tür bir grafik olacağını görür; düz bir
 * "Veri yok" kutusu gibi alan boş kalmaz.
 */
export function ChartEmpty({ plot, children, compact = false }: { plot: React.ReactNode; children: React.ReactNode; compact?: boolean }) {
  return (
    <div className="absolute inset-0">
      {/* Küçük (Sparkline) şekilde ince çizgi fazla bulanıklıkta kaybolur. */}
      <div aria-hidden className={cn("absolute inset-0 [&_*]:animate-none", compact ? "blur-[1px]" : "blur-[2px]")}>
        {plot}
      </div>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/** Pasta / halka: çizim alanına sığan en büyük daire (grafikteki `outer` gibi 6px pay). */
export function PieSkeleton({ donut }: { donut: boolean }) {
  return (
    <div className="absolute inset-1.5 grid place-items-center">
      <div
        className={cn("aspect-square h-full max-w-full rounded-full", skeletonFill(true))}
        // Halka: iç yarıçap dış yarıçapın %62'si (PieChart ile aynı).
        style={donut ? { maskImage: "radial-gradient(circle closest-side, transparent 61.5%, black 62%)", WebkitMaskImage: "radial-gradient(circle closest-side, transparent 61.5%, black 62%)" } : undefined}
      />
    </div>
  );
}
