import React, { useRef } from "react";
import { Animated, View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUp, Camera, FileText, HelpCircle, MessageCircle, Pencil, Plus, UserPlus } from "lucide-react-native";
import { BackTop, FloatButton, FloatButtonGroup, type FloatButtonIconState } from "./FloatButton";
import { useAppBarScroll } from "../AppBar";
import { ListItem, ListItemMeta } from "../List";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, jsxProps, storyDoc, withNativeTheme, withStretch, withoutInsets } from "../stories/storyMeta";

const meta: Meta<typeof FloatButton> = {
  title: "Native/Genel/FloatButton",
  component: FloatButton,
  tags: ["autodocs"],
  // withoutInsets: örnekler sayfa içindeki çerçevede, ev çubuğu payı almasın.
  decorators: [withStretch, withoutInsets, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Yüzen eylem düğmesi (Material 3 FAB): ekranın ana eylemi, kapsayıcının köşesine yapışık. Daire, kare (alt metinli), genişletilmiş (`label`), rozet. `FloatButtonGroup`: alt alta düğmeler ya da ana düğmeden açılan menü (speed dial). `BackTop`: kaydırınca beliren başa dön.",
    whenToUse: ["Ekranın tek ana eylemi: yeni mesaj, gönderi oluştur, sepete git.", "Destek sohbeti gibi her ekranda erişilen eylem.", "Birkaç ilişkili oluşturma eylemi (menü)."],
    whenNotToUse: ["Ekranda zaten belirgin bir ana düğme varsa — ikisi yarışır.", "Gezinme — BottomNavigation.", "Az önemli / yıkıcı eylemler (Sil) — AppBar eylemi ya da ActionSheet."],
    vsWeb: "API web ile aynı (`icon`, `description`, `tooltip`, `color`, `shape`, `badge`, `placement`; `href`/`target` yok → `onPress`). Native'e özgü: `label` (genişletilmiş FAB), `floating={false}` (akışta), `offset`. Kapsayıcının köşesine `position: absolute` — ekranın kök View'una koyun; alt / üst güvenli alan `ThemeProvider insets`ten. Grup menüsünde `tooltip` düğmenin yanında görünen etikettir. `BackTop`: `scrollY` (`useAppBarScroll`) + `onPress` (`scrollToOffset`).",
  }) } } },
  argTypes: {
    shape: { control: "select", options: ["circle", "square"] },
    color: { control: "select", options: [undefined, "primary", "accent", "success", "error"] },
    placement: { control: "select", options: ["bottom-right", "bottom-left", "top-right", "top-left"] },
    skeleton: { control: "boolean" },
  },
  args: { shape: "circle", color: "primary", placement: "bottom-right", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof FloatButton>;

const icon = (Icon: typeof Plus) => ({ color, size }: FloatButtonIconState) => <Icon size={size} color={color} />;

/** Telefon ekranı gibi çerçeve: düğmeler bu kutunun köşesine yapışır. */
function Screen({ children, height = 300 }: { children: React.ReactNode; height?: number }) {
  const theme = useTheme();
  return <View style={{ height, alignSelf: "stretch", borderWidth: 1, borderColor: theme.color.canvas.border, borderRadius: 16, overflow: "hidden", backgroundColor: theme.color.canvas.surfaceAlt }}>{children}</View>;
}

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin.", (args) => `<FloatButton ${jsxProps(args, { skip: ["icon"] })} icon={({ color, size }) => <Plus color={color} size={size} />} accessibilityLabel="Yeni" onPress={create} />`),
  render: (args) => (
    <Screen>
      <FloatButton {...args} icon={icon(Plus)} accessibilityLabel="Yeni" />
    </Screen>
  ),
};

export const Support: Story = {
  name: "Destek Sohbeti",
  ...storyDoc("Nötr yüzey (renk yok) + okunmamış sayısı rozeti; her ekranda erişilen ikincil eylem.", `<FloatButton icon={({ color, size }) => <MessageCircle color={color} size={size} />} badge={{ count: 3 }} accessibilityLabel="Destek, 3 okunmamış" />`),
  render: () => (
    <Screen>
      <View style={{ padding: 16, gap: 6 }}>
        <Text weight="semibold">Sipariş #48213</Text>
        <Text muted>Kargoda · tahmini teslim yarın</Text>
      </View>
      <FloatButton icon={icon(MessageCircle)} badge={{ count: 3 }} accessibilityLabel="Destek, 3 okunmamış" onPress={() => undefined} />
    </Screen>
  ),
};

export const Extended: Story = {
  name: "Genişletilmiş (label)",
  ...storyDoc("`label`: ikon + metin, hap şeklinde — ilk kez gelen kullanıcıya eylemi açıkça söyler. Liste kaydırılınca `label`ı kaldırıp daraltmak yaygın kalıptır.", `<FloatButton color="primary" icon={({ color, size }) => <Pencil color={color} size={size} />} label="Yeni gönderi" onPress={openComposer} />`),
  render: () => (
    <Screen height={200}>
      <FloatButton color="primary" icon={icon(Pencil)} label="Yeni gönderi" onPress={() => undefined} />
    </Screen>
  ),
};

