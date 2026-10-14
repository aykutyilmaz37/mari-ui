import type { HexColor } from "../contrast";
import type { ThemeMode } from "../semantic/deriveColorRole";

/**
 * Grafik serileri için kategorik palet (Pie dilimleri, çok serili
 * Line/Bar). Anlam taşıyan rollerden (primary/success/error…) BAĞIMSIZ: bir
 * seri "hata" demek değil, yalnız kimlik.
 *
 * Değerler ve SIRA hesaplandı, göz kararı değil: OKLCH açıklık bandı, kroma
 * tabanı, renk körlüğü simülasyonunda (protan/deutan) komşu çiftlerin OKLab
 * ΔE ≥ 8, normal görüşte ≥ 15 — açık modda `#f8f8fc`, koyu modda `#191822`
 * yüzeyine karşı (dataviz doğrulayıcısı; marka moruyla başlayan 7! sıralama
 * tarandı, iki modda da uyarısız geçen 4 sıralamadan biri seçildi). İlk üç
 * renk TÜM çiftlerde de geçer → pasta/çok serili grafikte 3 seriye kadar en
 * güvenli; daha fazlasında lejant + doğrudan etiket şart.
 *
 * Kurallar: sırayla atanır, döngüye girmez (9. seri "Diğer"e katlanır);
 * renk seriye bağlıdır, sırasına değil. Koyu sütun aynı tonların koyu yüzey
 * için seçilmiş adımları (otomatik çevirme değil). Açık modda su yeşili, sarı
 * ve pembe yüzeye karşı 3:1'in altında → grafiklerde lejant/etiket/tablo
 * görünümü zorunlu (rahatlatma kuralı).
 *
 * Paleti değiştirirseniz doğrulayıcıyı yeniden çalıştırın; tema rengi
 * (`primary`) değişse bile bu palet değişmez — doğrulanmış bir set.
 */
export const chartPalette: Record<ThemeMode, readonly HexColor[]> = {
  //       mor        turuncu    su yeşili  sarı       pembe      yeşil      mavi       kırmızı
  light: ["#6951ce", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#2a78d6", "#e34948"],
  dark: ["#9085e9", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#3987e5", "#e66767"],
};

export const CHART_PALETTE_SIZE = 8;
