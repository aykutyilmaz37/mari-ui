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

import { CarouselControls, DotPosition, ResponsiveItem } from "./types";
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
  dots?: boolean | { className?: string };
  dotPosition?: DotPosition;
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
  dots = true,
  dotPosition = "bottom",
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

  return (
    <div className={cn("relative w-full", className)}>
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

      {/* Default UI */}
      {arrows && count > slidesToShow && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="bg-mari-surface/70 text-mari-foreground hover:bg-mari-surface absolute top-1/2 left-2 -translate-y-1/2 rounded-full p-2 shadow transition disabled:opacity-40"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="bg-mari-surface/70 text-mari-foreground hover:bg-mari-surface absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2 shadow transition disabled:opacity-40"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      )}

      {dots && scrollSnaps.length > 1 && (
        <div
          className={cn(
            "pointer-events-none absolute z-10 flex gap-2",
            dotPosition === "left" || dotPosition === "right" ? "flex-col" : "flex-row",
            dotWrapperPos,
            typeof dots === "object" ? dots.className : undefined
          )}
        >
          {scrollSnaps.map((_, idx) => (
            <button key={`snap-${idx}`} onClick={() => scrollTo(idx)} className={getDotClass(selectedIndex === idx, color)} />
          ))}
        </div>
      )}
    </div>
  );
};
