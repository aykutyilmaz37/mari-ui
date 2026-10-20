import type { Size } from "@mari-ui/core";
import type { AvatarSize } from "./types";

// Kutu geometrisi lib'de: Skeleton da kullanıyor, avatar klasörünü çekmesin diye.
export { getAvatarShapeClasses as getShapeClasses, getAvatarSizeStyle as getSizeStyle } from "../lib/avatarGeometry";

/*
 * Baş harf font-size'ı ve kare köşe yarıçapı kutuyla orantılı büyür. Faz 15'ten
 * beri baş harf İKİ harf ("AY") olabildiği için ant'ın tek-harf ölçeği
 * (14/18/24px) yerine kutunun ~%40'ı kullanılır: 24→10, 32→14, 40→16px.
 * Sayısal (özel px) boyutlarda `md`'nin değerlerine düşülür.
 */
const INITIAL_FONT_SIZE_CLASS: Record<Size, string> = { sm: "text-[0.625rem]", md: "text-sm", lg: "text-base" };

export function getInitialFontClass(size: AvatarSize): string {
  return typeof size === "number" ? INITIAL_FONT_SIZE_CLASS.md : INITIAL_FONT_SIZE_CLASS[size];
}

/**
 * İlk + son kelimenin baş harfi ("Aykut Yılmaz" → "AY"); tek kelimede
 * tek harf. Büyük harf Türkçe kurallarıyla ("ilker" → "İ", "I" değil).
 */
export function getInitials(alt: string): string {
  const words = alt.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";
  return (first + last).toLocaleUpperCase("tr");
}
