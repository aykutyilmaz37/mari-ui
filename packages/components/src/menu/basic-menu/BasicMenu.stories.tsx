import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MariLogo } from "../../logo";
import { ActivityIcon, BookOpenIcon, BriefcaseIcon, CodeIcon, HeadphonesIcon, HomeIcon, InfoIcon, LaptopIcon, LayersIcon, MailIcon, NewspaperIcon, PaletteIcon, PhoneIcon, ShirtIcon, ShoppingCartIcon, SmartphoneIcon, SofaIcon, TagIcon } from "lucide-react";
import { BasicMenu } from "./BasicMenu";
import type { MenuItemType } from "../types";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
import { SkeletonDemo } from "../../lib/SkeletonDemo";
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
            "(çocukların kendi çocukları varsa) başlıklı gruplu kolonlar. Route'u olan her öğe gerçek bir `<a href>`'dir. " +
            "Component hangi router'ı kullandığınızı bilmez: sayfa yenilenmeden geçiş için `onNavigate`e router'ınızın " +
            "gezinme fonksiyonunu verin (Next: `router.push`, React Router: `navigate`); verilmezse tarayıcı sayfayı " +
            "yükler. Öğe bazında `target` (`_blank`, `_parent`, `_top`, çerçeve adı) ve `reloadDocument` router'ı atlar.",
          whenToUse: ["Bir uygulamanın üst seviye sayfaları arasında yatay, her zaman görünür bir gezinme çubuğu gerektiğinde."],
          a11y:
            "Öğeler `<nav aria-label=\"Ana menü\">` içinde bir `<ul>` listesi; route'u olan öğeler gerçek link (orta tık / " +
            "yeni sekmede aç çalışır), geçerli sayfa `aria-current=\"page\"`. Alt menü tetikleyicisi `aria-expanded` taşıyan " +
            "tek bir `<button>`: Enter/Boşluk/↓ açar, panelde ↑/↓/Home/End ve harf tuşlarıyla gezilir, Escape kapatır. " +
            "Tetikleyiciden panele geçerken menü kapanmaz (hover-intent). `mobileBreakpoint` altında hamburger bir " +
            "`role=\"dialog\"` çekmece açar: odak içeri taşınır ve içinde döner, Escape/scrim kapatır, odak hamburger'e döner. " +
            "Logo `logoHref` ile \"Ana sayfa\" adlı bir link olur.",
        }),
      },
    },
  },
  argTypes: {
    mobileBreakpoint: { control: "select", options: ["md", "lg", "xl"], description: "Bu genişliğin altında öğeler gizlenir, hamburger + mobil çekmece gelir. Varsayılan `lg` (1024px)." },
    menuItemJustify: { control: "select", options: ["left", "center", "right"], description: "Menü öğelerinin yatay hizalanması." },
    menuPosition: { control: "select", options: ["default", "sticky", "fixed"], description: "Menünün sayfa kaydırmasına göre konumlanma davranışı." },
    currentPath: { control: "text", description: "Aktif öğeyi belirlemek için mevcut yol — verilirse ve `data`da eşleşen bir `route` varsa başlangıçta o öğe vurgulanır." },
    actions: { control: false, description: "Sağ tarafta gösterilecek keyfi içerik (örn. \"Giriş Yap\" düğmesi, sepet ikonu)." },
    logoHref: { control: "text", description: "Logoyu bu adrese giden bir link yapar (genelde `/`)." },
    logoLabel: { control: "text", description: "Etkileşimli logonun erişilebilir adı.", table: { defaultValue: { summary: '"Ana sayfa"' } } },
    skeleton: { control: "boolean", description: "Logo, öğeler ve `actions` yer tutucu.", table: { defaultValue: { summary: "false" } } },
    "aria-label": { control: "text", description: "`<nav>`ın erişilebilir adı.", table: { defaultValue: { summary: '"Ana menü"' } } },
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
    logo: <MariLogo size={36} />,
    logoHref: "/",
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

export const Mobile: Story = {
  name: "Mobil (Hamburger + Çekmece)",
  ...storyDoc(
    "`mobileBreakpoint` (varsayılan `lg`, 1024px) altında yatay öğeler gizlenir, logonun soluna hamburger gelir; `actions` " +
      "çubukta kalır. Çekmece soldan kayar, alt menüsü olan öğeler bir seviye içeri girer (geri düğmesi + seviye başlığı). " +
      "Bu story mobil viewport'ta açılır — araç çubuğundaki viewport seçicisiyle genişliği değiştirip geçişi görebilirsiniz."
  ),
  parameters: { viewport: { defaultViewport: "mobile2" } },
  args: { ...RealWorldEcommerce.args, currentPath: "/campaigns" },
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
    logo: <MariLogo size={36} />,
    logoHref: "/",
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
    logo: <MariLogo size={36} />,
    logoHref: "/",
  },
};

