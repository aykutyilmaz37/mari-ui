---
"@mari-ui/components": minor
"@mari-ui/native": minor
"@mari-ui/cli": patch
---

**Kırıcı (0.x minor):** kullanılmayan özelliklerin kodu artık `Table`/`Empty` kullanan herkese gelmiyor.

- **Table:** `pagination`, `paginationMode` ve `TablePaginationConfig` kaldırıldı; yerine `footer` yuvası (çerçevenin altında, ayırıcıyla) ve `skeletonRows`. Tablo veriyi dilimlemez. Geçiş: `pagination={{ page, pageSize, total, onPageChange }}` → `footer={<Pagination currentPage={page} pageSize={pageSize} totalItems={total} onPageChange={setPage} showTotal />}` (`@mari-ui/components/pagination`); istemci taraflıda `data={rows.slice((page - 1) * pageSize, page * pageSize)}`; iskelet satır sayısı için `skeletonRows={pageSize}`.
- **Table:** `actions.onEditWithDrawer` (ve yalnız ona hizmet eden `actions.refetch`) kaldırıldı; yerine `actions.editRow(row)` — "Düzenle" düğmesi satırla çağrılır, Drawer/Modal'ı tüketici açar (bkz. Table → "Çekmecede Düzenleme" story'si).
- **Empty (web + native):** `buttonText`/`onClick`/`href`/`buttonIcon` (native: `buttonText`/`onPress`/`buttonIcon`) kısayolu kaldırıldı; eylem `actions` yuvasına verilen `Button`. Geçiş: `<Empty buttonText="Tekrar dene" onClick={retry} />` → `<Empty actions={<Button onClick={retry}>Tekrar dene</Button>} />` (`size="sm"` Empty'de `size="sm"` buton; native iskelette `skeleton`'ı butona da verin).

Neden (min+gz): Pagination, Drawer ve Empty → Button zinciri her tabloya/listeye/grafiğe geliyordu. `table` 24.50 → 18.18 KB, `empty` 10.75 → 8.80 KB, `list` 18.35 → 16.90 KB, `chart` 19.60 → 17.75 KB; native `empty` 6.84 → 4.35 KB.
