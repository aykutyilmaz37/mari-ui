import React, { useState } from "react";
import { Pressable, View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Bell, MessageCircle, ShoppingBag } from "lucide-react-native";
import { Badge, StatusBadge } from "./Badge";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { Row, SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const COLORS = ["error", "primary", "accent", "success", "warning", "info", "neutral"] as const;

const meta: Meta<typeof Badge> = {
  title: "Native/Veri Gösterimi/Badge",
  component: Badge,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Sayı ya da nokta kabarcığı; bir ikonun/avatarın köşesine oturur ya da tek başına durur. `StatusBadge` renkli nokta + durum metni.",
    whenToUse: ["Okunmamış bildirim, sepet adedi.", "\"Yeni\" gibi kısa işaret.", "Çevrimiçi/aktif durumu (StatusBadge)."],
    whenNotToUse: ["Kategori/durum etiketi — `Tag`.", "Önemli bir uyarı — Alert/Toast."],
    vsWeb: "Prop'lar aynı; `offset` pt sayısı. Ölçü iOS rozetine yakın: md 20 / sm 16pt, 12 yarı kalın, rakamlar eşit genişlikte. Öğeye oturan kabarcık zemin renginde 2pt halka alır. `label` kabarcığı ekran okuyucuda okunur kılar; sarılan öğe bir düğmeyse sayıyı düğmenin `accessibilityLabel`ına katmak daha iyidir. StatusBadge metni Subheadline 15/20; `processing` nabzı hareket azaltmada durur.",
  }) } } },
  argTypes: {
    count: { control: "number" },
    overflowCount: { control: "number" },
    dot: { control: "boolean" },
    showZero: { control: "boolean" },
    color: { control: "select", options: COLORS },
    size: { control: "select", options: ["sm", "md"] },
    skeleton: { control: "boolean" },
  },
  args: { count: 5, overflowCount: 99, dot: false, showZero: false, color: "error", size: "md", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Badge>;

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.canvas.surfaceAlt }}>
      {children}
    </Pressable>
  );
}

function TabBarIcons() {
  const theme = useTheme();
  const [cart, setCart] = useState(2);
  const icon = theme.color.canvas.foreground;
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", gap: 20 }}>
        <Badge count={12}>
          <IconButton label="Bildirimler, 12 okunmamış"><Bell size={22} color={icon} /></IconButton>
        </Badge>
        <Badge dot color="primary">
          <IconButton label="Mesajlar, yeni mesaj var"><MessageCircle size={22} color={icon} /></IconButton>
        </Badge>
        <Badge count={cart} overflowCount={9}>
          <IconButton label={`Sepet, ${cart} ürün`}><ShoppingBag size={22} color={icon} /></IconButton>
        </Badge>
      </View>
      <Button size="sm" variant="outline" onPress={() => setCart((c) => c + 4)}>Sepete 4 ürün ekle</Button>
    </View>
  );
}

export const Playground: Story = {
  ...storyDoc("Sayı, nokta, renk ve boyutu deneyin."),
  render: (args) => <Badge {...args}><Avatar alt="Ayşe Demir" shape="square" /></Badge>,
};

export const AppBar: Story = {
  name: "Uygulama Çubuğu",
  ...storyDoc(
    "İkon düğmelerinde bildirim sayısı, nokta ve sepet adedi; 9'u aşınca \"9+\". Sayı düğmenin kendi adında okunur.",
    `<Badge count={12}>
  <IconButton accessibilityLabel="Bildirimler, 12 okunmamış"><Bell /></IconButton>
</Badge>`
  ),
  render: () => <TabBarIcons />,
};

export const Presence: Story = {
  name: "Ekip Durumu",
  ...storyDoc("StatusBadge: renk + metin; süren işlem `processing` ile nabız atar.", `<StatusBadge color="success">Çevrimiçi</StatusBadge>
<StatusBadge color="info" processing>Senkronize ediliyor</StatusBadge>`),
  render: () => (
    <Stack>
      <StatusBadge color="success">Çevrimiçi</StatusBadge>
      <StatusBadge color="warning">Toplantıda</StatusBadge>
      <StatusBadge color="neutral">Çevrimdışı</StatusBadge>
      <StatusBadge color="info" processing>Senkronize ediliyor</StatusBadge>
    </Stack>
  ),
};

const FOLDERS = [
  { name: "Gelen kutusu", count: 128 as number | string, color: "error" as const, a11y: "128 okunmamış" },
  { name: "Promosyonlar", count: "Yeni", color: "primary" as const, a11y: "yeni ileti" },
  { name: "Gönderilenler", count: 0, color: "error" as const, a11y: "" },
];

function Folders() {
  const theme = useTheme();
  return (
    <View style={{ alignSelf: "stretch", borderRadius: 12, backgroundColor: theme.color.canvas.surfaceAlt }}>
      {FOLDERS.map((folder, i) => (
        <View
          key={folder.name}
          accessible
          accessibilityLabel={folder.a11y ? `${folder.name}, ${folder.a11y}` : folder.name}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44, paddingHorizontal: 16, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: theme.color.canvas.border }}
        >
          <Text>{folder.name}</Text>
          <Badge count={folder.count} color={folder.color} />
        </View>
      ))}
    </View>
  );
}

export const Standalone: Story = {
  name: "Klasör Listesi",
  ...storyDoc(
    "Satır sonunda tek başına kabarcık (halkasız), iOS Mail gibi: okunmamış sayısı (99'u aşınca \"99+\"), \"Yeni\" işareti; 0 gizlenir. Sayı satırın erişilebilir adına katılır.",
    `<View accessible accessibilityLabel="Gelen kutusu, 128 okunmamış">
  <Text>Gelen kutusu</Text>
  <Badge count={128} />
</View>`
  ),
  render: () => <Folders />,
};

export const Colors: Story = {
  name: "Renk ve Boyut",
  ...storyDoc("Yedi rol rengi ve nokta; üst satır md 20pt, alt satır sm 16pt."),
  render: () => (
    <Stack>
      {(["md", "sm"] as const).map((size) => (
        <Row key={size}>
          {COLORS.map((color) => <Badge key={color} size={size} count={7} color={color} />)}
          <Badge size={size} dot color="primary" />
        </Row>
      ))}
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Badge skeleton={isLoading} count={3}>…</Badge>
<StatusBadge skeleton={isLoading} color="success">Çevrimiçi</StatusBadge>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Stack>
          <View style={{ paddingTop: 12 }}><Badge skeleton={skeleton} count={3}><Avatar alt="Mert Kaya" skeleton={skeleton} /></Badge></View>
          <StatusBadge skeleton={skeleton} color="success">Çevrimiçi</StatusBadge>
        </Stack>
      )}
    </SkeletonDemo>
  ),
};
