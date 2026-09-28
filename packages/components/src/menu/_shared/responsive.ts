/**
 * Navbar'ların (BasicMenu/MegaMenu) masaüstü ↔ mobil geçiş noktası. Bu
 * genişliğin ALTINDA yatay öğeler gizlenir, yerine hamburger + çekmece
 * (`MobileNav`) gelir. Değerler `@mari-ui/tokens`un `breakpoint` skalasıyla
 * (ve Tailwind'in varsayılanlarıyla) aynı.
 */
export type MenuMobileBreakpoint = "md" | "lg" | "xl";

export const MOBILE_BREAKPOINT_PX: Record<MenuMobileBreakpoint, number> = {
  md: 768,
  lg: 1024,
  xl: 1280,
};

/** Literal tablolar — Tailwind birleştirilmiş/dinamik sınıf adlarını taramaz. */
export const DESKTOP_ONLY_CLASS: Record<MenuMobileBreakpoint, string> = {
  md: "hidden md:flex",
  lg: "hidden lg:flex",
  xl: "hidden xl:flex",
};

export const MOBILE_ONLY_CLASS: Record<MenuMobileBreakpoint, string> = {
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
};
