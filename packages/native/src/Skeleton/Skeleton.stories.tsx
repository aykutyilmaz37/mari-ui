import React from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, SkeletonBlock } from "./Skeleton";
import { Avatar } from "../Avatar";
import { Card } from "../Card";
import { Paragraph, Text, Title } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Skeleton> = {
  title: "Native/Geri Bildirim/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Kendi `skeleton` prop'u olmayan serbest içerik için yer tutucu: avatar + başlık + paragraf ya da serbest kutu (`SkeletonBlock`).",
    whenToUse: ["Henüz bileşeni belli olmayan özel bir bölüm yüklenirken.", "Görsel, grafik gibi serbest kutular için `SkeletonBlock`."],
    whenNotToUse: ["mari-ui bileşenleri için — her birinin kendi `skeleton` prop'u var, kendi geometrisinde çizer."],
    vsWeb: "Prop'lar aynı. Satırlar Typography ölçeğinde: başlık Headline 17/22, paragraf Body 17/22 → yerine gelen `Title level={5}` + `Paragraph` ile aynı yükseklik. `active` native'de varsayılan `true` (component iskeletleriyle aynı nabız; hareket azaltmada durur). `label` verilince \"meşgul\" olarak duyurulur, yoksa gizli. Genişlikler `DimensionValue` (pt ya da yüzde).",
  }) } } },
  argTypes: {
    avatar: { control: "boolean" },
    title: { control: "boolean" },
    paragraph: { control: "boolean" },
    round: { control: "boolean" },
    active: { control: "boolean" },
    loading: { control: "boolean" },
  },
  args: { avatar: true, title: true, paragraph: true, round: false, active: true, loading: true },
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Playground: Story = {
  ...storyDoc("Parçaları açıp kapatın; `loading={false}` içeriği gösterir."),
  render: (args) => (
    <Skeleton {...args}>
      <Text>Yüklendi.</Text>
    </Skeleton>
  ),
};

export const Comment: Story = {
  name: "Yorum Yükleniyor",
  ...storyDoc(
    "`loading` bitince aynı yerde gerçek içerik: avatar 40, başlık Headline, gövde paragraf — yükseklikler eşleşir. `rows` beklenen satır sayısıyla eşleşmeli; metni bilinen içerikte `Paragraph skeleton` satırları kendisi ölçer.",
    `<Skeleton loading={isLoading} avatar paragraph={{ rows: 1 }}>
  <Comment />
</Skeleton>`
  ),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Skeleton loading={skeleton} avatar paragraph={{ rows: 1, width: "70%" }} label="Yorum yükleniyor">
          <View style={{ flexDirection: "row", gap: 16, alignSelf: "stretch" }}>
            <Avatar alt="Mert Kaya" color="success" />
            <View style={{ flex: 1, gap: 8 }}>
              <Title level={5}>Mert Kaya</Title>
              <Paragraph>Hızlı kargo, sağlam paket.</Paragraph>
            </View>
          </View>
        </Skeleton>
      )}
    </SkeletonDemo>
  ),
};

export const ProductCard: Story = {
  name: "Ürün Kartı (Serbest Kutu)",
  ...storyDoc("Görsel alanı `SkeletonBlock`, metin alanı `Skeleton` — kart kendisi değişmez.", `<SkeletonBlock height={140} radius="lg" />
<Skeleton title={{ width: "70%" }} paragraph={{ rows: 1, width: "40%" }} />`),
  render: () => (
    <Card style={{ width: 220 }}>
      <View style={{ gap: 12 }}>
        <SkeletonBlock height={140} radius="lg" />
        <Skeleton title={{ width: "70%" }} paragraph={{ rows: 1, width: "40%" }} />
      </View>
    </Card>
  ),
};

export const Shapes: Story = {
  name: "Biçimler",
  ...storyDoc("Kare avatar, hap köşeli satırlar (`round`), duran (`active={false}`) iskelet.", `<Skeleton avatar={{ shape: "square", size: "lg" }} paragraph={{ rows: 2 }} />
<Skeleton round title={false} paragraph={{ rows: 2, width: ["90%", "50%"] }} />
<Skeleton active={false} avatar={{ size: "sm" }} paragraph={false} />`),
  render: () => (
    <Stack>
      <Skeleton avatar={{ shape: "square", size: "lg" }} paragraph={{ rows: 2 }} />
      <Skeleton round title={false} paragraph={{ rows: 2, width: ["90%", "50%"] }} />
      <Skeleton active={false} avatar={{ size: "sm" }} paragraph={false} />
    </Stack>
  ),
};

export const SkeletonStory: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Skeleton loading={isLoading} avatar>{content}</Skeleton>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Skeleton loading={skeleton} avatar title paragraph={{ rows: 1 }}>
          <View style={{ flexDirection: "row", gap: 16, alignSelf: "stretch" }}>
            <Avatar alt="Ayşe Demir" />
            <View style={{ flex: 1, gap: 8 }}>
              <Title level={5}>Ayşe Demir</Title>
              <Paragraph muted>Ürün tasarımcısı</Paragraph>
            </View>
          </View>
        </Skeleton>
      )}
    </SkeletonDemo>
  ),
};
