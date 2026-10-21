---
"@mari-ui/cli": patch
---

`sync` kural dosyalarını Prettier'ın varsayılan biçiminde yazar (işaretlerin ve frontmatter'ın çevresinde boş satır, hizalı tablolar, 80 sütuna sığan kod örnekleri); Prettier kullanan projelerde `prettier --check` artık kırılmıyor. `sync --check` biçim farkını (boş satır, tablo hizası) bayatlık saymaz; eski biçimde yazılmış dosyalar CI'ı kırmaz.
