import React from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { User } from "lucide-react-native";
import { Avatar, AvatarGroup } from "./Avatar";
import { Badge } from "../Badge";
import { Text, Title } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const PHOTO = "https://i.pravatar.cc/240?img=47";

const meta: Meta<typeof Avatar> = {
  title: "Native/Veri Gösterimi/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Kişi ya da hesap görseli; görsel yoksa baş harfler veya ikon. `AvatarGroup` üst üste binen avatarlar ve \"+N\".",
    whenToUse: ["Kişi listeleri, yorumlar, profil başlığı.", "Bir öğeye katılan kişileri özetlemek (AvatarGroup)."],
    whenNotToUse: ["Ürün/içerik görseli — Image."],
    vsWeb: "Prop'lar aynı; `src` URL, `require(...)` görseli ya da öğe olabilir. Ölçü native: sm 32 · md 40 (iOS liste satırı / M3) · lg 56. Görsel yüklenemezse baş harfe düşer (`onError` `false` dönerse düşmez). Grup halkası zemin renginde 2pt. `alt` erişilebilir ad olur (`accessibilityRole=\"image\"`).",
  }) } } },
  argTypes: {
    alt: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    shape: { control: "select", options: ["circle", "square"] },
    color: { control: "select", options: [undefined, "primary", "accent", "success", "warning", "error", "info", "neutral"] },
    src: { control: "text" },
    skeleton: { control: "boolean" },
  },
  args: { alt: "Ayşe Demir", size: "md", shape: "circle", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {
  ...storyDoc("Ad, boyut, biçim, renk ve görsel URL'sini deneyin."),
  render: (args) => <Avatar {...args} />,
};

function ProfileHeader() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
      <Badge dot color="success" offset={[-6, 6]}>
        <Avatar size="lg" alt="Elif Can" src={PHOTO} />
      </Badge>
      <View style={{ gap: 2 }}>
        <Title level={4}>Elif Can</Title>
        <Text muted>Ürün yöneticisi · İzmir</Text>
      </View>
    </View>
  );
}

export const Profile: Story = {
  name: "Profil Başlığı",
  ...storyDoc("Büyük avatar, çevrimiçi noktası (Badge `dot`, köşeye kaydırılmış) ve ad.", `<Badge dot color="success" offset={[-6, 6]}>
  <Avatar size="lg" alt="Elif Can" src={photoUrl} />
</Badge>`),
  render: () => <ProfileHeader />,
};

function Assignees() {
  return (
    <View style={{ gap: 8 }}>
      <Text weight="medium">Sorumlular</Text>
      <AvatarGroup max={3}>
        <Avatar alt="Ayşe Demir" color="primary" />
        <Avatar alt="Mert Kaya" color="success" />
        <Avatar alt="Elif Can" src={PHOTO} />
        <Avatar alt="Can Öztürk" color="warning" />
        <Avatar alt="İlker Şahin" color="info" />
      </AvatarGroup>
    </View>
  );
}

export const Group: Story = {
  name: "Görev Sorumluları",
  ...storyDoc("`max` üstü tek bir \"+N\" avatarında toplanır (\"2 kişi daha\" diye okunur).", `<AvatarGroup max={3}>
  <Avatar alt="Ayşe Demir" />…
</AvatarGroup>`),
  render: () => <Assignees />,
};

function Fallbacks() {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Avatar alt="Ayşe Demir" src={PHOTO} />
      <Avatar alt="İlker Şahin" color="primary" />
      <Avatar alt="Misafir" icon={<User size={20} color={theme.color.canvas.muted} />} />
      <Avatar alt="Bozuk Bağlantı" src="https://invalid.example/yok.png" color="accent" />
    </View>
  );
}

export const FallbackChain: Story = {
  name: "Görsel → Baş Harf → İkon",
  ...storyDoc("Görsel, görsel yoksa baş harfler (Türkçe büyük harf: İŞ), ikon; yüklenemeyen görsel baş harfe düşer."),
  render: () => <Fallbacks />,
};

export const Sizes: Story = {
  name: "Boyut ve Biçim",
  ...storyDoc("sm 32 · md 40 · lg 56; kare biçim temanın köşe ölçeğini kullanır."),
  render: () => (
    <Stack>
      {(["circle", "square"] as const).map((shape) => (
        <View key={shape} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {(["sm", "md", "lg"] as const).map((size) => <Avatar key={size} size={size} shape={shape} alt="Mert Kaya" color="success" />)}
        </View>
      ))}
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Avatar skeleton={isLoading} alt="Elif Can" />
<AvatarGroup skeleton={isLoading} max={3}>…</AvatarGroup>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Stack>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Avatar skeleton={skeleton} size="lg" alt="Elif Can" src={PHOTO} />
            <Avatar skeleton={skeleton} alt="Mert Kaya" color="success" />
            <Avatar skeleton={skeleton} size="sm" shape="square" alt="Ayşe Demir" />
          </View>
          <AvatarGroup skeleton={skeleton} max={2}>
            <Avatar alt="Ayşe Demir" color="primary" />
            <Avatar alt="Mert Kaya" color="success" />
            <Avatar alt="Elif Can" color="warning" />
          </AvatarGroup>
        </Stack>
      )}
    </SkeletonDemo>
  ),
};
