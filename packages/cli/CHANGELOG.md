# @mari-ui/cli

## 0.1.3

### Patch Changes

- e5480a7: Editörde görünen tip açıklamaları (JSDoc) kullanıcıya yönelik hale getirildi: iç geliştirme geçmişi ("Faz …", "eskiden …", "kullanıcı kararı") tip dosyalarından çıkarıldı, kaynakta iç yorum olarak duruyor. Açıklaması kalmayan dışa açık bildirimlere (Calendar, Pagination, Switch, Textarea, `ColumnDef`, `Variant`, `Placement`…) kısa açıklama yazıldı.
- Updated dependencies [e5480a7]
  - @mari-ui/tokens@0.1.3

## 0.1.2

### Patch Changes

- 01c95ef: İlk gerçek kurulum (POC) bulguları: `body` artık temanın yüzey ve metin rengini alır (koyu temada sayfa tarayıcının kendi koyu zeminine düşüyordu). `init` bağımlılıkları `"latest"` yerine CLI'ın sürüm aralığıyla (`^x.y.z`) yazar. CLI'ın önerdiği tema CSS import yolu, dosyanın proje köküne yazıldığını hesaba katar (`../mari-ui-theme.css`).
- @mari-ui/tokens@0.1.2

## 0.1.1

### Patch Changes

- 6003ce1: npm sayfaları için kullanıcıya yönelik README'ler (iç geliştirme notları `DEVELOPMENT.md`'ye taşındı). Dokümanlarda ve CLI çıktılarında komut `npx @mari-ui/cli` oldu: `npx mari-ui`, npm'de başka birine ait `mari-ui` paketini arıyordu. CLI yardımından uygulanmamış `--with-theme` bayrağı kaldırıldı.
- Updated dependencies [6003ce1]
  - @mari-ui/tokens@0.1.1
