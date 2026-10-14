---
"@mari-ui/cli": minor
---

`npx @mari-ui/cli theme` artık temayı sorar: **Varsayılan (Yumuşak iris)**, hazır kişilikler (Kurumsal, Oyunbaz, Minimal, Editoryal, Lüks) ya da **Özel** (birincil/vurgu rengi, köşe yuvarlaklığı, yoğunluk). Config varsa "mevcut ayarı koru" seçeneği çıkar; seçim tema alanlarını baştan yazar, ek temalar ve büyük ekran ayarı korunur. `init` de config yokken aynı soruyu sorar. Sormadan kullanım için `--persona default|<kişilik>`, `--primary #hex`, `--accent #hex`, `--yes`; etkileşimli olmayan terminalde (CI, AI ajanları) soru sorulmaz.

Kırıcı (programatik API): `runInit` seçeneği `persona` → `theme` (`ThemeChoice`).
