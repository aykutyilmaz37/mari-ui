import type { ExtendedSize } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { defaultNativeConfig, type NativeConfig, type NativeControlSize } from "../nativeConfig";
import { toPx } from "./toPx";

/**
 * NATIVE boyut ölçeği (`defaultNativeConfig.sizes`). Web ölçeği (20/24/32/40/48, masaüstü yoğunluğu) telefonda küçük
 * kalıyordu; native kendi ölçeğini kullanır — renk, varyant, davranış web ile
 * aynı kalır.
 *
 * Kaynaklar:
 * - Apple HIG: varsayılan kontrol 44pt (aynı zamanda en küçük dokunma hedefi),
 *  büyük 50–56pt; gövde metni 17pt.
 * - Material 3: buton XS 32 · S 36 · M 40 · L 48 · XL 56dp; köşe 8/8/12/16/16;
 *  en küçük dokunma hedefi 48dp; yazı alanı 56dp (sıkı 48dp).
 * → md = 44 (Apple varsayılanı), xs/sm = M3 XS/S, xl = M3 XL / Apple büyük.
 *  md yazı 16 = web'in dar ekran alan yazısı (`max-sm:text-base`) ile aynı.
 *
 * Köşe sabit sayı değil, temanın radius anahtarı — `density.radius` native'de de geçerli.
 */

export interface ResolvedNativeSize extends Omit<NativeControlSize, "radius"> {
  borderRadius: number;
}

/** Ölçek + temanın köşe değeri (rem → px). */
export function nativeSize(theme: Theme, size: ExtendedSize, config: NativeConfig = defaultNativeConfig): ResolvedNativeSize {
  const { radius, ...rest } = config.sizes[size];
  return { ...rest, borderRadius: toPx(theme.radius[radius]) };
}
