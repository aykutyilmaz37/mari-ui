/**
 * @mari-ui/utils — mari-ui'ın UI'dan bağımsız cross-cutting özellik
 * modülleri. `@mari-ui/core`dan farkı: `core` headless UI mantığı (variant
 * çözümleme, `cn()`, controlled/uncontrolled hook'ları) taşırken, bu paket
 * component RENDER ETMEZ — üçüncü parti servis entegrasyonlarını (analytics,
 * captcha) sarmalar. Framework-agnostic (React'e bağımlı değil) — bir React
 * hook'una ihtiyaç varsa tüketici bu vanilla fonksiyonları kendi
 * `useEffect`/hook'una trivially sarabilir.
 */
export { loadScriptOnce, type LoadScriptOptions } from "./scriptLoader";
export { initDataLayer, pushToDataLayer, getDataLayer, type DataLayerEvent } from "./datalayer";
export { loadRecaptcha, executeRecaptcha, loadHCaptcha, executeHCaptcha } from "./captcha";
