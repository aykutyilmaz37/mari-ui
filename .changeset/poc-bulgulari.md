---
"@mari-ui/components": patch
"@mari-ui/cli": patch
---

İlk gerçek kurulum (POC) bulguları: `body` artık temanın yüzey ve metin rengini alır (koyu temada sayfa tarayıcının kendi koyu zeminine düşüyordu). `init` bağımlılıkları `"latest"` yerine CLI'ın sürüm aralığıyla (`^x.y.z`) yazar. CLI'ın önerdiği tema CSS import yolu, dosyanın proje köküne yazıldığını hesaba katar (`../mari-ui-theme.css`).
