---
"@mari-ui/tokens": patch
"@mari-ui/core": patch
---

Her bileşenin ödediği ortak taban küçüldü (Faz 4a). `@mari-ui/tokens` artık tree-shake ediliyor: modül seviyesindeki hesaplamalar `@__PURE__` işaretli, varsayılan `lightTheme`/`darkTheme` düz veri olarak geliyor (yalnız `spacing` import eden ~10 KB yerine ~0.2 KB alır). `cn()`, tailwind-merge'ün varsayılan config'i yerine bileşenlerin kullandığı sınıf gruplarına indirgenmiş bir config ile çalışıyor; bileşen ↔ tüketici className ezme sonucu tam twMerge ile birebir aynı. Tek fark: `cn()`'i kendi kodunda kullanan biri, hiçbir mari-ui bileşeninin kullanmadığı bir gruptaki (ör. `mask-*`, `scrollbar-*`) iki sınıfını verirse ikisi de korunur. Web divider 13.8 → 8.2 KB, button 15.7 → 10.2 KB; native button 9.0 → 6.0 KB (min+gz).
