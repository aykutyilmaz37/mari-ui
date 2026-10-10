import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, type AccordionItem } from "./Accordion";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "../Card";
import { Checkbox } from "../Checkbox";
import { Slider } from "../Slider";
import { Switch } from "../Switch";
import { Tag } from "../Tag";
import { Text, Title } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Accordion> = {
  title: "Native/Veri Gösterimi/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  // İlk dekoratör en içte: story tam genişlik, tema onun dışında.
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Başlıkları görünen, içeriği açılıp kapanan bölümler (ant.design Collapse). Birden çok bölüm açık olabilir; `single` ile yalnız biri. Dört görünüm: `bordered`, `borderless`, `ghost`, `separated`. `extra` başlığın sağına sayaç/etiket/düğme koyar.",
    whenToUse: ["Uzun ekranı taranabilir bölümlere ayırmak (SSS, sipariş detayı).", "İkincil ayarları/filtreleri gizleyip gerekince açmak."],
    whenNotToUse: ["Bölümler arasında gidip gelmek, aynı anda yalnız birini görmek — Tabs.", "İçeriğin tamamı okunmalıysa (sözleşme) — gizlemeyin."],
    vsWeb: "Prop'lar aynı (`className` → `style`). Başlık satırının her yerine dokunmak açar, satır en az 44pt. Ekran okuyucuda başlık `button` + `expanded` durumu; kapalı gövde erişilebilirlik ağacından çıkar. RN'de başlık seviyesi olmadığı için `headingLevel` yok sayılır. Açılma yükseklik animasyonuyla (hareket azaltmada anlık). Metin gövde Text'e sarılır. Ölçüler `nativeConfig.accordion`.",
  }) } } },
  argTypes: {
    variant: { control: "select", options: ["bordered", "borderless", "ghost", "separated"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    iconPlacement: { control: "select", options: ["start", "end"] },
    single: { control: "boolean" },
    destroyOnHidden: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Accordion>;

const FAQ: AccordionItem[] = [
  { key: "kargo", label: "Siparişim ne zaman kargoya verilir?", children: "Saat 15:00'e kadar verilen siparişler aynı gün kargoya verilir. Hafta sonu verilen siparişler pazartesi çıkar." },
  {
    key: "iade",
    label: "İade ve değişim nasıl yapılır?",
    children: (
      <Text style={{ fontSize: 15, lineHeight: 20 }}>
        Teslimattan itibaren 14 gün içinde <Text weight="semibold">Hesabım › Siparişlerim</Text> sayfasından ücretsiz iade kodu alabilirsiniz. Tutar 3-5 iş günü içinde kartınıza yansır.
      </Text>
    ),
  },
  { key: "taksit", label: "Taksit seçenekleri nelerdir?", children: "Anlaşmalı banka kartlarına 3, 6 ve 9 taksit; 1.000 ₺ üzeri alışverişlerde vade farksız 3 taksit." },
  { key: "fatura", label: "Kurumsal fatura alabilir miyim?", children: "Evet. Ödeme adımında “Kurumsal fatura” seçeneğini işaretleyip vergi bilgilerinizi girin." },
];

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  args: { defaultActiveKey: "kargo", variant: "bordered", size: "md", iconPlacement: "start", single: false, skeleton: false },
  render: (args) => <Accordion {...args} items={FAQ} />,
};

export const Faq: Story = {
  name: "Sıkça Sorulan Sorular",
  ...storyDoc("SSS: `separated` her soruyu ayrı kart yapar, `single` aynı anda tek cevap açık tutar, ok sağda (`iconPlacement=\"end\"`).", `<Accordion variant="separated" single iconPlacement="end" defaultActiveKey="kargo" items={[
  { key: "kargo", label: "Siparişim ne zaman kargoya verilir?", children: "Saat 15:00'e kadar…" },
  …
]} />`),
  render: () => (
    <View style={{ gap: 12 }}>
      <Title level={4}>Sıkça sorulan sorular</Title>
      <Accordion variant="separated" single iconPlacement="end" defaultActiveKey="kargo" items={FAQ} />
    </View>
  ),
};

const tl = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`;

export const OrderSummary: Story = {
  name: "Sipariş Özeti (extra)",
  ...storyDoc(
    "`extra` başlığın sağında, açma düğmesinin DIŞINDA: tutar, durum etiketi ya da düğme — dokunması bölümü açıp kapatmaz. Devre dışı bölüm soluk.",
    `<Accordion defaultActiveKey="urunler" items={[
  { key: "urunler", label: "Ürünler (3)", extra: <Text weight="medium">5.697,00 ₺</Text>, children: … },
  { key: "teslimat", label: "Teslimat adresi", extra: <Button size="sm" variant="link">Değiştir</Button>, children: … },
  { key: "odeme", label: "Ödeme", extra: <Tag color="success">Onaylandı</Tag>, children: … },
  { key: "fatura", label: "Fatura", disabled: true, extra: <Tag>Kargodan sonra</Tag>, children: … },
]} />`
  ),
  render: () => (
    <Accordion
      defaultActiveKey="urunler"
      items={[
        {
          key: "urunler",
          label: "Ürünler (3)",
          extra: <Text weight="medium" style={{ fontVariant: ["tabular-nums"] }}>{tl(5697)}</Text>,
          children: (
            <View style={{ gap: 8 }}>
              {([
                ["Kablosuz Kulaklık Pro", 2499],
                ["Mekanik Klavye TKL", 1899],
                ["USB-C Hub 7'si 1 arada", 1299],
              ] as const).map(([name, price]) => (
                <View key={name} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                  <Text style={{ flexShrink: 1 }}>{name}</Text>
                  <Text muted style={{ fontVariant: ["tabular-nums"] }}>{tl(price)}</Text>
                </View>
              ))}
            </View>
          ),
        },
        { key: "teslimat", label: "Teslimat adresi", extra: <Button size="sm" variant="link" accessibilityLabel="Teslimat adresini değiştir">Değiştir</Button>, children: "Ayşe Kaya · Moda Cad. No:12 D:4, Kadıköy / İstanbul · 0532 *** ** 12" },
        { key: "odeme", label: "Ödeme", extra: <Tag color="success">Onaylandı</Tag>, children: "Kredi kartı (**** 4411) · Tek çekim" },
        { key: "fatura", label: "Fatura", disabled: true, extra: <Tag>Kargodan sonra</Tag>, children: "Fatura kargoya verildiğinde e-posta ile gönderilir." },
      ]}
    />
  ),
};

export const FilterPanel: Story = {
  name: "Filtre Paneli (ghost)",
  ...storyDoc("`ghost` zeminsiz ve çerçevesiz, kartın kendi çerçevesine gömülür; `extra`'da seçili filtre sayısı.", `<Card>
  <Accordion variant="ghost" size="sm" defaultActiveKey={["marka", "fiyat"]} items={[
    { key: "marka", label: "Marka", extra: <Badge count={2} color="primary" />, children: <Checkbox label="Apple" /> … },
    { key: "fiyat", label: "Fiyat", children: <Slider … /> },
    { key: "kargo", label: "Kargo", children: <Switch label="Ücretsiz kargo" /> },
  ]} />
</Card>`),
  render: () => (
    <Card size="sm">
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
              <View>
                <Checkbox label="Apple" defaultChecked />
                <Checkbox label="Samsung" defaultChecked />
                <Checkbox label="Xiaomi" />
              </View>
            ),
          },
          { key: "fiyat", label: "Fiyat", children: <Slider accessibilityLabel="Fiyat üst sınırı" min={0} max={50000} step={500} defaultValue={25000} formatValue={(v) => `${v.toLocaleString("tr-TR")} ₺`} /> },
          { key: "kargo", label: "Kargo", children: <Switch label="Ücretsiz kargo" /> },
        ]}
      />
    </Card>
  ),
};

const SPECS: AccordionItem[] = [
  { key: "ekran", label: "Ekran", children: "14,2\" Liquid Retina XDR · 3024×1964 · 120 Hz ProMotion" },
  { key: "islemci", label: "İşlemci ve bellek", children: "12 çekirdekli CPU · 19 çekirdekli GPU · 18 GB birleşik bellek" },
  { key: "pil", label: "Pil", children: "72,4 Wh · 18 saate kadar video oynatma · 70 W USB-C adaptör" },
  { key: "baglanti", label: "Bağlantı", children: "3× Thunderbolt 4 · HDMI · SDXC · MagSafe 3 · Wi-Fi 6E · Bluetooth 5.3" },
];

function ControlledDemo() {
  const [open, setOpen] = useState<string[]>(["ekran"]);
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Button size="sm" variant="outline" color="neutral" onPress={() => setOpen(SPECS.map((s) => s.key))} disabled={open.length === SPECS.length}>Tümünü aç</Button>
        <Button size="sm" variant="ghost" color="neutral" onPress={() => setOpen([])} disabled={open.length === 0}>Tümünü kapat</Button>
        <Text muted accessibilityLiveRegion="polite" style={{ marginLeft: "auto" }}>{`${open.length}/${SPECS.length} açık`}</Text>
      </View>
      <Accordion variant="borderless" activeKey={open} onChange={setOpen} items={SPECS} />
    </View>
  );
}

export const Controlled: Story = {
  name: "Tümünü Aç/Kapat (controlled)",
  ...storyDoc("`activeKey` + `onChange` ile açık bölümler dışarıdan yönetilir. `onChange` her zaman dizi verir.", `const [open, setOpen] = useState<string[]>(["ekran"]);
<Button onPress={() => setOpen(specs.map((s) => s.key))}>Tümünü aç</Button>
<Accordion variant="borderless" activeKey={open} onChange={setOpen} items={specs} />`),
  render: () => <ControlledDemo />,
};

export const Variants: Story = {
  name: "Görünümler ve Boyutlar",
  ...storyDoc("Dört görünüm ve üç boyut (başlık dolgusu sm 10·12 / md 12·16 / lg 16·20).", `<Accordion variant="borderless" … />
<Accordion variant="ghost" … />
<Accordion variant="separated" … />
<Accordion size="sm" … />`),
  render: () => (
    <View style={{ gap: 24 }}>
      {(["bordered", "borderless", "ghost", "separated"] as const).map((variant, i) => (
        <View key={variant} style={{ gap: 8 }}>
          <Text muted style={{ fontSize: 13 }}>{variant}</Text>
          <Accordion variant={variant} defaultActiveKey={FAQ[i]?.key} items={FAQ.slice(0, 3)} />
        </View>
      ))}
      {(["sm", "lg"] as const).map((size) => (
        <View key={size} style={{ gap: 8 }}>
          <Text muted style={{ fontSize: 13 }}>{`size="${size}"`}</Text>
          <Accordion size={size} items={SPECS.slice(0, 3)} />
        </View>
      ))}
    </View>
  ),
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Başlıklar kendi metin genişliğinde, açık bölümün içeriği kendi şeklinde; başlıklar dokunulamaz.", `<Accordion skeleton={loading} defaultActiveKey="iade" items={faq} />`),
  render: () => <SkeletonDemo>{(skeleton) => <Accordion skeleton={skeleton} defaultActiveKey="iade" items={FAQ} />}</SkeletonDemo>,
};
