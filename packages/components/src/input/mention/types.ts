import type React from "react";

export interface MentionOption {
  /** Metne yazılacak değer (`@` ardından): ör. kullanıcı adı. */
  value: string;
  /** Listede görünen. Verilmezse `value`. */
  label?: React.ReactNode;
  /** Solda avatar/ikon. */
  icon?: React.ReactNode;
  /** Etiketin altında soluk açıklama (ör. unvan, e-posta). */
  description?: React.ReactNode;
  disabled?: boolean;
  /** Arama metni — `label` düz metin değilse ya da e-postada da aranacaksa. */
  searchText?: string;
}

/**
 * Input/Textarea'nın `mentions` özelliği. Tetik karakteri (`@`) yazılınca
 * imlecin altında öneri listesi açılır; seçilen değer metne yazılır.
 */
export interface MentionsConfig {
  /** Tetik karakter(ler)i. Varsayılan: `"@"`. Ör. `["@", "#"]` — kişi ve etiket. */
  prefix?: string | string[];
  /** Öneriler. Birden çok tetikte hangisi yazıldıysa ona göre liste için fonksiyon verin. */
  options: MentionOption[] | ((prefix: string) => MentionOption[]);
  /**
   * Varsayılan: `value`/`searchText`/düz `label` içinde Türkçe/aksansız arama.
   * Sunucu tarafı aramada `false` verin (listeyi `onSearch` ile siz süzersiniz).
   */
  filterOption?: false | ((query: string, option: MentionOption) => boolean);
  /** Tetikten sonra yazılan metin değişince (sunucu araması için). */
  onSearch?: (query: string, prefix: string) => void;
  /** Bir öneri seçilip metne yazılınca. */
  onSelect?: (option: MentionOption, prefix: string) => void;
  /** Öneriler yükleniyor: listede gösterge. */
  loading?: boolean;
  /** Seçilen değerden sonra eklenen ayraç. Varsayılan: `" "`. */
  split?: string;
  /** Eşleşme yokken. Varsayılan: "Sonuç bulunamadı". `null` → liste hiç açılmaz. */
  notFoundContent?: React.ReactNode;
  /** Liste en fazla bu yükseklikte. Varsayılan: `"14rem"`. */
  listHeight?: string;
  /** Listenin erişilebilir adı. Varsayılan: "Öneriler". */
  listLabel?: string;
}
