import type { ReactNode } from "react";
import type { Theme } from "@mari-ui/tokens";
import { ThemeContext } from "./ThemeContext";

export interface ThemeProviderProps {
  /**
   * `@mari-ui/tokens`'ın `lightTheme`/`darkTheme`'i ya da tüketicinin kendi
   * ürettiği 3. bir tema (aynı `Theme` şekline uyduğu sürece — bkz. plan
   * backlog madde 10, "3. tema" ihtiyacı web'de olduğu gibi native'de de
   * sadece bir `Theme` objesi geçmekten ibaret).
   */
  theme: Theme;
  children: ReactNode;
}

/**
 * OPSİYONELDİR. Sarmalanmazsa `useTheme()` sistemin `useColorScheme()`ine
 * göre otomatik light/dark seçer — bkz. `ThemeContext.ts`. `react-native`
 * import ETMEZ (sadece `react`) — bu yüzden bu dosya, tersine, vitest altında
 * da (herhangi bir RN mock'una gerek kalmadan) test edilebilir durumda.
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
