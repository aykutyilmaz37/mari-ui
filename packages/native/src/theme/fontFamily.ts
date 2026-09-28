/** RN tek bir kayıtlı aile adı bekler; web'in CSS fallback listesi gönderilmez. */
export function nativeFontFamily(family: string): string | undefined {
  const first = family.split(",")[0]?.trim().replace(/^["']|["']$/g, "");
  if (!first || first.startsWith("var(") || ["system-ui", "ui-sans-serif", "sans-serif", "ui-monospace", "monospace"].includes(first)) return undefined;
  return first;
}
