/**
 * Faz 16.3: gerçek senaryolar — SSS (separated, tekli), sipariş özeti
 * (extra'da tutar/etiket), filtre paneli (ghost, form alanlı), tümünü aç/kapat
 * (controlled), görünümler ve boyutlar, iskelet.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Accordion } from ".";
import type { AccordionItem } from ".";
import { Badge } from "../badge";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Slider } from "../slider";
import { Switch } from "../switch";
import { Tag } from "../tag";

const meta: Meta<typeof Accordion> = {
  title: "Veri Gösterimi/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Başlıkları görünen, içeriği açılıp kapanan bölümler (ant.design Collapse). Aynı anda birden çok bölüm açık " +
            "olabilir; `single` ile yalnız biri. Dört görünüm: `bordered` (varsayılan), `borderless`, `ghost` (kart içine " +
            "gömülü), `separated` (aralıklı kartlar — SSS). `extra` başlığın sağına sayaç/etiket/düğme koyar.",
          whenToUse: [
            "Uzun bir sayfayı taranabilir bölümlere ayırmak (SSS, ürün özellikleri, sipariş detayı).",
            "İkincil ayarları/filtreleri varsayılan olarak gizleyip gerekince açmak.",
          ],
          whenNotToUse: [
            "Bölümler arasında gidip gelmek ve aynı anda yalnız birini görmek — Tabs.",
            "Kullanıcının içeriğin tamamını okuması gerekiyorsa (sözleşme maddeleri) — gizlemeyin, düz metin.",
            "Hiyerarşik veri (klasör ağacı) — Tree.",
          ],
          a11y:
            "WAI-ARIA APG Accordion: her başlık `<h3>` (değiştirmek için `headingLevel`) içinde `aria-expanded` + " +
            "`aria-controls` taşıyan bir `<button>`; gövde `role=\"region\"` ve başlıkla adlandırılır (6'dan fazla bölümde " +
            "landmark kalabalığı olmasın diye region verilmez). Kapalı gövde `inert` — Tab ile içine girilmez. Klavye: " +
            "Enter/Space aç-kapa, ↑/↓ başlıklar arası (döngülü), Home/End ilk/son. `extra` düğmenin dışındadır, içine " +
            "düğme/bağlantı koymak güvenlidir. Hareket azaltma tercihinde animasyon kapanır.",
        }),
      },
    },
  },
  argTypes: {
    items: { control: false },
    activeKey: { control: false },
    defaultActiveKey: { control: false },
    onChange: { table: { category: "Olaylar" } },
    single: { control: "boolean" },
    variant: { control: "inline-radio", options: ["bordered", "borderless", "ghost", "separated"], table: { defaultValue: { summary: "bordered" } } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"], table: { defaultValue: { summary: "md" } } },
    iconPlacement: { control: "inline-radio", options: ["start", "end"], table: { defaultValue: { summary: "start" } } },
    expandIcon: { control: false },
    headingLevel: { control: "inline-radio", options: [2, 3, 4, 5, 6], table: { defaultValue: { summary: "3" } } },
    destroyOnHidden: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const faq: AccordionItem[] = [
  {
    key: "kargo",
    label: "Siparişim ne zaman kargoya verilir?",
    children: "Saat 15:00'e kadar verilen siparişler aynı gün kargoya verilir. Hafta sonu verilen siparişler pazartesi çıkar.",
  },
  {
    key: "iade",
    label: "İade ve değişim nasıl yapılır?",
    children: (
      <>
        Teslimattan itibaren 14 gün içinde <strong>Hesabım › Siparişlerim</strong> sayfasından ücretsiz iade kodu alabilirsiniz. Ürün
        depomuza ulaştıktan sonra tutar 3-5 iş günü içinde kartınıza yansır.
      </>
    ),
  },
  { key: "taksit", label: "Taksit seçenekleri nelerdir?", children: "Anlaşmalı banka kartlarına 3, 6 ve 9 taksit; 1.000 ₺ üzeri alışverişlerde vade farksız 3 taksit." },
  { key: "fatura", label: "Kurumsal fatura alabilir miyim?", children: "Evet. Ödeme adımında “Kurumsal fatura” seçeneğini işaretleyip vergi bilgilerinizi girin." },
];

/* ─────────────────────────── Playground ─────────────────────────── */

export const Playground: Story = {
  args: { items: faq, defaultActiveKey: "kargo", variant: "bordered", size: "md", iconPlacement: "start", single: false },
  render: (args) => (
    <div className="max-w-2xl">
      <Accordion {...args} />
    </div>
  ),
};

/* ─────────────────────────── 1. SSS ─────────────────────────── */

