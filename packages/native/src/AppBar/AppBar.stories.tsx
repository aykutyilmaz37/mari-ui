import React from "react";
import { Animated, View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Menu, MoreVertical, Search, Share2, ShoppingBag } from "lucide-react-native";
import { AppBar, AppBarAction, useAppBarScroll, type AppBarProps } from "./AppBar";
import { ListItem, ListItemMeta } from "../List";
import { Paragraph, Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, jsxProps, storyDoc, withNativeTheme, withStretch, withoutInsets } from "../stories/storyMeta";

const meta: Meta<typeof AppBar> = {
  title: "Native/Navigasyon/AppBar",
  component: AppBar,
  tags: ["autodocs"],
  // withoutInsets: çubuklar sayfa içindeki çerçevede, çentik payı almasın.
  decorators: [withStretch, withoutInsets, withNativeTheme],
  parameters: {
    docs: { description: { component: componentDoc({
      summary: "Ekranın üst çubuğu: geri düğmesi ya da `leading`, başlık (+ alt başlık), sağda `AppBarAction`'lar. `size=\"large\"` büyük başlıkla açılır, `useAppBarScroll` ile kaydırınca küçük başlığa daralır.",
      whenToUse: ["Her ekranın başlığı ve ekran düzeyi eylemleri (paylaş, ara, daha fazla).", "Liste / ana sekme ekranlarında büyük başlık (`large`)."],
      whenNotToUse: ["Sayfa içi bölüm başlığı — Title.", "Ekranlar arası ana gezinme — BottomNavigation.", "React Navigation'ın kendi başlığını kullanıyorsanız ikisini birden koymayın (`headerShown: false` + AppBar ya da yalnız onun başlığı)."],
      vsWeb: "Web'de karşılığı yok (web'de üst gezinme BasicMenu / MegaMenu). Güvenli alan: kökte bir kez `<ThemeProvider insets={useSafeAreaInsets()}>` — AppBar üst payı oradan alır (`topInset` ezer). Ekranı ayrıca üstten SafeAreaView ile sarmayın, pay iki kez eklenir. Başlık hizası platforma göre: iOS ortalı, Android / web sola. Ölçüler `nativeConfig.appBar`.",
    }) } },
  },
  argTypes: {
    size: { control: "select", options: ["small", "large"] },
    titleAlign: { control: "select", options: ["start", "center"] },
    bordered: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { title: "Siparişlerim", subtitle: "3 aktif sipariş", size: "small", titleAlign: "start", bordered: true, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof AppBar>;

const icon = (Icon: typeof Bell) => ({ color }: { color: string }) => <Icon size={24} color={color} />;
const noop = () => undefined;

/** Telefon ekranı gibi sabit yükseklikte çerçeve — örnekler kendi içinde kayar. */
function Screen({ children, height = 420 }: { children: React.ReactNode; height?: number }) {
  const theme = useTheme();
  return <View style={{ height, alignSelf: "stretch", borderWidth: 1, borderColor: theme.color.canvas.border, borderRadius: 16, overflow: "hidden", backgroundColor: theme.color.canvas.surface }}>{children}</View>;
}

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin.", (args) => `<AppBar ${jsxProps(args, { skip: ["onBack", "actions"] })} onBack={goBack} actions={<AppBarAction icon={({ color, size }) => <Search color={color} size={size} />} accessibilityLabel="Ara" onPress={openSearch} />} />`),
  render: (args: AppBarProps) => <AppBar {...args} onBack={noop} actions={<AppBarAction icon={icon(Search)} accessibilityLabel="Ara" onPress={noop} />} />,
};

export const Detail: Story = {
  name: "Ayrıntı Ekranı",
  ...storyDoc(
    "En sık kalıp: `onBack` solda geri düğmesi çizer, sağda ekranın eylemleri. Eylemlerin `accessibilityLabel`ı zorunlu — ikon tek başına okunmaz.",
    `<AppBar
  title="Sipariş #48213"
  subtitle="Kargoda"
  onBack={() => navigation.goBack()}
  actions={<>
    <AppBarAction icon={({ color }) => <Share2 color={color} />} accessibilityLabel="Paylaş" onPress={share} />
    <AppBarAction icon={({ color }) => <MoreVertical color={color} />} accessibilityLabel="Daha fazla" onPress={openMenu} />
  </>}
/>`
  ),
  render: () => (
    <AppBar
      title="Sipariş #48213"
      subtitle="Kargoda"
      onBack={noop}
      bordered
      actions={
        <>
          <AppBarAction icon={icon(Share2)} accessibilityLabel="Paylaş" onPress={noop} />
          <AppBarAction icon={icon(MoreVertical)} accessibilityLabel="Daha fazla" onPress={noop} />
        </>
      }
    />
  ),
};

export const Home: Story = {
  name: "Ana Ekran (Menü ve Rozet)",
  ...storyDoc(
    "`leading` ile menü düğmesi (Sidebar'ı açar); `badge` sayı ya da nokta rozeti. Rozetli eylemde sayıyı adına da yazın.",
    `<AppBar
  title="mari-ui Market"
  leading={<AppBarAction icon={({ color }) => <Menu color={color} />} accessibilityLabel="Menüyü aç" onPress={openDrawer} />}
  actions={<>
    <AppBarAction icon={({ color }) => <Bell color={color} />} badge accessibilityLabel="Bildirimler, yeni var" />
    <AppBarAction icon={({ color }) => <ShoppingBag color={color} />} badge={3} accessibilityLabel="Sepet, 3 ürün" />
  </>}
/>`
  ),
  render: () => (
    <AppBar
      title="mari-ui Market"
      bordered
      leading={<AppBarAction icon={icon(Menu)} accessibilityLabel="Menüyü aç" onPress={noop} />}
      actions={
        <>
          <AppBarAction icon={icon(Bell)} badge accessibilityLabel="Bildirimler, yeni var" onPress={noop} />
          <AppBarAction icon={icon(ShoppingBag)} badge={3} accessibilityLabel="Sepet, 3 ürün" onPress={noop} />
        </>
      }
    />
  ),
};

const MESSAGES = [
  ["Elif Can", "Sunum dosyasını ekledim, bakabilir misin?", "09:41"],
  ["Mert Yılmaz", "Yarınki toplantı 14:00'e alındı.", "09:12"],
  ["Kargo", "Siparişiniz dağıtıma çıktı.", "Dün"],
  ["Deniz Kaya", "Teşekkürler, elime ulaştı 🙏", "Dün"],
  ["Banka", "Ekim ekstreniz hazır.", "Pzt"],
  ["Selin Arslan", "Hafta sonu planı ne?", "Pzt"],
  ["Ekip", "Sprint 42 notları paylaşıldı.", "Paz"],
  ["Aykut Yılmaz", "Native Dalga 4 başladı.", "Cmt"],
  ["Market", "Haftanın indirimleri yayında.", "Cum"],
  ["Emre Ak", "Fotoğrafları gönderiyorum.", "Per"],
];

function LargeDemo() {
  const { scrollY, onScroll, scrollEventThrottle } = useAppBarScroll();
  return (
    <Screen height={460}>
      <AppBar size="large" title="Mesajlar" scrollY={scrollY} actions={<AppBarAction icon={icon(Search)} accessibilityLabel="Ara" onPress={noop} />} />
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} nestedScrollEnabled focusable>
        <View>
          {MESSAGES.map(([name, text, time]) => (
            <ListItem key={name} extra={<Text muted>{time}</Text>}>
              <ListItemMeta title={name} description={text} />
            </ListItem>
          ))}
        </View>
      </Animated.ScrollView>
    </Screen>
  );
}

export const LargeCollapsing: Story = {
  name: "Büyük Başlık (Kaydırınca Daralır)",
  ...storyDoc(
    "`size=\"large\"` + `useAppBarScroll`: büyük başlık kaydırdıkça kısalır ve solar, küçük başlık üst sırada belirir, alt çizgi daralınca çıkar. iOS Mail / Ayarlar düzeni.",
    `const { scrollY, onScroll, scrollEventThrottle } = useAppBarScroll();

<AppBar size="large" title="Mesajlar" scrollY={scrollY} actions={<AppBarAction icon={({ color, size }) => <Search color={color} size={size} />} accessibilityLabel="Ara" onPress={openSearch} />} />
<Animated.ScrollView onScroll={onScroll} scrollEventThrottle={scrollEventThrottle}>
  {messages.map((m) => (
    <ListItem key={m.id} extra={<Text muted>{m.time}</Text>}>
      <ListItemMeta title={m.name} description={m.text} />
    </ListItem>
  ))}
</Animated.ScrollView>`
  ),
  render: () => <LargeDemo />,
};

function ScrollBorderDemo() {
  const { scrollY, onScroll, scrollEventThrottle } = useAppBarScroll();
  return (
    <Screen>
      <AppBar title="Gizlilik" onBack={noop} scrollY={scrollY} />
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} nestedScrollEnabled focusable contentContainerStyle={{ padding: 16, gap: 12 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Paragraph key={i}>
            Kişisel verileriniz yalnız hizmeti sunmak için işlenir. Hesabınızı sildiğinizde verileriniz 30 gün içinde kalıcı olarak kaldırılır; yasal saklama yükümlülükleri saklıdır.
          </Paragraph>
        ))}
      </Animated.ScrollView>
    </Screen>
  );
}

