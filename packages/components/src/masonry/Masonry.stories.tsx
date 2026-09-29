/**
 * Faz 16.3: gerçek senaryolar — ilham panosu (farklı oranlı görseller),
 * müşteri yorumları (farklı uzunlukta kartlar), iskelet.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CoffeeIcon, FlowerIcon, MountainIcon, PaletteIcon, SailboatIcon, SunIcon, TentIcon, TreePineIcon } from "lucide-react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Masonry } from ".";
import type { MasonryItem } from ".";
import { Avatar } from "../avatar";
import { Card } from "../card";
import { Rate } from "../rate";
import { Switch } from "../switch";

const meta: Meta<typeof Masonry> = {
  title: "Veri Gösterimi/Masonry",
  component: Masonry,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Farklı yükseklikteki öğeleri boşluk bırakmadan sütunlara dizer: her öğe o an en kısa sütuna girer. Sütun " +
            "sayısı pencere genişliğine göre verilebilir (`{ base: 1, sm: 2, lg: 3 }`); öğe büyürse (görsel yüklendi) " +
            "yerleşim kendiliğinden yenilenir.",
          whenToUse: [
            "Oranları farklı görseller (ilham panosu, portfolyo, ürün galerisi).",
            "Uzunluğu değişen kartlar (yorumlar, notlar, sosyal akış).",
          ],
          whenNotToUse: [
            "Öğeler eşit yükseklikteyse ya da satır hizası önemliyse — List `grid` ya da CSS grid.",
            "Sıranın satır satır okunması gerekiyorsa (sıralama, tablo verisi) — Masonry görsel sırayı sütunlara dağıtır.",
          ],
          a11y:
            "`<ul>` + `<li>`; görünür başlık yoksa `aria-label` verin. DOM (Tab ve ekran okuyucu) sırası verideki sıradır — " +
            "yalnız görsel konum hesaplanır. Ölçüm gelmeden (SSR, ilk kare) CSS `columns` ile çizilir. Yer değişimi " +
            "hareket azaltma tercihinde animasyonsuz.",
        }),
      },
    },
  },
  argTypes: {
    items: { control: false },
    columns: { control: "object" },
    gutter: { control: "inline-radio", options: ["sm", "md", "lg"], table: { defaultValue: { summary: "md" } } },
    onLayoutChange: { table: { category: "Olaylar" } },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Masonry>;

const tones = [
  "from-mari-primary-subtle to-mari-surface-alt text-mari-primary",
  "from-mari-accent-subtle to-mari-surface-alt text-mari-accent",
  "from-mari-success-subtle to-mari-surface-alt text-mari-success",
  "from-mari-warning-subtle to-mari-surface-alt text-mari-warning",
  "from-mari-info-subtle to-mari-surface-alt text-mari-info",
];

const board = [
  { title: "Kapadokya'da gün doğumu", ratio: "aspect-[3/4]", Icon: SunIcon },
  { title: "Kaş'ta tekne turu", ratio: "aspect-[4/3]", Icon: SailboatIcon },
  { title: "Karadeniz yaylaları", ratio: "aspect-[2/3]", Icon: MountainIcon },
  { title: "Üçüncü dalga kahveciler", ratio: "aspect-square", Icon: CoffeeIcon },
  { title: "Kamp ekipmanı listesi", ratio: "aspect-[3/5]", Icon: TentIcon },
  { title: "Lale Festivali", ratio: "aspect-[4/5]", Icon: FlowerIcon },
  { title: "Belgrad Ormanı yürüyüşü", ratio: "aspect-[16/10]", Icon: TreePineIcon },
  { title: "Ebru atölyesi", ratio: "aspect-[3/4]", Icon: PaletteIcon },
];

const boardItems: MasonryItem[] = board.map((b, i) => ({
  key: b.title,
  children: (
    <figure className="overflow-hidden rounded-xl border border-mari-border bg-mari-surface">
      <div className={`flex ${b.ratio} items-center justify-center bg-gradient-to-br ${tones[i % tones.length]}`}>
        <b.Icon size={40} strokeWidth={1.25} aria-hidden />
      </div>
      <figcaption className="px-3 py-2 text-sm font-medium text-mari-foreground">{b.title}</figcaption>
    </figure>
  ),
}));

/* ─────────────────────────── Playground ─────────────────────────── */

export const Playground: Story = {
  args: { items: boardItems, columns: { base: 1, sm: 2, lg: 4 }, gutter: "md" },
  render: (args) => <Masonry aria-label="İlham panosu" {...args} />,
};

/* ─────────────────────────── 1. İlham panosu ─────────────────────────── */

export const InspirationBoard: Story = {
  name: "İlham Panosu",
  ...storyDoc(
    "Oranları farklı görseller: sütun sayısı pencereye göre (mobilde 2, tablette 3, masaüstünde 4). Her görsel o an en " +
      "kısa sütuna yerleşir; DOM sırası verideki sıradır.",
    `
<Masonry
  aria-label="İlham panosu"
  columns={{ base: 2, md: 3, lg: 4 }}
  gutter="md"
  items={pins.map((p) => ({
    key: p.id,
    children: (
      <figure className="overflow-hidden rounded-xl border">
        <img src={p.image} alt="" />
        <figcaption className="px-3 py-2 text-sm">{p.title}</figcaption>
      </figure>
    ),
  }))}
/>`
  ),
  render: () => <Masonry aria-label="İlham panosu" columns={{ base: 2, md: 3, lg: 4 }} items={boardItems} />,
};

