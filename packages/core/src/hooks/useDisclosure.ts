"use client";

import { useCallback, useState } from "react";

export interface UseDisclosureOptions {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface UseDisclosureResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Açık/kapalı durumunu yöneten ortak mantık. Modal, Drawer ve Dropdown'ın
 * her biri bunu kendi içinde (farklı isimlerle: `isOpen`/`visible`/`open`)
 * ayrı ayrı yeniden yazıyordu. Artık üçü de bu hook'u çağırır.
 */
export function useDisclosure({ defaultOpen = false, onOpenChange }: UseDisclosureOptions = {}): UseDisclosureResult {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  }, [onOpenChange]);

  return { isOpen, open, close, toggle };
}
