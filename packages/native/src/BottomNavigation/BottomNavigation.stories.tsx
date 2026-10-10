import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Heart, Home, LayoutGrid, MessageCircle, Search, ShoppingBag, User } from "lucide-react-native";
import { BottomNavigation, type BottomNavigationIconState, type BottomNavigationItem, type BottomNavigationProps } from "./BottomNavigation";
import { AppBar, AppBarAction } from "../AppBar";
import { Empty } from "../Empty";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof BottomNavigation> = {
  title: "Native/Navigasyon/BottomNavigation",
  component: BottomNavigation,
  tags: ["autodocs"],
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Uygulamanın ana bölümleri arasında geçiş: ekranın altında sabit 3–5 sekme. İkon + etiket, rozet, iki görünüm (`pill` Material 3, `plain` iOS), yeniden dokunma (`onReselect`).",
    whenToUse: ["Uygulamanın 3–5 üst düzey bölümü (Ana Sayfa / Ara / Sepet / Hesabım).", "Bölümler arası sık ve eşit önemde geçiş."],
    whenNotToUse: ["2 bölüm — Segmented ya da Tabs.", "6+ bölüm — Sidebar (drawer) ya da \"Daha fazla\" sekmesi.", "Ekran içi görünüm değiştirmek — Tabs."],
    vsWeb: "Web'de karşılığı yok. Yönlendiriciden bağımsız: `value` / `onChange` ile kontrollü kullanın. React Navigation'da `tabBar={({ state, navigation }) => <BottomNavigation items={…} value={state.routes[state.index].name} onChange={(k) => navigation.navigate(k)} bottomInset={insets.bottom} />}`. Güvenli alan bağımlılıksız: `bottomInset={useSafeAreaInsets().bottom}` (varsayılan 0). Ölçüler `nativeConfig.bottomNavigation`.",
  }) } } },
  argTypes: {
    variant: { control: "select", options: ["pill", "plain"] },
    color: { control: "select", options: ["primary", "accent", "success", "error", "warning", "info", "neutral"] },
    hideLabels: { control: "boolean" },
    bordered: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { variant: "pill", color: "primary", hideLabels: false, bordered: true, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof BottomNavigation>;

type IconCmp = typeof Home;
/** Aktif sekmede dolu ikon (M3 / iOS alışkanlığı). */
const icon = (Icon: IconCmp, fillActive = true) => ({ active, color, size }: BottomNavigationIconState) => <Icon size={size} color={color} fill={active && fillActive ? color : "none"} />;

const SHOP: BottomNavigationItem[] = [
  { key: "home", label: "Ana Sayfa", icon: icon(Home) },
  { key: "categories", label: "Kategoriler", icon: icon(LayoutGrid) },
  { key: "cart", label: "Sepet", icon: icon(ShoppingBag), badge: 3, accessibilityLabel: "Sepet, 3 ürün" },
  { key: "favorites", label: "Favoriler", icon: icon(Heart) },
  { key: "account", label: "Hesabım", icon: icon(User) },
];

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  render: (args: Omit<BottomNavigationProps, "items">) => <BottomNavigation {...args} items={SHOP} accessibilityLabel="Ana gezinme" />,
};

/** Telefon ekranı gibi çerçeve: üstte AppBar, ortada içerik, altta gezinme. */
function Screen({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={{ height: 440, alignSelf: "stretch", borderWidth: 1, borderColor: theme.color.canvas.border, borderRadius: 16, overflow: "hidden", backgroundColor: theme.color.canvas.surface }}>{children}</View>;
}

const TITLES: Record<string, string> = { home: "mari-ui Market", categories: "Kategoriler", cart: "Sepetim", favorites: "Favoriler", account: "Hesabım" };

function ShopDemo() {
  const [tab, setTab] = useState("home");
  const [scrolledTop, setScrolledTop] = useState(0);
  return (
    <Screen>
      <AppBar title={TITLES[tab]} bordered actions={<AppBarAction icon={({ color }) => <Search size={24} color={color} />} accessibilityLabel="Ara" onPress={() => undefined} />} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16, gap: 8 }}>
        <Empty title={TITLES[tab] ?? ""} description="Bölüm içeriği burada." />
        {scrolledTop > 0 ? <Text muted>{`Aktif sekmeye yeniden dokunuldu (${scrolledTop}) — liste başa kaydırılır.`}</Text> : null}
      </View>
      <BottomNavigation items={SHOP} value={tab} onChange={setTab} onReselect={() => setScrolledTop((n) => n + 1)} accessibilityLabel="Ana gezinme" />
    </Screen>
  );
}

