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
  /** Başlığı içerikte kendiniz çiziyorsanız (Popconfirm gibi) adın id'si. */
  "aria-labelledby"?: string;
  /** Açıklama metninin id'si — `alertdialog`da zorunlu. */
  "aria-describedby"?: string;
  /**
   * `alertdialog`: kullanıcıdan onay isteyen, dikkat gerektiren panel
   * (Popconfirm). Varsayılan: `dialog`.
   */
  role?: "dialog" | "alertdialog";
  /** Panele ek sınıf (ör. genişlik: `w-80`). */
  className?: string;
}
