import type { ColorRole } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";

/** Steps'in saf mantığı (testli) — web `Steps/utils.ts` ile aynı kurallar, sınıf yerine renk. */

export type StepStatus = "wait" | "process" | "finish" | "error";
export type StepsVariant = "filled" | "outlined";

export function getStepNumber(item: { step?: number }, index: number): number {
  return item.step ?? index + 1;
}

/** Elle verilen `item.status` kazanır; yoksa `currentStep`e göre türetilir. */
export function resolveStepStatus(item: { step?: number; status?: StepStatus }, index: number, currentStep: number, currentStatus: Exclude<StepStatus, "wait">): StepStatus {
  if (item.status) return item.status;
  const step = getStepNumber(item, index);
  if (step < currentStep) return "finish";
  if (step === currentStep) return currentStatus;
  return "wait";
}

export type StepsLayout = "inline" | "stacked" | "vertical" | "compact";

/** inline: başlık yanında · stacked: altında ortalı · vertical: dikey liste · compact: dar ekranda göstergeler + "Adım 2/4 · Başlık". */
export function resolveLayout(vertical: boolean, isNarrow: boolean, responsiveLayout: "vertical" | "compact", dot: boolean, labelPlacement: "horizontal" | "vertical"): StepsLayout {
  if (vertical) return "vertical";
  if (isNarrow) return responsiveLayout === "compact" ? "compact" : "vertical";
  if (dot || labelPlacement === "vertical") return "stacked";
  return "inline";
}

export interface IndicatorColors {
  background: string;
  border: string;
  foreground: string;
}

/**
 * Gösterge dairesi (ant.design v6 yapısı, kendi token'larımız): filled —
 * tamamlanan tonlu, geçerli dolu, bekleyen nötr tonlu; outlined — hepsi
 * çerçeveli. Hata her zaman `error` rolüyle.
 */
export function indicatorColors(theme: Theme, status: StepStatus, color: ColorRole, variant: StepsVariant): IndicatorColors {
  const role = theme.color[status === "error" ? "error" : color];
  const c = theme.color.canvas;
  if (variant === "outlined") {
    if (status === "process") return { background: role.subtle, border: role.solid, foreground: role.text };
    if (status === "wait") return { background: c.surface, border: c.border, foreground: c.muted };
    return { background: c.surface, border: role.solid, foreground: role.text };
  }
  if (status === "process" || status === "error") return { background: role.solid, border: "transparent", foreground: role.solidContrast };
  if (status === "finish") return { background: role.subtle, border: "transparent", foreground: role.text };
  return { background: theme.color.neutral.subtle, border: "transparent", foreground: c.muted };
}

export function dotColor(theme: Theme, status: StepStatus, color: ColorRole): string {
  if (status === "wait") return theme.color.canvas.border;
  return theme.color[status === "error" ? "error" : color].solid;
}

export function titleStyle(theme: Theme, status: StepStatus): { color: string; fontWeight: "400" | "500" | "600" } {
  if (status === "process") return { color: theme.color.canvas.foreground, fontWeight: "600" };
  if (status === "finish") return { color: theme.color.canvas.foreground, fontWeight: "400" };
  if (status === "error") return { color: theme.color.error.text, fontWeight: "500" };
  return { color: theme.color.canvas.muted, fontWeight: "400" };
}

/** Bir adımdan sonrakine uzanan çizgi, bu adım tamamlandıysa renkli (ant.design ile aynı). */
export function railColor(theme: Theme, status: StepStatus, color: ColorRole): string {
  return status === "finish" ? theme.color[color].solid : theme.color.canvas.border;
}

/** Ekran okuyucu durum eki — renk/ikon tek başına anlam taşımasın. */
export const statusLabel: Record<StepStatus, string> = {
  wait: "bekliyor",
  process: "devam ediyor",
  finish: "tamamlandı",
  error: "hata",
};
