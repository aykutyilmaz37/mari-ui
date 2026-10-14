import { cn } from "@mari-ui/core";
import { touchTargetClass } from "../lib/sizeClasses";

/*
 * yapı ant.design Breadcrumb'dan (ölçüldü): 14px / 22px satır,
 * öğeler arası 8px ayırıcı boşluğu, bağlantılar soluk, son öğe (geçerli sayfa)
 * ön plan renginde; bağlantı hover'da 4px yarıçaplı hafif bir zemin alır
 * (`px-1 -mx-1`: zemin metnin iki yanına taşar, hizalama bozulmaz). Uzun
 * yollar alt satıra kırılır (`flex-wrap`), yatay taşma olmaz.
 */
export function getNavClass(className?: string): string {
  return cn("text-sm leading-[1.375rem] text-mari-muted", className);
}

export const listClass = "flex flex-wrap items-center gap-y-1";

export const itemClass = "flex min-w-0 items-center";

export const separatorClass = "mx-2 inline-flex items-center [&_svg]:size-3.5";

/** Metin + ikon kutusu; bağlantı olmayan öğeler (span) de aynı kutuyu kullanır ki hizalar tutsun. */
const contentBaseClass = "inline-flex min-w-0 items-center gap-1 break-words [&_svg]:size-3.5 [&_svg]:shrink-0";

/** Etkileşimli öğeler (link, button, menü tetikleyicisi): hover zemini + odak halkası + dokunma hedefi. */
export function getInteractiveClass(isCurrent: boolean, itemClassName?: string): string {
  return cn(
    contentBaseClass,
    "relative -mx-1 cursor-pointer rounded-sm px-1 transition-colors duration-200",
    "hover:bg-mari-foreground/[0.06] hover:text-mari-foreground",
    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mari-ring",
    touchTargetClass.xs,
    isCurrent && "text-mari-foreground",
    itemClassName
  );
}

/** Etkileşimsiz öğe (href/onClick yok) — genelde geçerli sayfa. */
export function getStaticClass(isCurrent: boolean, itemClassName?: string): string {
  return cn(contentBaseClass, isCurrent && "text-mari-foreground", itemClassName);
}

/**
 * `maxItems` aşılınca görünecek öğelerin indeksleri; `null` katlanmış
 * aralığın yerini ("…" düğmesi) işaretler. İlk öğe + son `maxItems - 1` öğe.
 */
export function getVisibleIndexes(count: number, maxItems: number | undefined, expanded: boolean): (number | null)[] {
  const all = Array.from({ length: count }, (_, i) => i);
  if (expanded || !maxItems || count <= maxItems) return all;
  const tail = Math.max(1, maxItems - 1);
  return [0, null, ...all.slice(count - tail)];
}

/** Her öğe için `itemRender`a verilen birikimli `path` listesi (katlanan öğeler de sayılır). */
export function getPathsByIndex(items: { path?: string }[]): string[][] {
  const acc: string[] = [];
  return items.map((item) => {
    if (item.path) acc.push(item.path);
    return [...acc];
  });
}
