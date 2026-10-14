// build-manifest testi için: kütüphanede şu an terk edilmiş prop yok, JSDoc
// `@deprecated` gerekçesinin çıkarılması bu küçük örnek üzerinden doğrulanır.
export interface OrnekProps {
  /** Yeni ad. */
  yeniAd?: string;
  /**
   * @deprecated `yeniAd` kullanın — gerekçe kaynakta
   * birden fazla satıra bölünmüş.
   */
  eskiAd?: string;
}

export function Ornek(_props: Readonly<OrnekProps>): null {
  return null;
}
