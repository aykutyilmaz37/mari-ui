import type { DataLayerEvent } from "./types";

export type { DataLayerEvent };

/**
 * `window.dataLayer`ı yoksa oluşturur. GTM'in KENDİ script'i de aynı şeyi
 * yapar (`window.dataLayer = window.dataLayer || []`) — bu fonksiyon GTM
 * script'i henüz yüklenmeden önce `pushToDataLayer` çağrılırsa (örn. sayfa
 * çok erken bir olay göndermek isterse) olayların KAYBOLMAMASINI sağlar:
 * dizi zaten var olacağı için GTM script'i geldiğinde önceki push'ları
 * işleyebilir.
 */
export function initDataLayer(): DataLayerEvent[] {
  if (typeof window === "undefined") {
    throw new Error('[@mari-ui/utils] initDataLayer: "window" yok — sadece tarayıcıda çalışır.');
  }
  window.dataLayer ??= [];
  return window.dataLayer;
}

/**
 * `window.dataLayer`a bir olay ekler — `dataLayer` henüz yoksa ÖNCE
 * `initDataLayer()`ı kendisi çağırır (tüketicinin ayrıca init etmeyi
 * unutması diye bir bug sınıfı yaşanmasın).
 */
export function pushToDataLayer(event: DataLayerEvent): void {
  const dataLayer = initDataLayer();
  dataLayer.push(event);
}

/** Test'ler ve gözlemlenebilirlik (örn. bir debug panelinde son N olayı göstermek) için — `dataLayer`ın KENDİSİNİ (referansı) döner. */
export function getDataLayer(): DataLayerEvent[] {
  return initDataLayer();
}
