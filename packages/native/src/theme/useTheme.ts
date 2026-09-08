import { useContext } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, type Theme } from "@mari-ui/tokens";
import { ThemeContext } from "./ThemeContext";

/**
 * `<ThemeProvider>` varsa onu kullanır; yoksa `react-native`'in
 * `useColorScheme()`iyle işletim sistemi tercihine göre `lightTheme`/
 * `darkTheme` arasında otomatik seçer. Bu dosya (ve sadece bu dosya, `theme/`
 * altında) gerçek `react-native` çalışma zamanını import eder — dolayısıyla
 * vitest'in Flow sözdizimini ayrıştıramaması nedeniyle otomatik testlerin
 * DIŞINDA tutulur (bkz. `packages/native/README.md` — "Test kapsamı" notu);
 * yalnızca `tsc`/`eslint` ile ve tüketici uygulamalarda doğrulanır.
 */
export function useTheme(): Theme {
  const provided = useContext(ThemeContext);
  const systemScheme = useColorScheme();
  if (provided) return provided;
  return systemScheme === "dark" ? darkTheme : lightTheme;
}
