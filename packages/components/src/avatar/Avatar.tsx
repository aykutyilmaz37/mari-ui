"use client";

import React, { useState } from "react";
import type { AvatarProps } from "./types";
import { getInitial, getShapeClasses, getSizeStyle } from "./utils";

export type { AvatarProps };

/**
 * `useState` (resim yükleme hatası takibi) kullanıyor — bu yüzden gerçekten
 * `"use client"` gerekiyor. `next/image` kaldırıldı: bu paket bir Next.js
 * uygulaması değil, bağımsız bir kütüphane. Eskiden ayrı bir `width`/
 * `height` prop çifti (varsayılan 32/32) vardı ve `size`'dan BAĞIMSIZ
 * olarak `<Image>`'a geçiyordu — `size="large"` iken kutu 40x40 ama görsel
 * 32x32 için optimize ediliyordu. Artık tek kaynak `size`.
 */
export function Avatar({ alt = "", icon, shape = "circle", size = "md", src, onError }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const handleImgError = () => {
    const preventDefault = onError?.() === false;
    if (!preventDefault) setImgError(true);
  };

  const content: React.ReactNode = (() => {
    if (typeof src === "string" && !imgError) {
      return <img src={src} alt={alt} onError={handleImgError} className="w-full h-full object-cover" />;
    }
    if (typeof src === "object" && src !== null) {
      return src;
    }
    return icon ?? <span className="text-sm font-medium">{alt ? getInitial(alt) : null}</span>;
  })();

  return (
    <div className={getShapeClasses(shape)} style={getSizeStyle(size)}>
      {content}
    </div>
  );
}
