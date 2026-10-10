import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/Skeleton";

export interface SidebarIconState {
  active: boolean;
  /** O anki ikon rengi (RN'de `currentColor` yok). */
  color: string;
  size: number;
}

/** Web `MenuItemType` ile aynı şekil (`promoTiles`, `target` yok — native'de anlamsız). */
export interface SidebarItem {
  key: string;
  title: string;
  description?: string;
  icon?: React.ReactNode | ((state: SidebarIconState) => React.ReactNode);
  route?: string;
  children?: SidebarItem[];
  /** Etkileşimsiz bölüm başlığı; gruplama dizide ondan sonra gelen kardeşlerle. */
  heading?: boolean;
  disabled?: boolean;
  /** Sayı rozeti; `true` nokta. */
  badge?: number | boolean;
}

/**
 * `Sidebar` (ekranın üstünde açılan katman) animasyonu. `slide`: yandan kayar
 * (kenara kaydırarak kapatma). `fade`: yerinde solarak belirir. Ekranı da
 * hareket ettiren açılışlar için `SidebarLayout`.
 */
export type SidebarAnimation = "slide" | "fade";

/**
 * `SidebarLayout` (ekranı da hareket ettiren) animasyonu. `push`: çekmece
 * ekranı yanında iter. `reveal`: menü altta sabit, ekran kayarak açığa
 * çıkarır. `scaleDown`: ekran küçülüp yuvarlak köşeli karta dönüşerek çekilir.
 */
export type SidebarLayoutAnimation = "push" | "reveal" | "scaleDown";

export interface SidebarHeaderInk {
  /** Başlık bandındaki metin rengi (`emphasizedHeader`da rol renginin karşıtı). */
  color: string;
  muted: string;
}

/** `Sidebar` ve `SidebarLayout` ortak prop'ları. */
export interface SidebarBaseProps extends SkeletonableProps {
  data: SidebarItem[];
  open: boolean;
  /** Kapatma isteği: karartma, kapatma düğmesi, kenara kaydırma, Android geri, öğe seçimi. */
  onOpenChange: (open: boolean) => void;
  /** Aktif öğeyi bulmak için mevcut yol (React Navigation'da rota adı / yolu). */
  currentPath?: string;
  /** Aktif öğe anahtarı — `currentPath`'i ezer. */
  activeKey?: string;
  /** Yol taşıyan yaprak seçilince (kapanmadan önce). Yönlendiriciye burada gidin. */
  onNavigate?: (route: string, item: SidebarItem) => void;
  /** Herhangi bir yaprak seçilince (yolu olmasa da). */
  onSelect?: (item: SidebarItem) => void;
  /** Panelin üstü (ör. Avatar + "Merhaba, Deniz"). Fonksiyon verilirse bant renklerini alır. */
  header?: React.ReactNode | ((ink: SidebarHeaderInk) => React.ReactNode);
  /** Başlık bandı rol renginde dolgulu (Amazon çekmecesi). */
  emphasizedHeader?: boolean;
  /** Panelin altında sabit bölüm (ör. Çıkış yap). */
  footer?: React.ReactNode;
  /** Varsayılan: `left`. */
  position?: "left" | "right";
  /** Menü satırları açılışta (ve alt seviyeye inince) küçük gecikmelerle sırayla gelir. Varsayılan: `false`. */
  staggerItems?: boolean;
  /** Aktif öğe rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  /** Kök seviyesine dönen satırın etiketi. Varsayılan: "Ana Menü". */
  rootLabel?: string;
  /** Üst seviyenin yolu varsa başlığın yanındaki bağlantı. Varsayılan: "Tümünü gör". */
  seeAllLabel?: string;
  /** Gezinme bölgesinin erişilebilir adı. Varsayılan: "Ana menü". */
  accessibilityLabel?: string;
  /**
   * Üst / alt güvenli alan payı. Varsayılan: `ThemeProvider insets`; o da yoksa
   * platform tahmini (iOS üst 54 / alt 28, Android durum çubuğu). `Sidebar` tam
   * ekran Modal'dır — uygulamanın SafeAreaView'u içine işlemez.
   */
  topInset?: number;
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
}

export interface SidebarProps extends SidebarBaseProps {
  /** Açılış / kapanış animasyonu. Varsayılan: `slide`. */
  animation?: SidebarAnimation;
}

export interface SidebarLayoutProps extends SidebarBaseProps {
  /** Varsayılan: `push`. */
  animation?: SidebarLayoutAnimation;
  /** Ekranın kendisi (AppBar + içerik). */
  children: React.ReactNode;
}

