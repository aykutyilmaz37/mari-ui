"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Hover-intent için tek bir zamanlayıcı: `schedule` bekleyen işi iptal edip
 * yenisini kurar, `cancel` iptal eder, unmount'ta temizlenir. Menülerde
 * "fare panele geçerken kapanmasın / yanlışlıkla üzerinden geçince
 * açılmasın" gecikmeleri için (bkz. MegaMenu, Sidebar).
 */
export function useHoverIntent() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(
    (action: () => void, delayMs: number) => {
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        action();
      }, delayMs);
    },
    [cancel]
  );

  useEffect(() => cancel, [cancel]);

  return { schedule, cancel };
}
