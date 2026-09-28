import { createContext } from "react";
import type { Theme } from "@mari-ui/tokens";

/**
 * `null` = tüketici bir `ThemeProvider` koymadı → `useTheme` sistem
 * `useColorScheme()`ine göre `lightTheme`/`darkTheme` arasında otomatik
 * seçer (bkz. `useTheme.ts`). Bu, "tüketiciye sıfır kurulum şartı" kararının
 * (plan Faz 5) somutlaşmış hali: `<ThemeProvider>` sarmalamak OPSİYONELDİR,
 * sadece 3. bir özel tema (bkz. plan madde 10) veya sistemi geçersiz kılmak
 * isteyen tüketiciler için vardır.
 */
export const ThemeContext = createContext<Theme | null>(null);