export const ScrollBorder: Story = {
  name: "Kaydırınca Alt Çizgi",
  ...storyDoc("`scrollY` verilip `bordered` verilmezse alt çizgi yalnız içerik kaydırılınca belirir — en üstteyken çubuk sayfayla birleşik durur.", `<AppBar title="Gizlilik" onBack={goBack} scrollY={scrollY} />`),
  render: () => <ScrollBorderDemo />,
};

export const Alignment: Story = {
  name: "Başlık Hizası",
  ...storyDoc(
    "Varsayılan platforma göre: iOS'ta ortalı, Android / web'de sola. Ortalı başlık iki ucun genişini kadar içeri çekilir — uçlar farklı genişlikte olsa da tam ortada kalır.",
    `<AppBar title="Profil Düzenle" titleAlign="start" bordered onBack={goBack}
  actions={
    <>
      <AppBarAction icon={({ color, size }) => <Share2 color={color} size={size} />} accessibilityLabel="Paylaş" onPress={share} />
      <AppBarAction icon={({ color, size }) => <MoreVertical color={color} size={size} />} accessibilityLabel="Daha fazla" onPress={openMenu} />
    </>
  }
/>
<AppBar title="Profil Düzenle" titleAlign="center" bordered onBack={goBack}
  actions={
    <>
      <AppBarAction icon={({ color, size }) => <Share2 color={color} size={size} />} accessibilityLabel="Paylaş" onPress={share} />
      <AppBarAction icon={({ color, size }) => <MoreVertical color={color} size={size} />} accessibilityLabel="Daha fazla" onPress={openMenu} />
    </>
  }
/>`
  ),
  render: () => (
    <View style={{ gap: 16, alignSelf: "stretch" }}>
      {(["start", "center"] as const).map((titleAlign) => (
        <AppBar
          key={titleAlign}
          title="Profil Düzenle"
          titleAlign={titleAlign}
          bordered
          onBack={noop}
          actions={
            <>
              <AppBarAction icon={icon(Share2)} accessibilityLabel="Paylaş" onPress={noop} />
              <AppBarAction icon={icon(MoreVertical)} accessibilityLabel="Daha fazla" onPress={noop} />
            </>
          }
        />
      ))}
    </View>
  ),
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("`small` tek sıra (56); `large` altında büyük başlık (34/41). `scrollY` yoksa `large` hep açık durur.", `<AppBar size="small" title="Ayarlar" />
<AppBar size="large" title="Ayarlar" />`),
  render: () => (
    <View style={{ gap: 16, alignSelf: "stretch" }}>
      {(["small", "large"] as const).map((size) => (
        <AppBar key={size} size={size} title="Ayarlar" bordered actions={<AppBarAction icon={icon(Search)} accessibilityLabel="Ara" onPress={noop} />} />
      ))}
    </View>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Başlıklar kendi metin kutularında, eylemler daire; eylemler dokunulamaz.", `<AppBar skeleton={isLoading} title={order?.title ?? "Sipariş"} subtitle="Kargoda" onBack={goBack} bordered actions={<AppBarAction icon={({ color, size }) => <Share2 color={color} size={size} />} accessibilityLabel="Paylaş" onPress={share} />} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View style={{ gap: 16 }}>
          <AppBar skeleton={skeleton} title="Sipariş #48213" subtitle="Kargoda" onBack={noop} bordered actions={<AppBarAction icon={icon(Share2)} accessibilityLabel="Paylaş" onPress={noop} />} />
          <AppBar skeleton={skeleton} size="large" title="Mesajlar" bordered actions={<AppBarAction icon={icon(Search)} accessibilityLabel="Ara" onPress={noop} />} />
        </View>
      )}
    </SkeletonDemo>
  ),
};
