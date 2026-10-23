"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Button } from "../button";
import { skeletonFill } from "../lib/skeleton";
import type { StepItem, StepStatus, StepsLabels, StepsProps, StepsSize } from "./types";
import {
  getDotClass,
  getIndicatorClass,
  getRailClass,
  getStepNumber,
  getTitleClass,
  defaultStatusLabels,
  defaultStepsLabels,
  resolveStepStatus,
} from "./utils";

export type { StepsProps };

/**
 * 32px (sm: 24px) daire gösterge, yatayda başlığın hemen yanından bir
 * sonraki adıma uzanan ince çizgi, dört durum (wait/process/finish/error),
 * filled/outlined, başlık-altı yerleşim, nokta, ilerleme halkası.
 *
 * Eski sürümde: gösterge dairesi yoktu (çıplak ikonlar), tamamlanan adım
 * sadece bazı modlarda tik gösteriyordu, çizgi başlığın altından geçiyordu,
 * dikey modda her adım arası sabit `min-h-32` boşluk vardı ve aktif adım
 * `scale-105` ile büyütülüp komşularını itiyordu.
 *
 * `"use client"`: `responsive` bir ResizeObserver kullanıyor.
 */

const indicatorSizeClass: Record<StepsSize, string> = {
  sm: "size-6 text-xs",
  md: "size-8 text-sm",
};
const iconPx: Record<StepsSize, number> = { sm: 12, md: 16 };
const indicatorPx: Record<StepsSize, number> = { sm: 24, md: 32 };
const headerHeightClass: Record<StepsSize, string> = { sm: "min-h-6", md: "min-h-8" };
const titleSizeClass: Record<StepsSize, string> = { sm: "text-sm", md: "text-base" };
const descSizeClass: Record<StepsSize, string> = { sm: "text-xs", md: "text-sm" };

// Tailwind derleme-zamanı tarayıcısı için literal tablo (bkz. lib/colorClasses).
const groupHoverTitleClass: Record<ColorRole, string> = {
  primary: "group-hover:text-mari-primary",
  accent: "group-hover:text-mari-accent",
  success: "group-hover:text-mari-success",
  error: "group-hover:text-mari-error",
  warning: "group-hover:text-mari-warning",
  info: "group-hover:text-mari-info",
  neutral: "group-hover:text-mari-neutral",
};

type StepsLayout = "inline" | "stacked" | "vertical" | "compact";

/**
 * İskelette metin: kendi satır kutusunda dolgu, harfler görünmez — başlığın/
 * açıklamanın gerçek genişliğini ve satır kırılmasını korur (sıfır zıplama).
 * `box-decoration-clone`: çok satırlı açıklamada her satır ayrı yuvarlanır.
 */
const skeletonTextClass = /* @__PURE__ */ cn("rounded-sm text-transparent box-decoration-clone", /* @__PURE__ */ skeletonFill(true));
/** İskelette gösterge: aynı daire, durum rengi/kenarlığı yok, içerik görünmez. */
const skeletonIndicatorClass = /* @__PURE__ */ cn("border-transparent text-transparent [&_svg]:invisible", /* @__PURE__ */ skeletonFill(true));

/**
 * İnline: başlık göstergenin yanında; stacked: altında ortalı; vertical:
 * dikey liste; compact: dar ekranda sadece göstergeler + altta geçerli adımın
 * başlığı ("Adım 2/4 · Teslimat").
 */
function resolveLayout(
  vertical: boolean,
  isNarrow: boolean,
  responsiveLayout: StepsProps["responsiveLayout"],
  dot: boolean,
  labelPlacement: StepsProps["labelPlacement"]
): StepsLayout {
  if (vertical) return "vertical";
  if (isNarrow) return responsiveLayout === "compact" ? "compact" : "vertical";
  if (dot || labelPlacement === "vertical") return "stacked";
  return "inline";
}

/** Dairenin içi: hata → ×, tamamlandı → ✓ (özel ikon yoksa), yoksa ikon ya da numara. */
function renderGlyph(item: StepItem, index: number, status: StepStatus, size: number): React.ReactNode {
  if (status === "error") return <XIcon size={size} strokeWidth={2.5} />;
  const Icon = item.icon;
  if (Icon) return <Icon size={size} />;
  if (status === "finish") return <CheckIcon size={size} strokeWidth={2.5} />;
  return getStepNumber(item, index);
}