export const Faq: Story = {
  name: "Sıkça Sorulan Sorular",
  ...storyDoc(
    "SSS sayfası: `separated` her soruyu ayrı bir kart yapar, `single` aynı anda tek cevap açık tutar, ok sağda " +
      "(`iconPlacement=\"end\"`). Sayfada `<h2>Sıkça sorulan sorular</h2>` varsa sorular `<h3>` (varsayılan).",
    `
<h2>Sıkça sorulan sorular</h2>
<Accordion variant="separated" single iconPlacement="end" defaultActiveKey="kargo" items={[
  { key: "kargo", label: "Siparişim ne zaman kargoya verilir?", children: "Saat 15:00'e kadar…" },
  { key: "iade", label: "İade ve değişim nasıl yapılır?", children: <>…</> },
  …
]} />`
  ),
  render: () => (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-xl font-semibold text-mari-foreground">Sıkça sorulan sorular</h2>
      <Accordion variant="separated" single iconPlacement="end" defaultActiveKey="kargo" items={faq} />
    </div>
  ),
};

/* ─────────────────────────── 2. Sipariş özeti ─────────────────────────── */

const tl = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";

export const OrderSummary: Story = {
  name: "Sipariş Özeti (extra)",
  ...storyDoc(
    "`extra` başlığın sağında, açma düğmesinin DIŞINDA durur: tutar, durum etiketi ya da bir düğme koyabilirsiniz — " +
      "tıklaması bölümü açıp kapatmaz. Devre dışı bölüm (`disabled`) soluk görünür ve klavyede atlanır.",
    `
<Accordion defaultActiveKey="urunler" items={[
  { key: "urunler", label: "Ürünler (3)", extra: <span className="font-medium">5.697,00 ₺</span>, children: <ul>…</ul> },
  { key: "teslimat", label: "Teslimat adresi", extra: <Button size="sm" variant="link">Değiştir</Button>, children: … },
  { key: "odeme", label: "Ödeme", extra: <Tag color="success">Onaylandı</Tag>, children: … },
  { key: "fatura", label: "Fatura", disabled: true, extra: <Tag>Kargodan sonra</Tag>, children: … },
]} />`
  ),
  render: () => (
    <div className="max-w-xl">
      <Accordion
        defaultActiveKey="urunler"
        items={[
          {
            key: "urunler",
            label: "Ürünler (3)",
            extra: <span className="font-medium tabular-nums">{tl(5697)}</span>,
            children: (
              <ul className="flex flex-col gap-2">
                {[
                  ["Kablosuz Kulaklık Pro", 2499],
                  ["Mekanik Klavye TKL", 1899],
                  ["USB-C Hub 7'si 1 arada", 1299],
                ].map(([name, price]) => (
                  <li key={name} className="flex justify-between gap-4">
                    <span>{name}</span>
                    <span className="tabular-nums text-mari-muted">{tl(price as number)}</span>
                  </li>
                ))}
              </ul>
            ),
          },
          {
            key: "teslimat",
            label: "Teslimat adresi",
            extra: (
              <Button size="sm" variant="link" aria-label="Teslimat adresini değiştir">
                Değiştir
              </Button>
            ),
            children: "Ayşe Kaya · Moda Cad. No:12 D:4, Kadıköy / İstanbul · 0532 *** ** 12",
          },
          { key: "odeme", label: "Ödeme", extra: <Tag color="success">Onaylandı</Tag>, children: "Kredi kartı (**** 4411) · Tek çekim" },
          { key: "fatura", label: "Fatura", disabled: true, extra: <Tag>Kargodan sonra</Tag>, children: "Fatura kargoya verildiğinde e-posta ile gönderilir." },
        ]}
      />
    </div>
  ),
};

/* ─────────────────────────── 3. Filtre paneli ─────────────────────────── */

export const FilterPanel: Story = {
  name: "Filtre Paneli (ghost)",
  ...storyDoc(
    "Kenar çubuğundaki filtreler: `ghost` zeminsiz ve çerçevesizdir, kartın kendi çerçevesine gömülür. `extra`'da seçili " +
      "filtre sayısı. Gövde form alanları içerir — kapalıyken `inert` olduğu için Tab gizli alanlara gitmez.",
    `
<aside className="rounded-xl border p-2">
  <Accordion variant="ghost" size="sm" defaultActiveKey={["marka", "fiyat"]} items={[
    { key: "marka", label: "Marka", extra: <Badge count={2} color="primary" />, children: <Checkbox label="Apple" /> … },
    { key: "fiyat", label: "Fiyat", children: <Slider range … /> },
    { key: "kargo", label: "Kargo", children: <Switch label="Ücretsiz kargo" /> },
  ]} />
</aside>`
  ),
  render: () => (
    <aside aria-label="Filtreler" className="max-w-72 rounded-xl border border-mari-border bg-mari-surface p-2">
      <Accordion
        variant="ghost"
        size="sm"
        defaultActiveKey={["marka", "fiyat"]}
        items={[
          {
            key: "marka",
            label: "Marka",
            extra: <Badge count={2} color="primary" />,
            children: (
              <div className="flex flex-col gap-2">
                <Checkbox label="Apple" defaultChecked />
                <Checkbox label="Samsung" defaultChecked />
                <Checkbox label="Xiaomi" />
                <Checkbox label="Lenovo" />
              </div>
            ),
          },
          { key: "fiyat", label: "Fiyat", children: <Slider aria-label="Fiyat üst sınırı" min={0} max={50000} step={500} defaultValue={25000} /> },
          { key: "kargo", label: "Kargo", children: <Switch label="Ücretsiz kargo" /> },
        ]}
      />
    </aside>
  ),
};

