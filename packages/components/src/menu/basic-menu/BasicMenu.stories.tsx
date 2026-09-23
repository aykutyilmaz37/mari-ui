import type { Meta, StoryObj } from "@storybook/react";
import { BriefcaseIcon, CodeIcon, HeadphonesIcon, HomeIcon, InfoIcon, LaptopIcon, LayersIcon, MailIcon, PaletteIcon, PhoneIcon, ShirtIcon, ShoppingCartIcon, SmartphoneIcon, SofaIcon, TagIcon } from "lucide-react";
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
            "olarak bir dropdown açar: veri düzse (tek seviye) kompakt bir liste, veri gerçekten 3 seviyeliyse " +
            "(çocukların kendi çocukları varsa) tetikleyiciye sabitlenmiş bir ray+kolon paneli (`MegaPanel`, " +
            "promosuz — tam genişlikteki hâli için `MegaMenu`ya bakın). `onNavigate` verilmezse `window.location.href` " +
            "ile tam sayfa geçiş yapar — bir router (örn. Next.js `useRouter`) kullanıyorsanız `onNavigate` ile " +
            "client-side gezinmeye bağlayın.",
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
      { key: "electronics", title: "Elektronik", route: "/products/electronics", icon: icon(SmartphoneIcon), description: "Telefon, bilgisayar ve tüm teknoloji ürünleri." },
      { key: "clothing", title: "Giyim", route: "/products/clothing", icon: icon(ShirtIcon), description: "Kadın, erkek ve çocuk koleksiyonları." },
      { key: "home-living", title: "Ev & Yaşam", route: "/products/home", icon: icon(SofaIcon), description: "Mobilya, dekorasyon ve mutfak." },
    ],
  },
  {
    key: "categories",
    title: "Kategoriler",
    icon: icon(LayersIcon),
    children: [
      {
        key: "electronics-group",
        title: "Elektronik",
        children: [
          { key: "phones", title: "Telefonlar", route: "/c/phones", icon: icon(SmartphoneIcon), description: "Akıllı telefon ve aksesuarları." },
          { key: "computers", title: "Bilgisayarlar", route: "/c/computers", icon: icon(LaptopIcon), description: "Dizüstü, masaüstü ve bileşenler." },
          { key: "audio", title: "Ses Sistemleri", route: "/c/audio", icon: icon(HeadphonesIcon), description: "Kulaklık ve hoparlörler." },
        ],
      },
      {
        key: "fashion-group",
        title: "Moda",
        children: [
          { key: "women", title: "Kadın", route: "/c/women", icon: icon(ShirtIcon), description: "Elbise, dış giyim ve daha fazlası." },
          { key: "men", title: "Erkek", route: "/c/men", icon: icon(ShirtIcon), description: "Gömlek, pantolon ve ayakkabı." },
        ],
      },
    ],
  },
  { key: "campaigns", title: "Kampanyalar", route: "/campaigns", icon: icon(TagIcon) },
  { key: "contact", title: "İletişim", route: "/contact", icon: icon(PhoneIcon) },
];

export const RealWorldEcommerce: Story = {
  name: "Gerçek Kullanım (E-Ticaret)",
  ...storyDoc(
    "Gerçek bir e-ticaret üst menüsü: logo sabit solda, ikonlu gezinme öğeleri ortada, \"Giriş Yap\" + sepet " +
      "`actions` ile sabit sağda. \"Ürünler\" ikon karosu + açıklamalı satırlardan oluşan bir panel açar; " +
      "\"Kategoriler\" ise çocukların kendi çocukları olduğu için başlıklı gruplu kolonlara geçer."
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
      { key: "web-dev", title: "Web Geliştirme", route: "/services/web", icon: icon(CodeIcon), description: "Kurumsal siteler ve web uygulamaları." },
      { key: "design", title: "Tasarım", route: "/services/design", icon: icon(PaletteIcon), description: "Marka kimliği, UI/UX ve grafik tasarım." },
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
    // Navbar'daki tek CTA sayfanın en yüksek vurgulu öğesi olmalı — `solid`.
    // `outline`/`ghost` daha düşük vurgulu ikincil eylemler içindir (bkz.
    // e-ticaret story'sindeki "Giriş Yap").
    actions: (
      <Button variant="solid" color="primary" size="lg">
        İletişime Geç
      </Button>
    ),
  },
};

export const ActiveFromCurrentPath: Story = {
  name: "Mevcut Yoldan Aktif Öğe",
  ...storyDoc(
    "`currentPath=\"/products/electronics\"` verildi — başlangıçta \"Ürünler > Elektronik\" aktif görünür. " +
      "`currentPath` eşleşen bir `route` bulamazsa (veya hiç verilmezse) hiçbir öğe aktif görünmez — Sidebar'la " +
      "tutarlı olsun diye \"ilk öğeye geri düş\" davranışı kaldırıldı."
  ),
  args: {
    data: ecommerceData,
    menuItemJustify: "center",
    currentPath: "/products/electronics",
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
