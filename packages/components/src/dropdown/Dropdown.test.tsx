import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dropdown } from "./Dropdown";
import { DropdownTrigger } from "./_components/DropdownTrigger";
import { DropdownContent } from "./_components/DropdownContent";
import { DropdownDivider, DropdownItem, DropdownLabel } from "./_components/DropdownItem";
import { getA11yViolations } from "../testUtils/a11y";

function setup() {
  return render(
    <div>
      <Dropdown>
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent>
          <div>İçerik</div>
        </DropdownContent>
      </Dropdown>
      <button type="button">Dışarıdaki Düğme</button>
    </div>
  );
}

describe("Dropdown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });


  it("tetikleyiciye tıklayınca içerik açılır ve tekrar tıklayınca kapanır", async () => {
    const user = userEvent.setup();
    setup();

    expect(screen.queryByText("İçerik")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    expect(screen.getByText("İçerik")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    expect(screen.queryByText("İçerik")).not.toBeInTheDocument();
  });

  it("panel document.body'e portal edilir ve position: fixed taşır (Faz 13.5 kullanıcı bulgusu — eskiden overflow: hidden olan bir atanın içinde konumlanıp kırpılıyordu)", async () => {
    const user = userEvent.setup();
    const { container } = setup();

    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    const content = screen.getByText("İçerik").closest("[class*='fixed']") as HTMLElement;

    expect(container.contains(content)).toBe(false);
    expect(content.parentElement).toBe(document.body);
    expect(content.className).toContain("fixed");
  });

  it("Escape tuşu açık paneli kapatır (Faz 13.5 kullanıcı bulgusu — eskiden bu davranış yoktu)", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    expect(screen.getByText("İçerik")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("İçerik")).not.toBeInTheDocument();
  });

  it("panelin dışına tıklamak paneli kapatır (Faz 13.5 kullanıcı bulgusu — eskiden bu davranış yoktu)", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    expect(screen.getByText("İçerik")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dışarıdaki Düğme" }));
    expect(screen.queryByText("İçerik")).not.toBeInTheDocument();
  });

  it("panelin İÇİNE tıklamak paneli KAPATMAZ (Faz 13.5 kullanıcı bulgusu round 2 — panel portal edildiğinden anchorRef'in alt ağacında değil, dışarı-tıklama algılaması panel içi tıklamayı da 'dışarı' sanıp anında kapatıyordu)", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent>
          <button type="button">İçerideki Düğme</button>
        </DropdownContent>
      </Dropdown>
    );

    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    await user.click(screen.getByRole("button", { name: "İçerideki Düğme" }));
    expect(screen.getByRole("button", { name: "İçerideki Düğme" })).toBeInTheDocument();
  });

  it("hover modunda tetikleyiciden panele geçerken (aradaki boşluğu geçerken) menü kapanmaz (Faz 13.5 kullanıcı bulgusu round 2 — panel portal edildiğinden mouseleave anında kapatıyordu, mouse paneli görmeye fırsat bulamıyordu)", () => {
    vi.useFakeTimers();
    render(
      <Dropdown hover>
        <DropdownTrigger>Üzerine Gel</DropdownTrigger>
        <DropdownContent>
          <div>İçerik</div>
        </DropdownContent>
      </Dropdown>
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Üzerine Gel" }));
    expect(screen.getByText("İçerik")).toBeInTheDocument();

    // Mouse tetikleyiciden ayrılıp (gecikmeli kapatma planlanır) panele girer
    // — gerçek kullanıcı davranışı: aradaki GAP_PX boşluğunu geçerken.
    fireEvent.mouseLeave(screen.getByRole("button", { name: "Üzerine Gel" }));
    fireEvent.mouseEnter(screen.getByText("İçerik"));

    act(() => { vi.advanceTimersByTime(300); });
    expect(screen.getByText("İçerik")).toBeInTheDocument();
  });

  it("hover modunda mouse hem tetikleyiciden hem panelden ayrılırsa menü gecikmeyle kapanır", () => {
    vi.useFakeTimers();
    render(
      <Dropdown hover>
        <DropdownTrigger>Üzerine Gel</DropdownTrigger>
        <DropdownContent>
          <div>İçerik</div>
        </DropdownContent>
      </Dropdown>
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Üzerine Gel" }));
    expect(screen.getByText("İçerik")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByRole("button", { name: "Üzerine Gel" }));
    act(() => { vi.advanceTimersByTime(300); });
    expect(screen.queryByText("İçerik")).not.toBeInTheDocument();
  });

  it("tetikleyici gerçek bir <button>dır — sarmalayıcıda anlamsız role=\"menu\"/tabIndex kalmaz", () => {
    setup();
    expect(screen.getByRole("button", { name: "Menüyü Aç" }).tagName).toBe("BUTTON");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("sarmalayıcı varsayılan olarak tetikleyiciye sarılır (inline-block) — panel geniş bir block kutuya değil tetikleyiciye hizalanır", () => {
    setup();
    const wrapper = screen.getByRole("button", { name: "Menüyü Aç" }).parentElement as HTMLElement;
    expect(wrapper.className).toContain("inline-block");
    expect(wrapper.className).not.toMatch(/(^|\s)relative(\s|$)/);
  });

  it("className ile sarmalayıcı override edilebilir (tam genişlik menü satırları için)", () => {
    render(
      <Dropdown className="block self-auto">
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent>İçerik</DropdownContent>
      </Dropdown>
    );
    const wrapper = screen.getByRole("button", { name: "Menüyü Aç" }).parentElement as HTMLElement;
    expect(wrapper.className).toContain("block");
    expect(wrapper.className).not.toContain("inline-block");
  });

  it("tetikleyici aria-expanded taşır; açıkken aria-controls panelin id'sini gösterir", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: "Menüyü Aç" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = screen.getByText("İçerik").closest("[id]") as HTMLElement;
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
  });

  it("klavyeyle (Enter) açılınca odak panelin içine taşınır; Escape paneli kapatıp odağı tetikleyiciye geri verir", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent>
          <button type="button">İlk</button>
          <button type="button">Son</button>
        </DropdownContent>
      </Dropdown>
    );
    const trigger = screen.getByRole("button", { name: "Menüyü Aç" });

    trigger.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("button", { name: "İlk" })).toHaveFocus());

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: "İlk" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("fareyle açılınca odak çalınmaz", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent>
          <button type="button">İlk</button>
        </DropdownContent>
      </Dropdown>
    );
    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    expect(screen.getByRole("button", { name: "İlk" })).not.toHaveFocus();
  });

  it("panelin son öğesinde Tab paneli kapatıp odağı tetikleyiciye döndürür (portal body'nin sonunda olduğundan odak kaybolmasın)", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent>
          <button type="button">İlk</button>
          <button type="button">Son</button>
        </DropdownContent>
      </Dropdown>
    );
    const trigger = screen.getByRole("button", { name: "Menüyü Aç" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("button", { name: "İlk" })).toHaveFocus());

    await user.tab();
    expect(screen.getByRole("button", { name: "Son" })).toHaveFocus();
    await user.tab();
    expect(screen.queryByRole("button", { name: "Son" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("arrow prop'u verilince panel dekoratif (aria-hidden) bir ok çizer; verilmezse çizmez", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <Dropdown>
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent arrow>İçerik</DropdownContent>
      </Dropdown>
    );
    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    await waitFor(() => expect(document.querySelector("[aria-hidden='true'].absolute")).toBeInTheDocument());
    unmount();

    setup();
    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    await screen.findByText("İçerik");
    expect(document.querySelector("[aria-hidden='true'].absolute")).not.toBeInTheDocument();
  });

  it("DropdownItem'a tıklamak onClick'i çağırır, paneli kapatır ve odağı tetikleyiciye geri verir", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Dropdown>
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent>
          <DropdownItem onClick={onClick}>Düzenle</DropdownItem>
          <DropdownDivider />
          <DropdownItem danger>Sil</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    await user.click(screen.getByRole("button", { name: "Düzenle" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Düzenle" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menüyü Aç" })).toHaveFocus();
  });

  it("disabled DropdownItem tıklanamaz ve paneli kapatmaz", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Dropdown>
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent>
          <DropdownItem disabled onClick={onClick}>Devre Dışı</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    await user.click(screen.getByRole("button", { name: "Devre Dışı" }));

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Devre Dışı" })).toBeInTheDocument();
  });

  it("DropdownDivider ayırıcı rolü taşır", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Bir</DropdownItem>
          <DropdownDivider />
          <DropdownItem>İki</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("offset, tetikleyiciyle panel arasındaki boşluğu büyütür", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Menüyü Aç</DropdownTrigger>
        <DropdownContent placement="bottom" offset={20}>
          <div>İçerik</div>
        </DropdownContent>
      </Dropdown>
    );
    await user.click(screen.getByRole("button", { name: "Menüyü Aç" }));
    const panel = screen.getByText("İçerik").closest("[id]") as HTMLElement;
    // jsdom'da tüm dikdörtgenler 0: top = 0 (tetikleyici altı) + 4 (varsayılan boşluk) + 20 (offset).
    await waitFor(() => expect(panel.style.top).toBe("24px"));
  });

  it("hover modunda fareyle açılan menü, ardından tetikleyiciye TIKLAYINCA kapanmaz (kullanıcı bulgusu: tıklama toggle edip menüyü gözünüzün önünde kapatıyordu)", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown hover>
        <DropdownTrigger>Üzerine Gel</DropdownTrigger>
        <DropdownContent>
          <div>İçerik</div>
        </DropdownContent>
      </Dropdown>
    );
    const trigger = screen.getByRole("button", { name: "Üzerine Gel" });
    await user.hover(trigger);
    expect(screen.getByText("İçerik")).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByText("İçerik")).toBeInTheDocument();
  });

  it("hover modunda KLAVYEYLE (Enter) toggle davranışı korunur", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown hover>
        <DropdownTrigger>Üzerine Gel</DropdownTrigger>
        <DropdownContent>
          <div>İçerik</div>
        </DropdownContent>
      </Dropdown>
    );
    const trigger = screen.getByRole("button", { name: "Üzerine Gel" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("İçerik")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.queryByText("İçerik")).not.toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = setup();
    expect(await getA11yViolations(container)).toEqual([]);
  });

  describe("Faz 15.5 — klavye gezinmesi", () => {
    function menu() {
      return render(
        <Dropdown>
          <DropdownTrigger>İşlemler</DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>Dosya</DropdownLabel>
            <DropdownItem>Düzenle</DropdownItem>
            <DropdownItem disabled>Kopyala</DropdownItem>
            <DropdownItem>Paylaş</DropdownItem>
            <DropdownItem extra="⌫">Sil</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );
    }

    it("tetikleyicide ↓ açar ve ilk öğeye, ↑ açar ve son öğeye odaklanır", async () => {
      const user = userEvent.setup();
      menu();
      screen.getByRole("button", { name: "İşlemler" }).focus();
      await user.keyboard("{ArrowDown}");
      await waitFor(() => expect(screen.getByRole("button", { name: "Düzenle" })).toHaveFocus());
      await user.keyboard("{Escape}");
      expect(screen.getByRole("button", { name: "İşlemler" })).toHaveFocus();
      await user.keyboard("{ArrowUp}");
      await waitFor(() => expect(screen.getByRole("button", { name: /Sil/ })).toHaveFocus());
    });

    it("panelde ↓/↑ devre dışı öğeyi atlayıp sarar, Home/End uçlara gider", async () => {
      const user = userEvent.setup();
      menu();
      screen.getByRole("button", { name: "İşlemler" }).focus();
      await user.keyboard("{ArrowDown}");
      await waitFor(() => expect(screen.getByRole("button", { name: "Düzenle" })).toHaveFocus());
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("button", { name: "Paylaş" })).toHaveFocus();
      await user.keyboard("{ArrowDown}{ArrowDown}");
      expect(screen.getByRole("button", { name: "Düzenle" })).toHaveFocus();
      await user.keyboard("{ArrowUp}");
      expect(screen.getByRole("button", { name: /Sil/ })).toHaveFocus();
      await user.keyboard("{Home}");
      expect(screen.getByRole("button", { name: "Düzenle" })).toHaveFocus();
      await user.keyboard("{End}");
      expect(screen.getByRole("button", { name: /Sil/ })).toHaveFocus();
    });

    it("harfe basınca o harfle başlayan sonraki öğeye atlar", async () => {
      const user = userEvent.setup();
      menu();
      screen.getByRole("button", { name: "İşlemler" }).focus();
      await user.keyboard("{ArrowDown}");
      await waitFor(() => expect(screen.getByRole("button", { name: "Düzenle" })).toHaveFocus());
      await user.keyboard("s");
      expect(screen.getByRole("button", { name: /Sil/ })).toHaveFocus();
      await user.keyboard("p");
      expect(screen.getByRole("button", { name: "Paylaş" })).toHaveFocus();
    });

    it("extra sağda ikincil metin olarak, DropdownLabel odaklanamayan başlık olarak render edilir", async () => {
      const user = userEvent.setup();
      menu();
      await user.click(screen.getByRole("button", { name: "İşlemler" }));
      expect(screen.getByText("⌫")).toHaveClass("text-mari-muted");
      expect(screen.getByText("Dosya").tabIndex).toBe(-1);
    });
  });

  it("DropdownItem href alınca gerçek link olur; devre dışıysa düğmeye döner", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Git</DropdownTrigger>
        <DropdownContent>
          <DropdownItem href="/profil">Profil</DropdownItem>
          <DropdownItem href="/faturalar" disabled>
            Faturalar
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    await user.click(screen.getByRole("button", { name: "Git" }));
    expect(screen.getByRole("link", { name: "Profil" })).toHaveAttribute("href", "/profil");
    expect(screen.getByRole("button", { name: "Faturalar" })).toBeDisabled();
  });

  it("skeleton: tetikleyici etkileşimsiz bir yer tutucudur, hover ile de panel açılmaz", () => {
    const { container } = render(
      <Dropdown hover skeleton>
        <DropdownTrigger className="rounded-full px-3">Hesabım</DropdownTrigger>
        <DropdownContent>
          <div>İçerik</div>
        </DropdownContent>
      </Dropdown>
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const box = container.querySelector("[data-skeleton]");
    expect(box).toHaveAttribute("aria-hidden", "true");
    expect(box).toHaveClass("rounded-full", "px-3");
    fireEvent.mouseEnter(container.firstElementChild as Element);
    expect(screen.queryByText("İçerik")).not.toBeInTheDocument();
  });

  it("DropdownItem target=_blank güvenli rel taşır ve yeni sekmede açıldığını duyurur", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Yardım</DropdownTrigger>
        <DropdownContent>
          <DropdownItem href="https://docs.example.com" target="_blank">
            Dokümanlar
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    await user.click(screen.getByRole("button", { name: "Yardım" }));
    const link = screen.getByRole("link", { name: "Dokümanlar (yeni sekmede açılır)" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
