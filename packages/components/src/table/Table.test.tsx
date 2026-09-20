import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Table } from "./Table";
import type { ColumnDef, TablePaginationConfig } from "./types";
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
    expect(screen.getByRole("button", { name: "Sil" })).toBeInTheDocument();
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

  it("pagination verilince sayfa değiştirme onPageChange'i çağırır", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const manyRows: Row[] = Array.from({ length: 25 }, (_, i) => ({ id: String(i), name: `Satır ${i}`, age: i }));
    const pagination: TablePaginationConfig = { page: 1, pageSize: 10, total: manyRows.length, onPageChange };
    render(<Table data={manyRows.slice(0, 10)} columns={columns} pagination={pagination} />);

    expect(screen.getByText("1-10 / 25 kayıt")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "2. sayfa" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("paginationMode=\"client\" iken Table kendi veriyi diler", () => {
    const manyRows: Row[] = Array.from({ length: 25 }, (_, i) => ({ id: String(i), name: `Satır ${i}`, age: i }));
    const pagination: TablePaginationConfig = { page: 2, pageSize: 10, total: manyRows.length, onPageChange: () => {} };
    render(<Table data={manyRows} columns={columns} pagination={pagination} paginationMode="client" />);

    expect(screen.getByText("Satır 10")).toBeInTheDocument();
    expect(screen.queryByText("Satır 0")).not.toBeInTheDocument();
  });

  it("hücre metni en fazla 2 satıra kırpılır (Faz 13.4 kullanıcı bulgusu), truncate ile çelişmez (truncate tek satıra zorlayıp sarmayı engelliyordu)", () => {
    render(<Table data={data} columns={columns} />);
    const cell = screen.getByText("Ada");
    expect(cell.className).toContain("line-clamp-2");
    expect(cell.className).not.toContain("line-clamp-3");
    expect(cell.className).not.toContain("truncate");
  });
});
