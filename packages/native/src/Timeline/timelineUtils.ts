import type React from "react";
import type { TimelineItem, TimelineProps } from "./types";

/** Timeline'ın saf mantığı — web `timeline/utils` ile birebir. */

export const PENDING_KEY = "__mari-timeline-pending__";

/** `pending` öğesini ekler ve `reverse`i uygular (bekleyen öğe hep "en yeni" uçta). */
export function buildItems(items: TimelineItem[], pending: React.ReactNode, reverse: boolean): TimelineItem[] {
  const all = [...items];
  if (pending !== undefined && pending !== null && pending !== false) {
    all.push({ key: PENDING_KEY, content: pending === true ? "Devam ediyor…" : pending, loading: true, color: "neutral" });
  }
  return reverse ? all.reverse() : all;
}

/**
 * İçerik noktanın hangi tarafında: `after` (sağ) ya da `before` (sol).
 * `alternate`de çift sıradakiler sağda başlar; öğenin `placement`ı önceliklidir.
 */
export function resolveSide(mode: NonNullable<TimelineProps["mode"]>, index: number, placement: TimelineItem["placement"]): "after" | "before" {
  if (mode === "start") return "after";
  if (mode === "end") return "before";
  if (placement) return placement === "start" ? "after" : "before";
  return index % 2 === 0 ? "after" : "before";
}

/** Üç sütunlu (başlık/boş | nokta | içerik) yerleşim gerekir mi. */
export function isThreeColumn(mode: NonNullable<TimelineProps["mode"]>, titlePlacement: NonNullable<TimelineProps["titlePlacement"]>): boolean {
  return mode === "alternate" || titlePlacement === "opposite";
}
