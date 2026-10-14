import React from "react";
import { cn } from "@mari-ui/core";

export interface SkeletonSlotProps {
  on: boolean;
  placeholder: React.ReactNode;
  /**
   * Bölgenin YÜKLÜ hâldeki akışı: flex bir ebeveynin (aksiyon hücresi, extra)
   * içeriği flex öğesidir, blok ebeveyninki satır kutusuna girer. Görünmez
   * kopya aynı akışta çizilmezse yükseklik 3-4px kayar (Card'da ölçüldü).
   */
  flow?: "block" | "flex";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Faz 15 — iskelette bir bölgeyi yer tutucuya çevirir: gerçek içerik
 * `invisible` olarak aynı grid hücresinde kalır (yükseklik/genişlik korunur,
 * tab sırasından çıkar), yer tutucu üstüne biner. İçerik yoksa (veri henüz
 * gelmedi) kutuyu yer tutucu belirler — her iki durumda da yüklenince zıplama
 * olmaz. Serbest içerik taşıyan component'lerin (Card, Carousel…) ortak aracı.
 */
export function SkeletonSlot({ on, placeholder, flow = "block", className, children }: Readonly<SkeletonSlotProps>) {
  if (!on) return <>{children}</>;
  return (
    <div aria-hidden className={cn("grid", className)}>
      <div className={cn("invisible min-w-0 [grid-area:1/1]", flow === "flex" && "flex items-center")}>{children}</div>
      <div className="[grid-area:1/1]">{placeholder}</div>
    </div>
  );
}
