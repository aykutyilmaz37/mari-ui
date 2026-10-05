import type { ExtendedSize } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { toPx } from "./toPx";

/**
 * NATIVE boyut ölçeği (kullanıcı kararı 2026-10-05: "native'in standardına
 * göre"). Web ölçeği (20/24/32/40/48, masaüstü yoğunluğu) telefonda küçük
 * kalıyordu; native kendi ölçeğini kullanır — renk, varyant, davranış web ile
 * aynı kalır.
 *
 * Kaynaklar:
 * - Apple HIG: varsayılan kontrol 44pt (aynı zamanda en küçük dokunma hedefi),
 *   büyük 50–56pt; gövde metni 17pt.
 * - Material 3: buton XS 32 · S 36 · M 40 · L 48 · XL 56dp; köşe 8/8/12/16/16;
 *   en küçük dokunma hedefi 48dp; yazı alanı 56dp (sıkı 48dp).
 * → md = 44 (Apple varsayılanı), xs/sm = M3 XS/S, xl = M3 XL / Apple büyük.
 *   md yazı 16 = web'in dar ekran alan yazısı (`max-sm:text-base`) ile aynı.
 *
 * Köşe sabit sayı değil, temanın radius anahtarı — `density.radius` native'de de geçerli.
 */
interface NativeSizeSpec {
  height: number;
  fontSize: number;
  lineHeight: number;
  paddingHorizontal: number;
  gap: number;
  iconSize: number;
  radius: keyof Theme["radius"];
}

export const NATIVE_SIZE: Record<ExtendedSize, NativeSizeSpec> = {
  xs: { height: 32, fontSize: 13, lineHeight: 18, paddingHorizontal: 12, gap: 6, iconSize: 14, radius: "md" },
  sm: { height: 36, fontSize: 14, lineHeight: 20, paddingHorizontal: 14, gap: 6, iconSize: 16, radius: "md" },
  md: { height: 44, fontSize: 16, lineHeight: 22, paddingHorizontal: 16, gap: 8, iconSize: 18, radius: "lg" },
  lg: { height: 50, fontSize: 17, lineHeight: 22, paddingHorizontal: 20, gap: 8, iconSize: 20, radius: "lg" },
  xl: { height: 56, fontSize: 18, lineHeight: 24, paddingHorizontal: 24, gap: 10, iconSize: 22, radius: "xl" },
};

export interface ResolvedNativeSize extends Omit<NativeSizeSpec, "radius"> {
  borderRadius: number;
}

/** Ölçek + temanın köşe değeri (rem → px). */
export function nativeSize(theme: Theme, size: ExtendedSize): ResolvedNativeSize {
  const { radius, ...rest } = NATIVE_SIZE[size];
  return { ...rest, borderRadius: toPx(theme.radius[radius]) };
}
