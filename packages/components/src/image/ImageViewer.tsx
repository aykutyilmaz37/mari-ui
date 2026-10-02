"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeftIcon, ChevronRightIcon, ImageOffIcon, Loader2Icon, XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { Button } from "../button";
import { useModalBehavior, usePresence } from "../lib/overlay";
import type { ImageLoader, ImageSource } from "./types";
import { normalizeSource, resolveImage } from "./utils";
import {
  IDENTITY,
  MAX_SCALE,
  MIN_SCALE,
  clampPan,
  containSize,
  dismissProgress,
  dragIntent,
  originTransform,
  shouldDismiss,
  swipeOutcome,
  toggleZoom,
  visibleSlides,
  zoomAround,
  type Size,
  type ViewState,
} from "./viewerUtils";

export interface ImageViewerItem {
  key: React.Key;
  /** Tam çözünürlüklü kaynak (video için video adresi). */
  src: ImageSource;
  alt: string;
  /** Asıl görsel yüklenene kadar altta gösterilen küçük boy; alt şeritte de kullanılır. */
  thumbnail?: string;
  caption?: React.ReactNode;
  /** Varsayılan: `"image"`. Videoda yakınlaştırma yoktur, yerel oynatıcı denetimleri kullanılır. */
  type?: "image" | "video";
  /** Video kapak görseli. */
  poster?: string;
  /** Video altyazı/açıklama izleri (WebVTT). Konuşma içeren videolarda verin. */
  tracks?: { src: string; srcLang: string; label: string; kind?: "captions" | "subtitles" | "descriptions"; default?: boolean }[];
}

export interface ImageViewerProps {
  items: ImageViewerItem[];
  open: boolean;
  onClose: () => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  loader?: ImageLoader;
  /**
   * Bir öğenin sayfadaki küçük resmi (genelde tetikleyici düğme): açılış/kapanış
   * o kutudan büyüyerek/küçülerek olur, kapanınca odak ona döner.
   */
  getOriginElement?: (index: number) => HTMLElement | null | undefined;
  /** Alt şerit. Varsayılan: birden fazla öğe varsa. */
  thumbnails?: boolean;
  /** Üst çubuğa ek eylemler (paylaş, sil…). */
  actions?: (item: ImageViewerItem, index: number) => React.ReactNode;
  "aria-label"?: string;
}

const EXIT_MS = 250;
const ENTER_MS = 300;
const SETTLE_MS = 250;
const SLIDE_GAP = 24;
const DOUBLE_TAP_MS = 280;
const ZOOM_STEP = 1.5;
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

interface Gesture {
  kind: "pending" | "swipe" | "dismiss" | "pan" | "pinch";
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastT: number;
  vx: number;
  vy: number;
  dx: number;
  dy: number;
  startView: ViewState;
  startDist: number;
  startMid: { x: number; y: number };
  pointerType: string;
}

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

function setStyle(el: HTMLElement | null | undefined, transform: string, ms: number) {
  if (!el) return;
  el.style.transition = ms > 0 ? `transform ${ms}ms ${EASE}, opacity ${ms}ms ${EASE}` : "none";
  el.style.transform = transform;
}

function zoomLevelOf(scale: number): "min" | "mid" | "max" {
  if (scale <= MIN_SCALE) return "min";
  return scale >= MAX_SCALE ? "max" : "mid";
}

/** Başlangıç durumunu uygula ki ardından gelen geçiş ondan başlasın. */
function forceReflow(el: HTMLElement | null | undefined) {
  el?.getBoundingClientRect();
}

const viewTransform = (v: ViewState) => `translate3d(${v.x}px, ${v.y}px, 0) scale(${v.scale})`;

/** Küçük resim adresi: verilen `thumbnail` → `loader` küçük boy → kaynağın kendisi. */
export function viewerThumbnail(item: ImageViewerItem, loader: ImageLoader | undefined, width = 160): string | undefined {
  if (item.thumbnail) return item.thumbnail;
  if (item.type === "video") return item.poster;
  const source = normalizeSource(item.src);
  if (!source) return undefined;
  return loader ? loader({ src: source.src, width }) : source.src;
}

