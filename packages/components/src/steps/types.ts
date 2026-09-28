import type React from "react";
import type { ColorRole } from "@mari-ui/core";

/** ant.design ile aynı dört durum. */
export type StepStatus = "wait" | "process" | "finish" | "error";

export interface StepItem {
  title: React.ReactNode;
  /** Başlığın yanında soluk ikincil metin (ör. süre, tarih). */
  subTitle?: React.ReactNode;
  description?: React.ReactNode;
  /** Numara yerine dairenin içinde gösterilecek ikon. */
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  /**
   * Adımın 1 tabanlı kimliği — `currentStep` bununla karşılaştırılır.
   * Varsayılan: sırası (`index + 1`).
   */
  step?: number;
  /** Bu adımın durumunu elle belirler; verilmezse `currentStep`'e göre türetilir. */
  status?: StepStatus;
  /** Tıklanabilir Steps'te bu adıma gidilemez. */
  disabled?: boolean;
}

export type StepData = StepItem[];

export type StepsVariant = "filled" | "outlined";
export type StepsSize = "sm" | "md";
export type StepsLabelPlacement = "horizontal" | "vertical";

export interface StepsProps {
  data: StepData;
  /** Geçerli adım (1 tabanlı, `StepItem.step` ile eşleşir). */
  currentStep: number;
  /**
   * GEÇERLİ adımın durumu. `"error"` verilirse geçerli adım hata olarak
   * gösterilir (ör. ödeme reddedildi). Varsayılan: `"process"`.
   */
  status?: Exclude<StepStatus, "wait">;
  /**
   * Verilirse adımlar tıklanabilir olur (gerçek `<button>`, klavyeyle
   * erişilebilir) ve varsayılan olarak alttaki Geri/İleri çubuğu gösterilir.
   */
  onChange?: (step: number) => void;
  /**
   * Son adımda "Tamamla"ya tıklandığında çağrılır. Verilmezse "Tamamla"
   * devre dışı kalır.
   */
  onComplete?: () => void;
  /** Alttaki Geri/İleri/Tamamla çubuğu. Varsayılan: `onChange` verildiyse `true`. */
  showActions?: boolean;
  /** Aktif/tamamlanmış adımların rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  /** Varsayılan: `"filled"`. */
  variant?: StepsVariant;
  /** Varsayılan: `"md"` (32px gösterge). `"sm"` = 24px. */
  size?: StepsSize;
  vertical?: boolean;
  /**
   * Yatay yönde başlığın yeri: göstergenin yanında (`horizontal`, varsayılan)
   * ya da altında ortalı (`vertical`). `dot` iken her zaman `vertical`.
   */
  labelPlacement?: StepsLabelPlacement;
  /** Numara/ikon yerine küçük nokta — sade zaman çizelgeleri için. */
  dot?: boolean;
  /** Geçerli adımın göstergesinin etrafında ilerleme halkası (0-100). */
  percent?: number;
  /**
   * Yatay Steps, kapsayıcısı bu genişliğin (px) altına inince dar düzene
   * (`responsiveLayout`) geçer — başlıklar sıkışıp kesilmez. `false` kapatır.
   * Varsayılan: `520`.
   */
  responsive?: number | false;
  /**
   * Dar kapsayıcıda neye dönüşeceği. `"vertical"` (varsayılan): dikey liste —
   * açıklamalı zaman çizelgeleri için. `"compact"`: sadece göstergeler ve
   * altta "Adım 2/4 · Başlık" — içeriği adımların altında olan sihirbazlarda
   * (ödeme, kayıt) ekranın yarısını adım listesine harcamamak için.
   */
  responsiveLayout?: "vertical" | "compact";
  /** Adımların altında, eylem çubuğunun üstünde render edilir (bkz. `StepsContent`). */
  content?: React.ReactNode;
  className?: string;
  /** Varsayılan: `"İlerleme adımları"`. */
  "aria-label"?: string;
}
