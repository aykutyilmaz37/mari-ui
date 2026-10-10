import React, { useState } from "react";
import { Pressable, Text as RNText, View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Archive, Bell, Clock, FileText, HelpCircle, Home, Inbox, LogOut, Menu, Package, Send, Settings, Star, Trash2, User } from "lucide-react-native";
import { Sidebar, type SidebarAnimation, type SidebarIconState, type SidebarItem, type SidebarProps } from "./Sidebar";
import { AppBar, AppBarAction } from "../AppBar";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { Segmented } from "../Segmented";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Sidebar> = {
  title: "Native/Navigasyon/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Kenardan kayan gezinme çekmecesi (Material 3 Navigation Drawer, Amazon menüsü): başlık bandı, bölüm başlıkları (`heading`), aktif öğe, alt seviyelere inen satırlar (geri satırı + seviye başlığı + \"Tümünü gör\"), rozet, alt bölüm. Tetikleyiciyi (menü düğmesi) siz koyarsınız.",
    whenToUse: ["Uygulamanın çok sayıda bölümü / hiyerarşik kategorileri (e-ticaret kategori ağacı).", "BottomNavigation'a sığmayan ikincil bölümler (Ayarlar, Yardım, Hesap).", "Tablette kalıcı yan menü yerine telefonda çekmece."],
    whenNotToUse: ["3–5 ana bölüm — BottomNavigation.", "Bir kayda ait eylemler — ActionSheet.", "Form / ayrıntı içeriği — BottomSheet ya da yeni ekran."],
    vsWeb: "Web Sidebar'ın yalnız `variant=\"drawer\"`ı; hover rayı / dropdown / mega yok (dokunmatikte anlamsız). Veri web `MenuItemType` ile aynı şekil (`promoTiles`, `target` yok). Yönlendiriciden bağımsız: `onNavigate(route, item)`. Telefonda tam genişlik, tablette en fazla 480 (`nativeConfig.sidebar.widthRatio` / `maxWidth` ile değişir; ör. `widthRatio: 0.85` yarım çekmece). Kapanma: karartma (yarım çekmecede), ✕, kenara kaydırma, Android geri (alt seviyede önce bir seviye yukarı), öğe seçimi. Güvenli alan: kökteki `ThemeProvider insets={useSafeAreaInsets()}` (çekmece tam ekran Modal — uygulamanın SafeAreaView'u içine işlemez); tek tek `topInset` / `bottomInset` ile ezilebilir, sağlayıcı yoksa platform tahmini. Ölçüler `nativeConfig.sidebar`.",
  }) } } },
  argTypes: {
    position: { control: "select", options: ["left", "right"] },
    animation: { control: "select", options: ["slide", "fade", "scale", "slideUp", "slideDown"] },
    color: { control: "select", options: ["primary", "accent", "success", "neutral"] },
    emphasizedHeader: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { position: "left", animation: "slide", color: "primary", emphasizedHeader: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

type IconCmp = typeof Home;
const icon = (Icon: IconCmp) => ({ color, size }: SidebarIconState) => <Icon size={size} color={color} />;
const noop = () => undefined;

const SHOP: SidebarItem[] = [
  { key: "trending", title: "Trendler", heading: true },
  { key: "best", title: "Çok Satanlar", route: "/cok-satanlar" },
  { key: "new", title: "Yeni Gelenler", route: "/yeni" },
  { key: "cats", title: "Kategorilere Göre Alışveriş", heading: true },
  {
    key: "electronics",
    title: "Elektronik",
    route: "/elektronik",
    children: [
      { key: "computers", title: "Bilgisayar", route: "/elektronik/bilgisayar", children: [
        { key: "laptop", title: "Laptop", route: "/elektronik/bilgisayar/laptop" },
        { key: "desktop", title: "Masaüstü", route: "/elektronik/bilgisayar/masaustu" },
        { key: "monitor", title: "Monitör", route: "/elektronik/bilgisayar/monitor" },
      ] },
      { key: "phones", title: "Telefon", route: "/elektronik/telefon" },
      { key: "audio", title: "Kulaklık ve Ses", route: "/elektronik/ses" },
    ],
  },
  { key: "fashion", title: "Moda", children: [
    { key: "women", title: "Kadın", route: "/moda/kadin" },
    { key: "men", title: "Erkek", route: "/moda/erkek" },
    { key: "kids", title: "Çocuk", route: "/moda/cocuk" },
  ] },
  { key: "home-living", title: "Ev ve Yaşam", route: "/ev" },
  { key: "books", title: "Kitap", route: "/kitap" },
  { key: "help", title: "Yardım ve Ayarlar", heading: true },
  { key: "account", title: "Hesabım", route: "/hesap" },
  { key: "orders", title: "Siparişlerim", route: "/siparisler", badge: 2 },
  { key: "support", title: "Müşteri Hizmetleri", route: "/destek" },
];

const MAIL: SidebarItem[] = [
  { key: "inbox", title: "Gelen Kutusu", icon: icon(Inbox), route: "/inbox", badge: 24 },
  { key: "starred", title: "Yıldızlı", icon: icon(Star), route: "/starred" },
  { key: "snoozed", title: "Ertelenenler", icon: icon(Clock), route: "/snoozed" },
  { key: "sent", title: "Gönderilenler", icon: icon(Send), route: "/sent" },
  { key: "drafts", title: "Taslaklar", icon: icon(FileText), route: "/drafts", badge: 3 },
  { key: "labels", title: "Etiketler", heading: true },
  { key: "work", title: "İş", route: "/label/is" },
  { key: "family", title: "Aile", route: "/label/aile" },
  { key: "more", title: "Diğer", heading: true },
  { key: "archive", title: "Arşiv", icon: icon(Archive), route: "/archive" },
  { key: "trash", title: "Çöp Kutusu", icon: icon(Trash2), route: "/trash" },
  { key: "settings", title: "Ayarlar", icon: icon(Settings), route: "/settings" },
  { key: "help", title: "Yardım", icon: icon(HelpCircle), route: "/help", disabled: true },
];

/** Telefon ekranı gibi çerçeve; çekmece tam ekran açılır (Modal). */
function Screen({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={{ height: 320, alignSelf: "stretch", borderWidth: 1, borderColor: theme.color.canvas.border, borderRadius: 16, overflow: "hidden", backgroundColor: theme.color.canvas.surface }}>{children}</View>;
}

function MenuButton({ onPress }: { onPress: () => void }) {
  return <AppBarAction icon={({ color }) => <Menu size={24} color={color} />} accessibilityLabel="Menüyü aç" onPress={onPress} />;
}

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  render: function PlaygroundStory(args: Omit<SidebarProps, "data" | "open" | "onOpenChange">) {
    const [open, setOpen] = useState(false);
    return (
      <View style={{ alignItems: "flex-start" }}>
        <Button onPress={() => setOpen(true)}>Menüyü aç</Button>
        <Sidebar {...args} data={MAIL} open={open} onOpenChange={setOpen} currentPath="/inbox" header={(ink) => <RNText style={{ fontSize: 20, fontWeight: "700", color: ink.color }}>Posta</RNText>} />
      </View>
    );
  },
};

function LogoutRow({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, minHeight: 52, backgroundColor: pressed ? theme.color.canvas.surfaceAlt : "transparent" })}>
      <LogOut size={20} color={theme.color.canvas.muted} />
      <Text>Çıkış yap</Text>
    </Pressable>
  );
}

