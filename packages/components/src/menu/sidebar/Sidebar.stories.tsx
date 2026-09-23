import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppWindowIcon, DatabaseIcon, FlameIcon, MailIcon, SettingsIcon, SparklesIcon, UserIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { MenuItemType } from "../types";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
import { Avatar } from "../../avatar";

/**
 * Not: eskiden her öğe `iconName: "AppWindowIcon"` gibi bir STRING taşıyordu
 * ve silinmiş bir `mock-data/mockIconData` dosyasından ad->component
 * eşlemesi yapılıyordu (bkz. plan Faz 0/3 — bu import çalışmıyordu). Artık
 * `icon: React.ReactNode` doğrudan geçiliyor.
 */
const icon = (Icon: typeof AppWindowIcon) => <Icon size={18} />;

const baseData: MenuItemType[] = [
  { key: "dashboard", title: "Panel", route: "/dashboard", icon: icon(AppWindowIcon) },
  {
    key: "products",
    title: "Ürünler",
    icon: icon(DatabaseIcon),
    children: [
      { key: "all-products", title: "Tüm Ürünler", route: "/products", icon: icon(DatabaseIcon) },
      { key: "categories", title: "Kategoriler", route: "/products/categories", icon: icon(SettingsIcon) },
      {
        key: "manage",
        title: "Yönet",
        icon: icon(SettingsIcon),
        children: [
          { key: "create", title: "Oluştur", route: "/products/create", icon: icon(AppWindowIcon) },
          { key: "inventory", title: "Envanter", route: "/products/inventory", icon: icon(DatabaseIcon) },
        ],
      },
    ],
  },
  {
    key: "services",
    title: "Hizmetler",
    icon: icon(SettingsIcon),
    children: [
      { key: "web-dev", title: "Web Geliştirme", route: "/services/web", description: "Frontend ve backend çözümleri", icon: icon(AppWindowIcon) },
      { key: "design", title: "Tasarım", route: "/services/design", description: "UI/UX ve grafik tasarım", icon: icon(MailIcon) },
      { key: "consulting", title: "Danışmanlık", route: "/services/consulting", description: "Teknik danışmanlık", icon: icon(SettingsIcon) },
    ],
  },
  { key: "messages", title: "Mesajlar", route: "/messages", icon: icon(MailIcon) },
  { key: "settings", title: "Ayarlar", route: "/settings", icon: icon(SettingsIcon) },
];

const disabledData: MenuItemType[] = [...baseData, { key: "billing", title: "Faturalama (Devre Dışı)", route: "/billing", icon: icon(DatabaseIcon), disabled: true }];

