"use client";

import React, { FC, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";

import { skeletonFill, type SkeletonableProps } from "../lib/skeleton";
import { SkeletonSlot } from "../lib/SkeletonSlot";
import { touchTargetSquareClass } from "../lib/sizeClasses";
import { ArrowsPlacement, CarouselControls, DotPosition, DotsPlacement, ResponsiveItem } from "./types";
import { getDotClass } from "./utils";

export type CarouselProps = SkeletonableProps & {
  children: React.ReactNode[];
  className?: string;
  containerClassName?: string;
  itemClassName?: string;
  viewportClassName?: string;
  /** Ok ve nokta göstergelerinin aktif rengi. Varsayılan: `neutral`. */
  color?: ColorRole;
  /**
   * Carousel bölgesinin erişilebilir adı (ör. "Kampanyalar"). Sayfada birden
   * fazla carousel varsa her birine ayırt edici bir ad verin. Varsayılan:
   * `"Slayt gösterisi"`.
   */
  label?: string;

  /** Core */
  loop?: boolean;
  /** Fare/dokunma ile sürükleyerek gezinme. Varsayılan: `true`. */
  draggable?: boolean;
  speed?: number;

  /** Viewport */
  slidesToShow?: number;
  slidesToScroll?: number;
  align?: "start" | "center" | "end";
  containScroll?: "trimSnaps" | "keepSnaps";

  /**
   * Otomatik ilerleme. Üzerine gelince / klavye odağı içerideyken duraklar,
   * durdur/başlat düğmesi gösterilir (WCAG 2.2.2) ve `prefers-reduced-motion`
   * açıksa kendiliğinden başlamaz.
   */
  autoplay?: boolean;
  autoplayDelay?: number;
  /** Kullanıcı sürükler/odaklanırsa otomatik oynatma kalıcı olarak durur. Varsayılan: `true`. */
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
  /** Seçili slayt değişirken: `(önceki, yeni)`. */
  beforeChange?: (current: number, next: number) => void;
  /** Kaydırma animasyonu yeni slaytta durduğunda. */
  afterChange?: (current: number) => void;

  /** Dış state aynası — `CarouselControls` her değiştiğinde çağrılır. */
  onStateChange?: (state: CarouselControls) => void;
};

/* ========== Responsive Slides Hook ========== */
const useResponsiveSlides = (baseShow: number, baseScroll: number, responsive?: ResponsiveItem[]) => {
  const [state, setState] = useState({
    slidesToShow: Math.max(1, baseShow),
    slidesToScroll: Math.max(1, baseScroll || baseShow),
  });

  useEffect(() => {
    if (!responsive?.length) {
      setState({ slidesToShow: Math.max(1, baseShow), slidesToScroll: Math.max(1, baseScroll || baseShow) });
      return;
    }

    const onResize = () => {
      const width = window.innerWidth;
      const sorted = [...responsive].sort((a, b) => a.breakpoint - b.breakpoint);

      let appliedShow = baseShow;
      let appliedScroll = baseScroll || baseShow;

      for (const r of sorted) {
        if (width <= r.breakpoint) {
          appliedShow = r.slidesToShow;
          appliedScroll = r.slidesToScroll ?? r.slidesToShow;
          break;
        }
      }

      setState({ slidesToShow: Math.max(1, appliedShow), slidesToScroll: Math.max(1, appliedScroll) });
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [baseShow, baseScroll, responsive]);

  return state;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/* ========== Oklar ========== */

/**
 * Oklar çıplak ikon (arka plan/daire yok, kullanıcı isteği); rastgele slayt
 * içeriği üzerinde okunabilirlik için `drop-shadow`. `hover` görünürlüğünde
 * `group-hover` ile belirir, klavye odağında (`focus-visible`) yine görünür.
 * Faz 15: dokunmatikte görünmez 44px hedef (`touchTargetSquareClass`).
 */
function CarouselArrows({
  placement,
  visibility,
  hidden,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  placement: ArrowsPlacement;
  visibility: "always" | "hover";
  hidden: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const sides = placement === "sides";
  const base = cn(
    "relative text-mari-foreground drop-shadow-sm transition-colors hover:text-mari-primary disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
    sides ? touchTargetSquareClass.md : touchTargetSquareClass.sm,
    visibility === "hover" && "opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100",
    // İskelette yer kaplamaya devam eder ama görünmez ve tab sırasından çıkar.
    hidden && "invisible"
  );
  const iconClass = sides ? "h-7 w-7" : "h-6 w-6";
  const prev = (
    <button type="button" onClick={onPrev} disabled={!canPrev} aria-label="Önceki slayt" className={cn(base, "p-1", sides && "absolute top-1/2 left-4 -translate-y-1/2")}>
      <ChevronLeftIcon className={iconClass} aria-hidden />
    </button>
  );
  const next = (
    <button type="button" onClick={onNext} disabled={!canNext} aria-label="Sonraki slayt" className={cn(base, "p-1", sides && "absolute top-1/2 right-4 -translate-y-1/2")}>
      <ChevronRightIcon className={iconClass} aria-hidden />
    </button>
  );

  if (sides) {
    return (
      <>
        {prev}
        {next}
      </>
    );
  }
  return (
    <div
      className={cn("absolute z-10 flex gap-1", {
        "top-4 left-4": placement === "top-left",
        "top-4 right-4": placement === "top-right",
        "bottom-4 left-4": placement === "bottom-left",
        "bottom-4 right-4": placement === "bottom-right",
      })}
    >
      {prev}
      {next}
    </div>
  );
}

const DOT_WRAPPER_POS: Record<DotPosition, string> = {
  top: "top-2 left-1/2 -translate-x-1/2",
  left: "left-2 top-1/2 -translate-y-1/2",
  right: "right-2 top-1/2 -translate-y-1/2",
  bottom: "bottom-2 left-1/2 -translate-x-1/2",
};

/* ========== Carousel Component ========== */
export const Carousel: FC<CarouselProps> = ({
  children,
  className,
  containerClassName,
  itemClassName,
  viewportClassName,
  color = "neutral",
  label = "Slayt gösterisi",
  skeleton = false,

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
  onStateChange,
}) => {
  const items = React.Children.toArray(children);
  const count = items.length;

  const { slidesToShow, slidesToScroll } = useResponsiveSlides(baseSlidesToShow, baseSlidesToScroll ?? baseSlidesToShow, responsive);
  const reducedMotion = usePrefersReducedMotion();

  const emblaOptions = useMemo(
    () => ({
      loop,
      align,
      containScroll,
      slidesToScroll,
      duration: speed,
      // Eskiden `draggable` Embla'ya aynen geçiliyordu — v8'de böyle bir
      // seçenek yok, `watchDrag` sabit `true`du: `draggable={false}` sürüklemeyi
      // KAPATMIYORDU (tarayıcıda doğrulandı). İskelette de sürükleme kapalı.
      watchDrag: draggable && !skeleton,
      // Varsayılan 0: kenarı görünür alana DEĞEN (0px görünen) komşu slayt da
      // "görünür" sayılıyor ve Tab'la odaklanabiliyordu (ölçüldü). Yarısından
      // fazlası görünen slayt görünür sayılır.
      inViewThreshold: 0.5,
    }),
    [loop, align, draggable, skeleton, containScroll, slidesToScroll, speed]
  );

  // Seçenekler değişince eklenti yeniden kurulur (eskiden ilk render'daki
  // `autoplayDelay` sonsuza dek kalıyordu). Üzerine gelince/odakta duraklar.
  const plugins = useMemo(
    () =>
      autoplay && !skeleton
        ? [
            Autoplay({
              delay: autoplayDelay,
              stopOnInteraction: autoplayStopOnInteraction,
              stopOnMouseEnter: true,
              stopOnFocusIn: true,
              playOnInit: !reducedMotion,
              rootNode: (emblaRoot) => emblaRoot.parentElement as HTMLElement,
            }),
          ]
        : [],
    [autoplay, skeleton, autoplayDelay, autoplayStopOnInteraction, reducedMotion]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [playing, setPlaying] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const togglePlay = useCallback(() => {
    const ap = emblaApi?.plugins().autoplay;
    if (!ap) return;
    if (ap.isPlaying()) ap.stop();
    else ap.play();
  }, [emblaApi]);

  // Geri çağırmalar ref'te: satır içi fonksiyonlar her render'da değişince
  // Embla dinleyicileri yeniden bağlanmasın.
  const callbacksRef = useRef({ beforeChange, afterChange });
  useEffect(() => {
    callbacksRef.current = { beforeChange, afterChange };
  });

  useEffect(() => {
    if (!emblaApi) return;
    let prevIndex = emblaApi.selectedScrollSnap();
    let settledIndex = prevIndex;

    const sync = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    // Eskiden `beforeChange(from, from)` HER kaydırma karesinde (`scroll`)
    // çağrılıyordu — `next` hep `current`a eşitti.
    const onSelect = () => {
      const next = emblaApi.selectedScrollSnap();
      if (next !== prevIndex) callbacksRef.current.beforeChange?.(prevIndex, next);
      prevIndex = next;
      sync();
    };
    const onSettle = () => {
      const idx = emblaApi.selectedScrollSnap();
      if (idx === settledIndex) return;
      settledIndex = idx;
      callbacksRef.current.afterChange?.(idx);
    };
    // Görünmeyen slaytlar klavye/ekran okuyucudan çıkar — eskiden ekran
    // dışındaki slaytın düğmesine Tab ile gidilebiliyordu (odak görünmez
    // yerde kayboluyordu). `inert` DOM'a doğrudan yazılır: React 18 peer'ı
    // bu özniteliği prop olarak tanımıyor.
    const onInView = () => {
      const inView = new Set(emblaApi.slidesInView());
      if (inView.size === 0) return;
      emblaApi.slideNodes().forEach((node, i) => {
        const hidden = !inView.has(i);
        node.toggleAttribute("inert", hidden);
        if (hidden) node.setAttribute("aria-hidden", "true");
        else node.removeAttribute("aria-hidden");
      });
    };
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);

    sync();
    onInView();
    setPlaying(Boolean(emblaApi.plugins().autoplay?.isPlaying()));

    emblaApi
      .on("select", onSelect)
      .on("reInit", sync)
      .on("settle", onSettle)
      .on("slidesInView", onInView)
      .on("autoplay:play", onPlay)
      .on("autoplay:stop", onStop);

    // Eskiden `reInit`/`pointerDown` anonim fonksiyonla bağlanıp hiç
    // çözülmüyordu — her effect tekrarında dinleyici birikiyordu.
    return () => {
      emblaApi
        .off("select", onSelect)
        .off("reInit", sync)
        .off("settle", onSettle)
        .off("slidesInView", onInView)
        .off("autoplay:play", onPlay)
        .off("autoplay:stop", onStop);
    };
  }, [emblaApi]);

  /* State'i ref + callback ile dışarı ver */
  useEffect(() => {
    const state: CarouselControls = { selectedIndex, scrollSnaps, canScrollPrev, canScrollNext, scrollPrev, scrollNext, scrollTo };
    if (controlsRef) controlsRef.current = state;
    onStateChange?.(state);
  }, [controlsRef, onStateChange, selectedIndex, scrollSnaps, canScrollPrev, canScrollNext, scrollPrev, scrollNext, scrollTo]);

  // Ok tuşları: odak carousel'in içindeki herhangi bir öğedeyken (ok, nokta,
  // slayt içeriği) önceki/sonraki. Olay içerideki etkileşimli öğelerden
  // kabarcıklanır; bölgenin kendisi odaklanabilir değil.
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    };
    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [scrollPrev, scrollNext]);

  const showArrows = arrows && count > slidesToShow;
  const showDots = dots && scrollSnaps.length > 1;
  const showPlayToggle = autoplay && !skeleton;
  const verticalDots = dotsPlacement === "overlay" && (dotPosition === "left" || dotPosition === "right");

  const playToggle = showPlayToggle && (
    <button
      type="button"
      onClick={togglePlay}
      aria-label={playing ? "Otomatik oynatmayı durdur" : "Otomatik oynatmayı başlat"}
      className={cn(
        "pointer-events-auto relative text-mari-foreground drop-shadow-sm transition-colors hover:text-mari-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
        touchTargetSquareClass.xs
      )}
    >
      {playing ? <PauseIcon className="h-4 w-4" aria-hidden /> : <PlayIcon className="h-4 w-4" aria-hidden />}
    </button>
  );

  const dotsContent = (
    <div
      aria-hidden={skeleton || undefined}
      className={cn(
        "flex items-center gap-2",
        dotsPlacement === "overlay" && "pointer-events-none absolute z-10",
        dotsPlacement === "overlay" && (verticalDots ? "flex-col" : "flex-row"),
        dotsPlacement === "overlay" && DOT_WRAPPER_POS[dotPosition],
        dotsPlacement === "outside" && "mt-3 flex-row justify-center",
        typeof dots === "object" ? dots.className : undefined
      )}
    >
      {!verticalDots && playToggle}
      {scrollSnaps.map((_, idx) =>
        skeleton ? (
          <span key={`snap-${idx}`} className={cn("h-1 w-4 rounded-full", skeletonFill(true))} />
        ) : (
          <button
            key={`snap-${idx}`}
            type="button"
            onClick={() => scrollTo(idx)}
            aria-label={`${idx + 1}. slayta git`}
            aria-current={selectedIndex === idx ? "true" : undefined}
            className={cn(
              getDotClass(selectedIndex === idx, color),
              // 4px'lik çubuk: dokunmatikte 24×24 görünmez hedef (WCAG 2.5.8),
              // 8px aralıkla komşuya taşmaz.
              "relative pointer-coarse:before:absolute pointer-coarse:before:-inset-x-1 pointer-coarse:before:-inset-y-2.5",
              dotsPlacement === "overlay" && "pointer-events-auto"
            )}
          />
        )
      )}
    </div>
  );

  return (
    <section
      className={className}
      aria-roledescription="carousel"
      aria-label={label}
      aria-busy={skeleton || undefined}
      ref={rootRef}
    >
      <div className="group relative w-full">
        <div className={cn("overflow-hidden", viewportClassName)} ref={emblaRef}>
          <div
            className={cn("flex w-full will-change-transform select-none", containerClassName)}
            style={{ "--slide-basis": `calc(100% / ${slidesToShow})` } as React.CSSProperties}
            // Otomatik oynarken her geçişi duyurmak gürültü; elle gezinmede duyur (APG).
            aria-live={playing ? "off" : "polite"}
          >
            {items.map((child, i) => {
              const key = isValidElement(child) && child.key != null ? child.key : `slide-${i}`;
              return (
                <div
                  key={key}
                  role="group"
                  aria-roledescription="slayt"
                  aria-label={`${i + 1} / ${count}`}
                  className={cn("embla__slide shrink-0", itemClassName)}
                  style={{ flex: "0 0 var(--slide-basis)" }}
                >
                  <SkeletonSlot on={skeleton} placeholder={<div className={cn("size-full rounded-lg", skeletonFill(true))} />}>
                    {child}
                  </SkeletonSlot>
                </div>
              );
            })}
          </div>
        </div>

        {showArrows && (
          <CarouselArrows
            placement={arrowsPlacement}
            visibility={arrowsVisibility}
            hidden={skeleton}
            canPrev={canScrollPrev}
            canNext={canScrollNext}
            onPrev={scrollPrev}
            onNext={scrollNext}
          />
        )}
        {showDots && dotsPlacement === "overlay" && dotsContent}
        {/* Dikey noktalarda / noktasız durumda durdur düğmesi sağ altta. */}
        {(verticalDots || !showDots) && playToggle && <div className="absolute right-3 bottom-3 z-10">{playToggle}</div>}
      </div>

      {showDots && dotsPlacement === "outside" && dotsContent}
    </section>
  );
};
