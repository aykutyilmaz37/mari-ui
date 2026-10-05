import { useState } from "react";

/** `value` verilirse kontrollü, yoksa `defaultValue` ile kendi durumunu tutar (web'deki checked/defaultChecked deseni). */
export function useControllable<T>(value: T | undefined, defaultValue: T): [T, (next: T) => void] {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  return [controlled ? value : inner, (next: T) => !controlled && setInner(next)];
}
