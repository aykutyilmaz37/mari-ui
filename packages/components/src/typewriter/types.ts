import type React from "react";
import type { SkeletonableProps } from "../lib/skeleton";

export interface TypewriterProps extends SkeletonableProps {
  /**
   * Yazılacak metin. Dizi verilirse sırayla yazılır: her metin yazılır,
   * beklenir, silinir, sıradaki gelir (ör. "Hızlı" → "Erişilebilir").
   */
  text: string | string[];
  /** Dizideki metinler bitince baştan başlasın. `false`: son metin yazılı kalır. Varsayılan: `false`. */
  loop?: boolean;
  /** Harf başına yazma süresi (ms). Varsayılan: `50`. */
  typeSpeed?: number;
  /** Harf başına silme süresi (ms). Varsayılan: `30`. */
  deleteSpeed?: number;
  /** Metin tamamlanınca silmeden önce bekleme (ms). Varsayılan: `1500`. */
  pauseMs?: number;
  /** Başlamadan önce bekleme (ms). Varsayılan: `0`. */
  startDelay?: number;
  /**
   * Ne zaman başlasın: `"visible"` öğe ekrana girince (sayfanın aşağısındaki
   * başlık kaydırılınca yazılır), `"mount"` hemen. Varsayılan: `"visible"`.
   */
  trigger?: "visible" | "mount";
  /** Yanıp sönen imleç. Varsayılan: `true`. */
  cursor?: boolean;
  /** Kök öğe (başlıkta `h1`/`h2`, paragrafta `p`). Varsayılan: `"span"`. */
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** Son metin yazılınca (döngüde hiç çağrılmaz). */
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
