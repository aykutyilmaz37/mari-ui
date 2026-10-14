/*
 * Bu dosyadan sonra her component aynı beş eksenden birini kullanır:
 * `color`, `size`, `variant`, `radius`, `placement`. Faz 3'te bir süre
 * `@deprecated` alias olarak yaşayan eski prop isimleri (paket yayınlanmadan
 * önce) kaldırıldı.
 */
/**
 * Ortak prop sözlüğü. Mevcut sistemde bunların hepsi component başına ayrı
 * ayrı tanımlanıyordu:
 *  - Semantik renk 5 farklı isimle geçiyordu: `type` (Button/Checkbox/Radio/
 *  Toast), `variant` (Tooltip/Dropdown/Modal), `color` (Switch), `status`
 *  (Input), `statu` (Tag — yazım hatası).
 *  - Boyut ölçeği 4 ayrı sözlükteydi: `large|middle|small`,
 *  `small|medium|large` (Modal), `sm|md|lg` (Drawer), `small|default|large`
 *  (Skeleton).
 *  - Konum `placement` (Tooltip/Dropdown) ile `position` (Drawer/Toast/
 *  Sidebar) arasında bölünmüştü.
 */

/** Semantik renk rolü. `neutral` "renksiz" bileşenler (Card, Divider) içindir. */
export type ColorRole = "primary" | "accent" | "success" | "error" | "warning" | "info" | "neutral";

/** Etkileşimli bileşenlerin standart boyut ekseni. */
export type Size = "sm" | "md" | "lg";

/** Bazı bileşenler (Avatar, Tag) uçlarda ekstra boyut ister. */
export type ExtendedSize = "xs" | Size | "xl";

/*
 * Dolgu/stil ekseni. Eskiden Button'da `variant` (outlined|filled) ile
 * Input'ta `variant` (outlined|borderless|filled|underlined) FARKLI eksenleri
 * ifade ediyordu — aynı prop adı iki farklı anlam taşıyordu. Artık `variant`
 * her zaman "ne kadar dolgulu" sorusuna cevap verir.
 */
/**
 * Dolgu stili: `solid` dolu, `outline` kenarlıklı, `soft` tonlu zemin, `ghost` zeminsiz,
 * `link` bağlantı görünümü.
 */
export type Variant = "solid" | "outline" | "soft" | "ghost" | "link";

/** Tokens paketindeki radius skalasıyla birebir aynı anahtarlar. */
export type Radius = "none" | "sm" | "md" | "lg" | "xl" | "full";

/*
 * Floating UI'ın da kullandığı 12 değerli konum sözleşmesi. Eskiden Tooltip/
 * Dropdown 4 yönlü (`top|bottom|left|right`), Drawer/Toast ise köşe bazlı
 * (`topRight`, `bottomLeft`, camelCase) iki farklı sözlük kullanıyordu. Tek
 * bir `Placement` tipi ikisini de karşılar: `top-end` = eski `topRight`.
 */
/** Açılan katmanın tetikleyiciye göre konumu (`top`, `bottom-start`, `right-end`…). */
export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

/*
 * Eskiden her component kendi `XClassNames = Partial<Record<"wrapper"|...,
 * string>>` tipini yazıyordu (`ButtonClassNames`, `InputClassNames`,
 * `CheckboxSemanticDOM`, card'daki çakışan-isimli `SemanticDOM`...). Generic
 * hale getirildi.
 */
/** Bileşenin iç parçalarına ek sınıf vermek için: `classNames={{ wrapper: "…" }}`. */
export type SlotClassNames<TSlot extends string> = Partial<Record<TSlot, string>>;
