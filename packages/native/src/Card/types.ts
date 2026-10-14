import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import type { Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/Skeleton";

export type CardSlot = "header" | "body" | "footer" | "cover" | "actions";
export type CardSlotStyles = Partial<Record<CardSlot, StyleProp<ViewStyle>>>;

export interface CardProps extends SkeletonableProps {
  children?: ReactNode;
  /** Uzun metin tek satırda kesilir. */
  title?: ReactNode;
  /** Başlığın sağındaki ek bilgi veya düğme. */
  extra?: ReactNode;
  /** Kenardan kenara kapak; görselin yüksekliğini veya aspectRatio'sunu verin. */
  cover?: ReactNode;
  footer?: ReactNode;
  /** Eşit bölünmüş alt çubuk; her öğe kendi onPress'ini taşıyan bir düğme olmalı. */
  actions?: ReactNode[];
  /** Varsayılan: true. */
  bordered?: boolean;
  /** Basılma geri bildirimi. onPress/onLongPress varsa varsayılan açık; etkileşimi kapatmaz. */
  hoverable?: boolean;
  /** Native yazı ölçeği; dolgu sm: 12, md: 16, lg: 20. Varsayılan: md. */
  size?: Size;
  /** Tonlu zemin ve kenarlık. */
  inset?: boolean;
  /** Kartın tamamını devre dışı bırakır (içindeki eylemler dahil). */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Web classNames karşılığı: header/body/footer/cover/actions bölümlerinin stilleri. */
  slotStyles?: CardSlotStyles;
  /** Tüm kart dokunulabilir olur. İçinde başka düğmeler varsa bu prop'u kullanmayın. */
  onPress?: Exclude<PressableProps["onPress"], undefined>;
  onLongPress?: Exclude<PressableProps["onLongPress"], undefined>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export interface CardMetaProps {
  /** Solda avatar veya ikon. */
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  style?: StyleProp<ViewStyle>;
}
