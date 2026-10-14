import type { SVGProps } from "react";

export interface MariLogoProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox" | "role" | "aria-label"> {
  /** Full wordmark for headers, or the compact iris monogram for narrow rails. */
  variant?: "full" | "mark";
  /** Rendered height in CSS pixels. */
  size?: number;
  /** Accessible name exposed to assistive technology. */
  label?: string;
}

/**
 * İşaret temanın `primary` rolünden boyanır (kişilik ve koyu tema ile değişir);
 * değişken yoksa (tema CSS'i yüklenmemiş) varsayılan iris tonlarına düşer.
 */
function IrisMark() {
  return (
    <g aria-hidden="true">
      <rect x="4" y="4" width="48" height="48" rx="15" fill="var(--mari-color-primary-solid, #6951CE)" />
      <path d="M28 10.5c-3.1 3.2-3.2 5.5 0 8.2 3.2-2.7 3.1-5 0-8.2Z" fill="var(--mari-color-primary-solid-contrast, #fff)" fillOpacity={0.72} />
      <path d="M20.6 13.3c-.3 4.5 1.2 6.5 5.6 7.1.5-4.4-1-6.4-5.6-7.1Zm14.8 0c.3 4.5-1.2 6.5-5.6 7.1-.5-4.4 1-6.4 5.6-7.1Z" fill="var(--mari-color-primary-solid-contrast, #fff)" fillOpacity={0.96} />
      <path d="M14.5 40V27a4.5 4.5 0 0 1 8.1-2.7L28 31l5.4-6.7a4.5 4.5 0 0 1 8.1 2.7v13" fill="none" stroke="var(--mari-color-primary-solid-contrast, #fff)" strokeWidth="3.7" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function MariLogo({ variant = "full", size = 56, label = "Mari UI", ...props }: Readonly<MariLogoProps>) {
  const isFull = variant === "full";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={isFull ? "0 0 184 56" : "0 0 56 56"}
      width={isFull ? (184 / 56) * size : size}
      height={size}
      role="img"
      aria-label={label}
      focusable="false"
      {...props}
    >
      <IrisMark />
      {isFull && (
        <g aria-hidden="true">
          <text x="66" y="38" fontFamily="var(--mari-font-sans, Inter, ui-sans-serif, system-ui, sans-serif)" fontSize="30" fontWeight="750" letterSpacing="-1.8" fill="var(--mari-color-foreground, #242331)">mari</text>
          <circle cx="128.5" cy="34" r="2.1" fill="var(--mari-color-primary, #6951CE)" fillOpacity={0.6} />
          <text x="137" y="38" fontFamily="var(--mari-font-sans, Inter, ui-sans-serif, system-ui, sans-serif)" fontSize="30" fontWeight="750" letterSpacing="-1.8" fill="var(--mari-color-primary, #6951CE)">ui</text>
        </g>
      )}
    </svg>
  );
}
