/**
 * Renk dışı token skalaları. Mevcut `globals.css`'te bunların hiçbiri yoktu —
 * bu yüzden component'lerde `w-[32rem]`, `h-[1px]`, `ml-[22px]`, `z-[999]`,
 * `z-[9999]` gibi rastgele kaçış değerleri birikmişti. Faz 3'te bu değerlerin
 * tamamı buradaki skalalara taşınacak.
 */

/** 4px taban birim üzerine kurulu spacing skalası (Tailwind'in `space`/`rem` yaklaşımıyla uyumlu). */
export const spacing = {
  0: "0px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
} as const;

export const radius = {
  none: "0px",
  sm: "0.25rem", // 4px
  md: "0.5rem", // 8px — çoğu component'in varsayılanı
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  full: "9999px",
} as const;

export const fontFamily = {
  sans: "var(--mari-font-sans, ui-sans-serif, system-ui, -apple-system, sans-serif)",
  mono: "var(--mari-font-mono, ui-monospace, SFMono-Regular, monospace)",
} as const;

/** Ölçek 1.125 (major second) oranıyla, 14px taban üzerine kurulu. */
export const fontSize = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px — gövde metni varsayılanı
  md: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const lineHeight = {
  tight: "1.25",
  normal: "1.5",
  relaxed: "1.75",
} as const;

export const shadow = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const;

/**
 * Tek katman skalası. Bugün `z-50`, `z-40`, `z-[999]`, `z-[9999]` rastgele
 * dağılmış durumdaydı (Modal, Drawer, Tooltip, Toast, Dropdown ayrı ayrı
 * kendi z-index'ini seçiyordu). Artık her overlay türü bu skaladan okur.
 */
export const zIndex = {
  dropdown: 1000,
  sticky: 1100,
  drawer: 1200,
  modal: 1300,
  toast: 1400,
  tooltip: 1500,
} as const;

export const duration = {
  fast: "150ms",
  normal: "250ms",
  slow: "350ms",
} as const;

export const easing = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",
  accelerate: "cubic-bezier(0.4, 0, 1, 1)",
} as const;

export const breakpoint = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;
