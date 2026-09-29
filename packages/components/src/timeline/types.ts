import type React from "react";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export interface TimelineItem {
  /** Satır anahtarı. Verilmezse sıra numarası. */
  key?: React.Key;
  /**
   * Kısa etiket — çoğunlukla zaman ("14:32", "24 Eyl"). `titlePlacement="opposite"`
   * ile noktanın karşı tarafına geçer. Tarih için `<time dateTime>` verin.
   */
  title?: React.ReactNode;
  /** Olayın kendisi. */
  content: React.ReactNode;
  /** Nokta rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  /** Nokta yerine ikon (en fazla 20px). */
  icon?: React.ReactNode;
  /** Süren adım: nokta yerine dönen gösterge, öncesindeki ray kesikli. */
  loading?: boolean;
  /** `mode="alternate"`de bu öğenin tarafını zorlar. */
  placement?: "start" | "end";
}

export interface TimelineProps extends SkeletonableProps {
  items: TimelineItem[];
  /**
   * `start` (varsayılan): nokta solda, içerik sağda. `end`: tersi.
   * `alternate`: içerik sırayla iki tarafa — dar ekranda (<640px) `start`a düşer.
   */
  mode?: "start" | "end" | "alternate";
  /**
   * `horizontal`: olaylar yan yana, ray yatay (kısa süreçler, sürüm geçmişi).
   * Sığmazsa yatay kaydırılır.
   */
  orientation?: "vertical" | "horizontal";
  /** `outlined` (varsayılan): içi boş halka. `filled`: dolu nokta. */
  variant?: "outlined" | "filled";
  /**
   * `inline` (varsayılan): başlık içeriğin üstünde. `opposite`: başlık noktanın
   * karşı tarafında (solda zaman, sağda olay) — dar ekranda üste döner.
   */
  titlePlacement?: "inline" | "opposite";
  /** En yeni olay üstte. */
  reverse?: boolean;
  /**
   * Sona (ters sırada başa) "sürüyor" öğesi ekler. `true` → "Devam ediyor…".
   */
  pending?: React.ReactNode;
  className?: string;
  /** Listenin erişilebilir adı. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
}
