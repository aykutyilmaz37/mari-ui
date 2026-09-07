import { cn, type ColorRole } from "@mari-ui/core";
import { bgSolidClass, textClass } from "../lib/colorClasses";

/**
 * Eskiden `dotColor: string` HAM bir Tailwind class'ıydı (örn. "text-info")
 * ve tüketici tarafından elle geçiriliyordu — tema değişikliğine uyum
 * sağlamazdı. Artık tek bir `ColorRole`'den türetiliyor.
 */
export function getStepIconClass(currentStep: number, itemStep: number, color: ColorRole): string {
  return cn(
    "shrink-0 p-0",
    currentStep === itemStep && textClass[color],
    currentStep < itemStep && "text-mari-muted",
    currentStep > itemStep && textClass[color]
  );
}

export function getLineClass(isActiveOrCompleted: boolean, color: ColorRole): string {
  return cn(isActiveOrCompleted ? bgSolidClass[color] : "bg-mari-border");
}
