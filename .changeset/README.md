# Changesets

Yayınlanan paketlerde (`@mari-ui/tokens`, `core`, `components`, `native`, `cli`) kullanıcıyı etkileyen her değişiklik bir changeset ile gelir:

```bash
pnpm changeset
```

Sorulan paketleri ve sürüm türünü seçin (`0.x` döneminde kırıcı değişiklik `minor`, geri kalan `patch`), kısa bir Türkçe açıklama yazın; oluşan `.changeset/*.md` dosyasını PR'a ekleyin.

Beş paket **birlikte** sürümlenir (`fixed`): biri değişince hepsi aynı sürüme çıkar — tasarım sisteminde sürüm uyumsuzluğu olmasın.

main'e birleşen changeset'leri "Version Packages" PR'ı toplar (`.github/workflows/release.yml`); o PR merge edilince paketler npm'e yayınlanır. Ayrıntı: [CONTRIBUTING.md](../CONTRIBUTING.md#sürüm-ve-yayın).
