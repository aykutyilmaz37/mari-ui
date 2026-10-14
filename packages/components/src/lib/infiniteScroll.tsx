"use client";

import React, { useEffect, useRef } from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "@mari-ui/core";

/**
 * List ve Masonry'nin ortak sonsuz kaydırma sözleşmesi.
 *
 * Erişilebilirlik: yalnız kaydırmaya bağlı yükleme klavye kullanıcısını
 * sayfa sonuna (alt bilgiye) hiç ulaştırmayabilir. Bu yüzden işaretçinin
 * yanında her zaman odaklanabilir bir "Daha fazla yükle" düğmesi de olur
 * (fare kullanıcısı için kendiliğinden, klavye için düğmeyle). Yükleme ve
 * "hepsi bu kadar" durumu `role="status"` ile duyurulur.
 */
export interface InfiniteScrollOptions {
  /** Yüklenecek kayıt kaldı mı. `false` olunca işaretçi kalkar, `endMessage` görünür. */
  hasMore: boolean;
  /** Sonraki sayfa yüklenirken `true` verin — bu sırada yeni istek tetiklenmez. */
  loading?: boolean;
  /** Liste sonu görünüme girince (ya da düğmeyle) çağrılır. */
  onLoadMore: () => void;
  /** İşaretçinin görünüme ne kadar erken sayılacağı. Varsayılan: `"200px"` (sona gelmeden yükler). */
  rootMargin?: string;
  /** Tüm kayıtlar yüklenince. Varsayılan: "Hepsi bu kadar". `null` gizler. */
  endMessage?: React.ReactNode;
  /** Düğme metni. Varsayılan: "Daha fazla yükle". */
  loadMoreLabel?: string;
}

/**
 * İşaretçi görünüme girince `onLoadMore`. Yükleme bitip işaretçi hâlâ
 * görünürse (içerik ekranı doldurmadıysa) gözlem yeniden kurulur ve bir
 * sonraki sayfa da istenir — ekran dolana kadar.
 */
export function useInfiniteScroll(sentinel: React.RefObject<HTMLElement | null>, { hasMore, loading = false, onLoadMore, rootMargin = "200px" }: InfiniteScrollOptions) {
  const callback = useRef(onLoadMore);
  callback.current = onLoadMore;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading || typeof IntersectionObserver === "undefined") return;
    // `root: null` yine de kaydırılan ata kaplarının kırpmasını hesaba katar → hem sayfa hem iç kaydırma alanında çalışır.
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) callback.current();
    }, { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [sentinel, hasMore, loading, rootMargin]);
}

/** Liste sonu: gözlenen işaretçi + durum + klavye için düğme. */
export function InfiniteScrollFooter({ options, className }: Readonly<{ options: InfiniteScrollOptions; className?: string }>) {
  const sentinel = useRef<HTMLDivElement>(null);
  useInfiniteScroll(sentinel, options);
  const { hasMore, loading = false, onLoadMore, endMessage = "Hepsi bu kadar", loadMoreLabel = "Daha fazla yükle" } = options;

  return (
    // `relative`: içindeki sr-only düğme konumlanmamış bir kaydırma kabından kaçıp sayfayı genişletmesin.
    <div className={cn("relative flex flex-col items-center gap-2 py-3 text-sm text-mari-muted", className)}>
      <div ref={sentinel} aria-hidden className="h-px w-full" />
      <div role="status" className="flex min-h-5 items-center gap-2">
        {loading && (
          <>
            <Loader2Icon size={16} aria-hidden className="animate-spin motion-reduce:animate-none" />
            Yükleniyor…
          </>
        )}
        {!loading && !hasMore && endMessage}
      </div>
      {hasMore && !loading && (
        // Fare kullanıcısında görünmez (kaydırma yetiyor); klavyeyle odaklanınca belirir.
        <button
          type="button"
          onClick={onLoadMore}
          className="sr-only rounded-md px-3 py-1.5 font-medium text-mari-primary focus-visible:not-sr-only focus-visible:outline-2 focus-visible:outline-mari-ring"
        >
          {loadMoreLabel}
        </button>
      )}
    </div>
  );
}
