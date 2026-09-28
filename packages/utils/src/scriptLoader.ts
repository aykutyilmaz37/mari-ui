/**
 * `@mari-ui/utils`'in tüm modülleri (bugün: captcha) üçüncü parti bir
 * `<script>` etiketini tarayıcıya enjekte etmek zorunda — bu, o mantığın
 * TEK kaynağı. Aynı `src` için birden fazla çağrı (örn. bir formun iki kez
 * render edilmesi) script'i İKİNCİ KEZ eklemez, hâlâ devam eden bir
 * yükleme varsa AYNI promise'i döner — art arda çağrılar script'i N kez
 * enjekte edip N kez `onload` dinleyicisi kaydetmez.
 */
const loadingScripts = new Map<string, Promise<void>>();

export interface LoadScriptOptions {
  /** Script'in `id` attribute'u — verilirse aynı id'li mevcut bir `<script>` de "zaten yüklü" sayılır (örn. tüketici script'i kendi elle eklediyse). */
  id?: string;
  async?: boolean;
  defer?: boolean;
}

/**
 * `src`teki script'i `document.head`e ekler, `load` event'inde çözülen bir
 * promise döner. `document` yoksa (SSR/Node/React Native ortamı) AÇIKÇA
 * reddeder — sessizce hiçbir şey yapıp çağıranı sonsuza dek bekletmez.
 */
export function loadScriptOnce(src: string, options: LoadScriptOptions = {}): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("[@mari-ui/utils] loadScriptOnce: \"document\" yok — sadece tarayıcıda çalışır (SSR/Node/React Native'de değil)."));
  }

  const existingById = options.id ? document.getElementById(options.id) : null;
  const existingBySrc = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existingById || existingBySrc) {
    return loadingScripts.get(src) ?? Promise.resolve();
  }

  const cached = loadingScripts.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolvePromise, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = options.async ?? true;
    script.defer = options.defer ?? false;
    if (options.id) script.id = options.id;
    script.addEventListener("load", () => resolvePromise());
    script.addEventListener("error", () => reject(new Error(`[@mari-ui/utils] Script yüklenemedi: ${src}`)));
    document.head.appendChild(script);
  });

  loadingScripts.set(src, promise);
  return promise;
}

/** Test'ler ve olağandışı temizlik senaryoları için — normal kullanımda gerekmez. */
export function __resetScriptLoaderCache(): void {
  loadingScripts.clear();
}
