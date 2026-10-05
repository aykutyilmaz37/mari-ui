import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

/**
 * Seri rengi. Sayı (1–8): kategorik grafik paleti (`--mari-color-chart-N`,
 * renk körlüğüne göre doğrulanmış sıra). `ColorRole`: yalnız seri gerçekten
 * o anlamı taşıyorsa (ör. "Hatalar" serisi → `error`). Verilmezse seri
 * sırasıyla paletten alır.
 */
export type ChartColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | ColorRole;

export interface ChartSeries<T> {
  /** Satırdaki sayısal alanın adı. */
  key: Extract<keyof T, string>;
  /** Lejant, tooltip ve tabloda görünen ad. */
  name: string;
  color?: ChartColor;
}

export interface ChartBaseProps extends SkeletonableProps {
  /** Grafiğin adı — ekran okuyucu (`role="img"`) ve tablo başlığı. Görünmez; görünür başlığı kartta verin. */
  label: string;
  /** Değer biçimi (eksen, tooltip, tablo). Varsayılan: `Intl.NumberFormat(locale)`; eksende kısaltılmış (12,5 B). */
  valueFormatter?: (value: number) => string;
  /** Varsayılan `"tr-TR"`. */
  locale?: string;
  /** Veri yokken görünen metin. Varsayılan "Veri yok". */
  emptyText?: string;
  /**
   * Boyut sınıfları. Yükseklik buradan verilir (varsayılan `h-64`) — rem
   * tabanlı, yoğunluk ve büyük ekran ölçeğiyle büyür. Genişlik kapsayıcıyı doldurur.
   */
  className?: string;
  /**
   * Giriş animasyonu: ilk çizimde (iskeletten yüklü hale geçerken de) çubuklar
   * büyür, çizgiler soldan açılır, dilimler süpürülür. Varsayılan açık (`false` ile kapatılır);
   * hareket azaltma tercihinde çalışmaz.
   */
  animated?: boolean;
}

export interface CartesianChartProps<T> extends ChartBaseProps {
  data: T[];
  /** Kategori/zaman ekseni alanı (ör. `"month"`). */
  xKey: Extract<keyof T, string>;
  series: ChartSeries<T>[];
  /** x etiketi biçimi. Varsayılan: değerin metni. */
  xFormatter?: (value: T[Extract<keyof T, string>], row: T) => string;
  /** Yatay kılavuz çizgileri. Varsayılan `true`. */
  showGrid?: boolean;
  /** Lejant. Varsayılan: 2+ seride açık, tek seride kapalı (başlık seriyi zaten adlandırır). */
  showLegend?: boolean;
}
