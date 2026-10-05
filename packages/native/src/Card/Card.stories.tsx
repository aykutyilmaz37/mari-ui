import React from "react";
import { Text } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Button } from "../Button/Button";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Card> = {
  title: "Native/Card",
  component: Card,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "İçerik kartı — web `Card` ile aynı slotlar: `title`, `extra`, `cover`, `footer`, gövde.",
          whenToUse: ["Bir kaydı özetlemek: sipariş, profil, ürün.", "Dokunulabilir liste öğesi (`hoverable` + `onPress`)."],
          vsWeb: "Fare üzerine gelme yok: `hoverable` dokunurken basılma efekti verir.",
        }),
      },
    },
  },
  args: { title: "Sipariş #4821", children: "2 ürün · ₺1.284,50 · Kargoda", bordered: true, skeleton: false },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  render: (args) => (
    <Stack>
      <Card {...args} />
    </Stack>
  ),
};

export const OrderSummary: Story = {
  name: "Sipariş Özeti",
  ...storyDoc("Başlık + ek bilgi + alt kısımda eylem.", `<Card title="Sipariş #4821" extra={<Text>3 Eki</Text>} footer={<Button size="sm" variant="soft">Detay</Button>}>…</Card>`),
  render: () => (
    <Stack>
      <Card title="Sipariş #4821" extra={<Text>3 Eki</Text>} footer={<Button size="sm" variant="soft">Detay</Button>}>
        2 ürün · ₺1.284,50 · Kargoda
      </Card>
    </Stack>
  ),
};

export const Pressable: Story = {
  name: "Dokunulabilir",
  ...storyDoc("`hoverable` + `onPress`: tüm kart dokunma hedefi, basılınca geri bildirim.", `<Card hoverable onPress={open} title="Profil">…</Card>`),
  render: () => (
    <Stack>
      <Card hoverable onPress={() => undefined} title="Profil ayarları">
        Ad, e-posta ve bildirim tercihleri
      </Card>
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Card skeleton={isLoading} title={order?.title}>…</Card>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Stack>
          <Card skeleton={skeleton} title="Sipariş #4821" extra={<Text>3 Eki</Text>} footer={<Button size="sm" variant="soft">Detay</Button>}>
            2 ürün · ₺1.284,50 · Kargoda. Tahmini teslimat 6 Ekim Pazartesi.
          </Card>
        </Stack>
      )}
    </SkeletonDemo>
  ),
};
