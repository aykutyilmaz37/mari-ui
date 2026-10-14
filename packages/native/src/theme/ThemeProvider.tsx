import type { ReactNode } from "react";
import type { Theme } from "@mari-ui/tokens";
import { ThemeContext } from "./ThemeContext";
import { withFonts, type NativeFonts } from "./fonts";
import { InsetsContext, type SafeAreaInsets } from "./insets";

export interface ThemeProviderProps {
  /**
   * `@mari-ui/tokens`'ın `lightTheme`/`darkTheme`'i ya da tüketicinin kendi
   * ürettiği 3. bir tema.
   */
  theme: Theme;
  /**
   * `"system"` (varsayılan): platform fontu, kurulum gerekmez. `"brand"`:
   * Geist / Manrope / Geist Mono — önce `expo-font` ile yükleyin (kayıt adları
   * `BRAND_FONT_FAMILIES`).
   */
  fonts?: NativeFonts;
  /**
   * Güvenli alan payları — kökte bir kez `useSafeAreaInsets()` verin. Ekran
   * kenarına değen bileşenler (AppBar, BottomNavigation, Sidebar, BottomSheet,
   * Toast, ImageViewer) kendi prop'u verilmezse bunu kullanır. Verilmezse üst
   * sağlayıcınınki geçerli kalır.
   */
  insets?: Partial<SafeAreaInsets>;
  children: ReactNode;
}

/**
 * OPSİYONELDİR. Sarmalanmazsa `useTheme()` sistemin `useColorScheme()`ine
 * göre otomatik light/dark seçer — bkz. `ThemeContext.ts`. `react-native`
 * import ETMEZ (sadece `react`) — bu yüzden bu dosya, tersine, vitest altında
 * da (herhangi bir RN mock'una gerek kalmadan) test edilebilir durumda.
 */
export function ThemeProvider({ theme, fonts = "system", insets, children }: ThemeProviderProps) {
  const themed = <ThemeContext.Provider value={withFonts(theme, fonts)}>{children}</ThemeContext.Provider>;
  return insets ? <InsetsContext.Provider value={insets}>{themed}</InsetsContext.Provider> : themed;
}
