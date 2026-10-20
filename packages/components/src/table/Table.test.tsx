import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Table } from "./Table";
import type { ColumnDef } from "./types";
import { getA11yViolations } from "../testUtils/a11y";

interface Row {
  id: string;
  name: string;
  age: number;
}

const data: Row[] = [{ id: "1", name: "Ada", age: 30 }];
const columns: ColumnDef<Row>[] = [{ header: "İsim", columnName: "name" }];

describe("Table", () => {
  it("başlık hücreleri scope=\"col\" taşır (Faz 13.4 — plan denetiminde bulunan satır/hücre semantiği eksikliği)", () => {
    render(<Table data={data} columns={columns} />);
    expect(screen.getByRole("columnheader", { name: "İsim" })).toHaveAttribute("scope", "col");
  });

  it("ikon-only satır eylem butonları erişilebilir isim taşır (Faz 13.4 — eskiden isimsizdi, Tag'in kapatma butonuyla aynı sınıf bug)", () => {
    const rowColumns: ColumnDef<Row>[] = [
      { header: "İsim", columnName: "name" },
      { header: "İşlemler", actions: { deleteRow: () => {} } },
    ];
    render(<Table data={data} columns={rowColumns} />);
    // Faz 15: ad satırı da taşır — eskiden her satırın düğmesi aynı "Sil" adındaydı.
    expect(screen.getByRole("button", { name: "Sil: Ada" })).toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Table data={data} columns={columns} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("sütunlar varsayılan olarak sola hizalıdır, DOM index'ine göre değil (Faz 13.4 kullanıcı bulgusu — eskiden ilk sütun sol, ortadakiler merkez, son sütun sağ hizalanıyordu)", () => {
    const threeColumns: ColumnDef<Row>[] = [
      { header: "İsim", columnName: "name" },
      { header: "Yaş", columnName: "age" },
    ];
    render(<Table data={data} columns={threeColumns} />);
    const headers = screen.getAllByRole("columnheader");
    headers.forEach((h) => expect(h.className).toContain("text-start"));
  });

  it("age sütunu align=\"end\" ile açıkça sağa hizalanabilir", () => {
    const alignedColumns: ColumnDef<Row>[] = [{ header: "Yaş", columnName: "age", align: "end" }];
    render(<Table data={data} columns={alignedColumns} />);
    expect(screen.getByRole("columnheader", { name: "Yaş" }).className).toContain("text-end");
  });

  it("veri boşken gerçek Empty component'i render edilir, düz metin değil (Faz 13.4 kullanıcı bulgusu)", () => {
    render(<Table data={[]} columns={columns} emptyState={{ title: "Kayıt Yok" }} />);
    expect(screen.getByText("Kayıt Yok")).toBeInTheDocument();
  });

  it("işlemler sütunu sticky (sağda sabit) class'ı taşır (Faz 13.4 kullanıcı bulgusu — tablo yatay kaydırıldığında hep görünür kalmalı)", () => {
    const actionColumns: ColumnDef<Row>[] = [{ header: "İşlemler", actions: { deleteRow: () => {} } }];
    render(<Table data={data} columns={actionColumns} />);
    expect(screen.getByRole("columnheader", { name: "İşlemler" }).className).toContain("sticky");
  });

  it("responsive=\"accordion\" iken satırlar açılır/kapanır kart olarak da render edilir", async () => {
    const user = userEvent.setup();
    render(<Table data={data} columns={columns} responsive="accordion" />);
    const toggle = screen.getAllByRole("button", { name: /Ada/ })[0]!;
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("footer çerçevenin altında, ayırıcıyla çizilir (sayfalama yuvası)", () => {
    render(<Table data={data} columns={columns} footer={<nav aria-label="Sayfalama">1 / 3</nav>} />);
    const footer = screen.getByRole("navigation", { name: "Sayfalama" }).parentElement!;
    expect(footer.className).toContain("border-t");
  });

  it("editRow: Düzenle düğmesi satırın kendisiyle çağrılır", async () => {
    const user = userEvent.setup();
    const editRow = vi.fn();
    render(<Table data={data} columns={[...columns, { header: "İşlemler", actions: { editRow } }]} />);
    await user.click(screen.getByRole("button", { name: "Düzenle: Ada" }));
    expect(editRow).toHaveBeenCalledWith(data[0]);
  });

  it("hücre metni en fazla 2 satıra kırpılır (Faz 13.4 kullanıcı bulgusu), truncate ile çelişmez (truncate tek satıra zorlayıp sarmayı engelliyordu)", () => {
    render(<Table data={data} columns={columns} />);
    const cell = screen.getByText("Ada");
    expect(cell.className).toContain("line-clamp-2");
    expect(cell.className).not.toContain("line-clamp-3");
    expect(cell.className).not.toContain("truncate");
  });

  it("render hücrenin özel içeriğini çizer (değer + satır + indeks alır)", () => {
    const rendered: ColumnDef<Row>[] = [
      { header: "İsim", columnName: "name", render: (value, row, i) => <strong>{`${String(value)}-${row.age}-${i}`}</strong> },
    ];
    render(<Table data={data} columns={rendered} />);
    expect(screen.getByText("Ada-30-0").tagName).toBe("STRONG");
  });

  it("satır içi düzenlemede render'lı sütun yine Input olur", async () => {
    const user = userEvent.setup();
    const editable: ColumnDef<Row>[] = [
      { header: "İsim", columnName: "name", render: (v) => <strong>{String(v)}</strong> },
      { header: "İşlemler", actions: { editRowInInline: { onChange: () => {} } } },
    ];
    render(<Table data={data} columns={editable} />);
    await user.click(screen.getByRole("button", { name: "Düzenle: Ada" }));
    expect(screen.getByRole("textbox", { name: "İsim" })).toHaveValue("Ada");
  });

  it("label ekran okuyucu başlığı (caption) olur", () => {
    render(<Table label="Kullanıcılar" data={data} columns={columns} />);
    expect(screen.getByRole("table", { name: "Kullanıcılar" })).toBeInTheDocument();
  });

  it("skeleton + veri varken hücreler görünmez yer tutar, eylemler etkileşimsiz, tablo aria-busy", () => {
    const actionColumns: ColumnDef<Row>[] = [...columns, { header: "İşlemler", actions: { deleteRow: () => {} } }];
    const { container } = render(<Table skeleton data={data} columns={actionColumns} />);
    const cell = screen.getByText("Ada");
    expect(cell.closest(".invisible")).not.toBeNull();
    expect(cell.closest("[aria-hidden='true']")).not.toBeNull();
    expect(screen.queryByRole("button", { name: /Sil/ })).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
  });

  it("skeleton + veri yokken Empty yerine skeletonRows kadar (en çok 10) sahte satır çizilir", () => {
    const { container } = render(<Table skeleton data={[]} columns={columns} skeletonRows={4} emptyState={{ title: "Kayıt Yok" }} />);
    expect(screen.queryByText("Kayıt Yok")).not.toBeInTheDocument();
    expect(container.querySelectorAll("tbody[aria-hidden] tr")).toHaveLength(4);
  });

  it("erişilebilirlik ihlali içermez — işlemli, render'lı ve iskelet halinde (axe-core)", async () => {
    const full: ColumnDef<Row>[] = [
      { header: "İsim", columnName: "name", render: (v) => <strong>{String(v)}</strong> },
      { header: "İşlemler", actions: { deleteRow: () => {}, navigateRow: () => {} } },
    ];
    const loaded = render(<Table label="Kişiler" data={data} columns={full} />);
    expect(await getA11yViolations(loaded.container)).toEqual([]);
    loaded.unmount();
    const sk = render(<Table label="Kişiler" skeleton data={[]} columns={full} />);
    expect(await getA11yViolations(sk.container)).toEqual([]);
    // İskelette başlıklar görsel olarak çubuk ama ekran okuyucu adı okur.
    expect(screen.getByRole("columnheader", { name: "İsim" })).toBeInTheDocument();
  });
});
