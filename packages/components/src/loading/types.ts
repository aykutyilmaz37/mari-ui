import type React from "react";
import type { ColorRole, Size } from "@mari-ui/core";

export interface LoadingProps {
  /** Yükleniyor mu. `false` iken (sarmalama modunda) sadece içerik render edilir. Varsayılan: `true`. */
  spinning?: boolean;
  /** Spinner çapı: sm 16 / md 24 / lg 40px. Varsayılan: `md`. */
  size?: Size;
  /** Spinner'ın altında açıklama; ekran okuyucuya da bu duyurulur. Varsayılan ad: "Yükleniyor". */
  tip?: React.ReactNode;
  /**
   * Spinner'ı bu kadar ms SONRA göster. Hızlı biten isteklerde yanıp sönmeyi
   * önler (ant.design `delay`). Varsayılan: `0`.
   */
  delay?: number;
  /** Belirli ilerleme (0-100): dönen yay yerine dolan halka + yüzde. */
  percent?: number;
  /**
   * Tüm ekranı kaplayan örtü + ortada spinner (sayfa geçişi, hesap hazırlama).
   * Faz 13.6'dan önce `<Loading />` HER ZAMAN tam ekrandı; artık varsayılan satır içi.
   */
  fullscreen?: boolean;
  /**
   * Verilirse sarmalama modu: içerik yerinde kalır (düzen kaymaz), yüklenirken
   * soluklaşır ve etkileşime kapanır (`inert`), üstünde spinner gösterilir.
   */
  children?: React.ReactNode;
  /** Dönen yayın rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  /** @deprecated Halka artık her zaman nötr ray rengi (`border`). Yok sayılır. */
  trackColor?: ColorRole;
  /** Varsayılan spinner yerine özel gösterge. */
  indicator?: React.ReactNode;
  className?: string;
}
