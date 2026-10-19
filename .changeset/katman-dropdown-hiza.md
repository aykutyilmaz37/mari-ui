---
"@mari-ui/tokens": patch
"@mari-ui/components": patch
---

Açılır paneller (`Dropdown`, `Popover`, `Select`…) yapışkan menünün altında kalmıyor: z-index skalasında `dropdown` artık `sticky`'nin üstünde (sticky 1000, dropdown 1100). `Dropdown` sarmalayıcısı flex satırlarda dikey ortalanıyor (`self-center`), `DropdownTrigger` `inline-flex items-center` olduğundan fazladan satır boşluğu almıyor.
