"use client";

import React, { useState } from "react";
import { Segmented } from "../segmented";

/**
 * YALNIZ STORY'LER İÇİN — her bileşenin "İskelet" story'si aynı düzende:
 * üstte İskelet / Yüklendi geçişi, altta bileşen. İki hal arasında geçince
 * yerleşimin kaymadığı görülür. Paket girişlerinden
 * import edilmez.
 */
export function SkeletonDemo({ children, className }: Readonly<{ children: (skeleton: boolean) => React.ReactNode; className?: string }>) {
  const [skeleton, setSkeleton] = useState(true);
  return (
    <div className="flex flex-col items-start gap-4">
      <Segmented
        size="sm"
        aria-label="Yükleme durumu"
        options={[
          { value: "skeleton", label: "İskelet" },
          { value: "loaded", label: "Yüklendi" },
        ]}
        value={skeleton ? "skeleton" : "loaded"}
        onChange={(v) => setSkeleton(v === "skeleton")}
      />
      <div className={className ?? "w-full"}>{children(skeleton)}</div>
    </div>
  );
}

/** "İskelet" story'lerinin ortak açıklaması. */
export const SKELETON_STORY_DOC =
  "Veri gelene kadar `skeleton`: bileşen kendi boyutunda yer tutucu çizer, ekran okuyucudan gizlidir. Üstteki geçişle " +
  "yüklü hale geçince yerleşim kaymaz.";
