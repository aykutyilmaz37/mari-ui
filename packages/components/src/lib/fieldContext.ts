"use client";

import type React from "react";
import { createContext, useContext, useEffect } from "react";
import type { ColorRole } from "@mari-ui/core";

/**
 * `Field`in içindeki kontrole geçirdiği bağlantılar. `lib`te
 * duruyor (field/ klasöründe değil) çünkü her kontrol bunu import eder;
 * tsup ortak parçaya (chunk) koyar, tek bir context örneği olur.
 */
export interface FieldContextValue {
  /** Kontrolün id'si — `<label htmlFor>` buna bağlı. */
  controlId: string;
  labelId: string;
  /** İpucu ve/veya hata metninin id'leri (boşlukla ayrılmış); yoksa `undefined`. */
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  /** Grup kontrolleri (RadioGroup, Segmented, OtpInput) çağırır: etiket `<label for>` değil grubun adı olur. */
  markGroup: () => void;
  /** Kontrol kendi `id`sini verdiyse etiketin `htmlFor`u ona dönsün. */
  setControlId: (id: string | undefined) => void;
  /** Field iskelette: içindeki kontrol de iskelet çizer (tek prop kuralı). */
  skeleton: boolean;
}

export const FieldContext = /* @__PURE__ */ createContext<FieldContextValue | null>(null);

const joinIds = (...ids: Array<string | undefined>) => ids.filter(Boolean).join(" ") || undefined;

export interface FieldControlProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: Exclude<React.AriaAttributes["aria-invalid"], undefined>;
  required?: boolean;
  disabled?: boolean;
  color?: ColorRole;
  skeleton?: boolean;
}

/**
 * Tek bir alanı olan kontroller (Input, Select, InputNumber…) için. Field
 * içinde değilse verilen prop'ları olduğu gibi döner. İçindeyse eksikleri
 * Field'dan tamamlar — kontrole AÇIKÇA verilen prop her zaman kazanır;
 * `aria-describedby` ise birleştirilir (ikisi de okunsun).
 */
export function useFieldControl<P extends FieldControlProps>(props: P): P & FieldControlProps {
  const field = useContext(FieldContext);
  const setControlId = field?.setControlId;
  const ownId = props.id;
  useEffect(() => {
    if (!setControlId || ownId === undefined) return;
    setControlId(ownId);
    return () => setControlId(undefined);
  }, [setControlId, ownId]);
  if (!field) return props;
  return {
    ...props,
    id: props.id ?? field.controlId,
    "aria-describedby": joinIds(props["aria-describedby"], field.describedBy),
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
    required: props.required ?? (field.required || undefined),
    disabled: props.disabled ?? (field.disabled || undefined),
    color: props.color ?? (field.invalid ? "error" : undefined),
    skeleton: props.skeleton ?? (field.skeleton || undefined),
  };
}

/**
 * Grup kontrolleri (RadioGroup, Segmented, OtpInput, Transfer) için: kontrolün
 * kendi `skeleton`u verilmediyse Field'ınki geçerli.
 */
export function useFieldSkeleton(own: boolean | undefined): boolean {
  const field = useContext(FieldContext);
  return own ?? field?.skeleton ?? false;
}

export interface FieldGroupProps {
  "aria-labelledby"?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  disabled?: boolean;
}

/**
 * Grup kontrolleri için: Field'ın etiketi grubun adı olur (`aria-labelledby`)
 * — grup tek bir odaklanabilir alan olmadığından `<label htmlFor>` bağlanamaz.
 * Kontrol kendi `aria-label`/`aria-labelledby`sini verdiyse o kazanır.
 */
export function useFieldGroup<P extends FieldGroupProps>(props: P, enabled = true): P & FieldGroupProps & { "aria-invalid"?: true; "aria-required"?: true } {
  const field = useContext(FieldContext);
  const markGroup = enabled ? field?.markGroup : undefined;
  useEffect(() => markGroup?.(), [markGroup]);
  if (!field || !enabled) return props;
  const named = props["aria-labelledby"] !== undefined || props["aria-label"] !== undefined;
  return {
    ...props,
    "aria-labelledby": named ? props["aria-labelledby"] : field.labelId,
    "aria-describedby": joinIds(props["aria-describedby"], field.describedBy),
    disabled: props.disabled ?? (field.disabled || undefined),
    "aria-invalid": field.invalid ? true : undefined,
    "aria-required": field.required ? true : undefined,
  };
}