function ShopDemo() {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("/elektronik/bilgisayar/laptop");
  return (
    <Screen>
      <AppBar title="mari-ui Market" topInset={0} bordered leading={<MenuButton onPress={() => setOpen(true)} />} />
      <View style={{ flex: 1, padding: 16, gap: 8 }}>
        <Text muted>Geçerli sayfa</Text>
        <Text weight="semibold">{path}</Text>
      </View>
      <Sidebar
        data={SHOP}
        open={open}
        onOpenChange={setOpen}
        currentPath={path}
        onNavigate={(route) => setPath(route)}
        emphasizedHeader
        header={(ink) => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Avatar alt="Deniz Kaya" size="sm" />
            <RNText style={{ fontSize: 18, fontWeight: "700", color: ink.color }}>Merhaba, Deniz</RNText>
          </View>
        )}
        footer={<LogoutRow onPress={() => setOpen(false)} />}
      />
    </Screen>
  );
}

export const Shop: Story = {
  name: "Alışveriş (Kategori Ağacı)",
  ...storyDoc(
    "Amazon çekmecesi düzeni: rol renginde başlık bandı (`emphasizedHeader`), kalın bölüm başlıkları, çocuklu satır bir seviye içeri girer — üstte geri satırı, seviye başlığı ve (yolu varsa) \"Tümünü gör\". Aktif yaprağın üst satırları da vurgulu. Android geri tuşu alt seviyede önce bir seviye yukarı çıkar.",
    `const [open, setOpen] = useState(false);

<AppBar title="mari-ui Market" leading={<AppBarAction icon={…} accessibilityLabel="Menüyü aç" onPress={() => setOpen(true)} />} />
<Sidebar
  data={categories}
  open={open}
  onOpenChange={setOpen}
  currentPath={route.path}
  onNavigate={(path) => navigation.navigate(path)}
  emphasizedHeader
  header={(ink) => <Text style={{ color: ink.color }}>Merhaba, Deniz</Text>}
  footer={<LogoutRow />}
/>`
  ),
  render: () => <ShopDemo />,
};

