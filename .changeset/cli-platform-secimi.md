---
"@mari-ui/cli": minor
"@mari-ui/tokens": minor
---

CLI artık platform ayırıyor (web / native / ikisi). `init` platformu sorar (`--platform web|native|both`; sorulamıyorsa `package.json`dan tahmin eder) ve seçimi `mari-ui.config.json`a `platform` olarak yazar. Seçilmeyen platformun paketi kurulmaz: native projeye `@mari-ui/components` yerine `@mari-ui/native` eklenir. Native projede `sync` web kurallarını artık yazmaz (React Native kodunu yanıltıyordu), `theme` CSS üretmez ve Tailwind talimatı basılmaz. Native kural içeriği sonraki sürümde.
