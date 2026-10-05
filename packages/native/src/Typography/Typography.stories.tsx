import React from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Paragraph, Text, Title } from "./Typography";
import { Card } from "../Card";
import { NativeConfigProvider } from "../nativeConfig";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Title> = {
  title: "Native/Genel/Typography",
  component: Title,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Başlık (`Title`), satır içi metin (`Text`) ve paragraf (`Paragraph`). Ölçek Apple HIG metin stillerinden gelir; renkler temadan.",
    whenToUse: ["Ekran ve bölüm başlıkları, gövde metni, ikincil açıklamalar.", "Paragraf içinde vurgu: iç içe `Text` boyutu ebeveynden alır, yalnız renk/ağırlık değiştirir."],
    whenNotToUse: ["Düğme veya bağlantı etiketi — `Button` kullanın.", "Liste satırı başlığı — `ListItemMeta` kendi ölçeğini kullanır."],
    vsWeb: "Prop'lar aynı (`level`, `color`, `weight`, `muted`, `ellipsis`, `skeleton`, `skeletonRows`). Ölçü native'e özel: gövde 17/22, başlıklar 34·28·22·20·17·15 (HIG Large Title → Subheadline); web'de gövde 16, h1 30. `ellipsis` → `numberOfLines`. `className` yerine `style`. Başlık `accessibilityRole=\"header\"` alır (RN'de seviye bilgisi yok). Ölçek `NativeConfigProvider` `typography` ile ezilebilir.",
  }) } } },
  argTypes: {
    level: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    color: { control: "select", options: [undefined, "primary", "accent", "neutral", "success", "warning", "error", "info"] },
    children: { control: "text" },
    skeleton: { control: "boolean" },
  },
  args: { level: 1, children: "Siparişlerim", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Title>;

export const Playground: Story = {
  ...storyDoc("Seviye, renk ve iskeleti deneyin."),
  render: (args) => <Title {...args} />,
};

export const Screen: Story = {
  name: "Ekran Başlığı ve Gövde",
  ...storyDoc(
    "Tipik bir detay ekranı: büyük başlık, ikincil bilgi, bölüm başlığı ve paragraf. Paragraf içindeki vurgu iç içe `Text` ile — boyutu paragraftan miras alır.",
    `<Title level={1}>Sipariş #4821</Title>
<Text muted>3 Ekim · 2 ürün</Text>
<Title level={5}>Teslimat</Title>
<Paragraph>Kargonuz <Text weight="semibold">6 Ekim</Text> tarihinde teslim edilecek.</Paragraph>`
  ),
  render: () => (
    <View style={{ alignSelf: "stretch", gap: 4 }}>
      <Title level={1}>Sipariş #4821</Title>
      <Text muted>3 Ekim · 2 ürün · ₺1.284,50</Text>
      <View style={{ height: 16 }} />
      <Title level={5}>Teslimat</Title>
      <Paragraph>
        Kargonuz <Text weight="semibold">6 Ekim Pazartesi</Text> tarihinde teslim edilecek. Teslimat sırasında evde olamayacaksanız adres değişikliğini <Text color="primary" weight="medium">Sipariş ayrıntıları</Text> ekranından yapabilirsiniz.
      </Paragraph>
    </View>
  ),
};

export const InCard: Story = {
  name: "Kart İçinde Kısaltma",
  ...storyDoc(
    "Dar alanda uzun ürün adı iki satırdan sonra kısalır; tek satırlık alt bilgi `ellipsis` ile kesilir.",
    `<Title level={5} ellipsis={{ rows: 2 }}>{product.name}</Title>
<Text muted ellipsis>{product.seller}</Text>`
  ),
  render: () => (
    <Card style={{ width: 240 }}>
      <View style={{ gap: 4 }}>
        <Title level={5} ellipsis={{ rows: 2 }}>Apple MacBook Air 13 inç M3 Çip 8 Çekirdekli CPU 10 Çekirdekli GPU 16GB 512GB SSD Gece Yarısı</Title>
        <Text muted ellipsis>Satıcı: Teknoloji Mağazası Resmi Distribütör</Text>
        <Text weight="bold">₺54.999</Text>
      </View>
    </Card>
  ),
};

export const TitleLevels: Story = {
  name: "Başlık Seviyeleri",
  ...storyDoc("HIG karşılıkları: 1 Large Title 34 · 2 Title 1 28 · 3 Title 2 22 · 4 Title 3 20 · 5 Headline 17 · 6 Subheadline 15.", `<Title level={1}>Large Title</Title>
<Title level={3}>Title 2</Title>
<Title level={5}>Headline</Title>`),
  render: () => (
    <Stack>
      {([1, 2, 3, 4, 5, 6] as const).map((level) => <Title key={level} level={level}>{`Başlık ${level}`}</Title>)}
    </Stack>
  ),
};

export const Weights: Story = {
  name: "Ağırlık ve Renk",
  ...storyDoc("`weight` dört kademe; `muted` ikincil metin; `color` rol rengi (metin tonu, zemine AA kontrast).", `<Text weight="semibold">Vurgulu</Text>
<Text muted>İkincil metin</Text>
<Text color="success">Teslim edildi</Text>`),
  render: () => (
    <Stack>
      {(["normal", "medium", "semibold", "bold"] as const).map((weight) => <Text key={weight} weight={weight}>{`Ağırlık: ${weight}`}</Text>)}
      <Text muted>İkincil metin (muted)</Text>
      {(["primary", "success", "warning", "error", "info"] as const).map((color) => <Text key={color} color={color}>{`Renk: ${color}`}</Text>)}
    </Stack>
  ),
};

export const CustomScale: Story = {
  name: "Uygulamaya Özel Ölçek",
  ...storyDoc(
    "`NativeConfigProvider` ile yalnız verilen satırlar değişir; diğer metin stilleri varsayılanda kalır.",
    `<NativeConfigProvider config={{ typography: { body: { fontSize: 15, lineHeight: 20 }, h1: { fontSize: 30, lineHeight: 36 } } }}>…</NativeConfigProvider>`
  ),
  render: () => (
    <NativeConfigProvider config={{ typography: { body: { fontSize: 15, lineHeight: 20 }, h1: { fontSize: 30, lineHeight: 36 } } }}>
      <View style={{ alignSelf: "stretch", gap: 4 }}>
        <Title level={1}>Kompakt uygulama</Title>
        <Paragraph>Yoğun içerikli ekranlarda gövde 15/20 kullanılır; başlık seviyeleri yerinde kalır.</Paragraph>
      </View>
    </NativeConfigProvider>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Title skeleton={isLoading}>Sipariş #4821</Title>
<Text skeleton={isLoading} muted>3 Ekim · 2 ürün</Text>
<Paragraph skeleton={isLoading} skeletonRows={3}>…</Paragraph>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View style={{ alignSelf: "stretch", gap: 4 }}>
          <Title level={2} skeleton={skeleton}>Sipariş #4821</Title>
          <Text skeleton={skeleton} muted>3 Ekim · 2 ürün · ₺1.284,50</Text>
          <Paragraph skeleton={skeleton} skeletonRows={3}>
            Kargonuz 6 Ekim Pazartesi tarihinde teslim edilecek. Teslimat sırasında evde olamayacaksanız adres değişikliğini sipariş ayrıntıları ekranından yapabilirsiniz.
          </Paragraph>
        </View>
      )}
    </SkeletonDemo>
  ),
};
