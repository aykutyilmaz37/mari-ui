import type React from "react";
import type { ColorRole, Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

/** `line`: alt çizgili (varsayılan). `card`: kart sekmeler. `pills`: kayan zeminli segmented kontrol. */
export type TabsVariant = "line" | "card" | "pills";
export type TabsOrientation = "horizontal" | "vertical";

export interface TabsContextType {
  activeTab: string;
  setActiveTab: (val: string) => void;
  isControlled: boolean;
  /** `useId` tabanlı önek — aynı sayfada iki Tabs'ın id'leri çakışmasın. */
  baseId: string;
  color: ColorRole;
  variant: TabsVariant;
  size: Size;
  orientation: TabsOrientation;
  fill: boolean;
  align: "start" | "center";
  keepMounted: boolean;
  activationMode: "automatic" | "manual";
  skeleton: boolean;
  /** DOM'da olan panellerin `value`'ları — sekme yalnız bunlara `aria-controls` verir. */
  mountedPanels: ReadonlySet<string>;
  /** Panel mount olunca kaydolur; dönen fonksiyon kaydı siler. */
  registerPanel: (value: string) => () => void;
}

/**
 * `skeleton`: sekme etiketleri kendi metin kutularında, aktif panelin içeriği
 * satır çubuklarıyla yer tutucu; gösterge gizli, sekmeler etkileşimsiz.
 */
export interface TabsProps extends SkeletonableProps {
  defaultActiveTab?: string;
  activeTab?: string;
  onChange?: (value: string) => void;
  /** Aktif sekme göstergesinin rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  /** Varsayılan: `"line"`. */
  variant?: TabsVariant;
  /** Varsayılan: `"md"`. */
  size?: Size;
  /** `vertical`: sekmeler solda, içerik sağda. Varsayılan: `"horizontal"`. */
  orientation?: TabsOrientation;
  /**
   * Dikey Tabs, kapsayıcısı bu genişliğin (px) altına inince yataya döner —
   * dar ekranda sol sütun içeriği ezmesin. `false` kapatır. Varsayılan: `640`.
   */
  responsive?: number | false;
  /** Sekmeler tüm genişliğe eşit dağılır (mobil segmented kontrol gibi). */
  fill?: boolean;
  /** Sekmelerin hizası. Varsayılan: `"start"`. */
  align?: "start" | "center";
  /**
   * Pasif paneller DOM'da kalır (gizli) — içlerindeki form state'i
   * sekme değişince kaybolmaz. Varsayılan: `false` (pasif panel kaldırılır).
   */
  keepMounted?: boolean;
  /**
   * `automatic` (varsayılan): ok tuşuyla odaklanan sekme hemen etkinleşir.
   * `manual`: ok tuşu sadece odağı taşır, Enter/Space etkinleştirir — panel
   * içeriği pahalıysa (veri çekme) tercih edin.
   */
  activationMode?: "automatic" | "manual";
  className?: string;
  children: React.ReactNode;
}

export interface TabsListProps {
  children: React.ReactNode;
  /** Sekme çubuğunun sonunda (sağda) gösterilecek içerik — ör. bir düğme. */
  extra?: React.ReactNode;
  /** Ekran okuyucu için sekme grubunun adı. */
  "aria-label"?: string;
  className?: string;
}

export interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  /** Etiketin önündeki ikon. */
  icon?: React.ReactNode;
  /** Etiketin yanında sayı rozeti (ör. yorum sayısı). */
  count?: number;
  disabled?: boolean;
  className?: string;
}

export interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  /** Bu panel pasifken de DOM'da kalsın (`Tabs.keepMounted`'ı panel bazında açar). */
  forceMount?: boolean;
  className?: string;
}
