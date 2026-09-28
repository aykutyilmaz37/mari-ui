"use client";

import React, { createContext, useContext, useMemo } from "react";

/** Kütüphanenin bir link bileşenine geçirdiği prop'lar (`href` adı `hrefProp` ile değişir). */
export interface MariLinkRenderProps {
  href: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  "aria-current"?: "page";
  "aria-label"?: string;
  children?: React.ReactNode;
}

export interface MariLinkProviderProps {
  /**
   * Router'ın link bileşeni: Next.js için `next/link`in `Link`i, React Router
   * için `react-router`ın `Link`i. Verilmezse düz `<a href>` render edilir.
   */
  component?: React.ElementType;
  /**
   * Bileşenin adres prop'unun adı. Next `href`, React Router `to` bekler.
   * Varsayılan `"href"`.
   */
  hrefProp?: "href" | "to";
  children: React.ReactNode;
}

interface LinkConfig {
  component?: React.ElementType;
  hrefProp: "href" | "to";
}

const LinkContext = createContext<LinkConfig>({ hrefProp: "href" });

/**
 * Faz 15.5 — kütüphane hiçbir router'a bağımlı değil (`next` peer dependency
 * DEĞİL). Uygulamanın kökünde bir kez router'ın link bileşeni verilir;
 * Breadcrumb, Dropdown ve menü ailesinin tüm linkleri onu kullanır (Next'te
 * prefetch, React Router'da client-side geçiş kendiliğinden gelir). Verilmezse
 * düz `<a href>`.
 *
 * ```tsx
 * // Next.js
 * import NextLink from "next/link";
 * <MariLinkProvider component={NextLink}>{children}</MariLinkProvider>
 *
 * // React Router
 * import { Link } from "react-router";
 * <MariLinkProvider component={Link} hrefProp="to">{children}</MariLinkProvider>
 * ```
 */
export function MariLinkProvider({ component, hrefProp = "href", children }: MariLinkProviderProps) {
  const value = useMemo(() => ({ component, hrefProp }), [component, hrefProp]);
  return <LinkContext.Provider value={value}>{children}</LinkContext.Provider>;
}

/**
 * Kütüphane içi link: sağlayıcıdaki router bileşenini ya da düz `<a>`yı
 * render eder. Tüketici doğrudan da kullanabilir.
 */
export function MariLink({ href, children, ...rest }: MariLinkRenderProps) {
  const { component: Component, hrefProp } = useContext(LinkContext);
  if (!Component) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Component {...rest} {...{ [hrefProp]: href }}>
      {children}
    </Component>
  );
}
