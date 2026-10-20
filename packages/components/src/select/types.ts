import type React from "react";
import type { ColorRole, Placement, Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";
import type { InputShape, InputVariant } from "../input/types";

export type SelectValue = string | number;

export interface SelectOption {
  value: SelectValue;
  /** Görünen metin. Verilmezse `value`. Aramada da bu (düz metinse) kullanılır. */
  label?: React.ReactNode;
  /** Solda ikon/avatar. */
  icon?: React.ReactNode;
  /** Etiketin altında soluk açıklama. */
  description?: React.ReactNode;
  disabled?: boolean;
  /** `label` düz metin değilse arama ve harfle atlama için kullanılacak metin. */
  searchText?: string;
}

/** Başlıklı seçenek grubu. */
export interface SelectOptionGroup {
  label: React.ReactNode;
  options: SelectOption[];
}

interface SelectCommonProps extends SkeletonableProps {
  options: Array<SelectOption | SelectOptionGroup>;
  placeholder?: string;
  /** Seçenekleri yazarak süz (Türkçe/aksansız). Varsayılan: `false`. */
  showSearch?: boolean;
  /** Seçimi temizleyen düğme. Varsayılan: `false`. */
  allowClear?: boolean;
  /** Temizle düğmesinin erişilebilir adı. Varsayılan: `"Temizle"`. */
  clearLabel?: string;
  /** Seçenekler yükleniyor: listede spinner, tetikleyicide dönen ikon. */
  loading?: boolean;
  /** Arama sonuç vermeyince. Varsayılan: `"Sonuç bulunamadı"`. */
  notFoundContent?: React.ReactNode;
  disabled?: boolean;
  size?: Size;
  variant?: InputVariant;
  shape?: InputShape;
  /** Doğrulama durumu (`error`/`warning`) ya da vurgu rengi — Input'la aynı kural. */
  color?: ColorRole;
  /** Panelin yönü; sığmazsa karşı yöne döner. Varsayılan: `"bottom-start"`. */
  placement?: Extract<Placement, "bottom-start" | "bottom-end" | "top-start" | "top-end">;
  /** Liste en fazla bu yükseklikte, sonra kayar. Varsayılan: `"16rem"`. */
  listHeight?: string;
  /** Açık/kapalı (kontrollü). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Aramada yazılan metin değişince (sunucu tarafı arama için). */
  onSearch?: (text: string) => void;
  /** Seçenek satırını özelleştir. */
  optionRender?: (option: SelectOption, state: { selected: boolean; active: boolean }) => React.ReactNode;
  id?: string;
  /** Native form gönderimi için gizli alan(lar)ın adı. */
  name?: string;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}

export interface SelectProps extends SelectCommonProps {
  value?: SelectValue | null;
  defaultValue?: SelectValue | null;
  onChange?: (value: SelectValue | null, option: SelectOption | null) => void;
}

/** `MultiSelect` (`@mari-ui/components/multi-select`): seçilenler etiket olarak görünür, liste seçimden sonra açık kalır. */
export interface MultiSelectProps extends SelectCommonProps {
  value?: SelectValue[];
  defaultValue?: SelectValue[];
  onChange?: (value: SelectValue[], options: SelectOption[]) => void;
  /** En fazla bu kadar etiket gösterilir, kalanı "+N" olur. Varsayılan: hepsi (satırlara sarar). */
  maxTagCount?: number;
}

/** İç: `SelectBase`in ortak gövdesi tekli ve çoklu modu birlikte taşır. */
export type SelectBaseProps = (SelectProps & { mode?: undefined }) | (MultiSelectProps & { mode: "multiple" });
