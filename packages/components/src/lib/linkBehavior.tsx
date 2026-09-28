import React from "react";
import { ExternalLinkIcon } from "lucide-react";

/** HTML `target` değerleri; isimli bir çerçeve/pencere adı da verilebilir. */
export type LinkTarget = "_self" | "_blank" | "_parent" | "_top" | (string & {});

/**
 * Faz 15.5 — bir linkin router'a (`onNavigate`) devredilip devredilmeyeceğini
 * belirleyen ortak alanlar (menü öğeleri, Breadcrumb, DropdownItem).
 */
export interface LinkBehaviorProps {
  /** Linkin açılacağı yer. `_blank` → yeni sekme (`rel="noopener noreferrer"` otomatik). */
  target?: LinkTarget;
  /**
   * Aynı sekmede ama router'ı ATLAYARAK tam sayfa yükleme: `onNavigate`
   * verilmiş olsa bile tarayıcı sayfayı baştan yükler. Aynı domain'de ama
   * uygulamanın parçası olmayan sayfalar (`/blog` ayrı bir site) ya da
   * sunucunun yönlendirdiği adresler (`/logout`) için.
   */
  reloadDocument?: boolean;
}

/** `https:`, `mailto:`, `tel:` gibi şemalı ya da `//` ile başlayan adresler — router bunlara gidemez. */
export function isExternalHref(href: string): boolean {
  return /^([a-z][a-z\d+.-]*:|\/\/)/i.test(href);
}

/** Bu link tarayıcıya mı bırakılmalı (router'a devredilmemeli)? */
export function bypassesRouter(href: string, { target, reloadDocument }: LinkBehaviorProps): boolean {
  return !!reloadDocument || (!!target && target !== "_self") || isExternalHref(href);
}

/** Değiştirici tuşsuz, sol tuşla yapılan tıklama — yalnızca bu router'a devredilir (⌘/Ctrl/Shift/orta tık tarayıcının). */
export function isPlainLeftClick(event: React.MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/** `<a>`ya yayılacak `target` + `rel` (yeni bağlamda açılan linkler açanın `window.opener`ına erişemesin). */
export function getLinkAttrs(target: LinkTarget | undefined): { target?: string; rel?: string } {
  if (!target || target === "_self") return {};
  return { target, rel: target === "_blank" ? "noopener noreferrer" : undefined };
}

/**
 * Yeni sekmede açılan linkin görsel + sesli işareti: küçük bir dış bağlantı
 * ikonu ve ekran okuyucu için "(yeni sekmede açılır)". WCAG 3.2.5 — bağlam
 * değişikliği önceden bildirilmeli.
 */
export function NewTabHint({ target }: { target?: LinkTarget }) {
  if (target !== "_blank") return null;
  return (
    <>
      <ExternalLinkIcon aria-hidden="true" className="size-3 shrink-0 opacity-60" />
      <span className="sr-only">(yeni sekmede açılır)</span>
    </>
  );
}