/* ─────────────────────────── 4. Tümünü aç/kapat ─────────────────────────── */

const specs: AccordionItem[] = [
  { key: "ekran", label: "Ekran", children: "14,2\" Liquid Retina XDR · 3024×1964 · 120 Hz ProMotion" },
  { key: "islemci", label: "İşlemci ve bellek", children: "12 çekirdekli CPU · 19 çekirdekli GPU · 18 GB birleşik bellek" },
  { key: "pil", label: "Pil", children: "72,4 Wh · 18 saate kadar video oynatma · 70 W USB-C adaptör" },
  { key: "baglanti", label: "Bağlantı", children: "3× Thunderbolt 4 · HDMI · SDXC · MagSafe 3 · Wi-Fi 6E · Bluetooth 5.3" },
];

export const Controlled: Story = {
  name: "Tümünü Aç/Kapat (controlled)",
  ...storyDoc(
    "`activeKey` + `onChange` ile açık bölümler dışarıdan yönetilir — burada teknik özellikleri tek tıkla açıp kapatan " +
      "düğmeler. `onChange` her zaman dizi verir.",
    `
const [open, setOpen] = useState<string[]>(["ekran"]);

<Button onClick={() => setOpen(specs.map((s) => s.key))}>Tümünü aç</Button>
<Button onClick={() => setOpen([])}>Tümünü kapat</Button>
<Accordion variant="borderless" activeKey={open} onChange={setOpen} items={specs} />`
  ),
  render: () => {
    const [open, setOpen] = useState<string[]>(["ekran"]);
    return (
      <div className="flex max-w-2xl flex-col gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen(specs.map((s) => s.key))} disabled={open.length === specs.length}>
            Tümünü aç
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen([])} disabled={open.length === 0}>
            Tümünü kapat
          </Button>
          <span className="ml-auto text-sm text-mari-muted" aria-live="polite">
            {open.length}/{specs.length} açık
          </span>
        </div>
        <Accordion variant="borderless" activeKey={open} onChange={setOpen} items={specs} />
      </div>
    );
  },
};

/* ─────────────────────────── 5. Görünümler ve boyutlar ─────────────────────────── */

export const Variants: Story = {
  name: "Görünümler ve Boyutlar",
  ...storyDoc(
    "Dört görünüm ve üç boyut (başlık dolgusu sm 8·12 / md 12·16 / lg 16·24px; lg'de başlık 16px).",
    `
<Accordion variant="bordered" … />
<Accordion variant="borderless" … />
<Accordion variant="ghost" … />
<Accordion variant="separated" … />
<Accordion size="sm" … /> <Accordion size="lg" … />`
  ),
  // Her demo farklı bir bölümü açık tutar: aynı sayfada aynı adlı iki region
  // (landmark) olmasın — gerçek sayfada da aynı başlıklı iki Accordion'dan kaçının.
  render: () => (
    <div className="grid max-w-5xl gap-8 md:grid-cols-2">
      {(["bordered", "borderless", "ghost", "separated"] as const).map((variant, i) => (
        <section key={variant} className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-mari-muted">{variant}</h3>
          <Accordion variant={variant} headingLevel={4} defaultActiveKey={faq[i]!.key} items={faq} />
        </section>
      ))}
      {(["sm", "lg"] as const).map((size, i) => (
        <section key={size} className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-mari-muted">size="{size}"</h3>
          <Accordion size={size} headingLevel={4} defaultActiveKey={specs[i]!.key} items={specs} />
        </section>
      ))}
    </div>
  ),
};

/* ─────────────────────────── 6. İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet (skeleton)",
  ...storyDoc(
    "`skeleton`: başlıklar kendi metin genişliğinde, açık bölümün içeriği kendi şeklinde yer tutucuya döner; " +
      "başlıklar tıklanamaz. Yüklenince yükseklik değişmez.",
    `<Accordion skeleton={loading} defaultActiveKey="iade" items={faq} />`
  ),
  render: () => {
    const [on, setOn] = useState(true);
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <Switch checked={on} onChange={setOn} label="İskelet" />
        <Accordion skeleton={on} defaultActiveKey="iade" items={faq} />
      </div>
    );
  },
};
