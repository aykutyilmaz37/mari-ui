import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * `@testing-library/react`in kendi otomatik `afterEach(cleanup)` kaydı
 * `globalThis.afterEach`e bağlıdır — bu projenin `vitest.config.ts`si
 * BİLİNÇLİ olarak `globals: false` (testler `vitest`ten açıkça import
 * ediyor, global sızıntı yok) olduğu için o otomatik kayıt HİÇ ÇALIŞMIYORDU.
 * Sonuç: `render()` ile monte edilen DOM, test dosyası içindeki SONRAKİ
 * teste SIZIYORDU — Faz 9'da `Card.test.tsx`teki iki `render()` çağrısı
 * (ikisi de "Tıklanabilir kart" metnini kullanıyor) `getByRole`in BİRDEN
 * FAZLA eşleşme bulup patlamasıyla fiilen yakalandı.
 */
afterEach(cleanup);
