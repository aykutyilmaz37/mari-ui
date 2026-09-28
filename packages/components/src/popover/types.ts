import type React from "react";
import type { Placement } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export type PopoverTrigger = "click" | "hover" | "focus";

export interface PopoverProps extends SkeletonableProps {
  /** Panelin başlığı — dialog'un erişilebilir adı da budur. */
  title?: React.ReactNode;
  /** Panel içeriği; etkileşimli olabilir (form, düğmeler, bağlantılar). */
  content: React.ReactNode;
  /**
   * Tetikleyici: TEK bir odaklanabilir öğe (genelde Button). `aria-expanded`,
   * `aria-controls` ve `aria-haspopup` ona eklenir.
   */
  children: React.ReactElement;
  /**
   * `click` (varsayılan): tıklayınca açılır, odak panele geçer. `hover`: üzerine
   * gelince (klavyede odaklanınca da) açılır — yalnız bilgi amaçlı içerik için.
   * `focus`: odaklanınca açılır, odak tetikleyicide kalır.
   */
  trigger?: PopoverTrigger;
  /** Varsayılan: `"top"`; sığmazsa karşı yöne döner. */
  placement?: Placement;
  /** Tetikleyiciyi gösteren ok. Varsayılan: `true`. */
  arrow?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Başlık yoksa panelin erişilebilir adı. */
  "aria-label"?: string;
  /** Panele ek sınıf (ör. genişlik: `w-80`). */
  className?: string;
}
