import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../field";
import { Transfer } from "./Transfer";
import type { TransferItem } from "./types";
import { getA11yViolations } from "../testUtils/a11y";

const data: TransferItem[] = [
  { key: "a", title: "Ankara" },
  { key: "b", title: "Bursa" },
  { key: "c", title: "Çanakkale", disabled: true },
  { key: "d", title: "Diyarbakır" },
  { key: "i", title: "İzmir" },
];

const list = (name: string) => within(screen.getByRole("group", { name }));

describe("Transfer", () => {
  it("işaretle → sağa taşı; onChange, sayaç ve duyuru", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Transfer dataSource={data} defaultTargetKeys={["d"]} onChange={onChange} />);
    const toRight = screen.getByRole("button", { name: "Seçilenleri Hedef listesine taşı" });
    expect(toRight).toHaveAttribute("aria-disabled", "true");
    await user.click(list("Kaynak").getByRole("checkbox", { name: "Ankara" }));
    await user.click(list("Kaynak").getByRole("checkbox", { name: "İzmir" }));
    expect(list("Kaynak").getByText("2/4 öğe")).toBeInTheDocument();
    await user.click(toRight);
    expect(onChange).toHaveBeenCalledWith(["d", "a", "i"], "right", ["a", "i"]);
    expect(list("Hedef").getAllByRole("checkbox").slice(1).map((c) => c.closest("label")!.textContent)).toEqual(["Diyarbakır", "Ankara", "İzmir"]);
    expect(screen.getByRole("status")).toHaveTextContent("2 öğe Hedef listesine taşındı.");
    // Taşıdıktan sonra odak düğmede kalır (aria-disabled, native disabled değil).
    expect(toRight).toHaveFocus();
    expect(toRight).toHaveAttribute("aria-disabled", "true");
  });

  it("tümünü seç yalnız etkin öğeleri seçer; ara durum (indeterminate)", async () => {
    const user = userEvent.setup();
    render(<Transfer dataSource={data} />);
    const all = list("Kaynak").getByRole("checkbox", { name: /tümünü seç/ });
    await user.click(list("Kaynak").getByRole("checkbox", { name: "Bursa" }));
    expect(all).toHaveProperty("indeterminate", true);
    await user.click(all);
    expect(list("Kaynak").getByText("4/5 öğe")).toBeInTheDocument();
    expect(list("Kaynak").getByRole("checkbox", { name: "Çanakkale" })).not.toBeChecked();
  });

  it("Shift+tıklama aralık seçer", async () => {
    const user = userEvent.setup();
    render(<Transfer dataSource={data} />);
    await user.click(list("Kaynak").getByRole("checkbox", { name: "Ankara" }));
    await user.keyboard("{Shift>}");
    await user.click(list("Kaynak").getByRole("checkbox", { name: "İzmir" }));
    await user.keyboard("{/Shift}");
    expect(list("Kaynak").getByText("4/5 öğe")).toBeInTheDocument();
  });

  it("arama Türkçe/aksansız süzer; sonuç yoksa mesaj", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<Transfer dataSource={data} showSearch onSearch={onSearch} />);
    const search = screen.getByRole("textbox", { name: "Kaynak listesinde ara" });
    await user.type(search, "izm");
    expect(list("Kaynak").getAllByRole("checkbox", { name: /İzmir/ })).toHaveLength(1);
    expect(list("Kaynak").queryByRole("checkbox", { name: "Ankara" })).toBeNull();
    expect(onSearch).toHaveBeenLastCalledWith("left", "izm");
    await user.type(search, "xx");
    expect(list("Kaynak").getByText("Sonuç bulunamadı")).toBeInTheDocument();
  });

  it("oneWay: hedefte kaldır düğmeleri, sola taşıma yok; kaldırınca odak sonraki satıra", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [keys, setKeys] = useState(["a", "b", "d"]);
      return <Transfer dataSource={data} targetKeys={keys} onChange={setKeys} oneWay />;
    }
    render(<Controlled />);
    expect(screen.queryByRole("button", { name: "Seçilenleri Kaynak listesine taşı" })).toBeNull();
    await user.click(list("Hedef").getByRole("button", { name: "Bursa kaldır" }));
    expect(list("Hedef").queryByText("Bursa")).toBeNull();
    expect(list("Hedef").getByRole("button", { name: "Diyarbakır kaldır" })).toHaveFocus();
    await user.click(list("Hedef").getByRole("button", { name: "Tümünü kaldır" }));
    expect(list("Hedef").getByText("Öğe yok")).toBeInTheDocument();
  });

  it("Field içinde grup adı etiketten; disabled kutuları ve düğmeleri pasifler", () => {
    render(
      <Field label="Yetkiler" hint="Rol için izinleri seçin">
        <Transfer dataSource={data} disabled />
      </Field>
    );
    const group = screen.getByRole("group", { name: "Yetkiler" });
    expect(group).toHaveAccessibleDescription("Rol için izinleri seçin");
    expect(list("Kaynak").getByRole("checkbox", { name: "Ankara" })).toBeDisabled();
  });

  it("axe: ihlal yok (arama, oneWay)", async () => {
    const { container } = render(<Transfer aria-label="Şehirler" dataSource={data} defaultTargetKeys={["a"]} showSearch oneWay />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
