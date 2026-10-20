---
"@mari-ui/components": patch
---

`styles.css` küçüldü: 138.1 → 121.5 KB (minify), 20.3 → 18.4 KB min+gz. Artık yalnız yayınlanan `dist/*.js`in sınıflarını içeriyor (Tailwind'li host modu `tailwind.css` ile aynı küme); story/test dosyalarının, yorumlardaki örneklerin ve kullanılmayan iç kodun sınıfları çıktı. Bileşenlerin görünümü değişmedi — kalan kurallar eskisiyle aynı sırada. Not: kendi işaretlemenizde `styles.css`ten tesadüfen gelen bir Tailwind sınıfına güveniyorsanız (ör. `w-96`), Tailwind'li host modunu (`@mari-ui/components/tailwind.css`) kullanın.
