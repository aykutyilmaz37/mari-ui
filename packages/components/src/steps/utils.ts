import { cn, type ColorRole } from "@mari-ui/core";
import {
  bgSolidClass,
  bgSubtleClass,
  borderStrongColorClass,
  textClass,
  textSolidContrastClass,
} from "../lib/colorClasses";
import type { StepItem, StepStatus, StepsLabels, StepsVariant } from "./types";

export function getStepNumber(item: StepItem, index: number): number {
  return item.step ?? index + 1;
}

/**
 * Adımın durumu: elle verilen `item.status` her zaman kazanır; yoksa
 * `currentStep`'e göre türetilir. Geçerli adımın durumu Steps'in `status`
 * prop'undan gelir (ör. `"error"`).
 */
export function resolveStepStatus(
  item: StepItem,
  index: number,
  currentStep: number,
  currentStatus: Exclude<StepStatus, "wait">
): StepStatus {
  if (item.status) return item.status;
  const step = getStepNumber(item, index);
  if (step < currentStep) return "finish";
  if (step === currentStep) return currentStatus;
  return "wait";
}

/*
 * Gösterge dairesinin renkleri. Yapı ant.design v6'dan (filled: tamamlanan
 * = tonlu, geçerli = dolu, bekleyen = nötr tonlu; outlined: hepsi çerçeveli),
 * renkler kendi token'larımızdan. Hata her zaman `error` rolüyle çizilir.
 */
export function getIndicatorClass(status: StepStatus, color: ColorRole, variant: StepsVariant): string {
  const role: ColorRole = status === "error" ? "error" : color;
  if (variant === "outlined") {
    switch (status) {
      case "process":
        return cn(bgSubtleClass[role], borderStrongColorClass[role], textClass[role]);
      case "finish":
      case "error":
        return cn("bg-mari-surface", borderStrongColorClass[role], textClass[role]);
      default:
        return "bg-mari-surface border-mari-border text-mari-muted";
    }
  }
  switch (status) {
    case "process":
    case "error":
      return cn("border-transparent", bgSolidClass[role], textSolidContrastClass[role]);
    case "finish":
      return cn("border-transparent", bgSubtleClass[role], textClass[role]);
    default:
      return "border-transparent bg-mari-neutral-subtle text-mari-muted";
  }
}

export function getDotClass(status: StepStatus, color: ColorRole): string {
  if (status === "wait") return "bg-mari-border";
  return bgSolidClass[status === "error" ? "error" : color];
}

export function getTitleClass(status: StepStatus): string {
  switch (status) {
    case "process":
      return "text-mari-foreground font-semibold";
    case "finish":
      return "text-mari-foreground";
    case "error":
      return "text-mari-error font-medium";
    default:
      return "text-mari-muted";
  }
}

/*
 * Bir adımdan sonrakine uzanan çizgi, SONRAKİ adıma varılmışsa renklidir
 * (yani bu adım tamamlanmışsa) — ant.design ile aynı.
 */
export function getRailClass(status: StepStatus, color: ColorRole): string {
  return status === "finish" ? bgSolidClass[color] : "bg-mari-border";
}

/** Ekran okuyucu için durum eki — renk/ikon tek başına anlam taşımasın. */
export const defaultStatusLabels: Record<StepStatus, string> = {
  wait: "bekliyor",
  process: "devam ediyor",
  finish: "tamamlandı",
  error: "hata",
};

export const defaultStepsLabels: StepsLabels = {
  status: defaultStatusLabels,
  percent: (p) => `%${p}`,
  stepOf: (current, total) => `Adım ${current}/${total}`,
  back: "Geri",
  next: "İleri",
  complete: "Tamamla",
};
