import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./Pagination";
import { ListItem, ListItemMeta } from "../List";
import { Text } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Pagination> = {
  title: "Native/Navigasyon/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Sayfalama. Varsayılan `‹ 3 / 10 ›` — mobilde yaygın biçim. `simple={false}`: sayfa numaraları; kaç komşu sığacağı genişliğe göre ayarlanır, `…` beş sayfa atlar. `showTotal`: \"11–20 / 95 kayıt\".",
    whenToUse: ["Sayfa sayfa gezilen içerik: arama sonuçları, sipariş geçmişi, makale sayfaları.", "Kullanıcının belli bir sayfaya dönmesi gerekiyorsa."],
    whenNotToUse: ["Uzun akışlar — sonsuz kaydırma (`List` / `Masonry` `infinite`) mobilde daha doğal.", "Birkaç adımlı süreç — Steps; görsel sırası — Carousel noktaları."],
    vsWeb: "Mantık web Pagination ile aynı (`getPageItems`, `fitSiblingCount`, `…` atlaması). Fark: varsayılan `simple` (`‹ 3 / 10 ›`); sayfa boyutu seçici (`showSizeChanger`) ve \"Git\" alanı (`showQuickJumper`) yok — gerekiyorsa yanına Select / InputNumber koyun; `align` yok (ortalı). Düğme sm 32 · md 40 · lg 44, dokunma alanı hep 44.",
  }) } } },
  argTypes: {
    simple: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["outline", "soft", "solid"] },
    color: { control: "select", options: ["primary", "accent", "neutral"] },
    showTotal: { control: "boolean" },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { totalItems: 95, simple: true, size: "md", variant: "outline", color: "primary", showTotal: false, disabled: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  render: (args) => <Pagination {...args} />,
};

const STATES = ["Teslim edildi", "Kargoda", "Hazırlanıyor", "İade edildi"];
const ORDERS = Array.from({ length: 47 }, (_, i) => ({ id: 48213 - i, title: `Sipariş #${48213 - i}`, desc: STATES[i % 4]! }));

function OrdersDemo() {
  const [page, setPage] = useState(1);
  const size = 5;
  const rows = ORDERS.slice((page - 1) * size, page * size);
  return (
    <Stack>
      <View>
        {rows.map((o) => (
          <ListItem key={o.id}>
            <ListItemMeta title={o.title} description={o.desc} />
          </ListItem>
        ))}
      </View>
      <Pagination totalItems={ORDERS.length} pageSize={size} currentPage={page} onPageChange={setPage} showTotal />
    </Stack>
  );
}

export const Orders: Story = {
  name: "Sipariş Geçmişi (simple + toplam)",
  ...storyDoc("Kontrollü: `currentPage` + `onPageChange`; `showTotal` altta kayıt aralığı.", `<Pagination totalItems={orders.length} pageSize={5} currentPage={page} onPageChange={setPage} showTotal />`),
  render: () => <OrdersDemo />,
};

export const Numbers: Story = {
  name: "Sayfa Numaraları",
  ...storyDoc("`simple={false}`: numaralar; dar ekranda komşu sayısı kendiliğinden azalır (taşmaz). `…` beş sayfa atlar.", `<Pagination simple={false} totalItems={500} defaultPage={12} />`),
  render: () => (
    <Stack>
      <Pagination simple={false} totalItems={500} defaultPage={12} />
      <Pagination simple={false} totalItems={500} defaultPage={12} siblingCount={2} variant="solid" />
      <Pagination simple={false} totalItems={60} defaultPage={2} variant="soft" />
    </Stack>
  ),
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("Düğme sm 32 · md 40 · lg 44; dokunma alanı her boyutta 44.", `<Pagination size="sm" />  <Pagination size="lg" />`),
  render: () => (
    <Stack>
      {(["sm", "md", "lg"] as const).map((s) => (
        <View key={s} style={{ gap: 4 }}>
          <Text muted style={{ fontSize: 13 }}>{s}</Text>
          <Pagination size={s} simple={false} totalItems={80} defaultPage={3} />
        </View>
      ))}
    </Stack>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc("İlk / son sayfada ilgili ok pasif; `disabled` tümü.", `
<Pagination totalItems={30} defaultPage={1} />
<Pagination totalItems={30} defaultPage={3} />
<Pagination totalItems={30} defaultPage={2} disabled />`),
  render: () => (
    <Stack>
      <Pagination totalItems={30} defaultPage={1} />
      <Pagination totalItems={30} defaultPage={3} />
      <Pagination totalItems={30} defaultPage={2} disabled />
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Oklar ve sayfa düğmeleri kare, sayaç ince çubuk.", `<Pagination skeleton={isLoading} totalItems={total ?? 0} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Stack>
          <Pagination skeleton={skeleton} totalItems={95} />
          <Pagination skeleton={skeleton} simple={false} totalItems={95} defaultPage={4} />
        </Stack>
      )}
    </SkeletonDemo>
  ),
};
