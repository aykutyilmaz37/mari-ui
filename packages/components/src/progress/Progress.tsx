import React from "react";
import { CheckIcon, CircleCheckIcon, CircleXIcon, XIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { bgSolidClass, strokeSolidClass, textClass } from "../lib/colorClasses";
import { skeletonFill } from "../lib/skeleton";
import type { ProgressProps, ProgressStatus } from "./types";

export type { ProgressProps };

const clamp = (n: number | undefined) => Math.min(100, Math.max(0, n ?? 0));

/** Çizgi kalınlığı rem (px yasak): 4 / 8 / 12px. */
const LINE_HEIGHT = { sm: "h-1", md: "h-2", lg: "h-3" } as const;
const LINE_TEXT = { sm: "text-xs", md: "text-sm", lg: "text-sm" } as const;
/** Daire çapı rem + viewBox birimi kalınlık. */
const CIRCLE_SIZE = { sm: "3rem", md: "5rem", lg: "7.5rem" } as const;
const CIRCLE_STROKE = { sm: 10, md: 8, lg: 6 } as const;
const CIRCLE_TEXT = { sm: "text-xs", md: "text-base", lg: "text-2xl" } as const;
const CIRCLE_ICON = { sm: 16, md: 28, lg: 40 } as const;

function resolveStatus(status: ProgressStatus | undefined, percent: number): ProgressStatus {
  if (status) return status;
  return percent >= 100 ? "success" : "normal";
}

function resolveColor(status: ProgressStatus, color: ColorRole | undefined): ColorRole {
  if (status === "success") return "success";
  if (status === "exception") return "error";
  return color ?? "primary";
}

/** `%45` (tr-TR: yüzde işareti önde). */
const defaultFormat = (p: number) => `%${Math.round(p)}`;

function valueText(format: ProgressProps["format"], percent: number, status: ProgressStatus): string {
  const custom = format?.(percent);
  const base = typeof custom === "string" || typeof custom === "number" ? String(custom) : defaultFormat(percent);
  if (status === "exception") return `${base}, hata`;
  if (status === "success") return `${base}, tamamlandı`;
  return base;
}

function Info({ status, percent, format, circle, size, color }: Readonly<{ status: ProgressStatus; percent: number; format: ProgressProps["format"]; circle: boolean; size: NonNullable<ProgressProps["size"]>; color: ColorRole }>) {
  // Özel format varsa her durumda metin; yoksa bitince/hatada ikon.
  if (!format && (status === "success" || status === "exception")) {
    // Dairede ortadaki alan geniş: yalın ✓/✕; çizginin yanında daire içinde ikon.
    const icons = circle ? { success: CheckIcon, exception: XIcon } : { success: CircleCheckIcon, exception: CircleXIcon };
    const Icon = icons[status];
    return <Icon aria-hidden size={circle ? CIRCLE_ICON[size] : 16} className={textClass[color]} />;
  }
  return <>{(format ?? defaultFormat)(percent)}</>;
}

/*
 * yapı ant.design Progress'ten. Çizgi (varsayılan, `steps` ile
 * parçalı) ve daire. `%100` kendiliğinden başarı; `exception` hata.
 */
/**
 * Erişilebilirlik: `role="progressbar"` + `aria-valuenow/min/max` ve okunur
 * `aria-valuetext` ("%45", "3 / 5 dosya", "%100, tamamlandı"). Ad zorunlu —
 * `aria-label` ya da görünür bir başlığa `aria-labelledby`. Durum rengi tek
 * başına anlam taşımaz: ikon ve valuetext de söyler. Geçişler ve `active`
 * parıltısı hareket azaltmada durur.
 */
export function Progress({
  percent: rawPercent,
  type = "line",
  status: statusProp,
  color: colorProp,
  success,
  steps,
  showInfo = true,
  format,
  size = "md",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  skeleton = false,
}: Readonly<ProgressProps>) {
  const percent = clamp(rawPercent);
  const status = resolveStatus(statusProp, percent);
  const color = resolveColor(status, colorProp);
  const successPercent = success ? Math.min(clamp(success.percent), percent) : 0;

  const a11y = skeleton
    ? { "aria-hidden": true as const }
    : {
        role: "progressbar",
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": Math.round(percent),
        "aria-valuetext": valueText(format, percent, status),
      };

  if (type === "circle") {
    return (
      <div {...a11y} className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: CIRCLE_SIZE[size], height: CIRCLE_SIZE[size] }}>
        <CircleTrack percent={percent} successPercent={successPercent} stroke={CIRCLE_STROKE[size]} color={color} skeleton={skeleton} />
        {showInfo && !skeleton && (
          <span aria-hidden className={cn("absolute inset-0 flex items-center justify-center font-semibold tabular-nums text-mari-foreground", CIRCLE_TEXT[size])}>
            <Info status={status} percent={percent} format={format} circle size={size} color={color} />
          </span>
        )}
      </div>
    );
  }

  return (
    <div {...a11y} className={cn("flex w-full items-center gap-3", className)}>
      {steps ? (
        <StepsTrack steps={steps} percent={percent} color={color} size={size} skeleton={skeleton} />
      ) : (
        <div className={cn("relative min-w-0 flex-1 overflow-hidden rounded-full", LINE_HEIGHT[size], skeleton ? skeletonFill(true) : "bg-mari-surface-alt")}>
          {!skeleton && (
            <>
              <span
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none",
                  bgSolidClass[color],
                  status === "active" && "overflow-hidden"
                )}
                style={{ width: `${percent}%` }}
              >
                {status === "active" && (
                  <span className="absolute inset-0 animate-[mari-progress-active_1.6s_ease-out_infinite] bg-linear-to-r from-transparent via-white/40 to-transparent motion-reduce:hidden" />
                )}
              </span>
              {successPercent > 0 && (
                <span className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 motion-reduce:transition-none", bgSolidClass.success)} style={{ width: `${successPercent}%` }} />
              )}
            </>
          )}
        </div>
      )}
      {showInfo && (
        <span aria-hidden className={cn("flex min-w-9 shrink-0 items-center justify-end tabular-nums text-mari-muted", LINE_TEXT[size], skeleton && "invisible")}>
          <Info status={status} percent={percent} format={format} circle={false} size={size} color={color} />
        </span>
      )}
    </div>
  );
}