export const StickyPosition: Story = {
  name: "Yapışkan (Sticky) Konum",
  ...storyDoc(
    "Sayfa kaydırılırken üstte yapışık kalır — aşağı kaydırın. `sticky`/`fixed` konumda çubuk `z-mari-sticky` " +
      "katmanındadır; kayan içerik üstüne binmez.",
    `
<BasicMenu
  data={data}
  menuPosition="sticky"
  menuItemJustify="center"
  logo={<MariLogo size={36} />}
  logoHref="/"
/>
<main>…</main>`
  ),
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
    logo: <MariLogo size={36} />,
    logoHref: "/",
  },
};

export const WithRouter: Story = {
  name: "Router ile Kullanım (Next.js / React Router)",
  ...storyDoc(
    "Component router bağımsızdır. `onNavigate` verilince düz sol tık router'a devredilir, sayfa yenilenmez; " +
      "⌘/Ctrl/orta tık yine yeni sekmede açar. Her sayfada tekrar yazmamak için menüyü projenizde bir kez sarın.",
    `
// Next.js (App Router)
"use client";
import { useRouter } from "next/navigation";

export function AppMenu(props: BasicMenuProps) {
  const router = useRouter();
  return <BasicMenu {...props} onNavigate={(route) => router.push(route)} />;
}

// React Router
import { useNavigate } from "react-router";

export function AppMenu(props: BasicMenuProps) {
  const navigate = useNavigate();
  return <BasicMenu {...props} onNavigate={(route) => navigate(route)} />;
}

// Router yok (düz site): onNavigate vermeyin, linkler sayfayı yükler.
<BasicMenu data={data} logo={<Logo />} logoHref="/" />`
  ),
  args: { data: corporateData, logo: <MariLogo size={36} />, logoHref: "/" },
};

const linkTargetData: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/", icon: icon(HomeIcon) },
  { key: "docs", title: "Dokümantasyon", route: "https://docs.example.com", target: "_blank", icon: icon(BookOpenIcon) },
  { key: "blog", title: "Blog", route: "/blog", reloadDocument: true, icon: icon(NewspaperIcon) },
  {
    key: "support",
    title: "Destek",
    icon: icon(HeadphonesIcon),
    children: [
      { key: "faq", title: "SSS", route: "/destek/sss", icon: icon(InfoIcon), description: "Uygulama içi sayfa — router ile açılır." },
      { key: "status", title: "Sistem Durumu", route: "https://status.example.com", target: "_blank", icon: icon(ActivityIcon), description: "Ayrı bir sitede, yeni sekmede açılır." },
      { key: "mail", title: "E-posta Gönder", route: "mailto:destek@example.com", icon: icon(MailIcon), description: "Posta uygulamasını açar." },
    ],
  },
];

export const LinkTargets: Story = {
  name: "Link Hedefleri (target / reloadDocument)",
  ...storyDoc(
    "Öğe bazında davranış: `target: \"_blank\"` yeni sekmede açar (`rel=\"noopener noreferrer\"`, dış bağlantı ikonu ve " +
      "ekran okuyucuya \"yeni sekmede açılır\" otomatik); `_parent`, `_top` ve çerçeve adları da geçerlidir. " +
      "`reloadDocument: true` aynı sekmede ama router'ı atlayarak tam sayfa yükler (aynı domain'de ayrı bir site, " +
      "`/logout` gibi sunucu yönlendirmeleri). `https:`, `mailto:`, `tel:` adresleri kendiliğinden tarayıcıya bırakılır.",
    `
const data: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/" },                                   // router
  { key: "docs", title: "Dokümantasyon", route: "https://docs.example.com", target: "_blank" },
  { key: "blog", title: "Blog", route: "/blog", reloadDocument: true },             // tam sayfa
  {
    key: "support",
    title: "Destek",
    children: [
      { key: "faq", title: "SSS", route: "/destek/sss" },
      { key: "status", title: "Sistem Durumu", route: "https://status.example.com", target: "_blank" },
      { key: "mail", title: "E-posta Gönder", route: "mailto:destek@example.com" },
    ],
  },
];

<BasicMenu data={data} onNavigate={(route) => router.push(route)} />`
  ),
  args: { data: linkTargetData, logo: <MariLogo size={36} />, logoHref: "/" },
};

function BasicMenuSkeleton(args: React.ComponentProps<typeof BasicMenu>) {
  return <SkeletonDemo>{(skeleton) => <BasicMenu {...args} skeleton={skeleton} />}</SkeletonDemo>;
}

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` logo, öğeler ve `actions`ı kendi kutularında yer tutucuya çevirir (menü verisi ya da oturum " +
      "bilgisi sunucudan geliyorsa). Gerçek içerik görünmez olarak yerinde kaldığı için yüklenince çubuk zıplamaz; " +
      "çubuk `aria-busy` taşır.",
    `<BasicMenu data={data} logo={<MariLogo size={36} />} logoHref="/" actions={actions} skeleton={!ready} />`
  ),
  render: (args) => <BasicMenuSkeleton {...args} />,
  args: { ...RealWorldEcommerce.args },
};

