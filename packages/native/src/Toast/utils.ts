/** Web konumları kabul edilir; telefonda köşe yok — en yakın kenara eşlenir. */
export type ToastPosition = "top" | "bottom" | "topRight" | "topLeft" | "bottomLeft" | "bottomRight";
export type ToastEdge = "top" | "bottom";

export const DEFAULT_DURATION = 5000;
export const ACTION_DURATION = 8000;
/** Telefonda kenar başına en fazla bu kadar Toast; eskisi düşer. */
export const MAX_PER_EDGE = 3;

export function toastEdge(position: ToastPosition | undefined): ToastEdge {
  return position?.startsWith("top") ? "top" : "bottom";
}

/**
 * Otomatik kapanma süresi (ms, 0 = kapanmaz). Eylemli Toast daha uzun kalır;
 * ekran okuyucu açıkken eylemli Toast hiç kendiliğinden kapanmaz ("Geri al"a
 * yetişilebilsin — web'de odaklanınca sayaç durması bunun karşılığı).
 */
export function resolveDuration(duration: number | undefined, hasAction: boolean, screenReader: boolean): number {
  if (hasAction && screenReader) return 0;
  return duration ?? (hasAction ? ACTION_DURATION : DEFAULT_DURATION);
}

/** Yeni Toast'u ekler; aynı kenarda sınır aşılırsa o kenardaki en eskiyi düşürür. */
export function pushToast<T extends { id: string; edge: ToastEdge }>(list: T[], next: T, max = MAX_PER_EDGE): T[] {
  const all = [...list, next];
  const sameEdge = all.filter((t) => t.edge === next.edge);
  if (sameEdge.length <= max) return all;
  const drop = new Set(sameEdge.slice(0, sameEdge.length - max).map((t) => t.id));
  return all.filter((t) => !drop.has(t.id));
}

/** Ekran okuyucu metni: başlık + düz metin açıklama. */
export function announcementText(title: string, description: unknown): string {
  return [title, typeof description === "string" ? description : ""].filter(Boolean).join(". ");
}
