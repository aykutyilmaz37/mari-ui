import type React from "react";
import type { ColorRole, Placement as CorePlacement, Variant } from "@mari-ui/core";

/** Sadece 4 ana yön render edilir — bkz. tooltip/utils.ts'teki aynı not. */
export type Placement = CorePlacement;

export interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  /** Verilmezse trigger düz (renksiz) render edilir — eski `variant="none"` varsayılanına karşılık gelir. */
  color?: ColorRole;
  variant?: Variant;
  /** Dropdown'ın açılıp/kapanmasına EK OLARAK çağrılır (örn. bir menü öğesine navigasyon). */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** İkon-only tetikleyiciler (örn. kebab menü) için ZORUNLU — trigger'ın erişilebilir ismi olur. */
  "aria-label"?: string;
}

export interface DropdownContentProps {
  /** Varsayılan `bottom-end`: panel tetikleyicinin altında, sağ kenarları hizalı açılır. */
  placement?: Placement;
  className?: string;
  children: React.ReactNode;
  customVisible?: boolean;
  /**
   * Panelin tetikleyiciyi gösteren küçük bir ok (üçgen) taşımasını sağlar. Ok, panelin hizalandığı
   * kenardan sabit 12px içeridedir (ant.design gibi); `{ pointAtCenter: true }` verilirse panel,
   * ok tetikleyicinin ORTASINI gösterecek şekilde kayar — kebab gibi küçük tetikleyiciler için.
   */
  arrow?: boolean | { pointAtCenter?: boolean };
  /**
   * Tetikleyiciyle panel arasındaki boşluğa eklenen px. Tetikleyici çizgili bir kapsayıcının (satır, kart)
   * içindeyse, okun ucu kapsayıcının çizgisine değmesin diye kullanılır.
   */
  offset?: number;
}

export interface DropdownProps {
  children:
    | [React.ReactElement<DropdownTriggerProps>, React.ReactElement<DropdownContentProps>]
    | React.ReactElement<DropdownContentProps>;
  hover?: boolean;
  /**
   * Veri gelene kadar tetikleyici kendi kutusunda iskelet çizer (içeriği
   * görünmez olarak yerinde kalır → yüklenince zıplamaz); panel açılmaz.
   */
  skeleton?: boolean;
  /**
   * Sarmalayıcı kutunun sınıfı. Varsayılan `inline-block self-start`: kutu
   * tetikleyicinin boyutuna sarılır, panel de TETİKLEYİCİYE hizalanır. Tetikleyici
   * kapsayıcının tam genişliğini kaplayacaksa (`w-full` menü satırı) `"block self-auto"` verin.
   */
  className?: string;
}

export interface DropdownItemProps {
  children: React.ReactNode;
  /** Metnin solunda gösterilen ikon (14px'e ölçeklenir). */
  icon?: React.ReactNode;
  /** Yıkıcı işlem (Sil, Çıkış…): kırmızı metin, hover'da dolu kırmızı zemin. */
  danger?: boolean;
  disabled?: boolean;
  /** Sağa yaslı ikincil bilgi — klavye kısayolu ("⌘C"), sayı rozeti vb. */
  extra?: React.ReactNode;
  /** Verilirse öğe gerçek bir `<a>` olarak render edilir (orta tık, yeni sekme, adres önizlemesi). */
  href?: string;
  /** Öğeye tıklanınca çağrılır; ardından dropdown kapanır. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
}
