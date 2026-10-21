---
"@mari-ui/cli": minor
---

`sync` artık React Native projelerine native'e özgü AI kuralları yazıyor (`@mari-ui/native` manifest'inden): `StyleSheet` + token objesi, `onPress`, `accessibilityRole`/`accessibilityLabel`, metin `Text` içinde, router ile gezinme, web paketinden import yok. `both` platformunda iki gövde birden: Claude'da `mari-ui-web` ve `mari-ui-native` skill'leri, Cursor `.mdc` ve Copilot `applyTo` dosyaları glob'la ayrılır, AGENTS.md ve GEMINI.md'de iki bölüm alt alta. `both` için yeni `--native-manifest` bayrağı. Web projelerinin çıktısı değişmedi.
