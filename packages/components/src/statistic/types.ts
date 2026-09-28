import type React from "react";
import type { SkeletonableProps } from "../lib/skeleton";

interface StatisticBaseProps extends SkeletonableProps {
  /** Üstte soluk başlık ("Aylık gelir"). */
  title?: React.ReactNode;
  /** Değerin solunda ("₺") / sağında ("kişi", "%"). */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Altta soluk açıklama ("geçen aya göre", "son 30 gün"). */
  description?: React.ReactNode;
  /** Değer boyutu: sm / md / lg. Varsayılan: `md`. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface StatisticTrend {
  /** Değişim (yüzde puan ya da yüzde): `12.4` → "▲ %12,4", `-3` → "▼ %3". */
  value: number;
  /** Hangi yön İYİ: gelir `up`, maliyet/iade/süre `down`. Varsayılan: `up`. */
  goodWhen?: "up" | "down";
  /** `%` yerine birim, ör. " puan". Varsayılan: yüzde. */
  unit?: "percent" | "points";
}

export interface StatisticProps extends StatisticBaseProps {
  /** Sayı tr-TR biçimlenir (1.234.567,8); metin olduğu gibi. */
  value: number | string;
  /** Sabit ondalık basamak. */
  precision?: number;
  /** Değişim göstergesi — renk yönden değil `goodWhen`den. */
  trend?: StatisticTrend;
  /** Varsayılan: `"tr-TR"`. */
  locale?: string;
}

export interface CountdownProps extends StatisticBaseProps {
  /** Hedef an (Date ya da ms). */
  target: Date | number;
  /** Süre dolunca bir kez. */
  onFinish?: () => void;
  /** Günleri ayrı göster ("2 gün 04:12:09"); `false`: saate kat ("52:12:09"). Varsayılan: `true`. */
  showDays?: boolean;
  /** Süre dolunca değerin yerine gösterilen ve duyurulan metin. Varsayılan: `"Süre doldu"`. */
  finishedText?: React.ReactNode;
}

export interface ClockProps extends StatisticBaseProps {
  /** IANA saat dilimi ("Europe/Istanbul", "America/New_York"). Varsayılan: tarayıcınınki. */
  timeZone?: string;
  /** Saniyeleri göster (her saniye güncellenir). Varsayılan: `false` (dakikada bir). */
  showSeconds?: boolean;
  /** Varsayılan: `"tr-TR"` (24 saat). */
  locale?: string;
}

export interface StopwatchProps extends StatisticBaseProps {
  /** Başlat / Duraklat / Sıfırla düğmeleri. Varsayılan: `true`. */
  controls?: boolean;
  /** Takıldığında hemen başlasın. Varsayılan: `false`. */
  autoStart?: boolean;
  /** Durdurulunca/sıfırlanınca geçen süre (ms). */
  onStop?: (elapsedMs: number) => void;
}
