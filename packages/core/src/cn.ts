import { type ClassValue, clsx } from "clsx";
import { createTailwindMerge } from "tailwind-merge";
import { mergeConfig } from "./mergeConfig.generated";

/**
 * Bileşen sınıflarına göre indirgenmiş config'le kurulan twMerge (bundle performansı
 * Faz 4a): varsayılan config'in ~6.4 KB min+gz'lik tamamı yerine yalnız bileşenlerin
 * kullandığı / onlarla çakışan sınıf grupları. Bileşen ↔ tüketici ezme sonucu tam
 * twMerge ile birebir aynı (bkz. `scripts/generate-merge-config.mjs`,
 * `__tests__/mergeConfig.test.ts`). `@__PURE__`: `cn` kullanılmayan bundle'dan düşer.
 */
const twMerge = /* @__PURE__ */ createTailwindMerge(mergeConfig);

/**
 * Bugün bu yardımcı yoktu — 30'dan fazla dosya `twMerge(clsx(...))`'i elle
 * yazıyordu. Tek bir `cn()` fonksiyonu hem tekrarı ortadan kaldırır hem de
 * `twMerge` yapılandırmasını (mari-ui'a indirgenmiş config) tek yerden
 * değiştirmeyi mümkün kılar.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
