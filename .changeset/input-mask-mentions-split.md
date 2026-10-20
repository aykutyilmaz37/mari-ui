---
"@mari-ui/components": minor
---

**Kırıcı (0.x minor):** `Input`, `Textarea` ve `SearchInput` artık `mask`/`replacement` ve `mentions` prop'larını almıyor. Bu özellikler iki yeni subpath'e taşındı:

- `@mari-ui/components/masked-input` → `MaskedInput` (`mask` zorunlu, `replacement` isteğe bağlı)
- `@mari-ui/components/mentions` → `MentionInput`, `MentionTextarea` (`mentions` zorunlu); `MentionsConfig`/`MentionOption` tipleri de buradan

Geçiş: `<Input mask="…" />` → `<MaskedInput mask="…" />`, `<Input mentions={…} />` → `<MentionInput mentions={…} />`, `<Textarea mentions={…} />` → `<MentionTextarea mentions={…} />`. Geri kalan prop'lar, görünüm ve davranış aynı. Eski kullanım derleme hatası verir (sessizce yok sayılmaz).

Neden: maske kütüphanesi (@react-input/mask) ve öneri paneli her `Input` kullanıcısına geliyordu; aynı entry'de kalsalar tree-shaking de onları atamıyordu. `import { Input }` 20.4 → 11.5 KB, `import { Textarea }` 20.4 → 12.3 KB min+gz; `@mari-ui/components/input` entry'sinin tamamı 22.2 → 14.1 KB.
