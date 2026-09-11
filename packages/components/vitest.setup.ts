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

/**
 * jsdom `URL.createObjectURL`/`revokeObjectURL`i hiç implemente etmiyor —
 * gerçek tarayıcıda çalışan `Upload`'ın resim önizlemesi (`ReviewList`)
 * burada TypeError ile patlıyordu. Testler için minimal, deterministik bir
 * sahte (gerçek bir Blob URL'i değil, sadece varlığı yeten bir işaretçi).
 */
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = () => "blob:mock-object-url";
}
if (typeof URL.revokeObjectURL !== "function") {
  URL.revokeObjectURL = () => {};
}
