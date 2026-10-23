---
"@mari-ui/native": patch
"@mari-ui/components": patch
---

native: AppBar başlığı RTL'de yön duyarlı (`textAlign: auto`, `paddingStart`); AppBar (`1.5`) ve BottomNavigation (`1.3`) için `maxFontSizeMultiplier` eklendi.
native + web: Steps'e `labels` prop'u — durum, "Adım 2/4", yüzde ve Geri/İleri/Tamamla metinleri çevrilebilir (varsayılanlar Türkçe). Web Steps'te yön bağımlı `text-left` / `ml-1 mr-3` mantıksal `text-start` / `ms-1 me-3` oldu.
