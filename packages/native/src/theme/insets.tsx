import { createContext, useContext, type ReactNode } from "react";

/** Güvenli alan payları (çentik / durum çubuğu / ev çubuğu), pt. */
export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Kütüphane güvenli alanı kendisi ölçmez (native bağımlılık yok). Tüketici
 * uygulama kökünde bir kez verir — `<ThemeProvider insets={useSafeAreaInsets()}>`
 * (react-native-safe-area-context, Expo'da hazır). Ekran kenarına değen
 * bileşenler (AppBar, BottomNavigation, Sidebar, BottomSheet, Toast,
 * ImageViewer) kendi `topInset` / `bottomInset` prop'u verilmezse bunu kullanır.
 * `null` = sağlayıcı yok → bileşen kendi platform varsayılanına düşer.
 */
export const InsetsContext = createContext<Partial<SafeAreaInsets> | null>(null);

export function useSafeInsets(): Partial<SafeAreaInsets> | null {
  return useContext(InsetsContext);
}

/**
 * Ağacın bir bölümü için güvenli alanı değiştirir — ör. ekran kenarına
 * DEĞMEYEN bir yerde çizilen AppBar / BottomNavigation için `insets={{}}`
 * (pay sıfır). Uygulama kökünde `ThemeProvider insets` yeterlidir.
 */
export function SafeAreaInsetsProvider({ insets, children }: Readonly<{ insets: Partial<SafeAreaInsets>; children: ReactNode }>) {
  return <InsetsContext.Provider value={insets}>{children}</InsetsContext.Provider>;
}