function MailDemo({ position = "left" as const }: { position?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("/inbox");
  const menu = <MenuButton onPress={() => setOpen(true)} />;
  return (
    <Screen>
      <AppBar title="Posta" topInset={0} bordered leading={position === "left" ? menu : undefined} actions={position === "right" ? menu : <AppBarAction icon={({ color }) => <Bell size={24} color={color} />} accessibilityLabel="Bildirimler" onPress={noop} />} />
      <View style={{ flex: 1, padding: 16 }}>
        <Text muted>{path}</Text>
      </View>
      <Sidebar
        data={MAIL}
        open={open}
        onOpenChange={setOpen}
        currentPath={path}
        onNavigate={(route) => setPath(route)}
        position={position}
        header={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Avatar alt="Deniz Kaya" size="sm" color="primary" />
            <View>
              <Text weight="semibold">Deniz Kaya</Text>
              <Text muted style={{ fontSize: 13 }}>deniz@mari-ui.com</Text>
            </View>
          </View>
        }
      />
    </Screen>
  );
}

export const Mail: Story = {
  name: "Uygulama Menüsü (İkon ve Rozet)",
  ...storyDoc(
    "Material 3 düzeni: ikonlu satırlar, sayı rozeti, bölüm başlıkları; ikonu olmayan satırlar (etiketler) ikon yerini ayırır — başlıklar tek hizada. Pasif öğe (`disabled`) soluk.",
    `<Sidebar
  data={[
    { key: "inbox", title: "Gelen Kutusu", icon: ({ color, size }) => <Inbox size={size} color={color} />, route: "/inbox", badge: 24 },
    { key: "labels", title: "Etiketler", heading: true },
    { key: "work", title: "İş", route: "/label/is" },
    …
  ]}
  open={open}
  onOpenChange={setOpen}
  currentPath={path}
  onNavigate={setPath}
  header={<AccountHeader />}
/>`
  ),
  render: () => <MailDemo />,
};

export const Right: Story = {
  name: "Sağdan",
  ...storyDoc("`position=\"right\"`: çekmece sağdan gelir, sağa kaydırınca kapanır.", `<Sidebar position="right" … />`),
  render: () => <MailDemo position="right" />,
};

const ANIMATIONS: { value: SidebarAnimation; label: string }[] = [
  { value: "slide", label: "Kay" },
  { value: "fade", label: "Belir" },
  { value: "scale", label: "Büyü" },
  { value: "slideUp", label: "Alttan" },
  { value: "slideDown", label: "Üstten" },
];

function AnimationsDemo() {
  const [animation, setAnimation] = useState<SidebarAnimation>("slide");
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 16, alignSelf: "stretch", alignItems: "flex-start" }}>
      <Segmented size="sm" accessibilityLabel="Açılış animasyonu" options={ANIMATIONS} value={animation} onChange={(v) => setAnimation(v as SidebarAnimation)} />
      <Button onPress={() => setOpen(true)}>Menüyü aç</Button>
      <Sidebar animation={animation} data={MAIL} open={open} onOpenChange={setOpen} currentPath="/inbox" header={<Text weight="semibold">Posta</Text>} />
    </View>
  );
}

export const Animations: Story = {
  name: "Açılış Animasyonları",
  ...storyDoc(
    "`animation`: `slide` yandan kayar (varsayılan; kenara kaydırarak kapatma yalnız bunda), `fade` yerinde belirir, `scale` hafif büyüyerek gelir, `slideUp` / `slideDown` alttan / üstten tam boy. Hareketi azalt açıksa hepsi anında.",
    `<Sidebar animation="slideUp" data={items} open={open} onOpenChange={setOpen} />`
  ),
  render: () => <AnimationsDemo />,
};

const PROFILE: SidebarItem[] = [
  { key: "home", title: "Ana Sayfa", icon: icon(Home), route: "/" },
  { key: "orders", title: "Siparişlerim", icon: icon(Package), route: "/siparisler", description: "2 sipariş kargoda" },
  { key: "profile", title: "Profil", icon: icon(User), route: "/profil" },
  { key: "settings", title: "Ayarlar", icon: icon(Settings), route: "/ayarlar" },
];

function SkeletonStory() {
  const [open, setOpen] = useState(false);
  return (
    <SkeletonDemo>
      {(skeleton) => (
        <View style={{ alignItems: "flex-start" }}>
          <Button onPress={() => setOpen(true)}>Menüyü aç</Button>
          <Sidebar skeleton={skeleton} data={PROFILE} open={open} onOpenChange={setOpen} currentPath="/" header={<Text weight="semibold">Deniz Kaya</Text>} />
        </View>
      )}
    </SkeletonDemo>
  );
}

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Başlık bandı ve satırlar kendi kutularında; satırlar dokunulamaz, ✕ ve karartma yine kapatır.", `<Sidebar skeleton={isLoading} data={items} open={open} onOpenChange={setOpen} />`),
  render: () => <SkeletonStory />,
};
