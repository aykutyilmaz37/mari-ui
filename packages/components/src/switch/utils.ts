import { cn, type ColorRole, type Size } from "@mari-ui/core";
import { bgSolidClass } from "../lib/colorClasses";

/**
 * Kullanıcı geri bildirimi (Faz 13): eskiden `md` bile 28×64px'ti (`lg`
 * 32×96px) — ant.design'ın switch'i referans alındığında (default 22×44px,
 * small 16×28px) çok büyük duruyordu. Track/thumb oranları ant'a hizalandı:
 * `sm`≈ant'ın small'ı, `md`=ant'ın default'u (birebir), `lg` orantılı
 * büyütülmüş bir üçüncü basamak (ant'ta yok).
 */
const TRACK_SIZE_CLASS: Record<Size, string> = {
  sm: "h-4 w-8",
  md: "h-[1.375rem] w-11", // 22×44px — ant.design'ın "default" boyutuyla birebir
  lg: "h-7 w-14",
};

/**
 * `switchTrueLabel`/`switchFalseLabel` verildiğinde (ant'ın "Text & icon"
 * örneğindeki gibi) normal track bu metne yer açamıyordu — "Kapalı" gibi
 * bir etiket track'in DIŞINA taşıp kesiliyordu (Faz 13 kullanıcı geri
 * bildirimi). Etiketli kullanım için daha geniş, ayrı bir preset.
 */
const TRACK_SIZE_WITH_LABEL_CLASS: Record<Size, string> = {
  sm: "h-4 w-14",
  md: "h-[1.375rem] w-20",
  lg: "h-7 w-28",
};

const BALL_SIZE_CLASS: Record<Size, string> = {
  sm: "h-3 w-3 top-0.5",
  md: "h-[1.125rem] w-[1.125rem] top-0.5", // 18px
  lg: "h-6 w-6 top-0.5",
};

// Kayan topun "açık" konumdaki sol boşluğu — `calc(100% - ...)` kullanıldığı
// için gerçek (dar veya geniş) track genişliğine göre KENDİLİĞİNDEN uyarlanır,
// track genişliği elle iki kez senkron tutulmaz.
const BALL_LEFT_ON_CLASS: Record<Size, string> = {
  sm: "left-[calc(100%-1.125rem)]",
  md: "left-[calc(100%-1.5rem)]",
  lg: "left-[calc(100%-1.875rem)]",
};

// Yeni (küçültülmüş) thumb boyutlarına göre — sabit 24px'lik lucide
// varsayılanı artık topun kendisinden büyük olurdu.
const SPINNER_SIZE: Record<Size, number> = { sm: 10, md: 14, lg: 20 };

export function getSpinnerSize(size: Size): number {
  return SPINNER_SIZE[size];
}

export function getTrackClass(size: Size, color: ColorRole, checked: boolean, hasLabel: boolean): string {
  return cn(hasLabel ? TRACK_SIZE_WITH_LABEL_CLASS[size] : TRACK_SIZE_CLASS[size], checked ? bgSolidClass[color] : "bg-mari-border");
}

export function getBallClass(size: Size, checked: boolean): string {
  return cn(BALL_SIZE_CLASS[size], checked ? BALL_LEFT_ON_CLASS[size] : "left-1");
}