const meta: Meta<typeof Sidebar> = {
  title: "Navigasyon/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Dikey gezinme menüsü. Alt öğeler `variant=\"hover\"` iken üzerine gelince, `variant=\"click\"` iken " +
            "tıklanınca açılır; `dropdown`/`mega` ile alt öğelerin akordeon yerine bir dropdown veya mega-panel " +
            "olarak açılması sağlanır (veri 3 seviyeliyse ikisi de ray+kolon `MegaPanel`ini kullanır, bkz. " +
            "\"Hover / Dropdown\" story'lerindeki \"Ürünler\"). `onlyIcon` sidebar'ı sadece ikonlarla daraltır. " +
            "`header` (mobil drawer tarzı bir avatar+karşılama bloğu için) ve `data`daki `heading: true` öğeleri " +
            "(bölüm etiketleri, tıklanamaz) için bkz. \"Mobil Drawer Deseni\" story'si.",
          a11y:
            "Her öğe gerçek bir `<button>` — Tab/Enter ile erişilebilir. `dropdown`/`mega` modlarında alt panel " +
            "eskiden sadece mouse hover ile açılıyordu; artık aynı düğmeye klavyeyle odaklanmak da (`onFocus`) açar " +
            "(Faz 13.5). **Kritik düzeltme:** sarmalayıcı eskiden `w-full` taşıyordu — görünür sidebar dar olsa bile " +
            "(örn. daraltılmış ikon hâli) bu görünmez `fixed` katman TÜM viewport genişliğini kaplayıp arkasındaki " +
            "sayfa içeriğinin tıklanmasını engelliyordu; kaldırıldı.",
        }),
      },
    },
  },
  argTypes: {
    variant: { control: { type: "radio" }, options: ["hover", "click"], description: "Alt menülerin açılma tetikleyicisi." },
    position: { control: { type: "radio" }, options: ["left", "right"], description: "Sidebar'ın ekrandaki kenarı." },
    onlyIcon: { control: { type: "boolean" }, description: "Sidebar'ı sadece ikonlarla daraltır." },
    dropdown: { control: { type: "boolean" }, description: "Alt öğeleri akordeon yerine bir dropdown panelde açar." },
    mega: { control: { type: "boolean" }, description: "Alt öğeleri bir mega-menu panelinde açar." },
  },
  args: {
    data: baseData,
    onNavigate: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const HoverLeftAccordion: Story = {
  name: "Hover / Sol / Akordeon",
  ...storyDoc("Üzerine gelince genişler, alt öğeler akordeon olarak açılır."),
  args: { variant: "hover", position: "left", dropdown: false, mega: false },
};

export const HoverRightAccordion: Story = {
  name: "Hover / Sağ / Akordeon",
  ...storyDoc("Sağ kenara sabitlenmiş hâli."),
  args: { variant: "hover", position: "right", dropdown: false, mega: false },
};

export const HoverDropdownLeft: Story = {
  name: "Hover / Sol / Dropdown",
  ...storyDoc("Alt öğeler akordeon yerine yan tarafta bir dropdown panelde açılır."),
  args: { variant: "hover", position: "left", dropdown: true, mega: false },
};

export const HoverDropdownRight: Story = {
  name: "Hover / Sağ / Dropdown",
  ...storyDoc("Dropdown paneli, sağ kenara sabitlenmiş hâli."),
  args: { variant: "hover", position: "right", dropdown: true, mega: false },
};

export const HoverMega: Story = {
  name: "Hover / Mega",
  ...storyDoc("Alt öğeler açıklamalı kartlardan oluşan bir mega-panelde açılır."),
  args: { variant: "hover", position: "left", dropdown: false, mega: true },
};

export const ClickLeft: Story = {
  name: "Tık / Sol",
  ...storyDoc("Genişleme hover yerine tetikleyici düğmeye tıklamayla tetiklenir."),
  args: { variant: "click", position: "left", dropdown: false, mega: false },
};

export const ClickRight: Story = {
  name: "Tık / Sağ",
  ...storyDoc("Tık ile genişleme, sağ kenara sabitlenmiş hâli."),
  args: { variant: "click", position: "right", dropdown: false, mega: false },
};

export const OnlyIconCollapsed: Story = {
  name: "Sadece İkon (Daraltılmış)",
  ...storyDoc("`onlyIcon` ile sidebar her zaman dar kalır, hover'da genişlemez."),
  args: { variant: "click", position: "left", onlyIcon: true, dropdown: false, mega: false },
};

export const WithDisabledItems: Story = {
  name: "Devre Dışı Öğeler",
  ...storyDoc("Devre dışı bir öğe tıklanamaz ve görsel olarak soluk görünür."),
  args: { data: disabledData, variant: "hover", position: "left", dropdown: false, mega: false },
};

export const WithCustomLogo: Story = {
  name: "Özel Logo",
  ...storyDoc("Üstte özel bir logo/görsel gösterir."),
  args: {
    variant: "hover",
    position: "left",
    logo: <img src="/images/avatar-placeholder.svg" alt="logo" className="w-8 h-8 rounded-full" />,
  },
};

export const ContentBehindSidebar: Story = {
  name: "Arkasındaki İçerik Tıklanabilir",
  ...storyDoc(
    "Sidebar'ın SAĞINDAKİ sayfa içeriğindeki düğmeye tıklayın (Faz 13.5 kritik bulgu — eskiden sarmalayıcı " +
      "`w-full` taşıdığı için görünmez bir katman TÜM viewport genişliğini kaplıyordu ve sidebar'ın görsel " +
      "genişliği ne olursa olsun arkasındaki HİÇBİR ŞEY tıklanamıyordu)."
  ),
  render: (args) => {
    function ClickableBehindContent() {
      const [clicked, setClicked] = React.useState(false);
      return (
        <div className="ml-16 p-8">
          <button type="button" className="rounded-md bg-mari-primary px-4 py-2 text-white cursor-pointer" onClick={() => setClicked(true)}>
            Sidebar'ın Arkasındaki Düğme
          </button>
          {clicked && <p className="mt-3 text-mari-success">Tıklama başarılı — sidebar arkasındaki içeriği engellemiyor.</p>}
        </div>
      );
    }
    return (
      <div className="relative h-[28rem]">
        <Sidebar {...args} />
        <ClickableBehindContent />
      </div>
    );
  },
  args: { variant: "hover", position: "left", dropdown: false, mega: false },
};

const drawerData: MenuItemType[] = [
  { key: "best-sellers", title: "Çok Satanlar", route: "/best-sellers", icon: icon(FlameIcon) },
  { key: "new-arrivals", title: "Yeni Çıkanlar", route: "/new", icon: icon(SparklesIcon) },
  { key: "section-categories", title: "Kategoriye Göre Alışveriş Yap", heading: true },
  { key: "electronics", title: "Elektronik", route: "/electronics", icon: icon(AppWindowIcon) },
  { key: "home-living", title: "Ev ve Yaşam", route: "/home-living", icon: icon(DatabaseIcon) },
  { key: "clothing", title: "Giyim", route: "/clothing", icon: icon(SettingsIcon) },
];

export const MobileDrawerPattern: Story = {
  name: "Mobil Drawer Deseni",
  ...storyDoc(
    "Amazon tarzı mobil drawer yapısı: `header` ile avatar + karşılama bloğu, ardından etiketsiz bir öğe grubu " +
      "(Çok Satanlar/Yeni Çıkanlar), sonra `heading: true` ile bölüm etiketli bir grup (Kategoriye Göre Alışveriş " +
      "Yap). Bölüm etiketi tıklanamaz, sadece kalın bir başlıktır — akordeon mimarisi değişmeden aynı kalıyor."
  ),
  render: (args) => (
    <div className="relative h-[32rem]">
      <Sidebar {...args} />
    </div>
  ),
  args: {
    data: drawerData,
    variant: "hover",
    position: "left",
    dropdown: false,
    mega: false,
    header: (
      <div className="flex items-center gap-3 px-2 py-2">
        <Avatar size="sm" icon={<UserIcon size={16} />} />
        <span className="text-sm font-medium">Merhaba, aykut</span>
      </div>
    ),
  },
};

export const RealWorldAdmin: Story = {
  name: "Gerçek Kullanım (Yönetim Paneli)",
  ...storyDoc(
    "Gerçek bir kullanım örneği: logo + `currentPath` ile aktif öğe (\"Ürünler\" > \"Tüm Ürünler\") başlangıçta " +
      "vurgulanmış, gerçek bir yönetim paneli kenar çubuğu."
  ),
  render: (args) => (
    <div className="relative h-[28rem]">
      <Sidebar {...args} />
    </div>
  ),
  args: {
    data: baseData,
    variant: "hover",
    position: "left",
    dropdown: false,
    mega: false,
    currentPath: "/products",
    logo: <span className="text-lg font-bold text-mari-primary">M</span>,
  },
};
