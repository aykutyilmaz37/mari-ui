---
"@mari-ui/native": minor
---

Bileşen başına subpath export'ları: `@mari-ui/native/button`, `@mari-ui/native/input-number`, `@mari-ui/native/theme`, `@mari-ui/native/config`… Metro tree-shaking yapmadığı için kök barrel tüm paketi (~96 KB min+gz) getiriyordu; subpath yalnız o bileşeni getirir (Button ~9 KB). Kök `@mari-ui/native` geriye uyumlu olarak duruyor; ortak modüller paylaşılan chunk'larda, context'ler tek kopya.
