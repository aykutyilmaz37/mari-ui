import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/Skeleton";

/** Web `TimelineItem` ile aynı şekil. */
export interface TimelineItem {
  /** Satır anahtarı. Verilmezse sıra numarası. */
  key?: React.Key;
  /** Kısa etiket — çoğunlukla zaman ("14:32", "24 Eyl"). `titlePlacement="opposite"` ile noktanın karşı tarafında. */
  title?: React.ReactNode;
  /** Olayın kendisi. */
  content: React.ReactNode;
  /** Nokta rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  /** Nokta yerine ikon (en fazla 20pt). Fonksiyon verilirse nokta rengini alır. */
  icon?: React.ReactNode | ((color: string) => React.ReactNode);
  /** Süren adım: nokta yerine dönen gösterge, öncesindeki ray kesikli. */
  loading?: boolean;
  /** `mode="alternate"`de bu öğenin tarafını zorlar. */
  placement?: "start" | "end";
}

export interface TimelineProps extends SkeletonableProps {
  items: TimelineItem[];
  /** `start` (varsayılan): nokta solda. `end`: sağda. `alternate`: sırayla iki tarafa — dar ekranda (`responsive`) `start`a düşer. */
  mode?: "start" | "end" | "alternate";
  /** `horizontal`: olaylar yan yana, sığmazsa yatay kayar. */
  orientation?: "vertical" | "horizontal";
  /** `outlined` (varsayılan): içi boş halka. `filled`: dolu nokta. */
  variant?: "outlined" | "filled";
  /** `inline` (varsayılan): başlık içeriğin üstünde. `opposite`: başlık noktanın karşı tarafında (solda zaman, sağda olay). */
  titlePlacement?: "inline" | "opposite";
  /** En yeni olay üstte. */
  reverse?: boolean;
  /** Sona (ters sırada başa) "sürüyor" öğesi ekler. `true` → "Devam ediyor…". */
  pending?: React.ReactNode;
  /** `alternate` bu genişliğin (pt) altında `start`a döner. `false` kapatır. Varsayılan: 480. */
  responsive?: number | false;
  /** Listenin erişilebilir adı. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}
