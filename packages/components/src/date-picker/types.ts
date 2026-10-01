import type React from "react";
import type { ColorRole, Placement, Size } from "@mari-ui/core";
import type { WeekStart } from "../lib/date";
import type { SkeletonableProps } from "../lib/skeleton";
import type { InputShape, InputVariant } from "../input/types";

export type DatePickerMode = "date" | "time" | "datetime";
/** `mode="date"`da seçim düzeyi: gün, ay ya da yıl. */
export type DatePickerPicker = "date" | "month" | "year";

export interface DatePickerPreset<V> {
  label: React.ReactNode;
  value: V | (() => V);
}

interface DatePickerBaseProps extends SkeletonableProps {
  /** Varsayılan: `"date"`. */
  mode?: DatePickerMode;
  /** Varsayılan: `"date"`. Yalnız `mode="date"`. */
  picker?: DatePickerPicker;
  /**
   * Görünen ve yazılan biçim. Varsayılan: gün `dd.MM.yyyy`, saat `HH:mm`,
   * tarih-saat `dd.MM.yyyy HH:mm`, ay `MM.yyyy`, yıl `yyyy`. Yazarak girişte
   * yalnız sayısal belirteçler çözülür (`.`, `/`, `-` ayraçları eşdeğer).
   */
  format?: string;
  /** Seçilemez günler. */
  disabledDate?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
  /** Dakika/saat/saniye sütunlarının adımı. Varsayılan: 1. */
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  /** Panel altında "Bugün"/"Şimdi". Varsayılan: `true` (aralıkta `false`). */
  showNow?: boolean;
  /** Varsayılan: `true`. */
  allowClear?: boolean;
  /** Varsayılan: `"Temizle"`. */
  clearLabel?: string;
  /** Varsayılan: `1` (Pazartesi). */
  weekStart?: WeekStart;
  showWeek?: boolean;
  /** Varsayılan: `"tr-TR"`. */
  locale?: string;
  size?: Size;
  variant?: InputVariant;
  shape?: InputShape;
  /** Doğrulama durumu (`error`/`warning`) — Input'la aynı kural. */
  color?: ColorRole;
  disabled?: boolean;
  /** Varsayılan: `"bottom-start"`. */
  placement?: Extract<Placement, "bottom-start" | "bottom-end" | "top-start" | "top-end">;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  /** Native form için gizli alan(lar): ISO biçimi (`yyyy-MM-dd`, `HH:mm`, `yyyy-MM-ddTHH:mm`). */
  name?: string;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
  range?: false;
  value?: Date | null;
  defaultValue?: Date | null;
  /** Değer kesinleşince (gün seçimi, "Tamam", yazılıp Enter/alan dışı). İkinci argüman görünen metin. */
  onChange?: (value: Date | null, text: string) => void;
  /** Varsayılan: biçime göre ("gg.aa.yyyy" gibi). */
  placeholder?: string;
  /** Hazır seçimler (panelin solunda): "Bugün", "Ay sonu"… */
  presets?: DatePickerPreset<Date>[];
}

export type DateRangeValue = [Date | null, Date | null];

export interface DatePickerRangeProps extends DatePickerBaseProps {
  /** Aralık: başlangıç ve bitiş için iki alan; gün modunda iki aylık panel. */
  range: true;
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  onChange?: (value: DateRangeValue | null, text: [string, string]) => void;
  placeholder?: [string, string];
  /** Hazır aralıklar: "Son 7 gün", "Bu ay"… */
  presets?: DatePickerPreset<[Date, Date]>[];
  /** Erişilebilir adlar. Varsayılan: "Başlangıç" / "Bitiş". */
  rangeLabels?: [string, string];
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

export type TimePickerProps =
  | (Omit<DatePickerSingleProps, "mode" | "picker" | "disabledDate" | "minDate" | "maxDate" | "weekStart" | "showWeek">)
  | (Omit<DatePickerRangeProps, "mode" | "picker" | "disabledDate" | "minDate" | "maxDate" | "weekStart" | "showWeek">);
