import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MariLogo } from "../../logo";
import { BarChart3Icon, LayoutDashboardIcon, LifeBuoyIcon, MenuIcon, PackageIcon, ReceiptIcon, SettingsIcon, ShoppingCartIcon, UserIcon, UsersIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { MenuItemType } from "../types";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
import { SkeletonDemo } from "../../lib/SkeletonDemo";
import { Button } from "../../button";

/**
 * Kullanıcı bulgusu (2026-09-25): "saçma sapan ikonlar kullanma". Eski demo
 * verisi ikonları rastgele dağıtıyordu (Ürünler = veritabanı, Tasarım = zarf,
 * Giyim/Kategoriler = dişli). Kural artık: ikon YALNIZCA anlamını taşıyorsa
 * — kök seviyedeki gezinme öğelerinde, bir yönetim panelinde herkesin
 * tanıdığı karşılıklarıyla. Alt öğeler ve Amazon tarzı çekmece ikonsuz;
 * ikonsuz kök öğe daraltılmış rayda baş harfiyle görünür, uydurma ikonla değil.
 */
const icon = (Icon: typeof LayoutDashboardIcon) => <Icon />;

const adminData: MenuItemType[] = [
  { key: "dashboard", title: "Genel Bakış", route: "/dashboard", icon: icon(LayoutDashboardIcon) },
  {
    key: "orders",
    title: "Siparişler",
    icon: icon(ShoppingCartIcon),
    children: [
      { key: "all-orders", title: "Tüm Siparişler", route: "/orders", description: "Bekleyen, hazırlanan ve teslim edilen siparişler." },
      { key: "returns", title: "İadeler", route: "/orders/returns", description: "İade talepleri ve geri ödemeler." },
      { key: "shipping", title: "Kargo Takibi", route: "/orders/shipping", description: "Gönderilerin anlık durumu." },
    ],
  },
  {
    key: "products",
    title: "Ürünler",
    icon: icon(PackageIcon),
    children: [
      { key: "product-list", title: "Ürün Listesi", route: "/products", description: "Tüm ürünler, fiyatlar ve varyantlar." },
      { key: "categories", title: "Kategoriler", route: "/products/categories", description: "Kategori ağacı ve sıralama." },
      {
        key: "stock",
        title: "Stok",
        children: [
          { key: "stock-status", title: "Stok Durumu", route: "/products/stock" },
          { key: "warehouses", title: "Depolar", route: "/products/warehouses" },
          { key: "transfers", title: "Transferler", route: "/products/transfers" },
        ],
      },
    ],
  },
  { key: "customers", title: "Müşteriler", route: "/customers", icon: icon(UsersIcon) },
  { key: "reports", title: "Raporlar", route: "/reports", icon: icon(BarChart3Icon) },
  { key: "section-system", title: "Sistem", heading: true },
  { key: "settings", title: "Ayarlar", route: "/settings", icon: icon(SettingsIcon) },
  { key: "help", title: "Yardım", route: "/help", icon: icon(LifeBuoyIcon) },
];

const disabledData: MenuItemType[] = [...adminData, { key: "billing", title: "Faturalama", route: "/billing", icon: icon(ReceiptIcon), disabled: true }];

/** Mega paneli için gerçek 3 seviye: kök → grup → bağlantılar. */
const megaData: MenuItemType[] = [
  { key: "dashboard", title: "Genel Bakış", route: "/dashboard", icon: icon(LayoutDashboardIcon) },
  {
    key: "products",
    title: "Ürünler",
    icon: icon(PackageIcon),
    children: [
      {
        key: "catalog",
        title: "Katalog",
        route: "/products",
        children: [
          { key: "product-list", title: "Ürün Listesi", route: "/products" },
          { key: "categories", title: "Kategoriler", route: "/products/categories" },
          { key: "brands", title: "Markalar", route: "/products/brands" },
          { key: "attributes", title: "Özellikler", route: "/products/attributes" },
        ],
      },
      {
        key: "inventory",
        title: "Envanter",
        route: "/inventory",
        children: [
          { key: "stock-status", title: "Stok Durumu", route: "/inventory/stock" },
          { key: "warehouses", title: "Depolar", route: "/inventory/warehouses" },
          { key: "transfers", title: "Transferler", route: "/inventory/transfers" },
        ],
      },
      {
        key: "pricing",
        title: "Fiyatlandırma",
        route: "/pricing",
        children: [
          { key: "price-lists", title: "Fiyat Listeleri", route: "/pricing/lists" },
          { key: "campaigns", title: "Kampanyalar", route: "/pricing/campaigns" },
          { key: "coupons", title: "Kuponlar", route: "/pricing/coupons" },
        ],
      },
    ],
  },
  adminData[1] as MenuItemType,
  { key: "customers", title: "Müşteriler", route: "/customers", icon: icon(UsersIcon) },
  { key: "reports", title: "Raporlar", route: "/reports", icon: icon(BarChart3Icon) },
];

/**
 * Amazon'un hamburger menüsünün YAPISI: bölüm başlıkları, ikonsuz satırlar,
 * alt kategorisi olan satırda chevron ve kademeli (drill-down) geçiş,
 * altta "Yardım ve Ayarlar". Görünüm kendi token'larımızdan.
 */
const amazonData: MenuItemType[] = [
  { key: "h-trends", title: "Trendler", heading: true },
  { key: "best-sellers", title: "Çok Satanlar", route: "/best-sellers" },
  { key: "new-releases", title: "Yeni Çıkanlar", route: "/new-releases" },
  { key: "movers", title: "Yükselenler", route: "/movers-and-shakers" },
  { key: "h-digital", title: "Dijital İçerik ve Cihazlar", heading: true },
  {
    key: "kindle",
    title: "Kindle E-Okuyucular ve E-Kitaplar",
    route: "/kindle",
    children: [
      { key: "h-kindle-devices", title: "Kindle E-Okuyucular", heading: true },
      { key: "kindle-all", title: "Tüm Kindle E-Okuyucular", route: "/kindle/devices" },
      { key: "kindle-acc", title: "Kindle Aksesuarları", route: "/kindle/accessories" },
      { key: "h-kindle-books", title: "Kindle Mağazası", heading: true },
      { key: "ebooks", title: "Kindle E-Kitaplar", route: "/kindle/ebooks" },
      { key: "unlimited", title: "Kindle Unlimited", route: "/kindle/unlimited" },
    ],
  },
  { key: "prime-video", title: "Prime Video", route: "/prime-video" },
  { key: "music", title: "Amazon Music", route: "/music" },
  { key: "h-categories", title: "Kategoriye Göre Alışveriş Yap", heading: true },
  {
    key: "electronics",
    title: "Elektronik",
    route: "/electronics",
    children: [
      {
        key: "computers",
        title: "Bilgisayarlar",
        route: "/electronics/computers",
        children: [
          { key: "laptops", title: "Dizüstü Bilgisayarlar", route: "/electronics/computers/laptops" },
          { key: "monitors", title: "Monitörler", route: "/electronics/computers/monitors" },
          { key: "components", title: "Bilgisayar Bileşenleri", route: "/electronics/computers/components" },
        ],
      },
      { key: "phones", title: "Cep Telefonları", route: "/electronics/phones" },
      { key: "tv", title: "Televizyonlar", route: "/electronics/tv" },
      { key: "headphones", title: "Kulaklıklar", route: "/electronics/headphones" },
    ],
  },
  {
    key: "home",
    title: "Ev ve Mutfak",
    route: "/home",
    children: [
      { key: "kitchen", title: "Mutfak Gereçleri", route: "/home/kitchen" },
      { key: "furniture", title: "Mobilya", route: "/home/furniture" },
      { key: "decor", title: "Ev Dekorasyonu", route: "/home/decor" },
    ],
  },
  {
    key: "fashion",
    title: "Moda",
    route: "/fashion",
    children: [
      { key: "women", title: "Kadın", route: "/fashion/women" },
      { key: "men", title: "Erkek", route: "/fashion/men" },
      { key: "kids", title: "Çocuk", route: "/fashion/kids" },
    ],
  },
  { key: "h-help", title: "Yardım ve Ayarlar", heading: true },
  { key: "account", title: "Hesabınız", route: "/account" },
  { key: "my-orders", title: "Siparişleriniz", route: "/orders" },
  { key: "support", title: "Müşteri Hizmetleri", route: "/help" },
  { key: "sign-out", title: "Çıkış Yap", route: "/sign-out" },
];

const brandLogo = <MariLogo size={36} />;

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
            "Dikey gezinme menüsü. `variant=\"hover\"`: 64px ikon rayı, üzerine gelince (kısa bir gecikmeyle) ya da klavyeyle " +
            "odaklanınca 256px'e genişler ve içeriğin üstüne biner. `variant=\"click\"`: kenardaki sekmeyle açılıp kapanır. " +
            "`variant=\"drawer\"`: Amazon'un hamburger menüsü gibi kenardan kayan, kademeli (drill-down) bir çekmece — " +
            "`open`/`onOpenChange` ile kontrol edilir, tetikleyiciyi tüketici koyar. Alt öğeler varsayılanda girintili bir " +
            "akordeonla, `dropdown` ile satırın yanında açılan panelde (BasicMenu'nün alt menü paneli), `mega` ile " +
            "sidebar'ın yanında tam yükseklikte bir panelde açılır. `onlyIcon` her zaman ray olarak kalır; alt menüler " +
            "rayın yanında açılır. İkon yalnızca anlamını taşıyorsa verilmeli — ikonsuz kök öğe rayda baş harfiyle görünür.",
          a11y:
            "Yaprak satırlar gerçek link (orta tık / yeni sekme çalışır; `target`/`reloadDocument` desteklenir), aktif sayfa " +
            "`aria-current=\"page\"`; alt öğesi olan satır `aria-expanded` taşıyan bir düğme. Satırlar arasında **↑/↓/Home/End** " +
            "ve harf tuşlarıyla gezilir; kapalı akordeonun satırları atlanır. Hover rayı klavye odağıyla da genişler. `mega` " +
            "modunda panel odakla açılmaz: fareyle üzerine gelince ya da **Enter/Boşluk/→** ile açılır ve odak panele geçer; " +
            "panelde ok tuşları, **Escape** kapatıp satıra döndürür, dışarı tıklama kapatır. Logo `logoHref` ile \"Ana sayfa\" " +
            "adlı bir link. `drawer` bir `role=\"dialog\"`: odak içeride döner, Escape/scrim kapatır, odak tetikleyiciye döner.",
        }),
      },
    },
  },
  argTypes: {
    variant: { control: { type: "radio" }, options: ["hover", "click", "drawer"], description: "Genişleme davranışı." },
    position: { control: { type: "radio" }, options: ["left", "right"], description: "Sidebar'ın ekrandaki kenarı." },
    onlyIcon: { control: { type: "boolean" }, description: "Her zaman ikon rayı olarak kalır." },
    dropdown: { control: { type: "boolean" }, description: "Alt öğeleri akordeon yerine satırın yanındaki panelde açar." },
    mega: { control: { type: "boolean" }, description: "Alt öğeleri sidebar'ın yanında tam yükseklikte bir panelde açar." },
    logoHref: { control: "text", description: "Logoyu bu adrese giden bir link yapar (genelde `/`)." },
    logoLabel: { control: "text", description: "Etkileşimli logonun erişilebilir adı.", table: { defaultValue: { summary: '"Ana sayfa"' } } },
    skeleton: { control: "boolean", description: "Logo, başlık ve satırlar yer tutucu.", table: { defaultValue: { summary: "false" } } },
    currentPath: { control: "text", description: "Aktif sayfa — eşleşen satır vurgulanır, grubu açık başlar." },
  },
  args: {
    data: adminData,
    onNavigate: () => {},
    logoHref: "/",
  },
  decorators: [
    (Story) => (
      <div className="relative h-[36rem]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const RealWorldAdmin: Story = {
  name: "Gerçek Kullanım (Yönetim Paneli)",
  ...storyDoc(
    "Hover rayı: 64px'te sadece ikonlar, üzerine gelince genişler. `currentPath` ile aktif sayfa (\"Ürünler\" > \"Ürün " +
      "Listesi\") başlangıçta vurgulu ve grubu açık; \"Sistem\" bir bölüm başlığı (rayda ince bir ayraç)."
  ),
  args: { variant: "hover", currentPath: "/products", logo: brandLogo },
};

export const HoverRight: Story = {
  name: "Hover / Sağ",
  ...storyDoc("Sağ kenara sabitlenmiş hover rayı — akordeon girintisi ve kılavuz çizgisi de sağa döner."),
  args: { variant: "hover", position: "right", logo: brandLogo },
};

export const HoverDropdown: Story = {
  name: "Hover / Dropdown",
  ...storyDoc(
    "Alt öğeler satırın TAM yanında, BasicMenu'nün alt menü paneliyle açılır (açıklamalı satırlar; \"Stok\" gibi iç " +
      "içe öğe kendi flyout'uyla)."
  ),
  args: { variant: "hover", dropdown: true, logo: brandLogo },
};

export const HoverMega: Story = {
  name: "Hover / Mega",
  ...storyDoc(
    "\"Ürünler\" gerçek 3 seviye → sidebar'ın yanında tam yükseklikte bir panel: gruplar kolonlara akar. \"Siparişler\" " +
      "düz veri → aynı panel açıklamalı satırlarla. Satırdan panele geçerken panel kapanmaz (hover-intent)."
  ),
  args: { variant: "hover", mega: true, data: megaData, logo: brandLogo },
};

export const OnlyIconRail: Story = {
  name: "Sadece İkon Rayı",
  ...storyDoc(
    "`onlyIcon`: ray hiç genişlemez; alt menüsü olan öğeler rayın yanında panel açar (akordeon rayda anlamsız olurdu). " +
      "Etiket, üzerine gelince `title` ipucu olarak görünür."
  ),
  args: { onlyIcon: true, logo: <MariLogo variant="mark" size={40} /> },
};

export const ClickLeft: Story = {
  name: "Tık / Sol",
  ...storyDoc("Kenardaki panel ikonuyla açılır/kapanır; kapalıyken ekranda sadece bu sekme kalır."),
  args: { variant: "click", logo: brandLogo },
};

export const ClickRight: Story = {
  name: "Tık / Sağ",
  ...storyDoc("Tık ile açılma, sağ kenara sabitlenmiş hâli."),
  args: { variant: "click", position: "right", logo: brandLogo },
};

export const WithDisabledItems: Story = {
  name: "Devre Dışı Öğeler",
  ...storyDoc("Devre dışı bir öğe tıklanamaz ve soluk görünür."),
  args: { data: disabledData, variant: "hover", logo: brandLogo },
};

export const WithoutIcons: Story = {
  name: "İkonsuz Öğeler",
  ...storyDoc(
    "Anlamlı bir ikonu olmayan öğelere ikon uydurmak gerekmez: daraltılmış rayda baş harfleriyle görünürler, " +
      "genişleyince normal satırlardır."
  ),
  args: { data: adminData.map(({ icon: _icon, ...item }) => item), variant: "hover", logo: brandLogo },
};

export const AmazonDrawer: Story = {
  name: "Çekmece (Amazon Tarzı)",
  ...storyDoc(
    "`variant=\"drawer\"`: Amazon'un hamburger menüsünün yapısı. Üstte `header` ile rol renginde bir \"Merhaba\" bandı; " +
      "bölümler ayraçlarla ayrılır (`heading: true`); satırlar ikonsuz; alt kategorisi olan satır chevron taşır ve bir " +
      "seviye içeri kayar (\"Ana Menü\"ye dönüş, üst öğenin route'u varsa \"Tümünü gör\"). Tetikleyici tüketiciye ait.",
    `
const [open, setOpen] = useState(false);

<Button variant="ghost" color="neutral" icon={<MenuIcon size={18} />} onClick={() => setOpen(true)}>
  Tümü
</Button>
<Sidebar
  variant="drawer"
  data={data}
  open={open}
  onOpenChange={setOpen}
  header={<span className="text-base font-semibold">Merhaba, aykut</span>}
  onNavigate={(route) => router.push(route)}
/>`
  ),
  render: function AmazonDrawerRender(args) {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-4">
        <Button variant="ghost" color="neutral" icon={<MenuIcon size={18} />} onClick={() => setOpen(true)}>
          Tümü
        </Button>
        <Sidebar {...args} open={open} onOpenChange={setOpen} />
      </div>
    );
  },
  args: {
    variant: "drawer",
    data: amazonData,
    logoHref: undefined,
    header: (
      <div className="flex items-center gap-3 py-3">
        {/* Bandın dolgusu rol rengi: siluet `currentColor` ile bandın kontrast rengini alır (Avatar'ın kendi zemini burada kayboluyordu). */}
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full border-2 border-current">
          <UserIcon size={18} />
        </span>
        <span className="text-base font-semibold">Merhaba, aykut</span>
      </div>
    ),
  },
};

function SidebarSkeleton(args: React.ComponentProps<typeof Sidebar>) {
  // Sidebar sabit konumlu (sol kenar); geçiş altında kalmasın diye sağ üstte.
  return (
    <div className="flex justify-end p-4">
      <SkeletonDemo>{(skeleton) => <Sidebar {...args} skeleton={skeleton} />}</SkeletonDemo>
    </div>
  );
}

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` logo, başlık ve her satırı kendi kutusunda ikon karesi + metin çubuğu olarak çizer (menü yetkiye göre " +
      "sunucudan geliyorsa); gruplar yüklü hâldeki gibi açık kalır, yüklenince satırlar zıplamaz. `nav` `aria-busy` taşır.",
    `<Sidebar variant="hover" data={menu ?? placeholderRows} logo={<MariLogo />} logoHref="/" skeleton={!menu} />`
  ),
  render: (args) => <SidebarSkeleton {...args} />,
  args: { variant: "hover", logo: brandLogo, currentPath: "/products" },
};
