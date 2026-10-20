---
"@mari-ui/components": minor
---

**Kırıcı (0.x minor):** `Select` artık yalnız tekli seçim yapıyor; çoklu seçim (etiketler) yeni subpath'teki ayrı bileşende:

- `@mari-ui/components/multi-select` → `MultiSelect` (`MultiSelectProps`: `value`/`defaultValue` dizi, `onChange(values, options)`, `maxTagCount`)

Geçiş: `<Select mode="multiple" … />` → `<MultiSelect … />` (`mode` prop'u kaldırıldı; diğer prop'lar, görünüm, klavye ve erişilebilirlik aynı). `SelectSingleProps` → `SelectProps`, `SelectMultipleProps` → `MultiSelectProps`. Eski kullanım derleme hatası verir.

Neden: `Select` (ve onu ay/yıl seçicisi olarak kullanan `Calendar`) çoklu modu hiç kullanmasa da `Tag` kodunu taşıyordu. `@mari-ui/components/select` 15.10 → 14.02 KB, `calendar` 20.64 → 20.21 KB min+gz. `TreeSelect` ve native `Select` `mode="multiple"` API'sini koruyor.
