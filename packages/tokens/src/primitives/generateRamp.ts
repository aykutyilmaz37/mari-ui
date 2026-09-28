import type { HexColor } from "../contrast";
import type { ColorRamp } from "./ramps";

/**
 * Faz 1'deki `primaryRamp`/`accentRamp` vb. ELLE seçilmiş, sabit rampalardı —
 * "modern mavi + turuncu" varsayılanı için yeterliydi ama Faz 6'nın tema
 * stüdyosu tüketicinin KENDİ seçtiği herhangi bir anchor rengi için tam bir
 * 11 tonluk rampa üretebilmeyi gerektiriyor. Bu dosya o üretici.
 *
 * Yöntem: anchor rengi HSL'e çevrilir ve DEĞİŞMEDEN `500` tonuna yerleştirilir
 * (kullanıcı "bu rengi seçtim" dediğinde tam olarak o rengi bir yerde
 * GÖRMELİ). Diğer tonlar aynı hue/saturation'ı koruyup lightness'ı sabit bir
 * eğriyle (`LIGHTNESS_DELTA`) kaydırarak üretilir — bu, Tailwind'in kendi
 * rampalarının da yaklaşık şekli (açık uçlarda büyük adımlar, koyu uçlarda
 * küçülen adımlar). WCAG AA garantisi burada YOK — o iş zaten
 * `deriveColorRole`'ün sorumluluğu (bu üretici sadece rampayı üretir,
 * `buildSemanticColors` rampadan AA-geçen tonu SEÇER).
 */

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function hexToRgb(hex: HexColor): [number, number, number] {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function rgbToHex(r: number, g: number, b: number): HexColor {
  const toHex = (channel: number) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn:
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      break;
    case gn:
      h = ((bn - rn) / d + 2) / 6;
      break;
    default:
      h = ((rn - gn) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }: Hsl): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  if (sn === 0) {
    const gray = ln * 255;
    return [gray, gray, gray];
  }
  const hueToRgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hn = h / 360;
  return [hueToRgb(p, q, hn + 1 / 3) * 255, hueToRgb(p, q, hn) * 255, hueToRgb(p, q, hn - 1 / 3) * 255];
}

function hexToHsl(hex: HexColor): Hsl {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function hslToHex(hsl: Hsl): HexColor {
  const [r, g, b] = hslToRgb(hsl);
  return rgbToHex(r, g, b);
}

const MIN_LIGHTNESS = 3;
const MAX_LIGHTNESS = 98;

/**
 * SABİT lightness FARKLARI (örn. "500 - 8") ilk denemede kullanılmıştı ama
 * gerçek anchor renklerinde ciddi bir kusur çıkardı: doygun (saturated) mavi/
 * yeşil/mor tonların HSL lightness'ı genelde 30'ların altındadır (HSL
 * algısal olarak düz değildir — parlak görünen doygun bir renk bile düşük
 * `l` taşıyabilir). Böyle bir anchor'da `500 - 34` ve `500 - 40` ikisi de
 * `MIN_LIGHTNESS`e kırpılıp AYNI tona çöküyordu (fiilen `generateRamp.
 * test.ts`te #059669 ile yakalandı). Çözüm: sabit fark yerine, anchor'ın
 * KENDİ lightness'ından uca (0 veya 98) kalan MESAFENİN bir ORANI. Oran her
 * zaman kesin artan olduğu için (anchor aşırı uçta olmadıkça) çakışma
 * matematiksel olarak imkânsız.
 */
const LIGHTER_FRACTION: Record<400 | 300 | 200 | 100 | 50, number> = {
  400: 0.22,
  300: 0.42,
  200: 0.62,
  100: 0.8,
  50: 0.94,
};

const DARKER_FRACTION: Record<600 | 700 | 800 | 900 | 950, number> = {
  600: 0.2,
  700: 0.45,
  800: 0.65,
  900: 0.82,
  950: 0.93,
};

/**
 * `anchor`'ı DEĞİŞTİRMEDEN `500` tonuna yerleştirip (HSL round-trip'i
 * yüzünden hex birebir aynı kalmayabilir — bkz. testler) diğer 10 tonu aynı
 * hue/saturation üzerinden, anchor'ın KENDİ lightness'ına göre ORANTILI bir
 * eğriyle türetir.
 */
export function generateRamp(anchor: HexColor): ColorRamp {
  const base = hexToHsl(anchor);
  const at = (l: number) => hslToHex({ h: base.h, s: base.s, l: Math.min(MAX_LIGHTNESS, Math.max(MIN_LIGHTNESS, l)) });

  const ramp: ColorRamp = { 500: at(base.l) } as ColorRamp;
  for (const [shade, fraction] of Object.entries(LIGHTER_FRACTION)) {
    ramp[Number(shade) as keyof typeof LIGHTER_FRACTION] = at(base.l + fraction * (MAX_LIGHTNESS - base.l));
  }
  for (const [shade, fraction] of Object.entries(DARKER_FRACTION)) {
    ramp[Number(shade) as keyof typeof DARKER_FRACTION] = at(base.l - fraction * (base.l - MIN_LIGHTNESS));
  }
  return ramp;
}
