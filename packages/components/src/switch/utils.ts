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

/**
 * Kullanıcı geri bildirimi: `lg` topu track'in kenarına tam oturmuyordu
 * (devtools'ta elle `calc(100% - 1.675rem)` denenince doğru görünmüştü).
 * Kök sebep: dikey kenar payı (`top-0.5` = 2px, üçü de aynı) ile yatay
 * kenar payı (`left-1` = 4px) TUTARSIZDI — top burada 2px'i, sağdaki/soldaki
 * ise 4px'i kullanıyordu, top hem tüm boyutlarda aynı hem de gerçek "track
 * yüksekliği - thumb yüksekliği" farkına (hep 4px, yarısı 2px) denk
 * geliyordu; yatay pay ise elle `1` (4px) yazılmış, aynı mantığı izlemiyordu.
 * Artık YATAY pay da `0.5` (2px) — dikeyle birebir aynı — ve "açık" konumdaki
 * `calc(100% - X)` değeri `thumb genişliği + 2px` olarak HESAPLANDI (elle
 * tahmin edilmedi): sm 0.75+0.125=0.875rem, md 1.125+0.125=1.25rem,
 * lg 1.5+0.125=1.625rem (kullanıcının devtools'ta bulduğu 1.675rem'e çok
 * yakın — aradaki fark elle sürükleyip bırakmanın hassasiyet payı).
 */
const BALL_SIZE_CLASS: Record<Size, string> = {
  sm: "h-3 w-3 top-0.5",
  md: "h-[1.125rem] w-[1.125rem] top-0.5", // 18px
  lg: "h-6 w-6 top-0.5",
};

const BALL_LEFT_ON_CLASS: Record<Size, string> = {
  sm: "left-[calc(100%-0.875rem)]",
  md: "left-[calc(100%-1.25rem)]",
  lg: "left-[calc(100%-1.625rem)]",
};

// Yeni (küçültülmüş) thumb boyutlarına göre — sabit 24px'lik lucide
// varsayılanı artık topun kendisinden büyük olurdu.
const SPINNER_SIZE: Record<Size, number> = { sm: 10, md: 14, lg: 20 };

/**
 * Dokunmatik hedef: track yüksekliği sm 16 / md 22 / lg 28px → 44px'e tamamlar.
 * `sm` track'i (32px) yatayda da 44'e genişler.
 */
export const SWITCH_TOUCH_TARGET_CLASS: Record<Size, string> = {
  sm: "pointer-coarse:before:absolute pointer-coarse:before:-inset-x-1.5 pointer-coarse:before:-inset-y-3.5",
  md: "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-2.5",
  lg: "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-2",
};

export function getTrackSizeClass(size: Size, hasLabel: boolean): string {
  return hasLabel ? TRACK_SIZE_WITH_LABEL_CLASS[size] : TRACK_SIZE_CLASS[size];
}

export function getSpinnerSize(size: Size): number {
  return SPINNER_SIZE[size];
}

export function getTrackClass(size: Size, color: ColorRole, checked: boolean, hasLabel: boolean): string {
  // Kapalı track'te KENARLIK YOK (Faz 15): 1px kenarlık iç kutuyu 2px
  // küçültüyor, top (track − 4px) kutuya sığmayıp alttan/soldan taşıyordu.
  // Kapalı hal her renkte aynı nötr gri — renk yalnızca "açık"ı anlatır.
  // İç etiketliyken kapalı track `neutral` dolgusu: `input` grisi üstünde ne
  // koyu (okunmuyordu) ne beyaz (3.6:1) metin yeterli; neutral dolgu + onun
  // kontrast rengi 5.6:1 (koyu temada otomatik tersine döner).
  let offTrack = "bg-mari-input";
  if (hasLabel) offTrack = bgSolidClass.neutral;
  return cn(hasLabel ? TRACK_SIZE_WITH_LABEL_CLASS[size] : TRACK_SIZE_CLASS[size], checked ? bgSolidClass[color] : offTrack);
}

export function getBallClass(size: Size, checked: boolean): string {
  return cn(BALL_SIZE_CLASS[size], checked ? BALL_LEFT_ON_CLASS[size] : "left-0.5");
}
