---
"@mari-ui/components": patch
"@mari-ui/native": patch
---

Entry içi tree-shaking (Faz 4c): çok export'lu bir subpath'ten tek bir bileşen import edildiğinde kardeş export'lar artık bundle'a girmiyor. Modül seviyesindeki `forwardRef`/`createContext`/`cn` çağrıları `/* @__PURE__ */` işaretli, `X.displayName = …` atamaları kalktı (render fonksiyonu adlı: `forwardRef(function Button(…))` — React DevTools adı oradan okur), `Platform.OS`/token özellik erişimleri fonksiyona ya da satır içine alındı. Örnekler (min+gz): `import { Textarea }` 12.30 → 10.69 KB, `import { ImageViewer }` 19.58 → 16.45 KB, `import { MegaMenu }` 20.49 → 16.26 KB, `import { PieChart }` 14.18 → 11.93 KB, `import { CardMeta }` 9.46 → 7.53 KB; native `import { ListItem }` 7.56 → 1.66 KB.

Bileşenlerin `displayName` özelliği artık atanmıyor (DevTools'ta ad aynı görünür). Kural yeni bileşenlerde de geçerli: eslint `pure-module-scope` (`@mari-ui/eslint-config/tree-shaking`) editörde, `pnpm size`daki "artık kod" testi CI'da yakalar.
