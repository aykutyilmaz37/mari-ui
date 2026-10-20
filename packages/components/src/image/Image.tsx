"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";
import { EyeIcon, ImageOffIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { skeletonBoxProps } from "../lib/skeleton";
import { ImageViewer } from "./ImageViewer";
import type { ImageFit, ImageLoader, ImagePreviewConfig, ImageProps } from "./types";
import { getBoxStyle, imgAttributes, normalizeSource, resolveBlurSource, resolveImage } from "./utils";

export type { ImageProps };

const FIT_CLASS: Record<ImageFit, string> = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
  "scale-down": "object-scale-down",
};

type Status = "loading" | "loaded" | "error";

function DefaultFallback() {
  return (
    <span className="flex size-full min-h-16 flex-col items-center justify-center gap-1 p-2 text-center text-xs text-mari-muted">
      <ImageOffIcon aria-hidden className="size-6" />
      Görsel yüklenemedi
    </span>
  );
}

/** Yüklenirken: bulanık ön izleme → özel içerik → parıltı (öncelik sırasıyla). */
function PlaceholderLayer({ blurSrc, custom, shimmer, fit }: Readonly<{ blurSrc: string | null; custom: React.ReactNode; shimmer: boolean; fit: ImageFit }>) {
  if (blurSrc) {
    return <img src={blurSrc} alt="" aria-hidden draggable={false} className={cn("absolute inset-0 size-full scale-110 blur-lg", FIT_CLASS[fit])} />;
  }
  if (custom) {
    return (
      <span aria-hidden className="absolute inset-0 flex items-center justify-center">
        {custom}
      </span>
    );
  }
  return shimmer ? <span aria-hidden className={cn("absolute inset-0", skeletonBoxProps().className)} /> : null;
}

function placeholderNode(placeholder: ImageProps["placeholder"]): React.ReactNode {
  return placeholder !== undefined && typeof placeholder !== "boolean" && typeof placeholder !== "string" ? placeholder : null;
}

/*
 * yapı ant.design Image'dan (progressive loading: önce düşük
 * çözünürlüklü/bulanık ön izleme, asıl görsel yüklenince yumuşak geçiş;
 * `fallback`; `preview`), görünüm token'lardan. Framework'e bağlı değil: düz
 * `<img>` (`loading="lazy"`, `decoding="async"`, `srcSet`/`sizes`); CDN ve
 * boyutlandırma `loader` ile, `next/image`'a gerek yok.
 */
/**
 * Dış kutu yeri önceden ayırır (`aspectRatio` ya da `width`/`height`) →
 * yüklenince sayfa kaymaz. `preview` ile kutu bir düğme olur ve tam ekran
 * `ImageViewer` açılır.
 */
