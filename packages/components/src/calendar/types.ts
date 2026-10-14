import type React from "react";
import type { WeekStart } from "../lib/date";
import type { SkeletonableProps } from "../lib/skeleton";

export type CalendarMode = "month" | "year";

export interface CalendarCellInfo {
  /** `date`: gün hücresi (ay görünümü), `month`: ay hücresi (yıl görünümü). */
  type: "date" | "month";
  selected: boolean;
  today: boolean;
  disabled: boolean;
  /** Gün hücresinde: gösterilen aya ait değil. */
  outside: boolean;
}

export interface CalendarProps extends SkeletonableProps {
  value?: Date | null;
  defaultValue?: Date | null;
  /** Seçili gün değişince. */
  onChange?: (date: Date) => void;
  /** Kullanıcı bir gün/ay seçince; `source` neyle seçildiğini söyler. */
  onSelect?: (date: Date, info: { source: "date" | "month" | "year" | "today" }) => void;
  /** Görünen dönem ya da mod değişince. */
  onPanelChange?: (date: Date, mode: CalendarMode) => void;
  /** `month`: günler; `year`: aylar. */
  mode?: CalendarMode;
  defaultMode?: CalendarMode;
  /** Varsayılan: `true` — büyük hücreler, `cellRender` içeriğiyle. `false`: kompakt kart. */
  fullscreen?: boolean;
  disabledDate?: (date: Date) => boolean;
  /** Seçilebilir aralık; dışındaki günler devre dışı, yıl listesi bununla sınırlı. */
  validRange?: [Date, Date];
  /**
   * Hücreye içerik (yalnız `fullscreen`): etkinlikler, notlar. İçerik yoksa
   * `null` döndürün — dar ekranda içerikli günler nokta ile işaretlenir, boş
   * bir kapsayıcı (`<ul />`) da "içerik var" sayılır.
   */
  cellRender?: (date: Date, info: CalendarCellInfo) => React.ReactNode;
  /** Varsayılan: `1` (Pazartesi). */
  weekStart?: WeekStart;
  /** ISO hafta numarası sütunu. */
  showWeek?: boolean;
  /** Varsayılan: `"tr-TR"`. */
  locale?: string;
  /** Takvimin erişilebilir adı (başlık bölgesi). */
  "aria-label"?: string;
  className?: string;
}
