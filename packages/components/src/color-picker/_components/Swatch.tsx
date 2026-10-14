import { cn } from "@mari-ui/core";
import type { Hsba } from "../types";
import { colorInfo } from "../utils";

/**
 * Saydamlığı gösteren dama deseni — tema token'larından (açık/koyu temada
 * zeminle uyumlu), boyutu rem.
 */
export const CHECKER_CLASS =
  "bg-[conic-gradient(var(--mari-color-border)_25%,var(--mari-color-surface)_0_50%,var(--mari-color-border)_0_75%,var(--mari-color-surface)_0)] bg-[length:0.5rem_0.5rem]";

/** Renk yok: zemin + köşeden köşeye kırmızı çizgi (ant.design'ın "temizlendi" işareti). */
const EMPTY_CLASS = "bg-mari-surface bg-[linear-gradient(to_top_right,transparent_calc(50%-1px),var(--mari-color-error)_calc(50%-1px)_calc(50%+1px),transparent_calc(50%+1px))]";

interface SwatchProps {
  color: Hsba | null;
  className?: string;
}

/** Rengi dama deseni üstünde gösteren kutu; içi dolu, kenarında ince çizgi (beyaz rengi zeminden ayırır). */
export function Swatch({ color, className }: Readonly<SwatchProps>) {
  if (!color) return <span aria-hidden className={cn("block shrink-0 border border-mari-border", EMPTY_CLASS, className)} />;
  return (
    <span aria-hidden className={cn("relative block shrink-0 overflow-hidden border border-mari-border", CHECKER_CLASS, className)}>
      <span className="absolute inset-0" style={{ backgroundColor: colorInfo(color).rgb }} />
    </span>
  );
}
