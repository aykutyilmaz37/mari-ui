import type { Theme } from "@mari-ui/tokens";

/** `#rrggbb` + saydamlık → `rgba(...)` (RN hex'e alfa eklemeyi her platformda desteklemiyor). */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) return hex;
  const n = Number.parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** İskelet dolgusu — web ile aynı ton: `canvas.border` %70 (`bg-mari-border/70`). */
export function skeletonColor(theme: Theme): string {
  return withAlpha(theme.color.canvas.border, 0.7);
}
