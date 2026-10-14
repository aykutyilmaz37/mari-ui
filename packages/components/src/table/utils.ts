import type React from "react";
import type { ColumnDef, TableColumnAlign } from "./types";

export type DraftsSetter<T> = React.Dispatch<React.SetStateAction<Record<string, Partial<T>>>>;

/**
 * `TableBody` ve `TableAccordion` (aynı satır içi düzenleme davranışını
 * responsive/accordion görünümünde de desteklemek için) ortak kullanır.
 * Modül seviyesinde tanımlı — `setDrafts((prev) => {...})` çağrıları render
 * fonksiyonu İÇİNE gömülü kalırsa SonarJS `no-nested-functions` sınırını
 * (4) aşıyordu.
 */
export function clearRowDraft<T>(setDrafts: DraftsSetter<T>, id: string) {
  setDrafts((prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  });
}

export function setRowDraftValue<T>(setDrafts: DraftsSetter<T>, id: string, columnName: keyof T, value: T[keyof T]) {
  setDrafts((prev) => {
    // TS, jenerik bir `keyof T` anahtarıyla computed-property atamasını
    // statik olarak doğrulayamıyor (bilinen bir TS kısıtı) — tek satırlık
    // bir cast ile çözülüyor, `columnName`/`value` zaten çağıranda tam tipli.
    const rowDraft = { ...prev[id], [columnName]: value } as Partial<T>;
    return { ...prev, [id]: rowDraft };
  });
}

/*
 * Eskiden hizalama DOM index'ine göre otomatikti (ilk sütun sol, son sütun
 * sağ, ortadakiler merkez) — kullanıcı bulgusu: aynı tablodaki her sütun
 * farklı hizalanıyordu, tutarsız görünüyordu. Artık `ColumnDef.align`'dan
 * okunur, verilmezse sola hizalı.
 */
const ALIGN_CLASS: Record<TableColumnAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

export function getAlignClass(align: TableColumnAlign | undefined): string {
  return ALIGN_CLASS[align ?? "start"];
}

/**
 * İşlemler hücresi bir `<div className="flex ...">` (bkz. `TableRowActions`)
 * döndürür — BLOK bir kutu, `text-align`/`getAlignClass` onu yok sayar (sadece
 * satır içi içeriği hizalar). Bu yüzden hizalama burada `justify-*` ile
 * bloğun kendisine uygulanır.
 */
const ACTIONS_JUSTIFY_CLASS: Record<TableColumnAlign, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

export function getActionsJustifyClass(align: TableColumnAlign | undefined): string {
  return ACTIONS_JUSTIFY_CLASS[align ?? "start"];
}

/*
 * Satırın okunur adı — satır eylem düğmelerinin erişilebilir adında kullanılır
 * ("Sil: Aykut Yılmaz"). Eskiden her satırın düğmesi aynı "Sil" adını
 * taşıyordu; ekran okuyucu kullanıcısı hangi satırı sildiğini bilemiyordu.
 * İlk veri sütununun değeri, yoksa `id`.
 */
export function getRowLabel<T extends { id: string }>(columns: ColumnDef<T>[], item: T): string {
  const first = columns.find((c) => !c.actions && c.columnName);
  const value = first?.columnName ? item[first.columnName] : undefined;
  const text = value == null ? "" : String(value);
  return text || item.id;
}

/** İskelet çubuk genişlikleri — sütuna göre değişken, deterministik (gerçek veri gibi dalgalı görünsün). */
const SKELETON_WIDTHS = ["70%", "45%", "60%", "85%", "50%", "75%"];
export function skeletonWidth(columnIndex: number, rowIndex = 0): string {
  return SKELETON_WIDTHS[(columnIndex + rowIndex) % SKELETON_WIDTHS.length]!;
}

/** Veri yokken iskelette çizilecek satır sayısı: sayfa boyu (en çok 10), yoksa 5. */
export function skeletonRowCount(pageSize?: number): number {
  return Math.min(pageSize ?? 5, 10);
}
