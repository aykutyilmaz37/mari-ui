"use client";

import React, {
  FC,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";

import { ArrowsPlacement, CarouselControls, DotPosition, DotsPlacement, ResponsiveItem } from "./types";
import { getDotClass } from "./utils";

export type CarouselProps = {
  children: React.ReactNode[];
  className?: string;
  containerClassName?: string;
  itemClassName?: string;
  viewportClassName?: string;
  /** Ok ve nokta göstergelerinin aktif rengi. Varsayılan: `neutral`. */
  color?: ColorRole;

  /** Core */
  loop?: boolean;
  draggable?: boolean;
  speed?: number;

  /** Viewport */
  slidesToShow?: number;
  slidesToScroll?: number;
  align?: "start" | "center" | "end";
  containScroll?: "trimSnaps" | "keepSnaps";

  /** Autoplay */
  autoplay?: boolean;
  autoplayDelay?: number;
  autoplayStopOnInteraction?: boolean;

  /** UI */
  arrows?: boolean;
  /** Ok butonlarının görünürlüğü. `"always"` (varsayılan) her zaman görünür, `"hover"` yalnızca carousel'in üzerine gelindiğinde belirir (klavye odağında da görünür kalır). */
  arrowsVisibility?: "always" | "hover";
  /** Ok butonlarının yerleşimi. `"sides"` (varsayılan) biri solda biri sağda, dikeyde ortalanmış. Köşe değerleri (örn. `"top-right"`) ikisini de tek bir köşede gruplar — metin ağırlıklı slaytlarda içeriğin üzerine binmemek için. */
  arrowsPlacement?: ArrowsPlacement;
  dots?: boolean | { className?: string };
  dotPosition?: DotPosition;
  /** Nokta göstergelerinin yerleşimi. `"overlay"` (varsayılan) carousel'in üzerine `absolute` konumlanır. `"outside"` noktaları normal akışa alıp carousel'in ALTINA, içerikle çakışmadan render eder. */
  dotsPlacement?: DotsPlacement;
  controlsRef?: React.RefObject<CarouselControls | null>;

  /** Responsive */
  responsive?: ResponsiveItem[];

  /** Callbacks */
  beforeChange?: (current: number, next: number) => void;
  afterChange?: (current: number) => void;

  /** 🔹 NEW: External state mirror */
  onStateChange?: (state: CarouselControls) => void;
};

/* ========== Responsive Slides Hook ========== */
const useResponsiveSlides = (
  baseShow: number,
  baseScroll: number,
  responsive?: ResponsiveItem[]
) => {
  const [state, setState] = useState({
    slidesToShow: Math.max(1, baseShow),
    slidesToScroll: Math.max(1, baseScroll || baseShow),
  });

  useEffect(() => {
    if (!responsive?.length) {
      setState({
        slidesToShow: Math.max(1, baseShow),
        slidesToScroll: Math.max(1, baseScroll || baseShow),
      });
      return;
    }

    const onResize = () => {
      const width = window.innerWidth;
      const sorted = [...responsive].sort(
        (a, b) => a.breakpoint - b.breakpoint
      );

      let appliedShow = baseShow;
      let appliedScroll = baseScroll || baseShow;

      for (const r of sorted) {
        if (width <= r.breakpoint) {
          appliedShow = r.slidesToShow;
          appliedScroll = r.slidesToScroll ?? r.slidesToShow;
          break;
        }
      }

      setState({
        slidesToShow: Math.max(1, appliedShow),
        slidesToScroll: Math.max(1, appliedScroll),
      });
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [baseShow, baseScroll, responsive]);

  return state;
};

/* ========== Carousel Component ========== */
export const Carousel: FC<CarouselProps> = ({
  children,
  className,
  containerClassName,
  itemClassName,
  viewportClassName,
  color = "neutral",

  loop = true,
  draggable = true,
  speed = 20,

  slidesToShow: baseSlidesToShow = 1,
  slidesToScroll: baseSlidesToScroll,
  align = "start",
  containScroll = "trimSnaps",

  autoplay = false,
  autoplayDelay = 3000,
  autoplayStopOnInteraction = true,

  arrows = true,
  arrowsVisibility = "always",
  arrowsPlacement = "sides",
  dots = true,
  dotPosition = "bottom",
  dotsPlacement = "overlay",
  controlsRef,
  responsive,
  beforeChange,
  afterChange,
  onStateChange, // 🔹 added
}) => {
  const items = React.Children.toArray(children);
  const count = items.length;

  const { slidesToShow, slidesToScroll } = useResponsiveSlides(
    baseSlidesToShow,
    baseSlidesToScroll ?? baseSlidesToShow,
    responsive
  );

  const slideBasis = useMemo(
    () => `calc(100% / ${slidesToShow})`,
    [slidesToShow]
  );

  /* Embla setup */
  const emblaOptions = useMemo(
    () => ({
      loop,
      align,
      draggable,
      containScroll,
      slidesToScroll,
      duration: speed,
      watchDrag: true,
    }),
    [loop, align, draggable, containScroll, slidesToScroll, speed]
  );

  const autoplayPluginRef = useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: autoplayStopOnInteraction,
      rootNode: (emblaRoot) => emblaRoot.parentElement as HTMLElement,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    emblaOptions,
    autoplay ? [autoplayPluginRef.current] : []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const updateCanScroll = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setSelectedIndex(idx);
    updateCanScroll();
    afterChange?.(idx);
  }, [emblaApi, updateCanScroll, afterChange]);

  const onBeforeScroll = useCallback(() => {
    if (!emblaApi) return;
    const from = emblaApi.selectedScrollSnap();
    beforeChange?.(from, from);
  }, [emblaApi, beforeChange]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());
    updateCanScroll();

    emblaApi
      .on("select", onSelect)
      .on("reInit", () => {
        setScrollSnaps(emblaApi.scrollSnapList());
        setSelectedIndex(emblaApi.selectedScrollSnap());
        updateCanScroll();
        afterChange?.(emblaApi.selectedScrollSnap());
      })
      .on("pointerDown", () => {
        if (autoplay && autoplayStopOnInteraction)
          autoplayPluginRef.current.stop();
      })
      .on("scroll", onBeforeScroll);

    return () => {
      emblaApi
        .off("select", onSelect)
        .off("scroll", onBeforeScroll)
        .off("reInit", updateCanScroll);
    };
  }, [
    emblaApi,
    onSelect,
    onBeforeScroll,
    updateCanScroll,
    autoplay,
    autoplayStopOnInteraction,
    afterChange,
  ]);

  /* 🔹 Expose state via ref + callback */
  useEffect(() => {
    const state: CarouselControls = {
      selectedIndex,
      scrollSnaps,
      canScrollPrev,
      canScrollNext,
      scrollPrev,
      scrollNext,
      scrollTo,
    };
    if (controlsRef) controlsRef.current = state;
    if (onStateChange) onStateChange(state);
  }, [
    controlsRef,
    onStateChange,
    selectedIndex,
    scrollSnaps,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
  ]);

  /* Dot position helper */
  const dotWrapperPos = useMemo(() => {
    switch (dotPosition) {
      case "top":
        return "top-2 left-1/2 -translate-x-1/2";
      case "left":
        return "left-2 top-1/2 -translate-y-1/2";
      case "right":
        return "right-2 top-1/2 -translate-y-1/2";
      default:
        return "bottom-2 left-1/2 -translate-x-1/2";
    }
  }, [dotPosition]);

  /**
   * Eskiden oklar `bg-mari-surface/70` + `rounded-full` + `elevationClass.sm`
   * ile dolgun, dairesel bir "buton" gibiydi ve kenara çok yakındı (`left-2`/
   * `right-2` = 8px). Kullanıcı isteğiyle çıplak ikonlara indirildi (arka
   * plan/daire yok), kenar boşluğu artırıldı (`left-4`/`right-4` = 16px), ve
   * rastgele slayt içeriğinin üzerinde okunabilirlik için arka plansız bir
   * `drop-shadow` bırakıldı. `arrowsVisibility="hover"` iken oklar varsayılan
   * olarak görünmez, `group-hover` ile belirir — ama klavye odağında
   * (`focus-visible`) fareye bağımlı kalmadan yine görünür.
   */
  const arrowBaseClass = cn(
    "text-mari-foreground drop-shadow-sm transition-colors hover:text-mari-primary disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
    arrowsVisibility === "hover" && "opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
  );

  const showArrows = arrows && count > slidesToShow;
  const showDots = dots && scrollSnaps.length > 1;

  /**
   * `"sides"` iken oklar bağımsız, dikeyde ortalanmış iki `absolute` eleman.
   * Köşe değerlerinde (`"top-right"` vb.) metin ağırlıklı slaytların (örn.
   * yorum kartı) üzerine binmemeleri için ikisi TEK bir köşede, yan yana
   * gruplanır — kullanıcının "oklar sağ üstte olsun" ihtiyacı buradan geldi.
   */
  const arrowsContent =
    arrowsPlacement === "sides" ? (
      <>
        <button type="button" onClick={scrollPrev} disabled={!canScrollPrev} aria-label="Önceki slayt" className={cn(arrowBaseClass, "absolute top-1/2 left-4 -translate-y-1/2 p-1")}>
          <ChevronLeftIcon className="h-7 w-7" />
        </button>
        <button type="button" onClick={scrollNext} disabled={!canScrollNext} aria-label="Sonraki slayt" className={cn(arrowBaseClass, "absolute top-1/2 right-4 -translate-y-1/2 p-1")}>
          <ChevronRightIcon className="h-7 w-7" />
        </button>
      </>
    ) : (
      <div
        className={cn("absolute z-10 flex gap-1", {
          "top-4 left-4": arrowsPlacement === "top-left",
          "top-4 right-4": arrowsPlacement === "top-right",
          "bottom-4 left-4": arrowsPlacement === "bottom-left",
          "bottom-4 right-4": arrowsPlacement === "bottom-right",
        })}
      >
        <button type="button" onClick={scrollPrev} disabled={!canScrollPrev} aria-label="Önceki slayt" className={cn(arrowBaseClass, "p-1")}>
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <button type="button" onClick={scrollNext} disabled={!canScrollNext} aria-label="Sonraki slayt" className={cn(arrowBaseClass, "p-1")}>
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>
    );

  const dotsContent = (
    <div
      className={cn(
        "flex gap-2",
        dotsPlacement === "overlay" && "pointer-events-none absolute z-10",
        dotsPlacement === "overlay" && (dotPosition === "left" || dotPosition === "right" ? "flex-col" : "flex-row"),
        dotsPlacement === "overlay" && dotWrapperPos,
        dotsPlacement === "outside" && "mt-3 flex-row justify-center",
        typeof dots === "object" ? dots.className : undefined
      )}
    >
      {scrollSnaps.map((_, idx) => (
        <button
          key={`snap-${idx}`}
          type="button"
          onClick={() => scrollTo(idx)}
          aria-label={`${idx + 1}. slayta git`}
          aria-current={selectedIndex === idx ? "true" : undefined}
          className={cn(getDotClass(selectedIndex === idx, color), dotsPlacement === "overlay" && "pointer-events-auto")}
        />
      ))}
    </div>
  );

  return (
    <div className={className}>
      <div className="group relative w-full">
        <div className={cn("overflow-hidden", viewportClassName)} ref={emblaRef}>
          <div
            className={cn("flex w-full will-change-transform select-none", containerClassName)}
            style={{ "--slide-basis": slideBasis } as React.CSSProperties}
          >
            {items.map((child, i) => {
              const key = isValidElement(child) && child.key != null ? child.key : `slide-${i}`;
              return (
                <div key={key} className={cn("embla__slide shrink-0", itemClassName)} style={{ flex: "0 0 var(--slide-basis)" }}>
                  {child}
                </div>
              );
            })}
          </div>
        </div>

        {showArrows && arrowsContent}
        {showDots && dotsPlacement === "overlay" && dotsContent}
      </div>

      {showDots && dotsPlacement === "outside" && dotsContent}
    </div>
  );
};
