import type React from "react";
import type { ColorRole, Variant } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export interface TagProps extends SkeletonableProps {
  children: React.ReactNode;
  /** Varsayılan: `neutral`. */
  color?: ColorRole;
  /** Varsayılan: `soft`. Sadece `solid`/`soft`/`outline` anlamlı (bir Tag için `ghost`/`link` uygun değil). */
  variant?: Extract<Variant, "solid" | "soft" | "outline">;
  icon?: React.ReactNode;
  closeIcon?: React.ReactNode | boolean;
  bordered?: boolean;
  onClose?: () => void;
  /** Kapatma butonunun erişilebilir adı. Varsayılan: metin etiketse `"<metin> etiketini kaldır"`, değilse `"Kaldır"`. */
  closeLabel?: string;
  className?: string;
}
