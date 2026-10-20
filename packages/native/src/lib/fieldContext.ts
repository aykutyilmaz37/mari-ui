import { createContext, useContext } from "react";

/**
 * Web `lib/fieldContext`in native karşılığı: `Field` içindeki kontrol etiketini,
 * ipucunu/hatasını, zorunluluğu, devre dışı ve iskelet durumunu buradan alır.
 * Kontrole açıkça verilen değer her zaman kazanır.
 *
 * RN'de `htmlFor`/`aria-describedby` bağı yok: etiket kontrolün
 * `accessibilityLabel`ı, hata (yoksa ipucu) `accessibilityHint`i olur.
 */
export interface FieldContextValue {
  /** Düz metin etiket (öğe verilmişse yok). */
  label?: string;
  hint?: string;
  error?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  skeleton: boolean;
}

export const FieldContext = /* @__PURE__ */ createContext<FieldContextValue | null>(null);

export interface FieldControlInput {
  disabled?: boolean;
  skeleton?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  status?: "error" | "warning";
}

export interface FieldControlResult {
  disabled: boolean;
  skeleton: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Field hatalıysa (ve kontrole kendi durumu verilmemişse) `"error"`. */
  status?: "error" | "warning";
}

export function useFieldControl(own: FieldControlInput): FieldControlResult {
  const field = useContext(FieldContext);
  const fieldLabel = field?.label && field.required ? `${field.label}, zorunlu` : field?.label;
  return {
    disabled: own.disabled ?? field?.disabled ?? false,
    skeleton: own.skeleton ?? field?.skeleton ?? false,
    accessibilityLabel: own.accessibilityLabel ?? fieldLabel,
    accessibilityHint: own.accessibilityHint ?? field?.error ?? field?.hint,
    status: own.status ?? (field?.invalid ? "error" : undefined),
  };
}
