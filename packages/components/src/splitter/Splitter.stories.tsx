/**
 * Gerçek senaryolar: e-posta istemcisi (klasör + liste + okuma, daraltılabilir
 * klasör paneli, düzen hatırlanır), düzenleyici + önizleme, kod + konsol
 * (dikey). "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Splitter, SplitterPanel } from "./Splitter";

const meta: Meta<typeof Splitter> = {
  title: "Genel/Splitter",
  component: Splitter,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Bölünmüş görünüm — paneller arasındaki tutamaç sürüklenerek ya da klavyeyle boyut değiştirir. `SplitterPanel`: " +
            "`defaultSize` (px ya da %), `min`/`max`, `collapsible` (tutamaçtaki düğme ya da Enter ile kapat/aç). Yatayda " +
            "`stackBelow` genişliğinin altında paneller alt alta dizilir. `storageKey` ile kullanıcının ayarladığı düzen hatırlanır.",
          whenToUse: [
            "Liste + detay (e-posta, talepler, siparişler) — kullanıcı listeyi ya da detayı genişletebilsin.",
            "Düzenleyici + canlı önizleme; kod + konsol/log paneli.",
            "Kullanıcının alan dağılımını kendi işine göre ayarlaması gereken iş ekranları.",
          ],
          whenNotToUse: [
            "Sabit genişlikte, yalnız açılıp kapanan yan menü — `Sidebar`.",
            "İçerik sayfası düzeni (blog, ürün sayfası) — normal grid; kullanıcı sütun genişliği ayarlamaz.",
            "Mobil öncelikli ekran — orada paneller zaten alt alta.",
          ],
          a11y:
            "Tutamaç APG \"window splitter\": `role=\"separator\"`, odaklanır, adı panelden (`label`). ←/→ (dikeyde ↑/↓) 16px, " +
            "Shift ile 64px; Home/End en küçük/en büyük; Enter daraltılabilir paneli kapatır/açar. Değer önceki panelin yüzdesi " +
            "olarak okunur. Kapalı panel `inert` (odak içine girmez).",
        }),
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    stackBelow: { control: "inline-radio", options: ["sm", "md", "lg", "none"] },
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Splitter>;

const pane = "h-full p-4 text-sm text-mari-foreground";

export const Playground: Story = {
  ...storyDoc("Tutamacı sürükleyin ya da Tab ile odaklanıp ok tuşlarını kullanın."),
  args: { orientation: "horizontal", stackBelow: "md" },
  render: (args) => (
    <Splitter {...args} className="h-72 rounded-lg border border-mari-border">
      <SplitterPanel defaultSize="40%" min={160} label="Sol">
        <div className={pane}>Sol panel (en az 160px)</div>
      </SplitterPanel>
      <SplitterPanel min="20%" label="Sağ">
        <div className={pane}>Sağ panel (en az %20)</div>
      </SplitterPanel>
    </Splitter>
  ),
};

const mails = [
  { from: "Elif Kaya", subject: "Ekim bütçesi onayı", preview: "Ekteki tabloyu inceleyip onaylayabilir misin?" },
  { from: "Destek", subject: "Talep #4821 güncellendi", preview: "Talebiniz çözüldü olarak işaretlendi." },
  { from: "Mert Aydın", subject: "Sprint değerlendirmesi", preview: "Cuma 15:00'te kısa bir toplantı yapalım mı?" },
  { from: "Fatura", subject: "Eylül faturanız hazır", preview: "Toplam tutar: ₺1.284,50" },
];

export const MailClient: Story = {
  name: "E-posta İstemcisi",
  ...storyDoc(
    "Üç panel: klasörler (daraltılabilir, 220px), liste (320px), okuma (kalan). `storageKey` ile ayarlanan düzen sayfa " +
      "yenilenince korunur. Dar ekranda paneller alt alta dizilir.",
    `<Splitter storageKey="mail-layout" className="h-[32rem]">
  <SplitterPanel defaultSize={220} min={160} max={320} collapsible label="Klasörler">…</SplitterPanel>
  <SplitterPanel defaultSize={320} min={240} label="Gelen kutusu">…</SplitterPanel>
  <SplitterPanel min={320} label="Okuma">…</SplitterPanel>
</Splitter>`
  ),
  render: () => {
    const [active, setActive] = useState(0);
    const mail = mails[active]!;
    return (
      <Splitter storageKey="mari-story-mail-layout" className="h-[28rem] rounded-lg border border-mari-border bg-mari-surface">
        <SplitterPanel defaultSize={220} min={160} max={320} collapsible label="Klasörler">
          <nav aria-label="Klasörler" className="flex flex-col gap-0.5 p-2 text-sm">
            {["Gelen kutusu", "Yıldızlı", "Gönderilenler", "Taslaklar", "Arşiv"].map((f, i) => (
              <button type="button" key={f} aria-current={i === 0 ? "page" : undefined} className={`cursor-pointer rounded-md px-3 py-1.5 text-left ${i === 0 ? "bg-mari-primary-subtle text-mari-primary-subtle-contrast font-medium" : "text-mari-foreground hover:bg-mari-surface-alt"}`}>
                {f}
              </button>
            ))}
          </nav>
        </SplitterPanel>
        <SplitterPanel defaultSize={320} min={240} label="Gelen kutusu">
          <ul className="divide-y divide-mari-border">
            {mails.map((m, i) => (
              <li key={m.subject}>
                <button type="button" onClick={() => setActive(i)} className={`block w-full cursor-pointer px-4 py-3 text-left ${i === active ? "bg-mari-surface-alt" : "hover:bg-mari-surface-alt"}`}>
                  <span className="block text-sm font-medium text-mari-foreground">{m.from}</span>
                  <span className="block truncate text-sm text-mari-foreground">{m.subject}</span>
                  <span className="block truncate text-xs text-mari-muted">{m.preview}</span>
                </button>
              </li>
            ))}
          </ul>
        </SplitterPanel>
        <SplitterPanel min={320} label="Okuma">
          <article className="flex flex-col gap-2 p-6">
            <h2 className="text-lg font-semibold text-mari-foreground">{mail.subject}</h2>
            <p className="text-sm text-mari-muted">{mail.from}</p>
            <p className="text-sm leading-relaxed text-mari-foreground">{mail.preview} Detaylar için ekteki dosyaya bakabilirsin. İyi çalışmalar.</p>
          </article>
        </SplitterPanel>
      </Splitter>
    );
  },
};

export const EditorPreview: Story = {
  name: "Düzenleyici + Önizleme",
  ...storyDoc(
    "Yarı yarıya başlar; her iki panel en az %25. `onResizeEnd` oranları verir (ör. analitik ya da sunucuya kaydetmek için).",
    `<Splitter onResizeEnd={(sizes) => save(sizes)}>
  <SplitterPanel min="25%" label="Düzenleyici">…</SplitterPanel>
  <SplitterPanel min="25%" label="Önizleme">…</SplitterPanel>
</Splitter>`
  ),
  render: () => {
    const [text, setText] = useState("# Merhaba\n\nBu bir **önizleme** örneği.");
    const [sizes, setSizes] = useState<number[] | null>(null);
    return (
      <div className="flex flex-col gap-2">
        <Splitter onResizeEnd={setSizes} className="h-72 rounded-lg border border-mari-border bg-mari-surface">
          <SplitterPanel min="25%" label="Düzenleyici">
            <textarea aria-label="Markdown" value={text} onChange={(e) => setText(e.target.value)} className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-mari-foreground outline-none" />
          </SplitterPanel>
          <SplitterPanel min="25%" label="Önizleme">
            <div className="h-full whitespace-pre-wrap bg-mari-surface-alt p-4 text-sm text-mari-foreground">{text}</div>
          </SplitterPanel>
        </Splitter>
        <p className="text-xs text-mari-muted">onResizeEnd: {sizes ? sizes.map((s) => `%${Math.round(s * 100)}`).join(" / ") : "—"}</p>
      </div>
    );
  },
};

export const CodeConsole: Story = {
  name: "Dikey — Kod + Konsol",
  ...storyDoc(
    "`orientation=\"vertical\"`: paneller üst üste. Konsol daraltılabilir; tutamaç odaktayken Enter ile kapat/aç. Dikey " +
      "splitter'ın kapsayıcısına yükseklik verin.",
    `<Splitter orientation="vertical" className="h-96">
  <SplitterPanel min={120} label="Kod">…</SplitterPanel>
  <SplitterPanel defaultSize={140} min={80} collapsible label="Konsol">…</SplitterPanel>
</Splitter>`
  ),
  render: () => (
    <Splitter orientation="vertical" className="h-96 rounded-lg border border-mari-border bg-mari-surface">
      <SplitterPanel min={120} label="Kod">
        <pre className="h-full p-4 font-mono text-sm text-mari-foreground">{`export function topla(a: number, b: number) {\n  return a + b;\n}`}</pre>
      </SplitterPanel>
      <SplitterPanel defaultSize={140} min={80} collapsible label="Konsol">
        <pre className="h-full bg-mari-surface-alt p-4 font-mono text-xs text-mari-muted">{"> topla(2, 3)\n5\n> ✓ 12 test geçti"}</pre>
      </SplitterPanel>
    </Splitter>
  ),
};
