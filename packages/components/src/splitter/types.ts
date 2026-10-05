import type React from "react";

/** Boyut: piksel (`280`) ya da yüzde (`"30%"`). */
export type SplitterSize = number | `${number}%`;

export interface SplitterProps {
  /** `"horizontal"`: paneller yan yana (sürükleme sola/sağa). `"vertical"`: üst üste. Varsayılan: `"horizontal"`. */
  orientation?: "horizontal" | "vertical";
  /**
   * Bu genişliğin altında yatay paneller alt alta dizilir, tutamaçlar gizlenir
   * (mobilde sürükleyerek bölmenin anlamı yok). `"none"`: hep yan yana.
   * Dikey splitter'da etkisiz. Varsayılan: `"md"` (768px).
   */
  stackBelow?: "sm" | "md" | "lg" | "none";
  /**
   * Verilirse panel boyutları tarayıcıda saklanır (`localStorage`); kullanıcı
   * sayfaya döndüğünde ayarladığı düzeni bulur. Uygulamada benzersiz olmalı.
   */
  storageKey?: string;
  /** Sürüklerken: panel oranları (toplam 1). */
  onResize?: (sizes: number[]) => void;
  /** Sürükleme / klavye / daraltma bitince: panel oranları (toplam 1). */
  onResizeEnd?: (sizes: number[]) => void;
  /** `SplitterPanel`ler. */
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface SplitterPanelProps {
  /** İlk boyut. Verilmeyen paneller kalan alanı eşit paylaşır. */
  defaultSize?: SplitterSize;
  /** En küçük boyut. Varsayılan: `0`. */
  min?: SplitterSize;
  /** En büyük boyut. */
  max?: SplitterSize;
  /** `false`: bu panelin kenarındaki tutamaç sürüklenemez. Varsayılan: `true`. */
  resizable?: boolean;
  /**
   * Tutamaçtaki düğmeyle (ya da tutamaç odaktayken Enter ile) tamamen
   * kapatılabilir; tekrar açınca önceki boyutuna döner.
   */
  collapsible?: boolean;
  /**
   * Tutamacın ekran okuyucu adı bu panelin adından kurulur ("Liste
   * panelini yeniden boyutlandır"). Verilmezse "Panel 1" gibi sıra adı.
   */
  label?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