/** Kapsayıcı genişliğini izler — `responsive` için. SSR'da `undefined`. */
function useContainerWidth(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);
  return [ref, width] as const;
}

export function Steps({
  data,
  currentStep,
  status: currentStatus = "process",
  onChange,
  onComplete,
  showActions,
  color = "primary",
  variant = "filled",
  size = "md",
  vertical = false,
  labelPlacement = "horizontal",
  dot = false,
  percent,
  responsive = 520,
  responsiveLayout = "vertical",
  content,
  labels: labelsProp,
  className,
  "aria-label": ariaLabel = "İlerleme adımları",
  skeleton = false,
}: Readonly<StepsProps>) {
  const labels: StepsLabels = { ...defaultStepsLabels, ...labelsProp, status: { ...defaultStatusLabels, ...labelsProp?.status } };
  const [rootRef, width] = useContainerWidth(!vertical && responsive !== false);
  const isNarrow = responsive !== false && width !== undefined && width < responsive;
  const layout = resolveLayout(vertical, isNarrow, responsiveLayout, dot, labelPlacement);

  const isInteractive = Boolean(onChange);
  const actionsVisible = showActions ?? isInteractive;
  const stepNumbers = data.map(getStepNumber);
  const lastStep = stepNumbers[stepNumbers.length - 1];
  const isLastStep = currentStep === lastStep;
  const isFirstStep = currentStep === stepNumbers[0];

  const renderIndicator = (item: StepItem, index: number, status: StepStatus) => {
    if (dot) {
      return (
        <span aria-hidden className={cn("flex shrink-0 items-center justify-center", layout === "stacked" ? "w-full" : "w-3", headerHeightClass[size])}>
          <span
            className={cn(
              "rounded-full transition-[background-color,transform] duration-200 motion-reduce:transition-none",
              status === "process" || status === "error" ? "size-2.5" : "size-2",
              skeleton ? skeletonFill(true) : getDotClass(status, color)
            )}
          />
        </span>
      );
    }

    const glyph = renderGlyph(item, index, status, iconPx[size]);

    const hasRing = status === "process" && percent !== undefined;
    // İskelette halka çizilmez ama payı (`mx-1`) korunur — yüklenince kaymasın.
    const showRing = hasRing && !skeleton;
    // Halka ile daire arasında ~3px boşluk (ant.design ile aynı his).
    const ringSize = indicatorPx[size] + 10;
    const radius = ringSize / 2 - 1;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(100, Math.max(0, percent ?? 0));

    return (
      // Gösterge ekran okuyucudan gizli: sıra `<ol>`'dan, durum başlıktaki
      // sr-only ekten gelir — aksi halde ad "3 Onay" gibi okunuyordu.
      <span
        aria-hidden
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-full border font-semibold tabular-nums",
          "transition-colors duration-200 motion-reduce:transition-none",
          indicatorSizeClass[size],
          skeleton ? skeletonIndicatorClass : getIndicatorClass(status, color, variant),
          // Halka 5px taşar — komşu çizgi/başlıkla çakışmasın.
          hasRing && "mx-1"
        )}
      >
        {glyph}
        {showRing && (
          <svg
            className="pointer-events-none absolute -rotate-90"
            width={ringSize}
            height={ringSize}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
            aria-hidden
          >
            <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none" strokeWidth={2} className="stroke-mari-border" />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - clamped / 100)}
              className={cn(ringStrokeClass[color], "transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none")}
            />
          </svg>
        )}
      </span>
    );
  };

  // Kompakt modda geçerli adımın görünür özeti. Ekran okuyucu aynı bilgiyi
  // listeden (`aria-current` + sr-only başlıklar) aldığı için aria-hidden.
  const renderCompactCaption = () => {
    const index = stepNumbers.indexOf(currentStep);
    const item = data[index];
    if (!item) return null;
    const status = resolveStepStatus(item, index, currentStep, currentStatus);
    return (
      <div aria-hidden className="-mt-3 flex flex-col gap-0.5">
        <p className={cn("flex flex-wrap items-baseline gap-x-2", titleSizeClass[size])}>
          <span className={cn("text-mari-muted", descSizeClass[size], skeleton && skeletonTextClass)}>
            {labels.stepOf(index + 1, data.length)}
          </span>
          <span className={cn(getTitleClass(status), skeleton && skeletonTextClass)}>{item.title}</span>
          {item.subTitle && <span className={cn("text-mari-muted", descSizeClass[size], skeleton && skeletonTextClass)}>{item.subTitle}</span>}
        </p>
        {item.description && (
          <p className={cn("text-mari-muted", descSizeClass[size])}>
            <span className={cn(skeleton && skeletonTextClass)}>{item.description}</span>
          </p>
        )}
      </div>
    );
  };

  const renderText = (item: StepItem, status: StepStatus, isCurrent: boolean, withRail: React.ReactNode) => (
    <span className={cn("flex min-w-0 flex-col", layout === "stacked" ? "items-center text-center" : "flex-1")}>
      <span className={cn("flex min-w-0 items-center gap-2", layout !== "stacked" && headerHeightClass[size])}>
        <span
          className={cn(
            "leading-snug transition-colors motion-reduce:transition-none",
            layout === "inline" && "whitespace-nowrap",
            titleSizeClass[size],
            getTitleClass(status),
            isInteractive && !item.disabled && !isCurrent && groupHoverTitleClass[color],
            skeleton && skeletonTextClass
          )}
        >
          {item.title}
          <span className="sr-only">
            {" "}
            ({labels.status[status]}
            {status === "process" && percent !== undefined ? `, ${labels.percent(Math.round(percent))}` : ""})
          </span>
        </span>
        {item.subTitle && <span className={cn("whitespace-nowrap text-mari-muted", descSizeClass[size], skeleton && skeletonTextClass)}>{item.subTitle}</span>}
        {withRail}
      </span>
      {item.description && (
        // Bekleyen adımda da tam `muted`: `/80` açık zeminde 4.5:1'in altına düşüyordu (axe color-contrast).
        <span className={cn("mt-0.5 leading-relaxed text-mari-muted", descSizeClass[size])}>
          {/* Dolgu iç `<span>`de: satır satır sarılsın (blok kutunun tamamı değil). */}
          <span className={cn(skeleton && skeletonTextClass)}>{item.description}</span>
        </span>
      )}
    </span>
  );

  /** Her yerleşimin ortak girdileri — `renderItem` yerleşim başına ayrı fonksiyonlara dağıtır (tek dev fonksiyon 38 karmaşıklıktaydı). */
  const itemContext = (item: StepItem, index: number) => {
    const step = getStepNumber(item, index);
    const status = resolveStepStatus(item, index, currentStep, currentStatus);
    const isCurrent = step === currentStep;
    const clickable = isInteractive && !item.disabled && !skeleton;
    return {
      item,
      index,
      step,
      status,
      isCurrent,
      isLast: index === data.length - 1,
      liCurrent: !isInteractive && isCurrent ? ("step" as const) : undefined,
      // İskelette çizgiler durum rengini taşımaz (henüz durum yok).
      railClass: cn("rounded-full transition-colors duration-200 motion-reduce:transition-none", skeleton ? "bg-mari-border" : getRailClass(status, color)),
      // Etkileşimli ise gerçek <button> — Enter/Space/Tab tarayıcıdan gelir.
      Wrapper: (isInteractive ? "button" : "div") as "button" | "div",
      wrapperProps: isInteractive
        ? {
            type: "button" as const,
            disabled: item.disabled,
            tabIndex: skeleton ? -1 : undefined,
            "aria-current": isCurrent ? ("step" as const) : undefined,
            onClick: () => !skeleton && step !== currentStep && onChange?.(step),
          }
        : {},
      interactiveClass: cn(
        "group rounded-md text-start",
        clickable && "cursor-pointer",
        item.disabled && "cursor-not-allowed opacity-50",
        skeleton && "pointer-events-none",
        isInteractive && "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mari-ring"
      ),
    };
  };
  type ItemContext = ReturnType<typeof itemContext>;

  const renderCompactItem = ({ item, index, step, status, isLast, liCurrent, railClass, Wrapper, wrapperProps, interactiveClass }: ItemContext) => (
    <li key={step} aria-current={liCurrent} className={cn("flex min-w-0 items-center", isLast ? "flex-none" : "flex-1")}>
      {/* Başlık görünmez ama erişilebilir ad olarak kalır. Dokunma hedefi
          için gösterge etrafında 6px pay (32px → 44px). */}
      <Wrapper {...wrapperProps} className={cn(interactiveClass, "-m-1.5 shrink-0 rounded-full p-1.5")}>
        {renderIndicator(item, index, status)}
        <span className="sr-only">
          {item.title} ({labels.status[status]})
        </span>
      </Wrapper>
      {!isLast && <span aria-hidden className={cn("mx-3 h-px min-w-3 flex-1", railClass)} />}
    </li>
  );

  const renderVerticalItem = ({ item, index, step, status, isCurrent, isLast, liCurrent, railClass, Wrapper, wrapperProps, interactiveClass }: ItemContext) => (
    <li key={step} aria-current={liCurrent} className="flex">
      <Wrapper {...wrapperProps} className={cn(interactiveClass, "flex w-full gap-3")}>
        <span className="flex flex-col items-center">
          {renderIndicator(item, index, status)}
          {!isLast && <span className={cn("my-1.5 w-px min-h-6 flex-1", dot && "w-0.5", railClass)} />}
        </span>
        <span className={cn("flex min-w-0 flex-1", !isLast && (size === "sm" ? "pb-4" : "pb-6"))}>{renderText(item, status, isCurrent, null)}</span>
      </Wrapper>
    </li>
  );

  const renderStackedItem = ({ item, index, step, status, isCurrent, isLast, liCurrent, railClass, Wrapper, wrapperProps, interactiveClass }: ItemContext) => {
    const half = dot ? 5 : indicatorPx[size] / 2;
    const gap = dot ? 12 : 8;
    return (
      <li key={step} aria-current={liCurrent} className="relative min-w-0 flex-1">
        {!isLast && (
          <span
            aria-hidden
            className={cn("absolute", dot ? "h-0.5" : "h-px", railClass)}
            style={{
              top: indicatorPx[size] / 2 - (dot ? 1 : 0.5),
              left: `calc(50% + ${half + gap}px)`,
              width: `calc(100% - ${2 * (half + gap)}px)`,
            }}
          />
        )}
        <Wrapper {...wrapperProps} className={cn(interactiveClass, "flex w-full flex-col items-center gap-2 px-2")}>
          {renderIndicator(item, index, status)}
          {renderText(item, status, isCurrent, null)}
        </Wrapper>
      </li>
    );
  };

  const renderInlineItem = ({ item, index, step, status, isCurrent, isLast, liCurrent, railClass, Wrapper, wrapperProps, interactiveClass }: ItemContext) => (
    <li key={step} aria-current={liCurrent} className={cn("flex min-w-0", isLast ? "flex-none" : "flex-1")}>
      <Wrapper {...wrapperProps} className={cn(interactiveClass, "flex min-w-0 flex-1 items-start gap-3")}>
        {renderIndicator(item, index, status)}
        {renderText(item, status, isCurrent, !isLast && <span aria-hidden className={cn("ms-1 me-3 h-px min-w-6 flex-1", railClass)} />)}
      </Wrapper>
    </li>
  );

  const layoutRenderer: Record<StepsLayout, (context: ItemContext) => React.ReactNode> = {
    compact: renderCompactItem,
    vertical: renderVerticalItem,
    stacked: renderStackedItem,
    inline: renderInlineItem,
  };
  const renderItem = (item: StepItem, index: number) => layoutRenderer[layout](itemContext(item, index));

  return (
    <div ref={rootRef} aria-busy={skeleton || undefined} className={cn("flex w-full flex-col gap-6", className)}>
      <ol aria-label={ariaLabel} aria-hidden={skeleton || undefined} className={cn("flex w-full", layout === "vertical" ? "flex-col" : "flex-row items-start")}>
        {data.map(renderItem)}
      </ol>
      {layout === "compact" && renderCompactCaption()}
      {content}
      {onChange && actionsVisible && (
        <div className="flex justify-between gap-4 border-t border-mari-border pt-6">
          <Button skeleton={skeleton} color="neutral" variant="outline" disabled={isFirstStep} onClick={() => onChange(currentStep - 1)}>
            {labels.back}
          </Button>
          {isLastStep ? (
            <Button skeleton={skeleton} color={color} disabled={!onComplete} onClick={onComplete}>
              {labels.complete}
            </Button>
          ) : (
            <Button skeleton={skeleton} color={color} onClick={() => onChange(currentStep + 1)}>
              {labels.next}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const ringStrokeClass: Record<ColorRole, string> = {
  primary: "stroke-mari-primary",
  accent: "stroke-mari-accent",
  success: "stroke-mari-success",
  error: "stroke-mari-error",
  warning: "stroke-mari-warning",
  info: "stroke-mari-info",
  neutral: "stroke-mari-neutral",
};
