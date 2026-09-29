import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { List, ListItem, ListItemMeta } from ".";
import { getA11yViolations } from "../testUtils/a11y";

interface Member {
  id: number;
  name: string;
  email: string;
}

const members: Member[] = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Üye ${i + 1}`, email: `uye${i + 1}@ornek.com` }));

const renderMember = (m: Member) => (
  <ListItem actions={[<button key="e">Düzenle</button>, <button key="s">Sil</button>]}>
    <ListItemMeta title={m.name} description={m.email} />
  </ListItem>
);

describe("List", () => {
  it("dataSource + renderItem: liste ve satırlar liste semantiğiyle çizilir", () => {
    render(<List aria-label="Ekip" dataSource={members.slice(0, 3)} renderItem={renderMember} />);
    const list = screen.getByRole("list", { name: "Ekip" });
    const rows = within(list).getAllByRole("listitem").filter((li) => li.parentElement === list);
    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getByText("uye1@ornek.com")).toBeInTheDocument();
    // Eylemler kendi listesinde.
    expect(within(rows[0]!).getByRole("list")).toContainElement(within(rows[0]!).getByRole("button", { name: "Sil" }));
  });

  it("kayıt yokken varsayılan boş durum, `empty` ile özel içerik", () => {
    const { rerender } = render(<List dataSource={[]} renderItem={renderMember} />);
    expect(screen.getByText("Kayıt yok")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    rerender(<List dataSource={[]} renderItem={renderMember} empty={<p>Henüz üye yok</p>} />);
    expect(screen.getByText("Henüz üye yok")).toBeInTheDocument();
  });

  it("istemci tarafı sayfalama: dataSource'u dilimler, sayfa değişince onPageChange", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<List dataSource={members} renderItem={renderMember} pagination={{ pageSize: 5, onPageChange }} />);
    expect(screen.getByText("Üye 1")).toBeInTheDocument();
    expect(screen.queryByText("Üye 6")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /2\. sayfa|^2$/ }));
    expect(onPageChange).toHaveBeenCalledWith(2, 5);
    expect(screen.getByText("Üye 6")).toBeInTheDocument();
    expect(screen.queryByText("Üye 1")).not.toBeInTheDocument();
  });

  it("sunucu tarafı sayfalama (totalItems): dataSource dilimlenmez", () => {
    render(<List dataSource={members.slice(0, 3)} renderItem={renderMember} pagination={{ totalItems: 120, pageSize: 3, currentPage: 4 }} />);
    expect(screen.getByText("Üye 1")).toBeInTheDocument();
    expect(screen.getByText("Üye 3")).toBeInTheDocument();
  });

  it("header, footer ve loadMore çizilir", () => {
    render(<List header="Ekip" footer="12 üye" loadMore={<button>Daha fazla</button>} dataSource={members.slice(0, 2)} renderItem={renderMember} />);
    expect(screen.getByText("Ekip")).toBeInTheDocument();
    expect(screen.getByText("12 üye")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Daha fazla" })).toBeInTheDocument();
  });

  it("grid: hücreler ızgara sınıflarıyla, satır ayırıcısı yok", () => {
    render(
      <List aria-label="Ürünler" grid={{ columns: { base: 1, md: 3 } }} dataSource={members.slice(0, 3)} renderItem={(m) => <ListItem>{m.name}</ListItem>} />
    );
    const list = screen.getByRole("list", { name: "Ürünler" });
    expect(list).toHaveClass("grid", "grid-cols-1", "md:grid-cols-3");
    expect(list).not.toHaveClass("divide-y");
  });

  it("vertical: extra ve eylemler çizilir", () => {
    render(
      <List itemLayout="vertical" dataSource={[members[0]!]} renderItem={(m) => (
        <ListItem extra={<img src="/kapak.png" alt="Kapak" />} actions={[<span key="l">12 beğeni</span>]}>
          <ListItemMeta title={m.name} />
          <p>Yazı özeti</p>
        </ListItem>
      )} />
    );
    expect(screen.getByRole("img", { name: "Kapak" })).toBeInTheDocument();
    expect(screen.getByText("12 beğeni")).toBeInTheDocument();
  });

  it("skeleton: aria-busy, içerik erişilebilirlik ağacından çıkar; veri yokken yer tutucu satırlar", () => {
    const { container, rerender } = render(<List skeleton dataSource={members.slice(0, 2)} renderItem={renderMember} />);
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("button", { name: "Sil" })).not.toBeInTheDocument();
    rerender(<List skeleton dataSource={[]} renderItem={renderMember} />);
    expect(screen.queryByText("Kayıt yok")).not.toBeInTheDocument();
    expect(container.querySelectorAll("[data-skeleton].divide-y > div").length).toBeGreaterThan(0);
  });

  it("loading: satırlar yerinde kalır, etkileşime kapanır", () => {
    render(<List loading dataSource={members.slice(0, 2)} renderItem={renderMember} />);
    expect(screen.getByText("Üye 1").closest("[inert]")).not.toBeNull();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <List aria-label="Ekip" bordered header="Ekip" footer="Toplam 12" dataSource={members} renderItem={renderMember} pagination={{ pageSize: 4 }} />
        <List aria-label="Kartlar" grid={{ columns: 2 }} dataSource={members.slice(0, 2)} renderItem={(m) => <ListItem>{m.name}</ListItem>} />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
