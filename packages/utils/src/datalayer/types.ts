/**
 * Google Tag Manager/GA4'ün endüstri standardı haline gelmiş `dataLayer.
 * push()` sözleşmesi — sadece Google'a özgü değil, Segment/Adobe Launch
 * gibi birçok araç da AYNI `window.dataLayer` dizisini okur/yazar. Bu
 * yüzden `@mari-ui/utils` belirli bir SAĞLAYICIYA (vendor) bağlanmıyor,
 * bu ARA KATMAN formatını konuşuyor — hangi analytics aracının GTM
 * container'ına bağlı olduğu tüketicinin kendi kurulumuna kalır.
 */
export interface DataLayerEvent {
  /** GTM/GA4 konvansiyonu — hangi olayın tetiklendiği (örn. "page_view", "purchase", "form_submit"). */
  event: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}
