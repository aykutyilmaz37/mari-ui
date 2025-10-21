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

import clsx from "clsx";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { DotPosition } from "./types";

type ResponsiveItem = {
  breakpoint: number;
  slidesToShow: number;
  slidesToScroll?: number;
};

export type CarouselProps = {
  children: React.ReactNode[];
  className?: string;
  containerClassName?: string;
  itemClassName?: string;
  viewportClassName?: string;

  /** Core */
  loop?: boolean; // infinite karşılığı
  draggable?: boolean;
  speed?: number; // ms

  /** Viewport ayarları */
  slidesToShow?: number; // default 1
  slidesToScroll?: number; // default slidesToShow
  align?: "start" | "center" | "end"; // Embla align
  containScroll?: "trimSnaps" | "keepSnaps"; // overscroll davranışı

  /** Oto oynatma */
  autoplay?: boolean;
  autoplayDelay?: number; // ms, default 3000
  autoplayStopOnInteraction?: boolean;

  /** UI */
  arrows?: boolean;
  dots?: boolean | { className?: string };
  dotPosition?: DotPosition;

  /** Responsive */
  responsive?: ResponsiveItem[];

  /** Callbacks */
  beforeChange?: (current: number, next: number) => void;
  afterChange?: (current: number) => void;
};

/** Basit responsive slidesToShow/slidesToScroll hook'u */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseShow, baseScroll, JSON.stringify(responsive || [])]);

  return state;
};

export const Carousel: FC<CarouselProps> = ({
  children,
  className,
  containerClassName,
  itemClassName,
  viewportClassName,

  loop = true,
  draggable = true,
  speed = 20, // Embla hız birimi ~ px/step (ms değil). Daha yavaş animasyon için düşür, daha hızlı için artır.

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

  responsive,

  beforeChange,
  afterChange,
}) => {
  const items = React.Children.toArray(children);
  const count = items.length;

  // Responsive derive
  const { slidesToShow, slidesToScroll } = useResponsiveSlides(
    baseSlidesToShow,
    baseSlidesToScroll ?? baseSlidesToShow,
    responsive
  );

  // Slide genişliği için CSS değişkeni kullanıyoruz (Tailwind ile kolay)
  const slideBasis = useMemo(
    () => `calc(100% / ${slidesToShow})`,
    [slidesToShow]
  );

  /** Embla Options */
  const emblaOptions = useMemo(
    () => ({
      loop,
      align,
      dragFree: false,
      draggable,
      containScroll,
      slidesToScroll, // önemli: çoklu scroll
      inViewThreshold: 0.6,
      duration: speed, // animasyon hızı: Embla'da ms değil; deneyerek ayarla
      watchDrag: true,
    }),
    [loop, align, draggable, containScroll, slidesToScroll, speed]
  );

  /** Autoplay plugin */
  const autoplayPluginRef = useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: autoplayStopOnInteraction,
      // İKİNCİ ARGÜMAN YERİNE BURAYA:
      rootNode: (emblaRoot) => emblaRoot.parentElement as HTMLElement,
    })
  );

  /** Embla init */
  const [emblaRef, emblaApi] = useEmblaCarousel(
    emblaOptions,
    autoplay ? [autoplayPluginRef.current] : []
  );

  /** Seçili index & sayfa/dot hesapları */
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setSelectedIndex(idx);
    afterChange?.(idx);
  }, [emblaApi, afterChange]);

  const onBeforeScroll = useCallback(() => {
    if (!emblaApi) return;
    const from = emblaApi.selectedScrollSnap();
    // targetSnap index'ini yakalamak için hack: emblaApi.internalEngine().target.get() olabilir,
    // ama public API’de yok. Yaklaşık olarak afterChange ile yetiniyoruz.
    // Dilersen beforeChange’i prev/next handler’larında manuel çağırabiliriz.
    // Burada sadece mevcut index'i geçiyoruz.
    beforeChange?.(from, from);
  }, [emblaApi, beforeChange]);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());

    emblaApi
      .on("select", onSelect)
      .on("reInit", () => {
        setScrollSnaps(emblaApi.scrollSnapList());
        setSelectedIndex(emblaApi.selectedScrollSnap());
      })
      .on("pointerDown", () => {
        // Kullanıcı dokunduysa autoplay’i durdur (opsiyon)
        if (autoplay && autoplayStopOnInteraction) {
          autoplayPluginRef.current.stop();
        }
      })
      .on("scroll", onBeforeScroll);

    return () => {
      emblaApi.off("select", onSelect).off("scroll", onBeforeScroll);
    };
  }, [emblaApi, onSelect, onBeforeScroll, autoplay, autoplayStopOnInteraction]);

  /** slidesToShow değişince yeniden init gerekmez; Embla "reInit" ile handle ediyor.
   *  Ancak slide genişliğini CSS ile verdiğimiz için dependents yok.
   */

  /** Prev/Next */
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  /** Dot click */
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  /** Dot wrapper pos */
  const dotWrapperPos = useMemo(() => {
    switch (dotPosition) {
      case "top":
        return "top-2 left-1/2 -translate-x-1/2";
      case "left":
        return "left-2 top-1/2 -translate-y-1/2";
      case "right":
        return "right-2 top-1/2 -translate-y-1/2";
      case "bottom":
      default:
        return "bottom-2 left-1/2 -translate-x-1/2";
    }
  }, [dotPosition]);

  return (
    <div className={twMerge(clsx("relative w-full", className))}>
      {/* Viewport */}
      <div
        className={twMerge(clsx("overflow-hidden", viewportClassName))}
        ref={emblaRef}
      >
        {/* Container */}
        <div
          className={twMerge(
            clsx(
              "flex w-full will-change-transform select-none",
              containerClassName
            )
          )}
          style={
            {
              // Tailwind ile desteklemek için CSS var:
              // .embla__slide { flex: 0 0 var(--slide-basis) }
              // burada inline veriyoruz:
              "--slide-basis": slideBasis,
            } as React.CSSProperties
          }
        >
          {items.map((child, i) => {
            // Eğer child bir ReactElement ise key okunabilir
            const key =
              isValidElement(child) && child.key != null
                ? child.key
                : `slide-${i}`;

            return (
              <div
                key={key}
                className={twMerge(
                  clsx("embla__slide shrink-0", itemClassName)
                )}
                style={{ flex: "0 0 var(--slide-basis)" }}
              >
                {child}
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrows */}
      {arrows && count > slidesToShow && (
        <>
          <button
            onClick={scrollPrev}
            className="bg-background/70 hover:bg-background absolute top-1/2 left-2 -translate-y-1/2 rounded-full p-2 shadow"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="bg-background/70 hover:bg-background absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2 shadow"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {dots && scrollSnaps.length > 1 && (
        <div
          className={twMerge(
            "pointer-events-none absolute z-10 flex gap-2",
            dotPosition === "left" || dotPosition === "right"
              ? "flex-col"
              : "flex-row",
            dotWrapperPos
          )}
        >
          {scrollSnaps.map((snap) => (
            <button
              key={`snap-${snap}`}
              className={clsx(
                "bg-border pointer-events-auto h-2 w-2 rounded-full transition-colors",
                scrollSnaps[selectedIndex] === snap && "bg-foreground"
              )}
              onClick={() => scrollTo(scrollSnaps.indexOf(snap))}
              aria-label={`Go to slide ${snap}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
