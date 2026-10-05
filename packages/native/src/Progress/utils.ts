import type { ColorRole } from "@mari-ui/core";

export type ProgressStatus = "normal" | "active" | "success" | "exception";

export const clampPercent = (n: number | undefined) => Math.min(100, Math.max(0, n ?? 0));

/** Durum verilmezse %100 → `success`, değilse `normal` (web ile aynı). */
export function resolveProgressStatus(status: ProgressStatus | undefined, percent: number): ProgressStatus {
  if (status) return status;
  return percent >= 100 ? "success" : "normal";
}

export function resolveProgressColor(status: ProgressStatus, color: ColorRole | undefined): ColorRole {
  if (status === "success") return "success";
  if (status === "exception") return "error";
  return color ?? "primary";
}

export const defaultProgressFormat = (p: number) => `%${Math.round(p)}`;

/** Ekran okuyucu metni: "%45", "%100, tamamlandı", "%30, hata". */
export function progressValueText(custom: unknown, percent: number, status: ProgressStatus): string {
  const base = typeof custom === "string" || typeof custom === "number" ? String(custom) : defaultProgressFormat(percent);
  if (status === "exception") return `${base}, hata`;
  if (status === "success") return `${base}, tamamlandı`;
  return base;
}

/** `steps` modunda dolu adım sayısı. */
export const filledSteps = (percent: number, steps: number) => Math.round((percent / 100) * steps);
