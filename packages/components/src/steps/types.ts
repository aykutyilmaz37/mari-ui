import type React from "react";
import type { ColorRole } from "@mari-ui/core";

export interface StepItem {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  step: number;
}

export type StepData = StepItem[];

export interface StepsProps {
  data: StepData;
  /**
   * Aktif/tamamlanmış adımların rengi. Varsayılan: `primary`.
   * @deprecated Eskiden `lineColor`/`dotColor` diye iki ayrı, HAM Tailwind
   * class string'i ("bg-info", "text-info" gibi) prop olarak geçiliyordu —
   * tema değişikliğine hiç uyum sağlamazdı. Artık tek bir `ColorRole`.
   */
  color?: ColorRole;
  currentStep: number;
  onChange?: (step: number) => void;
  /**
   * Son adımdayken "İleri" düğmesi yerine görünen "Tamamla"ya tıklandığında
   * çağrılır (bkz. Steps.stories.tsx'teki gerçek sihirbaz örneği). Verilmezse
   * son adımdaki düğme eski davranışıyla devre dışı kalır — akışın nasıl
   * sonlanacağını bilmeden bir şey yapmaz.
   */
  onComplete?: () => void;
  vertical?: boolean;
  dot?: boolean;
  content?: React.ReactNode;
}
