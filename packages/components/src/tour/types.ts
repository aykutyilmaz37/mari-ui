import type React from "react";
import type { Placement } from "@mari-ui/core";

export interface TourStep {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Başlığın üstünde görsel/video. */
  cover?: React.ReactNode;
  /** Vurgulanacak öğe. Verilmezse (ya da `null` dönerse) panel ekranın ortasında. */
  target?: () => HTMLElement | null;
  /** Varsayılan: `"bottom"`; sığmazsa karşı yöne döner. */
  placement?: Placement;
  /** Bu adımda karartma. Verilmezse Tour'unki. */
  mask?: boolean;
  /** Bu adımda "Sonraki" düğmesinin metni (ör. "Hadi başlayalım"). */
  nextButtonText?: string;
}

export interface TourProps {
  steps: TourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  /** Kapanınca (×, Escape, son adımda "Bitir"). */
  onOpenChange?: (open: boolean) => void;
  /** × ya da Escape ile yarıda kapatılınca; o anki adım. */
  onClose?: (current: number) => void;
  /** Son adımda "Bitir". */
  onFinish?: () => void;
  current?: number;
  defaultCurrent?: number;
  onChange?: (current: number) => void;
  /**
   * Varsayılan: `true` — sayfa kararır, yalnız hedef açıkta kalır; tur
   * modaldır (odak panelde, sayfa tıklanamaz). `false`: karartma yok, sayfa
   * kullanılabilir.
   */
  mask?: boolean;
  /** Hedefi gösteren ok. Varsayılan: `true`. */
  arrow?: boolean;
  /** Adım değişince hedef görünür alana kaydırılır. Varsayılan: `true`. */
  scrollIntoView?: boolean;
  /** Turun erişilebilir adı (panel başlığı her adımda değişir). Varsayılan: "Tanıtım turu". */
  "aria-label"?: string;
  className?: string;
  /** Adım içeriği (ör. sunucudan gelen açıklama) hazır değilken panelde iskelet; düğmeler de. */
  skeleton?: boolean;
}
