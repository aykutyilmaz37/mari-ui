---
"@mari-ui/components": patch
---

Input'u yalnız iç alan olarak kullanan bileşenler (AutoComplete, Slider, Transfer, Table, ColorPicker; dolayısıyla ThemeCustomizer) artık `mask` (@react-input/mask) ve `mentions` kodunu taşımıyor: her biri ~9 KB min+gz küçüldü (AutoComplete 21.1 → 12.2 KB, Slider 22.9 → 13.7 KB). (Public `Input`'un kendisi de bu özellikleri bıraktı; bkz. `MaskedInput` / `MentionInput` changeset'i.)