function StepsTrack({ steps, percent, color, size, skeleton }: Readonly<{ steps: number; percent: number; color: ColorRole; size: NonNullable<ProgressProps["size"]>; skeleton: boolean }>) {
  const filled = Math.round((percent / 100) * steps);
  const segmentFill = (i: number) => {
    if (skeleton) return skeletonFill(true);
    return i < filled ? bgSolidClass[color] : "bg-mari-surface-alt";
  };
  return (
    <div className="flex min-w-0 flex-1 gap-1">
      {Array.from({ length: steps }, (_, i) => (
        <span key={i} className={cn("flex-1 rounded-full transition-colors duration-200 motion-reduce:transition-none", LINE_HEIGHT[size], segmentFill(i))} />
      ))}
    </div>
  );
}

function CircleTrack({ percent, successPercent, stroke, color, skeleton }: Readonly<{ percent: number; successPercent: number; stroke: number; color: ColorRole; skeleton: boolean }>) {
  const box = 100;
  const r = (box - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = (p: number) => `${(p / 100) * c} ${c}`;
  return (
    <svg aria-hidden viewBox={`0 0 ${box} ${box}`} className="size-full -rotate-90">
      <circle cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={stroke} className={skeleton ? "stroke-mari-border/70" : "stroke-mari-surface-alt"} />
      {!skeleton && (
        <>
          <circle
            cx={box / 2}
            cy={box / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={arc(percent)}
            className={cn(strokeSolidClass[color], "transition-[stroke-dasharray] duration-300 motion-reduce:transition-none", percent === 0 && "opacity-0")}
          />
          {successPercent > 0 && (
            <circle cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={arc(successPercent)} className={strokeSolidClass.success} />
          )}
        </>
      )}
    </svg>
  );
}
