---
"@mari-ui/native": minor
"@mari-ui/components": minor
---

`ImageGallery` kendi subpath'inde: `@mari-ui/native/image-gallery` ve `@mari-ui/components/image-gallery`. Native'de `@mari-ui/native/image` artık galeriyi (ve görünüm seçicisi Segmented'ı) taşımıyor: Metro tree-shaking yapmadığı için her Image/Upload kullanıcısı onu da indiriyordu (`image` 17.8 → 12.2 KB min+gz). Kök `@mari-ui/native` barrel'ı `ImageGallery`'yi vermeye devam ediyor. Web'de `@mari-ui/components/image` da `ImageGallery`'yi vermeye devam ediyor (orada tree-shaking zaten ayıklıyordu); yeni subpath iki platformda aynı import yolu için.
