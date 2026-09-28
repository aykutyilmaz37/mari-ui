"use client";

import { useCallback, useRef, useState } from "react";

export interface UseControllableStateOptions<T> {
  /** Tüketici tarafından kontrol ediliyorsa (`value` verilmişse) bu değer kullanılır. */
  value?: T;
  /** Kontrolsüz modda ilk değer. */
  defaultValue?: T;
  onChange?: (value: T) => void;
}

/**
 * Controlled/uncontrolled ayrımını tek yerde çözer. Bu mantık öncesinde
 * `Input`, `Textarea`, `OtpInput`, `Checkbox`, `Radio`, `Slider` içinde 5+
 * kez neredeyse birebir aynı şekilde (`value ?? internalValue` + kendi
 * `useState`'i) tekrarlanıyordu. Artık her component bu hook'u çağırır.
 *
 * Not: `"use client"` bu dosyanın kendisinde — bir kütüphane hook'unun
 * client-only olup olmadığı tüketicinin root layout'una değil, dosyanın
 * kendisine bağlı olmalı (Faz 3'ün ana düzeltmelerinden biri buydu).
 */
export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (next: T) => void] {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultValue);

  // Bir component'in render sırasında controlled ↔ uncontrolled arası geçiş
  // yapması React'te bir uyarı sınıfıdır; ilk render'daki modu sabitleyip
  // geliştirme ortamında tespit ediyoruz.
  const wasControlled = useRef(isControlled);
  if (process.env.NODE_ENV !== "production" && wasControlled.current !== isControlled) {
    console.warn(
      "[@mari-ui/core] useControllableState: bir bileşen controlled ile uncontrolled arasında geçiş yaptı. " +
        "`value` prop'unu ya hep verin ya da hiç vermeyin."
    );
  }

  const value = (isControlled ? controlledValue : uncontrolledValue) as T;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}
