import React from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";
import { Button } from "../Button";
import { Paragraph, Text, Title } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Divider> = {
  title: "Native/Genel/Divider",
  component: Divider,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "İçerik bölümlerini ayıran ince çizgi; isteğe bağlı başlıkla.",
    whenToUse: ["Bir ekrandaki ilgili ama ayrı bölümleri ayırmak.", "Giriş ekranındaki \"veya\" gibi seçenek ayrımları.", "Satır içi meta bilgileri dikey çizgiyle ayırmak."],
    whenNotToUse: ["Liste satırları arası — `List` kendi ayırıcısını çizer.", "Kart içinde başlık/gövde ayrımı — `Card` bölgeleri zaten ayrışır."],
    vsWeb: "Prop'lar aynı. Düz çizgi platformun saç teli kalınlığında (`hairlineWidth`, iOS ayırıcıları gibi); kesik/noktalı 1pt. Boşluk sm/md/lg 8/16/24. `labelMargin` ve `height` pt. RN'de \"separator\" rolü olmadığından çizgi ekran okuyucudan gizlidir; başlık okunur.",
  }) } } },
  argTypes: {
    children: { control: "text" },
    lineStyle: { control: "select", options: ["solid", "dashed", "dotted"] },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    labelAlign: { control: "select", options: ["start", "center", "end"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    plain: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { children: "Bölüm", lineStyle: "solid", orientation: "horizontal", labelAlign: "center", size: "md", plain: true, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Playground: Story = {
  ...storyDoc("Yön, çizgi stili, başlık hizası ve boşluğu deneyin."),
  render: (args) => <View style={{ alignSelf: "stretch" }}><Divider {...args} /></View>,
};

export const SignIn: Story = {
  name: "Giriş Seçenekleri",
  ...storyDoc("E-posta ile giriş ve sosyal giriş arasında \"veya\" ayrımı.", `<Button block>Giriş yap</Button>
<Divider>veya</Divider>
<Button block variant="outline">Apple ile devam et</Button>`),
  render: () => (
    <View style={{ alignSelf: "stretch" }}>
      <Button block>Giriş yap</Button>
      <Divider>veya</Divider>
      <View style={{ gap: 12 }}>
        <Button block variant="outline" color="neutral">Apple ile devam et</Button>
        <Button block variant="outline" color="neutral">Google ile devam et</Button>
      </View>
    </View>
  ),
};

export const Sections: Story = {
  name: "Ayar Bölümleri",
  ...storyDoc("Başlığı sola hizalı, vurgulu (`plain={false}`) bölüm ayırıcıları.", `<Divider labelAlign="start" plain={false}>Hesap</Divider>`),
  render: () => (
    <View style={{ alignSelf: "stretch" }}>
      <Divider labelAlign="start" labelMargin={0} plain={false} size="sm">Hesap</Divider>
      <Paragraph muted>Ad, e-posta ve telefon numaranızı güncelleyin.</Paragraph>
      <Divider labelAlign="start" labelMargin={0} plain={false}>Bildirimler</Divider>
      <Paragraph muted>Sipariş ve kampanya bildirimlerini yönetin.</Paragraph>
    </View>
  ),
};

export const InlineMeta: Story = {
  name: "Satır İçi Meta",
  ...storyDoc("Dikey ayırıcı ile ürün meta bilgileri.", `<Text muted>4,6 ★</Text><Divider orientation="vertical" size="sm" /><Text muted>1.284 değerlendirme</Text>`),
  render: () => (
    <View style={{ gap: 4 }}>
      <Title level={5}>Kablosuz Kulaklık</Title>
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
        <Text muted>4,6 ★</Text>
        <Divider orientation="vertical" size="sm" />
        <Text muted>1.284 değerlendirme</Text>
        <Divider orientation="vertical" size="sm" />
        <Text color="success">Stokta</Text>
      </View>
    </View>
  ),
};

export const LineStyles: Story = {
  name: "Çizgi Stilleri ve Hiza",
  ...storyDoc("Düz (saç teli), kesik ve noktalı; başlık başta, ortada, sonda."),
  render: () => (
    <View style={{ alignSelf: "stretch" }}>
      <Divider />
      <Divider lineStyle="dashed">Kesik</Divider>
      <Divider lineStyle="dotted">Noktalı</Divider>
      <Divider labelAlign="start">Başta</Divider>
      <Divider labelAlign="end">Sonda</Divider>
    </View>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Divider skeleton={isLoading}>veya</Divider>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Stack>
          <View style={{ alignSelf: "stretch" }}>
            <Divider skeleton={skeleton}>veya</Divider>
            <Divider skeleton={skeleton} />
          </View>
        </Stack>
      )}
    </SkeletonDemo>
  ),
};
