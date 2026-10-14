"use client";

import React, { useEffect, useRef, useState } from "react";
import { Tooltip } from "../../tooltip";

export interface TableInfoValueProps {
  info?: boolean;
  value: string;
}

/*
 * Kullanıcı bulgusu: `line-clamp-2` bir telefon numarasını ("0532 111
 * 22...") ortasından kesiyordu — `info` prop'u verilmediği sürece kullanıcının
 * tam değeri okumasının HİÇBİR yolu yoktu. Artık `info` (her zaman tooltip)
 * dışında, metnin GERÇEKTEN kırpılıp kırpılmadığı `scrollHeight`/
 * `clientHeight` karşılaştırmasıyla otomatik tespit ediliyor — sığan bir
 * değer (örn. "Aktif") tooltip almaz, kırpılan her değer (`info`
 * verilmemiş olsa bile) otomatik olarak tooltip'e düşer. Sütun genişliğini
 * elle ayarlamaya gerek kalmadan hiçbir değer artık "okunamaz" kalmıyor.
 */
export function TableInfoValue({ info, value }: TableInfoValueProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [value]);

  const showTooltip = info || isTruncated;

  // `tabIndex={0}` KASITLI: bu bir düz `<span>`, doğal olarak odaklanılabilir
  // değil — tooltip'e sadece hover'la değil `Tab`'la da ulaşılabilmesi
  // gerekiyor (aksi hâlde klavye kullanıcıları kırpılan değeri hiç okuyamaz).
  const content = (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- kasıtlı: bu span tıklanabilir değil, TEK amacı kırpılan değerin tooltip'ini klavyeyle de erişilebilir kılmak (bkz. yukarıdaki not).
    <span ref={ref} tabIndex={showTooltip ? 0 : undefined} className="text-pretty line-clamp-2">
      {value}
    </span>
  );

  // Kullanıcı bulgusu: `w-2xs` SABİT bir genişlikti (16rem/256px) — kısa bir
  // değer (örn. bir telefon numarası) bile balonu gereksiz yere 256px'e
  // geriyordu ("çok geniş" tepkisi). `max-w-2xs`'e çevrildi: sadece UZUN
  // değerler bu sınıra çarpar, kısa değerler kendi içeriğine göre (Tooltip'in
  // `w-max` varsayılanıyla) doğal genişlikte kalır. Ayrıca burada `soft` +
  // `neutral` — koyu/dolu bir balon yerine soluk gri bir ipucu (kullanıcı
  // bulgusu: "rengi neutral gri olmalı, font-size küçülmeli") ve `text-xs`
  // (12px, genel Tooltip'in `text-sm`/14px varsayılanından küçük).
  return showTooltip ? (
    <Tooltip color="neutral" variant="soft" className="max-w-2xs text-xs" placement="bottom" trigger={content} content={<span>{value}</span>} />
  ) : (
    content
  );
}