export const QuickActions: Story = {
  name: "Hızlı İşlemler (Menü)",
  ...storyDoc("`FloatButtonGroup trigger=\"click\"`: ana düğme menüyü açar, ikonu × olur; öğeler etiketleriyle (`tooltip`) sırayla çıkar. Öğeye dokununca menü kapanır.", `<FloatButtonGroup trigger="click" icon={({ color, size }) => <Plus color={color} size={size} />} accessibilityLabel="Oluştur">
  <FloatButton icon={({ color, size }) => <Camera color={color} size={size} />} tooltip="Fotoğraf" onPress={takePhoto} />
  <FloatButton icon={({ color, size }) => <FileText color={color} size={size} />} tooltip="Belge" onPress={pickDocument} />
  <FloatButton icon={({ color, size }) => <UserPlus color={color} size={size} />} tooltip="Kişi ekle" onPress={addContact} />
</FloatButtonGroup>`),
  render: () => (
    <Screen height={360}>
      <FloatButtonGroup trigger="click" icon={icon(Plus)} accessibilityLabel="Oluştur">
        <FloatButton icon={icon(Camera)} tooltip="Fotoğraf" onPress={() => undefined} />
        <FloatButton icon={icon(FileText)} tooltip="Belge" onPress={() => undefined} />
        <FloatButton icon={icon(UserPlus)} tooltip="Kişi ekle" onPress={() => undefined} />
      </FloatButtonGroup>
    </Screen>
  ),
};

export const SquareGroup: Story = {
  name: "Yardım + Sohbet (Kare Grup)",
  ...storyDoc("`shape=\"square\"` grup: kare düğmeler alt alta, `description` ikonun altında.", `<FloatButtonGroup shape="square">
  <FloatButton icon={({ color, size }) => <HelpCircle color={color} size={size} />} description="Yardım" onPress={openHelp} />
  <FloatButton icon={({ color, size }) => <MessageCircle color={color} size={size} />} description="Sohbet" badge={{ dot: true }} onPress={openChat} />
</FloatButtonGroup>`),
  render: () => (
    <Screen height={260}>
      <FloatButtonGroup shape="square">
        <FloatButton icon={icon(HelpCircle)} description="Yardım" onPress={() => undefined} />
        <FloatButton icon={icon(MessageCircle)} description="Sohbet" badge={{ dot: true }} onPress={() => undefined} />
      </FloatButtonGroup>
    </Screen>
  ),
};

const ROWS = Array.from({ length: 30 }, (_, i) => ({ key: String(i), title: `Bildirim ${i + 1}`, body: i % 3 === 0 ? "Siparişiniz kargoya verildi." : "Yeni bir yorum var." }));

function BackTopDemo() {
  const { scrollY, onScroll, scrollEventThrottle } = useAppBarScroll();
  const listRef = useRef<React.ComponentRef<typeof Animated.ScrollView>>(null);
  return (
    <Screen height={380}>
      <Animated.ScrollView ref={listRef} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} nestedScrollEnabled>
        {ROWS.map((r) => (
          <ListItem key={r.key}>
            <ListItemMeta title={r.title} description={r.body} />
          </ListItem>
        ))}
      </Animated.ScrollView>
      <BackTop scrollY={scrollY} visibilityHeight={300} icon={icon(ArrowUp)} onPress={() => listRef.current?.scrollTo({ y: 0, animated: true })} />
    </Screen>
  );
}

export const BackToTop: Story = {
  name: "Başa Dön",
  ...storyDoc("`BackTop`: `visibilityHeight` kadar kaydırılınca solarak belirir; dokununca başa dönme işini siz yaparsınız (`scrollTo` / `scrollToOffset`).", `const listRef = useRef<FlatList>(null);
const { scrollY, onScroll } = useAppBarScroll();

<Animated.FlatList ref={listRef} data={messages} renderItem={({ item }) => <Text>{item.title}</Text>} onScroll={onScroll} />
<BackTop scrollY={scrollY} visibilityHeight={300} icon={({ color, size }) => <ArrowUp color={color} size={size} />} onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} />`),
  render: () => <BackTopDemo />,
};

export const Variants: Story = {
  name: "Şekil ve Renk",
  ...storyDoc("Daire / kare, nötr / rol rengi (ana eylem `primary`).", `<FloatButton floating={false} shape="square" description="Yardım" />`),
  render: () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
      <FloatButton floating={false} icon={icon(Plus)} accessibilityLabel="Nötr" />
      <FloatButton floating={false} color="primary" icon={icon(Plus)} accessibilityLabel="Primary" />
      <FloatButton floating={false} color="success" icon={icon(Plus)} accessibilityLabel="Success" />
      <FloatButton floating={false} shape="square" icon={icon(HelpCircle)} description="Yardım" />
      <FloatButton floating={false} color="primary" icon={icon(Pencil)} label="Yaz" />
    </View>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Düğme kendi şeklinde yer tutucu, dokunulamaz.", `<FloatButton floating={false} skeleton={isLoading} color="primary" icon={({ color, size }) => <Pencil color={color} size={size} />} label="Yeni gönderi" />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View style={{ flexDirection: "row", gap: 16 }}>
          <FloatButton floating={false} skeleton={skeleton} color="primary" icon={icon(Plus)} accessibilityLabel="Yeni" />
          <FloatButton floating={false} skeleton={skeleton} color="primary" icon={icon(Pencil)} label="Yeni gönderi" />
        </View>
      )}
    </SkeletonDemo>
  ),
};
