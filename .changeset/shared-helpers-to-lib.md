---
"@mari-ui/components": patch
---

İç bağımlılık zincirleri kesildi: Skeleton artık Avatar bileşenini değil ortak avatar geometrisini (`lib`) kullanıyor, Select/Transfer/Mentions arama katlamasını (`foldForSearch`) AutoComplete'ten değil `lib`'den alıyor. Card, Modal, Drawer, Toast, Popover, List, Table ve iskelet kullanan diğer bileşenlerin bundle'ında avatar kodu yok. Görünüm ve API değişmedi.
