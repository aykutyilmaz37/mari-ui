import type React from "react";

export interface FieldProps {
  /** Alanın etiketi — kontrolün (grupta: grubun) erişilebilir adı olur. */
  label: React.ReactNode;
  /** Etiketin altında/kontrolün altında soluk açıklama. Hata varken gizlenir, hata onun yerine okunur. */
  hint?: React.ReactNode;
  /** Doğrulama hatası. Verilince kontrol `color="error"` + `aria-invalid` olur, metin ekran okuyucuya okunur. */
  error?: React.ReactNode;
  /** Etikette `*`, kontrolde `required`. */
  required?: boolean;
  /** Kontrolü de devre dışı bırakır. */
  disabled?: boolean;
  /** `horizontal`: etiket solda, alan sağda (ayar sayfaları); dar ekranda alt alta. Varsayılan: `vertical`. */
  layout?: "vertical" | "horizontal";
  /** Kontrolün id'si. Verilmezse üretilir; kontrolün kendi `id` prop'u her zaman kazanır. */
  htmlFor?: string;
  className?: string;
  /** Tek bir kontrol (Input, Select, InputNumber, RadioGroup, Segmented…). */
  children: React.ReactNode;
}