/* ─────────────────────────── 2. Yorumlar ─────────────────────────── */

const reviews = [
  { name: "Ayşe K.", rate: 5, text: "Kargo ertesi gün geldi, paketleme çok özenliydi." },
  {
    name: "Mehmet D.",
    rate: 4,
    text: "Ses kalitesi fiyatına göre çok iyi. Gürültü engelleme metroda yeterli ama uçakta biraz daha güçlü olabilirdi. Kutu içeriği eksiksiz, şarj kablosu kısa.",
  },
  { name: "Zeynep A.", rate: 5, text: "İkinci kez alıyorum, annemin de çok hoşuna gitti." },
  { name: "Can Y.", rate: 3, text: "Ürün güzel fakat renk fotoğraftakinden biraz daha koyu. İade süreci kolaydı, bir beden büyüğünü sipariş ettim." },
  { name: "Elif S.", rate: 5, text: "Tam beklediğim gibi." },
  {
    name: "Burak T.",
    rate: 4,
    text: "Kurulumu 10 dakika sürdü, uygulaması Türkçe ve anlaşılır. Gece modu çok işe yarıyor. Tek eksik: duvar montaj vidaları kutudan çıkmadı, müşteri hizmetleri ertesi gün kargoladı.",
  },
];

export const Reviews: Story = {
  name: "Müşteri Yorumları (kartlar)",
  ...storyDoc(
    "Uzunluğu değişen kartlar: kısa yorumlar uzunların yanındaki boşluğu doldurur. Kartın kendisi (Card) tüketicinin; " +
      "Masonry yalnız yerleştirir.",
    `
<Masonry
  aria-label="Müşteri yorumları"
  columns={{ base: 1, sm: 2, lg: 3 }}
  items={reviews.map((r) => ({
    key: r.id,
    children: (
      <Card size="sm">
        <CardMeta avatar={<Avatar alt={r.name} />} title={r.name} />
        <Rate value={r.rate} disabled />
        <p>{r.text}</p>
      </Card>
    ),
  }))}
/>`
  ),
  render: () => (
    <Masonry
      aria-label="Müşteri yorumları"
      columns={{ base: 1, sm: 2, lg: 3 }}
      items={reviews.map((r) => ({
        key: r.name,
        children: (
          <Card size="sm">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Avatar alt={r.name} size="sm" />
                <span className="font-medium">{r.name}</span>
              </div>
              <Rate value={r.rate} disabled aria-label={`${r.rate} yıldız`} />
              <p className="leading-6 text-mari-foreground">{r.text}</p>
            </div>
          </Card>
        ),
      }))}
    />
  ),
};

/* ─────────────────────────── 2b. Sonsuz pano ─────────────────────────── */

export const InfiniteBoard: Story = {
  name: "Sonsuz Pano (infinite)",
  ...storyDoc(
    "`infinite`: pano sonu görünüme girince sonraki sayfa istenir; yeni görseller mevcut sütunların en kısasına eklenir " +
      "(önceki öğeler yer değiştirmez). Klavye için Tab ile beliren \"Daha fazla yükle\" düğmesi.",
    `
<Masonry
  aria-label="İlham panosu"
  columns={{ base: 2, md: 3, lg: 4 }}
  items={pins}
  infinite={{ hasMore, loading, onLoadMore: fetchNextPage }}
/>`
  ),
  render: () => {
    const [count, setCount] = useState(8);
    const [loading, setLoading] = useState(false);
    const items = Array.from({ length: count }, (_, i) => ({ ...boardItems[i % boardItems.length]!, key: `pin-${i}` }));
    return (
      <Masonry
        aria-label="İlham panosu"
        columns={{ base: 2, md: 3, lg: 4 }}
        items={items}
        infinite={{
          hasMore: count < 32,
          loading,
          onLoadMore: () => {
            setLoading(true);
            setTimeout(() => {
              setCount((c) => c + 8);
              setLoading(false);
            }, 700);
          },
        }}
      />
    );
  },
};

/* ─────────────────────────── 3. İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet (skeleton)",
  ...storyDoc(
    "`skeleton`: öğeler varsa her biri kendi şeklinde; yoksa (ilk yükleme) farklı yükseklikte yer tutucular aynı " +
      "sütun düzeninde çizilir.",
    `
<Masonry skeleton={loading} aria-label="İlham panosu" items={pins} />
<Masonry skeleton aria-label="İlham panosu" items={[]} />  // ilk yükleme`
  ),
  render: () => {
    const [on, setOn] = useState(true);
    return (
      <div className="flex flex-col gap-4">
        <Switch checked={on} onChange={setOn} label="İskelet" />
        <Masonry skeleton={on} aria-label="İlham panosu" columns={{ base: 2, lg: 4 }} items={boardItems} />
        <Masonry skeleton={on} aria-label="İlham panosu (ilk yükleme)" columns={{ base: 2, lg: 3 }} items={on ? [] : boardItems.slice(0, 6)} />
      </div>
    );
  },
};