export const Image = /* @__PURE__ */ forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt,
    width,
    height,
    aspectRatio,
    fit = "cover",
    loader,
    widths,
    sizes,
    quality,
    placeholder,
    fallback,
    loading = "lazy",
    priority = false,
    preview = false,
    fade = true,
    skeleton = false,
    className,
    wrapperClassName,
    style,
    onLoad,
    onError,
    ...imgProps
  },
  ref
) {
  const source = normalizeSource(src);
  const [status, setStatus] = useState<Status>("loading");
  const [cached, setCached] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const resolved = source ? resolveImage(source, { loader, width, widths, quality }) : null;
  const effectivePlaceholder = placeholder ?? (source?.blurDataURL ? true : undefined);
  const blurSrc = source ? resolveBlurSource(effectivePlaceholder, source, loader) : null;
  const customPlaceholder = placeholderNode(effectivePlaceholder);

  // Kaynak değişince baştan.
  const key = resolved ? `${resolved.src}|${resolved.srcSet ?? ""}` : "";
  useEffect(() => {
    setStatus("loading");
    // SSR'dan gelen ya da önbellekteki görsel hidrasyondan önce yüklenmiş olabilir — `onLoad` hiç gelmez.
    const img = imgRef.current;
    const ready = !!img?.complete;
    // Önbellekten gelen görselde geçiş atlanır — küçük ikonlarda soluk görünmesin.
    setCached(ready);
    if (ready) setStatus(img.naturalWidth > 0 ? "loaded" : "error");
  }, [key]);

  const boxStyle = getBoxStyle({ width, height, aspectRatio, source });
  const boxClass = cn(
    "relative isolate inline-block max-w-full overflow-hidden rounded-md align-middle",
    status !== "loaded" && "bg-mari-surface-alt",
    wrapperClassName
  );

  if (skeleton) {
    const sk = skeletonBoxProps(boxClass);
    // Boyut bilinmiyorsa iskelet görünür kalsın diye makul bir oran.
    const skStyle = Object.keys(boxStyle).length ? boxStyle : { width: "100%", aspectRatio: "4 / 3" };
    return <span {...sk} className={cn(sk.className, "block")} style={{ ...skStyle, ...style }} />;
  }

  const setRefs = (el: HTMLImageElement | null) => {
    imgRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  const loaded = status === "loaded";
  const failed = status === "error" || !source;

  const content = (
    <>
      {!loaded && !failed && (
        <PlaceholderLayer blurSrc={blurSrc} custom={customPlaceholder} shimmer={effectivePlaceholder === true} fit={fit} />
      )}
      {resolved && status !== "error" && (
        <img
          {...imgProps}
          ref={setRefs}
          src={resolved.src}
          srcSet={resolved.srcSet}
          {...imgAttributes({ width, height, source, srcSet: resolved.srcSet, sizes, priority, loading, fetchPriority: imgProps.fetchPriority })}
          alt={alt}
          decoding="async"
          onLoad={(event) => {
            setStatus("loaded");
            onLoad?.(event);
          }}
          onError={(event) => {
            setStatus("error");
            onError?.(event);
          }}
          className={cn(
            "relative block size-full",
            fade && !cached && "transition-opacity duration-500 motion-reduce:transition-none",
            FIT_CLASS[fit],
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
      {failed && <FallbackLayer key={key} fallback={fallback} alt={alt} className={cn(FIT_CLASS[fit], className)} />}
    </>
  );

  if (!preview) {
    return (
      <span className={boxClass} style={{ ...boxStyle, ...style }}>
        {content}
      </span>
    );
  }

  return (
    <PreviewFrame
      config={typeof preview === "object" ? preview : {}}
      src={src}
      alt={alt}
      loader={loader}
      loaded={loaded}
      disabled={failed}
      thumbnail={() => imgRef.current?.currentSrc || resolved?.src}
      className={boxClass}
      style={{ ...boxStyle, ...style }}
    >
      {content}
    </PreviewFrame>
  );
});

/** Yüklenemezse: URL yedeği (o da yüklenemezse varsayılan), node ya da varsayılan. */
function FallbackLayer({ fallback, alt, className }: Readonly<{ fallback: ImageProps["fallback"]; alt: string; className?: string }>) {
  const [urlFailed, setUrlFailed] = useState(false);
  if (typeof fallback === "string" && !urlFailed) {
    return <img src={fallback} alt={alt} onError={() => setUrlFailed(true)} className={cn("block size-full", className)} />;
  }
  if (typeof fallback !== "string" && fallback) return <>{fallback}</>;
  return <DefaultFallback />;
}

/** `preview`: kutu bir düğme olur, tam ekran görüntüleyiciyi açar; kapanınca odak düğmeye döner. */
function PreviewFrame({
  config,
  src,
  alt,
  loader,
  loaded,
  disabled,
  thumbnail,
  className,
  style,
  children,
}: Readonly<{
  config: ImagePreviewConfig;
  src: ImageProps["src"];
  alt: string;
  loader?: ImageLoader;
  loaded: boolean;
  disabled: boolean;
  thumbnail: () => string | undefined;
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useControllableState({ value: config.open, defaultValue: false, onChange: config.onOpenChange });
  const previewSource = config.src ?? src;
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-label={alt ? `${alt} — büyüt` : "Görseli büyüt"}
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          className,
          "group cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring disabled:cursor-default"
        )}
        style={style}
      >
        {children}
        {loaded && (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center gap-1.5 bg-mari-scrim text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:hidden"
          >
            <EyeIcon className="size-4" />
            Önizle
          </span>
        )}
      </button>
      {previewSource && (
        <ImageViewer
          open={open ?? false}
          onClose={() => setOpen(false)}
          loader={loader}
          getOriginElement={() => triggerRef.current}
          items={[{ key: "preview", src: previewSource, alt, caption: config.caption, thumbnail: thumbnail() }]}
        />
      )}
    </>
  );
}
