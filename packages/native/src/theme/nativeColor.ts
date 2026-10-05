/**
 * Token'lardaki CSS Color 4 yazımını (`rgb(25 24 34 / 0.45)` — web'de geçerli)
 * React Native'in her sürümde anladığı `rgba(25, 24, 34, 0.45)` biçimine çevirir.
 * Zaten virgüllü ya da hex olan değerler olduğu gibi döner. Saf — testli.
 */
export function nativeColor(color: string): string {
  const functionBody = /^rgba?\((.*)\)$/i.exec(color.trim())?.[1];
  if (!functionBody) return color;
  const m = /^([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?$/.exec(functionBody.trim());
  if (!m) return color;
  const [, r, g, b, a] = m;
  if (a === undefined) return `rgb(${r}, ${g}, ${b})`;
  const alpha = a.endsWith("%") ? Number.parseFloat(a) / 100 : Number.parseFloat(a);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
