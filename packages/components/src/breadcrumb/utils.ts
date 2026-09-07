import { cn } from "@mari-ui/core";

// Bu dosya eskiden 0 bayttı — clsx/twMerge çağrıları Breadcrumb.tsx'e
// dağılmıştı. Diğer component'lerin Component.tsx + utils.ts konvansiyonuna
// uyması ve token'a bağlanması için buraya taşındı.

export function getNavClass(className?: string): string {
  return cn("flex items-center text-sm text-mari-muted", className);
}

export function getItemClass(itemClassName?: string): string {
  return cn("hover:underline", itemClassName);
}
