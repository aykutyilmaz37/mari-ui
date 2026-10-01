"use client";

import { DatePicker } from "./DatePicker";
import type { DatePickerProps, TimePickerProps } from "./types";

export type { TimePickerProps };

/**
 * Faz 16.5 — TimePicker, DatePicker'ın saat modudur (16.0 kararı: tek motor,
 * iki isim). `range` ile saat aralığı (ör. çalışma saatleri).
 */
export function TimePicker(props: TimePickerProps) {
  return <DatePicker {...(props as DatePickerProps)} mode="time" />;
}
