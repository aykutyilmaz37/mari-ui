import { cn, type ColorRole } from "@mari-ui/core";
import { bgSolidClass } from "../lib/colorClasses";

// Not: eskiden burada `getDotWrapperClass`/`getArrowClass` diye iki
// fonksiyon vardı ama HİÇBİR YERDE import edilmiyorlardı — Carousel.tsx
// kendi (neredeyse birebir aynı) mantığını inline tutuyordu. Ölü kod
// silindi; buraya bunun yerine gerçekten kullanılan, token'a bağlı renk
// yardımcıları eklendi.

export function getDotClass(active: boolean, color: ColorRole): string {
  return cn("pointer-events-auto h-2 w-2 rounded-full transition-all", active ? cn(bgSolidClass[color], "w-6") : "bg-mari-border hover:bg-mari-muted");
}
