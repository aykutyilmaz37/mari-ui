import { reactInternalConfig } from "@mari-ui/eslint-config/react";

/**
 * Bu bir Next.js App Router uygulaması — component kütüphanesi değil, ama
 * `require-use-client-with-hooks` kuralı burada da anlamlı: bir App Router
 * dosyasının hook kullanıp "use client" taşımaması gerçek bir hatadır
 * (build'de patlar), kütüphanedeki gerekçeyle birebir aynı.
 */
export default [...reactInternalConfig, { ignores: [".next/**", "next-env.d.ts"] }];
