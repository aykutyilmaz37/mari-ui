import { cn, type ColorRole } from "@mari-ui/core";
import { bgSolidClass } from "../lib/colorClasses";

// Not: eskiden burada `getDotWrapperClass`/`getArrowClass` diye iki
// fonksiyon vardı ama HİÇBİR YERDE import edilmiyorlardı — Carousel.tsx
// kendi (neredeyse birebir aynı) mantığını inline tutuyordu. Ölü kod
// silindi; buraya bunun yerine gerçekten kullanılan, token'a bağlı renk
// yardımcıları eklendi.

/*
 * ant.design'ın gerçek Carousel'i noktaları hiçbir zaman YUVARLAK göstermez — ikisi de (aktif/pasif)
 * ince bir çubuk (ant'ta tam olarak 3px yükseklik); sadece genişlik farklı
 * (pasif 16px, aktif 24px). Eskiden pasif nokta yuvarlak (8x8), aktif nokta
 * kalın bir hap (24x8) oluyordu — ant'ın "hep aynı ince çubuk, sadece uzayan"
 * hissi yerine iki farklı geometri karışıyordu. Yükseklik burada paylaşılan
 * Tailwind ölçeğinden `h-1` (4px) — `h-[0.1875rem]` gibi keyfi bir değer bu
 * projede (Storybook'ta canlı doğrulanan) beklenmedik şekilde `height: 0`
 * üretti, standart ölçek adımı güvenilir.
 */
export function getDotClass(active: boolean, color: ColorRole): string {
  return cn(
    "pointer-events-auto h-1 rounded-full transition-all",
    active ? cn(bgSolidClass[color], "w-6") : "w-4 bg-mari-border hover:bg-mari-muted"
  );
}
