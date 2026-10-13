import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Check, LogIn, MapPin, Package, ShieldCheck, Truck } from "lucide-react-native";
import { Timeline, type TimelineItem } from "./Timeline";
import { Text } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, jsxProps, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Timeline> = {
  title: "Native/Veri Gösterimi/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Zaman sırasına dizilmiş olaylar: kargo takibi, hesap etkinliği, sürüm geçmişi. Dikey (`start` / `end` / `alternate`, başlık içte ya da karşıda) ya da yatay; ikonlu, dolu ya da boş nokta; süren adım (`pending`, `loading`).",
    whenToUse: ["Bir sürecin geçmişi ve şu anki durumu (sipariş, başvuru).", "Tarihli olay günlüğü."],
    whenNotToUse: ["Kullanıcının ilerleyeceği adımlar (sihirbaz) — Steps.", "Sırasız liste — List."],
    vsWeb: "API web Timeline ile aynı (`items`, `mode`, `orientation`, `variant`, `titlePlacement`, `reverse`, `pending`). `icon` fonksiyon olabilir: `(color) => <Truck color={color} />` (RN'de `currentColor` yok). `alternate` dar kapsayıcıda (`responsive`, 480pt) `start`a döner; `opposite` telefonda da kalır — zaman sütunu içeriği kadar.",
  }) } } },
  argTypes: {
    mode: { control: "select", options: ["start", "end", "alternate"] },
    orientation: { control: "select", options: ["vertical", "horizontal"] },
    variant: { control: "select", options: ["outlined", "filled"] },
    titlePlacement: { control: "select", options: ["inline", "opposite"] },
    reverse: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { mode: "start", orientation: "vertical", variant: "outlined", titlePlacement: "inline", reverse: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Timeline>;

const ic = (Icon: typeof Truck) => (color: string) => <Icon size={18} color={color} />;

const SHIPPING: TimelineItem[] = [
  { title: "8 Eki · 09:12", content: "Sipariş alındı", icon: ic(Check), color: "success" },
  { title: "8 Eki · 14:40", content: "Hazırlandı ve paketlendi", icon: ic(Package), color: "success" },
  { title: "9 Eki · 08:05", content: "Kargoya verildi — İstanbul aktarma merkezi", icon: ic(Truck), color: "primary" },
  { title: "10 Eki · 11:30", content: "Dağıtım şubesine ulaştı (Kadıköy)", icon: ic(MapPin), color: "primary" },
];

export const Playground: Story = {
  ...storyDoc(
    "Tüm prop'ları canlı deneyin.",
    (args) => `
const icon = (Icon: typeof Truck) => (color: string) => <Icon size={18} color={color} />;
const steps = [
  { title: "8 Eki · 09:12", content: "Sipariş alındı", icon: icon(Check), color: "success" },
  { title: "8 Eki · 14:40", content: "Hazırlandı ve paketlendi", icon: icon(Package), color: "success" },
  { title: "9 Eki · 08:05", content: "Kargoya verildi — İstanbul aktarma merkezi", icon: icon(Truck), color: "primary" },
];

<Timeline ${jsxProps(args, { skip: ["items"] })} items={steps} accessibilityLabel="Kargo durumu" />`
  ),
  render: (args) => <Timeline {...args} items={SHIPPING} accessibilityLabel="Kargo durumu" />,
};

export const Shipping: Story = {
  name: "Kargo Takibi (ikon + pending)",
  ...storyDoc("İkonlu adımlar; `pending` sona \"sürüyor\" öğesi ekler, ona giden ray kesikli.", `<Timeline items={steps} pending="Dağıtımda — bugün 18:00'e kadar" />`),
  render: () => <Timeline items={SHIPPING} pending="Dağıtımda — bugün 18:00'e kadar" accessibilityLabel="Kargo durumu" />,
};

const ACTIVITY: TimelineItem[] = [
  { title: "5 Eki · 21:14", content: "Yeni cihazdan giriş (iPhone, İzmir)", color: "warning" },
  { title: "6 Eki · 09:02", content: "Şifre değiştirildi", color: "info" },
  { title: "7 Eki · 10:47", content: "İki adımlı doğrulama açıldı", color: "success", icon: ic(ShieldCheck) },
  { title: "Bugün · 08:30", content: "Oturum açıldı (bu cihaz)", icon: ic(LogIn) },
];

export const Activity: Story = {
  name: "Hesap Etkinliği (reverse, filled)",
  ...storyDoc("`reverse`: en yeni olay üstte. `variant=\"filled\"`: dolu noktalar.", `<Timeline items={events} reverse variant="filled" />`),
  render: () => <Timeline items={ACTIVITY} reverse variant="filled" accessibilityLabel="Hesap etkinliği" />,
};

const RELEASES: TimelineItem[] = [
  { title: "v1.0", content: "İlk sürüm: Button, Input, Card" },
  { title: "v1.4", content: "Koyu tema ve tema stüdyosu" },
  { title: "v2.0", content: "@mari-ui/native: 40+ bileşen" },
  { title: "v2.1", content: "Sidebar, BottomNavigation, AppBar", color: "success" },
];

export const Releases: Story = {
  name: "Sürüm Geçmişi (başlık karşıda)",
  ...storyDoc("`titlePlacement=\"opposite\"`: sürüm / tarih solda, olay sağda — telefonda da; sol sütun içeriği kadar.", `<Timeline items={releases} titlePlacement="opposite" />`),
  render: () => <Timeline items={RELEASES} titlePlacement="opposite" accessibilityLabel="Sürümler" />,
};

const ROADMAP: TimelineItem[] = [
  { title: "Ç1", content: "Araştırma ve görüşmeler" },
  { title: "Ç2", content: "Tasarım sistemi" },
  { title: "Ç3", content: "Beta — 200 kullanıcı" },
  { title: "Ç4", content: "Genel yayın", color: "success" },
];

export const Roadmap: Story = {
  name: "Yol Haritası (alternate)",
  ...storyDoc("`mode=\"alternate\"`: içerik sırayla iki tarafa. 480pt'den dar kapsayıcıda (telefon) tek tarafa döner; `responsive={false}` iki tarafta tutar.", `<Timeline items={roadmap} mode="alternate" />
<Timeline items={roadmap} mode="alternate" responsive={false} />`),
  render: () => (
    <Stack>
      <Timeline items={ROADMAP} mode="alternate" accessibilityLabel="Yol haritası" />
      <Text muted>responsive=false</Text>
      <Timeline items={ROADMAP} mode="alternate" responsive={false} accessibilityLabel="Yol haritası" />
    </Stack>
  ),
};

const PHASES: TimelineItem[] = [
  { title: "Eylül", content: "Keşif", color: "success" },
  { title: "Ekim", content: "Tasarım", color: "success" },
  { title: "Kasım", content: "Geliştirme" },
  { title: "Aralık", content: "Test" },
  { title: "Ocak", content: "Yayın" },
];

export const Horizontal: Story = {
  name: "Proje Aşamaları (yatay)",
  ...storyDoc("`orientation=\"horizontal\"`: yan yana; sığmayınca yatay kayar.", `<Timeline items={phases} orientation="horizontal" pending="Sürüyor" />`),
  render: () => <Timeline items={PHASES} orientation="horizontal" accessibilityLabel="Proje aşamaları" />,
};

export const End: Story = {
  name: "Sağa Hizalı (end)",
  ...storyDoc("`mode=\"end\"`: nokta sağda, içerik solda (sağa hizalı).", `<Timeline items={items} mode="end" />`),
  render: () => <Timeline items={SHIPPING.slice(0, 3)} mode="end" accessibilityLabel="Kargo durumu" />,
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Noktalar daire, başlık ve içerik ince çubuk.", `<Timeline skeleton={isLoading} items={items} />`),
  render: () => <SkeletonDemo>{(skeleton) => <Timeline skeleton={skeleton} items={SHIPPING} accessibilityLabel="Kargo durumu" />}</SkeletonDemo>,
};
