/*
 * Kasıtlı olarak BURADA OLMAYANLAR: `useTabs`, `useToast`, `useUpload`.
 * Bunlar bugün ilgili component klasörlerinde yaşıyor ve mevcut (dağınık)
 * prop API'sine sıkı sıkıya bağlı. Faz 3'te o component'ler yeni sözleşmeye
 * taşınırken buraya taşınacaklar — önce mantığı taşıyıp component'i sonra
 * yeniden tasarlamak, aynı işi iki kere yapmak anlamına gelirdi.
 */
/**
 * @mari-ui/core — web ve native'in aynı sözleşmeyi konuştuğu paylaşılan
 * katman. İçinde JSX yok; `react-dom` veya `react-native` import etmez
 * (bu kural `packages/eslint-config/react-internal.mjs`'te bir sonraki
 * adımda zorlanacaktır — bkz. plan Faz 2).
 */
export * from "./cn";
export * from "./types";
export * from "./variants";
export * from "./hooks";
