import type React from "react";
import type { ColorRole, Variant } from "@mari-ui/core";
import type { LegacyTagStatu } from "./utils";

export interface TagProps {
  children: React.ReactNode;
  /** @deprecated `color` kullanın. "processing" -> `info`, "default" -> `neutral`. */
  statu?: LegacyTagStatu;
  /** Varsayılan: `neutral`. */
  color?: ColorRole;
  /** Varsayılan: `soft`. Sadece `solid`/`soft`/`outline` anlamlı (bir Tag için `ghost`/`link` uygun değil). */
  variant?: Extract<Variant, "solid" | "soft" | "outline">;
  icon?: React.ReactNode;
  closeIcon?: React.ReactNode | boolean;
  bordered?: boolean;
  onClose?: () => void;
  className?: string;
}
