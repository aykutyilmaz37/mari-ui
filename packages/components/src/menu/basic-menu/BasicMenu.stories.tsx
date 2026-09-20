import type { Meta, StoryObj } from "@storybook/react";
import { BriefcaseIcon, CodeIcon, HomeIcon, InfoIcon, MailIcon, PaletteIcon, PhoneIcon, ShoppingCartIcon, TagIcon } from "lucide-react";
import { BasicMenu } from "./BasicMenu";
import type { MenuItemType } from "../types";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
import { Button } from "../../button";

const icon = (Icon: typeof HomeIcon) => <Icon size={16} />;

/**
 * Not: `onNavigate` verilmediğinde bu component `window.location.href`
 * ile tam sayfa geçişi yapar. Storybook'ta gerçek navigasyonu önlemek için
 * her story burada bir no-op `onNavigate` geçiyor.
 */
const meta: Meta<typeof BasicMenu> = {
  component: BasicMenu,
  title: "Navigasyon/BasicMenu",
  tags: ["autodocs"],
  // Faz 13.5 kullanıcı bulgusu (round 2): "Playgroundu büyük olmalı" — küçük,
  // sabit yükseklikli bir canvas'ta gerçek bir navbar'ın nasıl davrandığını
  // (padding, hover, dropdown açılışı) değerlendirmek zordu. `fullscreen`
  // Sidebar'da zaten kullanılan aynı düzen.
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Yatay üst gezinme çubuğu. `data` içindeki `children`'ı olan öğeler üzerine gelindiğinde otomatik " +
            "olarak bir dropdown açar. `onNavigate` verilmezse `window.location.href` ile tam sayfa geçiş yapar — " +
            "bir router (örn. Next.js `useRouter`) kullanıyorsanız `onNavigate` ile client-side gezinmeye bağlayın.",
          whenToUse: ["Bir uygulamanın üst seviye sayfaları arasında yatay, her zaman görünür bir gezinme çubuğu gerektiğinde."],
          a11y:
            "Her öğe gerçek bir `<button>` (Button component'i) — Tab ile odaklanılıp Enter/Boşluk ile aktifleştirilebilir. " +
            "`children`'ı olan öğeler için alt menü tetikleyicisi de tek bir gerçek `<button>`dır. Alt panel açıkken " +
            "tetikleyiciden panele geçerken menü kapanmaz (Faz 13.5 round 2 — hover-intent gecikmesi, bkz. Dropdown).",
        }),
      },
    },
  },
  argTypes: {
    menuItemJustify: { control: "select", options: ["left", "center", "right"], description: "Menü öğelerinin yatay hizalanması." },
    menuPosition: { control: "select", options: ["default", "sticky", "fixed"], description: "Menünün sayfa kaydırmasına göre konumlanma davranışı." },
    currentPath: { control: "text", description: "Aktif öğeyi belirlemek için mevcut yol — verilirse ve `data`da eşleşen bir `route` varsa başlangıçta o öğe vurgulanır." },
    actions: { control: false, description: "Sağ tarafta gösterilecek keyfi içerik (örn. \"Giriş Yap\" düğmesi, sepet ikonu)." },
  },
  args: {
    onNavigate: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof BasicMenu>;

/**
 * Faz 13.5 kullanıcı bulgusu (round 2): "Sola Yaslı"/"Sağa Yaslı" gibi soyut,
 * içeriksiz hizalama demoları anlamsız bulundu — bunun yerine gerçek dummy
 * veriyle, gerçek kullanım senaryolarını gösteren story'ler tercih edildi.
 * Her ikisinde de HEM üst seviye HEM alt menü öğelerinde ikon var.
 */
const ecommerceData: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/", icon: icon(HomeIcon) },
  {
    key: "products",
    title: "Ürünler",
    children: [
      { key: "electronics", title: "Elektronik", route: "/products/electronics", icon: icon(TagIcon) },
      { key: "clothing", title: "Giyim", route: "/products/clothing", icon: icon(TagIcon) },
      { key: "home-living", title: "Ev & Yaşam", route: "/products/home", icon: icon(TagIcon) },
    ],
  },
  { key: "campaigns", title: "Kampanyalar", route: "/campaigns", icon: icon(TagIcon) },
  { key: "contact", title: "İletişim", route: "/contact", icon: icon(PhoneIcon) },
];

export const RealWorldEcommerce: Story = {
  name: "Gerçek Kullanım (E-Ticaret)",
  ...storyDoc(
    "Gerçek bir e-ticaret üst menüsü: logo sabit solda, ikonlu gezinme öğeleri ortada, \"Giriş Yap\" + sepet " +
      "`actions` ile sabit sağda. \"Ürünler\"in üzerine gelin — alt panel öğeleri de ikonlu."
  ),
  args: {
    data: ecommerceData,
    menuItemJustify: "center",
    logo: <span className="text-lg font-bold text-mari-primary">Mari</span>,
    actions: (
      <>
        <Button variant="ghost" color="neutral">
          Giriş Yap
        </Button>
        <Button variant="ghost" color="neutral" aria-label="Sepetim">
          <ShoppingCartIcon size={20} />
        </Button>
      </>
    ),
  },
};

const corporateData: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/", icon: icon(HomeIcon) },
  { key: "about", title: "Hakkımızda", route: "/about", icon: icon(InfoIcon) },
  {
    key: "services",
    title: "Hizmetler",
    icon: icon(BriefcaseIcon),
    children: [
      { key: "web-dev", title: "Web Geliştirme", route: "/services/web", icon: icon(CodeIcon) },
      { key: "design", title: "Tasarım", route: "/services/design", icon: icon(PaletteIcon) },
    ],
  },
  { key: "contact", title: "İletişim", route: "/contact", icon: icon(MailIcon) },
];

export const RealWorldCorporate: Story = {
  name: "Gerçek Kullanım (Kurumsal)",
  ...storyDoc("Sade bir kurumsal site üst menüsü: logo solda, öğeler sola yaslı, sağda tek bir \"İletişime Geç\" CTA düğmesi."),
  args: {
    data: corporateData,
    menuItemJustify: "left",
    logo: <span className="text-lg font-bold text-mari-primary">Mari Ajans</span>,
    actions: (
      <Button variant="outline" color="primary">
        İletişime Geç
      </Button>
    ),
  },
};

export const ActiveFromCurrentPath: Story = {
  name: "Mevcut Yoldan Aktif Öğe",
  ...storyDoc(
    "`currentPath=\"/products\"` verildi — başlangıçta \"Ürünler\" aktif görünür (alt çizgi + kalın metin). " +
      "`currentPath` verilmezse ilk öğe başlangıçta aktif kabul edilir."
  ),
  args: {
    data: ecommerceData,
    menuItemJustify: "center",
    currentPath: "/products",
    logo: <span className="text-lg font-bold text-mari-primary">Mari</span>,
  },
};

export const StickyPosition: Story = {
  name: "Yapışkan (Sticky) Konum",
  ...storyDoc("Sayfa kaydırılırken üstte yapışık kalır — aşağı kaydırın."),
  render: (args) => (
    <div className="h-96 overflow-y-auto">
      <BasicMenu {...args} />
      <div className="h-[150vh] p-8 text-mari-muted">Sayfa içeriği — menü kaydırırken üstte yapışık kalmalı.</div>
    </div>
  ),
  args: {
    data: ecommerceData,
    menuItemJustify: "center",
    menuPosition: "sticky",
    logo: <span className="text-lg font-bold text-mari-primary">Mari</span>,
  },
};
