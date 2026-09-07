import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Bugün bu yardımcı yoktu — 30'dan fazla dosya `twMerge(clsx(...))`'i elle
 * yazıyordu. Tek bir `cn()` fonksiyonu hem tekrarı ortadan kaldırır hem de
 * gelecekte `twMerge` yapılandırmasını (örn. mari-ui'a özel utility
 * grupları) tek yerden değiştirmeyi mümkün kılar.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