function ViewerSlide({
  item,
  offset,
  loader,
}: {
  item: ImageViewerItem;
  offset: number;
  loader?: ImageLoader;
}) {
  const active = offset === 0;
  const source = normalizeSource(item.src);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const thumb = viewerThumbnail(item, loader);
  const resolved = source && item.type !== "video" ? resolveImage(source, { loader }) : null;

  return (
    <div
      data-viewer-slide=""
      data-viewer-active={active ? "" : undefined}
      aria-hidden={active ? undefined : true}
      className="absolute inset-0"
      style={{ transform: `translateX(calc(${offset * 100}% + ${offset * SLIDE_GAP}px))` }}
    >
      <div data-viewer-zoom="" className="relative flex size-full items-center justify-center will-change-transform">
        {item.type === "video" ? (
          source && (
            // Altyazılar `tracks` ile tüketiciden gelir (kural eşlenmiş <track>ları göremiyor).
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={source.src}
              poster={item.poster}
              controls
              playsInline
              preload="metadata"
              tabIndex={active ? 0 : -1}
              aria-label={item.alt}
              className="max-h-full max-w-full"
            >
              {item.tracks?.map((t) => (
                <track key={t.src} kind={t.kind ?? "captions"} src={t.src} srcLang={t.srcLang} label={t.label} default={t.default} />
              ))}
            </video>
          )
        ) : (
          <>
            {thumb && !loaded && !failed && (
              <img src={thumb} alt="" aria-hidden draggable={false} className="absolute inset-0 size-full object-contain blur-sm" />
            )}
            {resolved && !failed && (
              <img
                data-viewer-full=""
                src={resolved.src}
                srcSet={resolved.srcSet}
                sizes="100vw"
                alt={item.alt}
                draggable={false}
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                className={cn(
                  "absolute inset-0 size-full object-contain transition-opacity duration-300 motion-reduce:transition-none",
                  loaded ? "opacity-100" : "opacity-0"
                )}
              />
            )}
            {!loaded && !failed && !thumb && <Loader2Icon aria-hidden className="size-8 animate-spin text-mari-muted" />}
            {failed && (
              <div className="flex flex-col items-center gap-2 text-sm text-mari-muted">
                <ImageOffIcon aria-hidden className="size-10" />
                Görsel yüklenemedi
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Faz 16.7 — tam ekran görsel/video görüntüleyici. Yapı iPhone Fotoğraflar'dan:
 * küçük resimden büyüyerek açılış, yana kaydırarak geçiş, aşağı çekerek kapatma,
 * iki parmak / tekerlek / çift dokunuşla yakınlaştırma + kaydırma, dokununca
 * araç çubuklarını gizleme, alt şerit. Görünüm token'lardan (arka plan =
 * `mari-surface`: açık temada beyaz, koyu temada koyu — iPhone gibi).
 * `Image`'ın `preview`'ı ve `ImageGallery` bunu kullanır.
 */
export function ImageViewer({
  items,
  open,
  onClose,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  loader,
  getOriginElement,
  thumbnails,
  actions,
  "aria-label": ariaLabel = "Görsel görüntüleyici",
}: ImageViewerProps) {
  const [rawIndex, setIndex] = useControllableState({ value: indexProp, defaultValue: defaultIndex, onChange: onIndexChange });
  const count = items.length;
  const index = Math.min(Math.max(rawIndex ?? 0, 0), Math.max(count - 1, 0));
  const item = items[index];
  const present = usePresence(open, EXIT_MS);

  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const view = useRef<ViewState>(IDENTITY);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const busy = useRef(false);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const goTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const indexRef = useRef(index);
  indexRef.current = index;
  // Yalnız eşik geçişlerinde render: hareket başına değil.
  const [zoomLevel, setZoomLevel] = useState<"min" | "mid" | "max">("min");
  const zoomed = zoomLevel !== "min";
  const [chrome, setChrome] = useState(true);

  useModalBehavior(open, panelRef, onClose, {
    getInitialFocus: (panel) => panel.querySelector<HTMLElement>("[data-viewer-close]"),
  });

  const isVideo = item?.type === "video";
  const showStrip = (thumbnails ?? count > 1) && count > 1;

  const zoomEl = () => trackRef.current?.querySelector<HTMLElement>("[data-viewer-active] [data-viewer-zoom]") ?? null;
  const stageSize = (): Size => ({ width: stageRef.current?.clientWidth ?? 0, height: stageRef.current?.clientHeight ?? 0 });
  const baseSize = (): Size => {
    const imgs = zoomEl()?.querySelectorAll("img");
    const img = Array.from(imgs ?? []).find((el) => el.naturalWidth > 0);
    return img ? containSize({ width: img.naturalWidth, height: img.naturalHeight }, stageSize()) : stageSize();
  };
  const toStagePoint = (clientX: number, clientY: number) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 };
  };

  const applyView = useCallback((next: ViewState, ms = 0) => {
    view.current = next;
    setStyle(zoomEl(), viewTransform(next), ms);
    setZoomLevel(zoomLevelOf(next.scale));
  }, []);

  const setTrack = (dx: number, ms = 0) => setStyle(trackRef.current, `translate3d(${dx}px, 0, 0)`, ms);

  const setDismiss = (dx: number, dy: number, ms = 0) => {
    const p = dismissProgress(dy, stageSize().height);
    setStyle(zoomEl(), `translate3d(${dx}px, ${Math.max(dy, 0)}px, 0) scale(${1 - p * 0.3})`, ms);
    const backdrop = backdropRef.current;
    if (backdrop) {
      backdrop.style.transition = ms > 0 ? `opacity ${ms}ms ${EASE}` : "none";
      backdrop.style.opacity = String(1 - p);
    }
  };

  const go = useCallback(
    (dir: -1 | 1) => {
      const next = indexRef.current + dir;
      if (busy.current) return;
      if (next < 0 || next >= count) {
        setTrack(0, SETTLE_MS);
        return;
      }
      busy.current = true;
      const width = stageSize().width;
      setTrack(reducedMotion() ? 0 : -dir * (width + SLIDE_GAP), reducedMotion() ? 0 : SETTLE_MS);
      clearTimeout(goTimer.current);
      goTimer.current = setTimeout(() => {
        busy.current = false;
        setIndex(next);
      }, reducedMotion() ? 0 : SETTLE_MS);
    },
    [count, setIndex]
  );

  // Öğe değişince: şerit ve yakınlaştırma sıfır, komşu dilimlerdeki eski dönüşümler temizlenir, videolar durur.
  useLayoutEffect(() => {
    if (!present) return;
    setTrack(0);
    trackRef.current?.querySelectorAll<HTMLElement>("[data-viewer-zoom]").forEach((el) => setStyle(el, "", 0));
    view.current = IDENTITY;
    setZoomLevel("min");
    trackRef.current?.querySelectorAll("video").forEach((v) => {
      if (!v.paused && !v.closest("[data-viewer-active]")) v.pause();
    });
  }, [index, present]);

  // Alt şeritte geçerli öğe ortada.
  useEffect(() => {
    const strip = stripRef.current;
    const btn = strip?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!strip || !btn) return;
    strip.scrollTo?.({ left: btn.offsetLeft - strip.clientWidth / 2 + btn.offsetWidth / 2, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [index, present, showStrip]);

  // Açılış: küçük resimden büyüyerek (FLIP), yoksa solarak.
  useLayoutEffect(() => {
    if (!open) return;
    setChrome(true);
    const zoom = zoomEl();
    const backdrop = backdropRef.current;
    const origin = getOriginElement?.(indexRef.current);
    const originImg = origin?.querySelector("img");
    if (backdrop) {
      backdrop.style.transition = "none";
      backdrop.style.opacity = "0";
    }
    if (zoom && origin && !reducedMotion()) {
      const from = (originImg ?? origin).getBoundingClientRect();
      const stage = stageRef.current?.getBoundingClientRect();
      const fit =
        originImg && originImg.naturalWidth > 0
          ? containSize({ width: originImg.naturalWidth, height: originImg.naturalHeight }, stageSize())
          : stageSize();
      if (stage) {
        const t = originTransform(from, {
          left: stage.left + (stage.width - fit.width) / 2,
          top: stage.top + (stage.height - fit.height) / 2,
          width: fit.width,
          height: fit.height,
        });
        setStyle(zoom, `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.scale})`, 0);
      }
    } else if (zoom) {
      zoom.style.opacity = "0";
    }
    forceReflow(zoom);
    const ms = reducedMotion() ? 0 : ENTER_MS;
    setStyle(zoom, viewTransform(IDENTITY), ms);
    if (zoom) zoom.style.opacity = "1";
    if (backdrop) {
      backdrop.style.transition = `opacity ${ms}ms ${EASE}`;
      backdrop.style.opacity = "1";
    }
    // Açılışta bir kez; `getOriginElement` her render'da yeni olabilir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Kapanış: geçerli öğenin küçük resmine küçülerek; odak ona döner.
  const wasOpen = useRef(open);
  useEffect(() => {
    const closing = wasOpen.current && !open;
    wasOpen.current = open;
    if (!closing) return;
    clearTimeout(tapTimer.current);
    gesture.current = null;
    pointers.current.clear();
    const origin = getOriginElement?.(indexRef.current);
    const zoom = zoomEl();
    const ms = reducedMotion() ? 0 : EXIT_MS;
    const rect = origin?.getBoundingClientRect();
    const onScreen = rect && rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;
    const zoomRect = zoom?.getBoundingClientRect();
    if (zoom && rect && onScreen && zoomRect && !reducedMotion()) {
      const base = baseSize();
      const current = view.current.scale > MIN_SCALE ? IDENTITY : view.current;
      const target = {
        left: zoomRect.left + (zoomRect.width - base.width) / 2,
        top: zoomRect.top + (zoomRect.height - base.height) / 2,
        width: base.width,
        height: base.height,
      };
      const t = originTransform(rect, target);
      setStyle(zoom, viewTransform(current), 0);
      forceReflow(zoom);
      setStyle(zoom, `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.scale})`, ms);
    } else if (zoom) {
      zoom.style.transition = `opacity ${ms}ms ${EASE}`;
      zoom.style.opacity = "0";
    }
    const backdrop = backdropRef.current;
    if (backdrop) {
      backdrop.style.transition = `opacity ${ms}ms ${EASE}`;
      backdrop.style.opacity = "0";
    }
    setChrome(false);
    // Modal davranışı odağı açılıştan önceki öğeye döndürdü; geçerli öğenin küçük resmi daha doğru hedef.
    origin?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(
    () => () => {
      clearTimeout(tapTimer.current);
      clearTimeout(goTimer.current);
    },
    []
  );

  // Tekerlek / izleme dörtgeni sıkıştırması: imleç çevresinde yakınlaştır.
  useEffect(() => {
    const stage = stageRef.current;
    if (!present || !stage) return;
    const onWheel = (event: WheelEvent) => {
      if (isVideo) return;
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.002));
      applyView(zoomAround(view.current, view.current.scale * factor, toStagePoint(event.clientX, event.clientY), baseSize(), stageSize()));
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present, isVideo, applyView]);

  const handleTap = (event: React.PointerEvent) => {
    const now = event.timeStamp;
    const prev = lastTap.current;
    if (prev && now - prev.t < DOUBLE_TAP_MS && Math.hypot(event.clientX - prev.x, event.clientY - prev.y) < 30) {
      lastTap.current = null;
      clearTimeout(tapTimer.current);
      if (!isVideo) applyView(toggleZoom(view.current, toStagePoint(event.clientX, event.clientY), baseSize(), stageSize()), SETTLE_MS);
      return;
    }
    lastTap.current = { t: now, x: event.clientX, y: event.clientY };
    // Dokunmatikte tek dokunuş araç çubuklarını gizler/gösterir (çift dokunuştan ayırmak için bekler).
    if (event.pointerType !== "mouse") {
      clearTimeout(tapTimer.current);
      tapTimer.current = setTimeout(() => setChrome((c) => !c), DOUBLE_TAP_MS);
    }
  };

  const startSingle = (x: number, y: number, t: number, pointerType: string): Gesture => ({
    kind: view.current.scale > MIN_SCALE ? "pan" : "pending",
    startX: x,
    startY: y,
    lastX: x,
    lastY: y,
    lastT: t,
    vx: 0,
    vy: 0,
    dx: 0,
    dy: 0,
    startView: view.current,
    startDist: 0,
    startMid: { x: 0, y: 0 },
    pointerType,
  });

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (busy.current || !open) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Fareyle videonun kendi denetimleri çalışsın.
    if (event.pointerType === "mouse" && (event.target as HTMLElement).closest("video")) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && !isVideo) {
      const [a, b] = Array.from(pointers.current.values()) as [{ x: number; y: number }, { x: number; y: number }];
      gesture.current = {
        ...startSingle(event.clientX, event.clientY, event.timeStamp, event.pointerType),
        kind: "pinch",
        startView: view.current,
        startDist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        startMid: toStagePoint((a.x + b.x) / 2, (a.y + b.y) / 2),
      };
      setTrack(0, SETTLE_MS);
      return;
    }
    if (pointers.current.size === 1) gesture.current = startSingle(event.clientX, event.clientY, event.timeStamp, event.pointerType);
  };

  const movePinch = (g: Gesture) => {
    const pts = Array.from(pointers.current.values());
    if (pts.length < 2) return;
    const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }];
    const mid = toStagePoint((a.x + b.x) / 2, (a.y + b.y) / 2);
    const scale = g.startView.scale * (Math.hypot(a.x - b.x, a.y - b.y) / g.startDist);
    const z = zoomAround(g.startView, Math.max(scale, MIN_SCALE), g.startMid, baseSize(), stageSize());
    applyView({ scale: z.scale, x: z.x + mid.x - g.startMid.x, y: z.y + mid.y - g.startMid.y });
  };

  const trackDrag = (g: Gesture, event: React.PointerEvent) => {
    const dt = event.timeStamp - g.lastT;
    if (dt > 0) {
      g.vx = (event.clientX - g.lastX) / dt;
      g.vy = (event.clientY - g.lastY) / dt;
    }
    g.lastX = event.clientX;
    g.lastY = event.clientY;
    g.lastT = event.timeStamp;
    g.dx = event.clientX - g.startX;
    g.dy = event.clientY - g.startY;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || !pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (g.kind === "pinch") {
      movePinch(g);
      return;
    }
    trackDrag(g, event);

    if (g.kind === "pending") {
      const intent = dragIntent(g.dx, g.dy);
      if (!intent) return;
      g.kind = intent;
      try {
        stageRef.current?.setPointerCapture(event.pointerId);
      } catch {
        /* sentetik olaylarda pointer yakalanamayabilir */
      }
    }
    if (g.kind === "swipe") {
      const atEdge = (indexRef.current === 0 && g.dx > 0) || (indexRef.current === count - 1 && g.dx < 0);
      setTrack(atEdge ? g.dx * 0.35 : g.dx);
    } else if (g.kind === "dismiss") {
      setDismiss(g.dx, g.dy);
    } else if (g.kind === "pan") {
      applyView({ scale: g.startView.scale, x: g.startView.x + g.dx, y: g.startView.y + g.dy });
    }
  };

  const endPinch = (g: Gesture, timeStamp: number) => {
    const rest = Array.from(pointers.current.values())[0];
    if (rest) {
      // Bir parmak kaldı: kaydırmaya geç.
      gesture.current = { ...startSingle(rest.x, rest.y, timeStamp, g.pointerType), kind: "pan" };
      return;
    }
    gesture.current = null;
    const v = view.current;
    applyView(v.scale < 1.05 ? IDENTITY : clampPan(v, baseSize(), stageSize()), SETTLE_MS);
  };

  const endSwipe = (g: Gesture, stage: Size) => {
    const dir = swipeOutcome(g.dx, g.vx, stage.width);
    const target = indexRef.current + dir;
    if (dir !== 0 && target >= 0 && target < count) go(dir);
    else setTrack(0, SETTLE_MS);
  };

  const endDismiss = (g: Gesture, stage: Size) => {
    if (shouldDismiss(g.dy, g.vy, stage.height)) onClose();
    else setDismiss(0, 0, SETTLE_MS);
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!pointers.current.delete(event.pointerId) || !g) return;
    if (g.kind === "pinch") {
      endPinch(g, event.timeStamp);
      return;
    }
    if (pointers.current.size > 0) return;
    gesture.current = null;
    const stage = stageSize();
    if (g.kind === "pending" && event.type === "pointerup") handleTap(event);
    else if (g.kind === "swipe") endSwipe(g, stage);
    else if (g.kind === "dismiss") endDismiss(g, stage);
    else if (g.kind === "pan") applyView(clampPan(view.current, baseSize(), stage), SETTLE_MS);
  };

  const zoomBy = (factor: number) => applyView(zoomAround(view.current, view.current.scale * factor, { x: 0, y: 0 }, baseSize(), stageSize()), SETTLE_MS);

  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest("video, input, textarea, select")) return;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => go(-1),
      ArrowRight: () => go(1),
      "+": () => zoomBy(ZOOM_STEP),
      "=": () => zoomBy(ZOOM_STEP),
      "-": () => zoomBy(1 / ZOOM_STEP),
      "0": () => applyView(IDENTITY, SETTLE_MS),
    };
    const action = keys[event.key];
    if (!action || (isVideo && event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    action();
  };

  const keyHandler = useRef(onKeyDown);
  keyHandler.current = onKeyDown;
  useEffect(() => {
    const panel = panelRef.current;
    if (!present || !panel) return;
    const listener = (event: KeyboardEvent) => keyHandler.current(event);
    panel.addEventListener("keydown", listener);
    return () => panel.removeEventListener("keydown", listener);
  }, [present]);

  if (!present || typeof document === "undefined" || !item) return null;

  const chromeClass = cn(
    "absolute inset-x-0 z-10 bg-mari-surface/80 backdrop-blur-md transition-opacity duration-200 motion-reduce:transition-none",
    chrome && open ? "opacity-100" : "pointer-events-none opacity-0"
  );

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      onFocus={() => setChrome(true)}
      className={cn("fixed inset-0 z-mari-modal text-mari-foreground outline-none", !open && "pointer-events-none")}
    >
      <div ref={backdropRef} className="absolute inset-0 bg-mari-surface" />

      <div
        ref={stageRef}
        data-viewer-stage=""
        className={cn("absolute inset-0 touch-none overflow-hidden select-none", zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in", isVideo && "cursor-auto")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div ref={trackRef} className="absolute inset-0">
          {visibleSlides(index, count).map((i) => (
            <ViewerSlide key={items[i]!.key} item={items[i]!} offset={i - index} loader={loader} />
          ))}
        </div>
      </div>

      <div className={cn(chromeClass, "top-0 flex items-center gap-1 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2")}>
        <Button data-viewer-close variant="ghost" color="neutral" shape="circle" icon={<XIcon />} aria-label="Kapat" onClick={onClose} />
        <p className="min-w-0 flex-1 truncate text-center text-sm font-medium tabular-nums">
          {count > 1 ? `${index + 1} / ${count}` : item.alt}
        </p>
        {actions?.(item, index)}
        {!isVideo && (
          <>
            <Button
              variant="ghost"
              color="neutral"
              shape="circle"
              icon={<ZoomOutIcon />}
              aria-label="Uzaklaştır"
              disabled={zoomLevel === "min"}
              onClick={() => zoomBy(1 / ZOOM_STEP)}
              className="pointer-coarse:hidden"
            />
            <Button
              variant="ghost"
              color="neutral"
              shape="circle"
              icon={<ZoomInIcon />}
              aria-label="Yakınlaştır"
              disabled={zoomLevel === "max"}
              onClick={() => zoomBy(ZOOM_STEP)}
              className="pointer-coarse:hidden"
            />
          </>
        )}
      </div>

      {count > 1 && (
        <>
          {index > 0 && (
            <Button
              variant="ghost"
              color="neutral"
              shape="circle"
              size="lg"
              icon={<ChevronLeftIcon />}
              aria-label="Önceki"
              onClick={() => go(-1)}
              className={cn(chromeClass, "inset-x-auto top-1/2 left-3 hidden -translate-y-1/2 sm:inline-flex pointer-coarse:hidden")}
            />
          )}
          {index < count - 1 && (
            <Button
              variant="ghost"
              color="neutral"
              shape="circle"
              size="lg"
              icon={<ChevronRightIcon />}
              aria-label="Sonraki"
              onClick={() => go(1)}
              className={cn(chromeClass, "inset-x-auto top-1/2 right-3 hidden -translate-y-1/2 sm:inline-flex pointer-coarse:hidden")}
            />
          )}
        </>
      )}

      {(item.caption || showStrip) && (
        <div className={cn(chromeClass, "bottom-0 flex flex-col gap-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]")}>
          {item.caption && <div className="px-4 text-center text-sm">{item.caption}</div>}
          {showStrip && (
            <div ref={stripRef} role="group" aria-label="Küçük resimler" className="flex items-center gap-0.5 overflow-x-auto px-[50%] [scrollbar-width:none]">
              {items.map((it, i) => {
                const current = i === index;
                const src = viewerThumbnail(it, loader, 96);
                return (
                  <button
                    key={it.key}
                    type="button"
                    aria-label={it.alt || `Öğe ${i + 1}`}
                    aria-current={current ? "true" : undefined}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative h-11 shrink-0 overflow-hidden bg-mari-surface-alt transition-[width,margin] duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-mari-ring",
                      current ? "mx-1.5 w-11 rounded-sm" : "w-7"
                    )}
                  >
                    {src && <img src={src} alt="" draggable={false} loading="lazy" className="size-full object-cover" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {count > 1 ? `${item.alt}, ${index + 1} / ${count}` : item.alt}
      </p>
    </div>,
    document.body
  );
}
