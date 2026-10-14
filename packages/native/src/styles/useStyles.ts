import { useTheme } from "../theme/useTheme";
import { useNativeConfig } from "../nativeConfig";
import { buttonRecipe, type ButtonRecipeOptions, type ButtonRecipeResult } from "./recipes/buttonRecipe";
import { inputRecipe, type InputRecipeOptions, type InputRecipeResult } from "./recipes/inputRecipe";
import { cardRecipe, type CardRecipeOptions, type CardRecipeResult } from "./recipes/cardRecipe";

interface RecipeMap {
  button: { options: ButtonRecipeOptions; result: ButtonRecipeResult };
  input: { options: InputRecipeOptions; result: InputRecipeResult };
  card: { options: CardRecipeOptions; result: CardRecipeResult };
}

const recipeFns = {
  button: buttonRecipe,
  input: inputRecipe,
  card: cardRecipe,
} as const;

/*
 * Bildirimsel stil API'si (plan Faz 5): component yazarken elle bir
 * `StyleSheet.create` objesi kurulmaz, `useStyles("button", { color,
 * variant, size, ... })` çağrılır — recipe (bkz. `recipes/*.ts`) güncel
 * temaya (`useTheme()`) göre çözülmüş somut RN stilini döner.
 */
/**
 * Kasıtlı olarak `useMemo` YOK: bu stiller zaten prop'lara göre DEĞİŞKEN —
 * klasik "component başına bir kere, modül seviyesinde `StyleSheet.create`"
 * paterni burada geçerli değil. Memoization burada gerçek bir performans
 * kazancı değil, sadece bağımlılık dizisini elle bakımlı tutma yükü demek
 * olurdu. İleride profiling gerçekten gerektirdiğini gösterirse eklenir.
 */
export function useStyles<K extends keyof RecipeMap>(name: K, options: RecipeMap[K]["options"]): RecipeMap[K]["result"] {
  const theme = useTheme();
  const config = useNativeConfig();
  // `recipeFns[name]`in dönüş tipi TS'in generic `K` ile statik olarak
  // ilişkilendiremeyeceği bir union'dır (record-dispatch + generic'in bilinen
  // bir sınırı) — çağıranın imzası (`RecipeMap[K]`) zaten doğru eşleşmeyi
  // garanti ettiği için tek satırlık bir cast yeterli.
  const recipe = recipeFns[name] as (theme: ReturnType<typeof useTheme>, options: RecipeMap[K]["options"], config: ReturnType<typeof useNativeConfig>) => RecipeMap[K]["result"];
  // `StyleSheet.create` YOK: stiller prop'a göre her render'da yeniden çözülüyor
  // (önbellek kazancı yok) ve recipe artık stil olmayan değerler de döndürüyor
  // (`iconSize`, `hitSlop`) — create bunları stil sanıp işlemeye çalışırdı.
  return recipe(theme, options, config);
}