export const Shop: Story = {
  name: "Alışveriş Uygulaması",
  ...storyDoc(
    "Beş bölüm, sepette sayı rozeti; aktif sekmede dolu ikon (`icon` fonksiyonu `active` alır). Aktif sekmeye yeniden dokunmak `onReselect` çağırır — listeyi başa kaydırmak için. Gerçek uygulamada `bottomInset={insets.bottom}`.",
    `const [tab, setTab] = useState("home");

<BottomNavigation
  value={tab}
  onChange={setTab}
  onReselect={() => listRef.current?.scrollToOffset({ offset: 0 })}
  bottomInset={insets.bottom}
  accessibilityLabel="Ana gezinme"
  items={[
    { key: "home", label: "Ana Sayfa", icon: ({ active, color, size }) => <Home size={size} color={color} fill={active ? color : "none"} /> },
    { key: "cart", label: "Sepet", icon: …, badge: 3, accessibilityLabel: "Sepet, 3 ürün" },
    …
  ]}
/>`
  ),
  render: () => <ShopDemo />,
};

const SOCIAL: BottomNavigationItem[] = [
  { key: "feed", label: "Akış", icon: icon(Home) },
  { key: "search", label: "Keşfet", icon: icon(Search, false) },
  { key: "messages", label: "Mesajlar", icon: icon(MessageCircle), badge: 12, accessibilityLabel: "Mesajlar, 12 okunmamış" },
  { key: "notifications", label: "Bildirimler", icon: icon(Bell), badge: true, accessibilityLabel: "Bildirimler, yeni var" },
];

export const Plain: Story = {
  name: "Sosyal Uygulama (plain)",
  ...storyDoc("`variant=\"plain\"`: iOS sekme çubuğu — zemin yok, yalnız renk; daha alçak (56). Nokta rozeti `badge: true`.", `<BottomNavigation variant="plain" items={items} value={tab} onChange={setTab} />`),
  render: () => <BottomNavigation variant="plain" items={SOCIAL} defaultValue="messages" accessibilityLabel="Ana gezinme" />,
};

export const IconsOnly: Story = {
  name: "Yalnız İkon",
  ...storyDoc("`hideLabels`: etiketler gizli, ekran okuyucu yine `label`ı okur. Yalnız ikonları evrensel olan 3–4 sekmede kullanın.", `<BottomNavigation hideLabels items={items} />`),
  render: () => (
    <View style={{ gap: 16, alignSelf: "stretch" }}>
      <BottomNavigation hideLabels items={SOCIAL} defaultValue="feed" accessibilityLabel="Ana gezinme" />
      <BottomNavigation hideLabels variant="plain" items={SOCIAL} defaultValue="feed" accessibilityLabel="Ana gezinme" />
    </View>
  ),
};

export const Variants: Story = {
  name: "Görünüm: pill / plain",
  ...storyDoc("`pill` (Material 3, 80): seçilen ikonun arkasında açılan hap zemin. `plain` (iOS, 56): yalnız renk.", `<BottomNavigation variant="pill" />  <BottomNavigation variant="plain" />`),
  render: () => (
    <View style={{ gap: 16, alignSelf: "stretch" }}>
      {(["pill", "plain"] as const).map((variant) => (
        <BottomNavigation key={variant} variant={variant} items={SHOP.slice(0, 4)} defaultValue="categories" accessibilityLabel={variant} />
      ))}
    </View>
  ),
};

export const Colors: Story = {
  name: "Renkler",
  ...storyDoc("`color`: aktif sekmenin rengi (pill'de zemin + ikon).", `<BottomNavigation color="success" />`),
  render: () => (
    <View style={{ gap: 16, alignSelf: "stretch" }}>
      {(["primary", "accent", "success", "neutral"] as const).map((color) => (
        <BottomNavigation key={color} color={color} items={SHOP.slice(0, 4)} defaultValue="home" accessibilityLabel={color} />
      ))}
    </View>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc("Pasif sekme (`disabled`) soluk ve dokunulamaz.", `{ key: "favorites", label: "Favoriler", icon: …, disabled: true }`),
  render: () => <BottomNavigation items={SHOP.map((i) => (i.key === "favorites" ? { ...i, disabled: true } : i))} defaultValue="home" accessibilityLabel="Ana gezinme" />,
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " İkonlar daire, etiketler kendi metin kutularında; gösterge ve rozetler gizli, sekmeler dokunulamaz.", `<BottomNavigation skeleton={isLoading} items={items} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View style={{ gap: 16 }}>
          <BottomNavigation skeleton={skeleton} items={SHOP} defaultValue="home" accessibilityLabel="Ana gezinme" />
          <BottomNavigation skeleton={skeleton} variant="plain" items={SOCIAL} defaultValue="feed" accessibilityLabel="Ana gezinme" />
        </View>
      )}
    </SkeletonDemo>
  ),
};
