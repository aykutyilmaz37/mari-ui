import type React from "react";
import type { HexColor, ThemeSettings } from "@mari-ui/tokens";
import type { SkeletonableProps } from "../lib/skeleton";

export type ThemeCustomizerSection = "mode" | "color" | "spacing";

export interface ThemeAccentOption {
  value: HexColor;
  /** Erişilebilir ad (ör. "Mavi") — renk örneği yalnız renkten ibaret. */
  label: string;
}

export interface ThemeCustomizerProps extends SkeletonableProps {
  /** Kontrollü değer. Kalıcılık (localStorage, API…) tüketicide. */
  value?: ThemeSettings;
  /** Varsayılan: `{ mode: "system", spacing: "normal" }` (vurgu rengi paketin kendi rengi). */
  defaultValue?: Partial<ThemeSettings>;
  onChange?: (value: ThemeSettings) => void;
  /**
   * Seçimi anında `applyTheme` ile uygular. Varsayılan: `true`. Bileşen kapanınca
   * (ör. Drawer) tema GERİ ALINMAZ — uygulama açılışında kayıtlı ayarla
   * `applyTheme(saved)` çağrılmalı. `false`: yalnız `onChange`, uygulamayı siz yaparsınız.
   */
  apply?: boolean;
  /** Uygulanacak eleman. Varsayılan: `<html>`. Önizleme kutusu gibi bölgesel tema için. */
  target?: React.RefObject<HTMLElement | null>;
  /** Hangi bölümler, bu sırayla. Varsayılan: hepsi. */
  sections?: ThemeCustomizerSection[];
  /** "Varsayılan"dan sonra gelen hazır renkler. Varsayılan: 7 renklik palet. */
  colors?: ThemeAccentOption[];
  /** Hazır renklerin yanında serbest renk seçici. Varsayılan: `false`. */
  allowCustom?: boolean;
  disabled?: boolean;
  className?: string;
}
