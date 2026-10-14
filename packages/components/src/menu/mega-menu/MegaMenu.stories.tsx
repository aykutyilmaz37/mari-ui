import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MariLogo } from "../../logo";
import { HeadphonesIcon, HomeIcon, LaptopIcon, ShirtIcon, ShoppingCartIcon, SmartphoneIcon, SofaIcon, TagIcon, UserIcon } from "lucide-react";
import { MegaMenu } from "./MegaMenu";
import type { MenuItemType } from "../types";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
import { SkeletonDemo } from "../../lib/SkeletonDemo";
import { Button } from "../../button";

const icon = (Icon: typeof HomeIcon) => <Icon size={16} />;

const meta: Meta<typeof MegaMenu> = {
  component: MegaMenu,
  title: "Navigasyon/MegaMenu",
  tags: ["autodocs"],
  // Faz 13.5 kullanıcı bulgusu (round 2): "BasicMenu için söylediklerim
  // MegaMenu için de geçerli" — playground küçüktü, gerçek bir mega panelin
  // nasıl davrandığını değerlendirmek zordu.
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "`BasicMenu`nun genişletilmiş hâli: `children`'ı olan öğeler tam genişlikte bir alt panel (mega menu) açar — " +
            "solda kategori rayı, sağda seçili kategorinin çok kolonlu grupları ve (varsa) promosyon kartları. Tüm öğeler " +
            "gerçek `<a href>`; sayfa yenilenmeden geçiş için `onNavigate`e router'ınızın gezinme fonksiyonunu verin " +
            "(Next: `router.push`, React Router: `navigate`). Öğe bazında `target`/`reloadDocument` router'ı atlar.",
          whenToUse: ["Gerçek bir e-ticaret kategori mega menüsü gerektiğinde: çok sayıda kategori, her birinin kendi alt gruplandırması ve isteğe bağlı görsel promosyonlar."],
          whenNotToUse: ["Birkaç düz alt sayfa için — `BasicMenu`nün tetikleyiciye sabit paneli yeterli."],
          a11y:
            "Öğeler `<nav aria-label=\"Ana menü\">` içinde bir liste. Çocuklu öğe bir açma düğmesi (`aria-expanded`, " +
            "`aria-controls` → panelin `region`ı): fareyle üzerine gelince açılır; **Enter/Boşluk/↓** açıp odağı panelin " +
            "ilk öğesine taşır (Tab ile gezerken panel kendiliğinden açılmaz). Panelde **↑/↓/Home/End** ve harf tuşlarıyla " +
            "gezilir, **Escape** kapatıp odağı tetikleyiciye döndürür; panelin sonundan **Tab** bir sonraki üst öğeye geçer. " +
            "Kapalı panel görünmezdir, linkleri Tab sırasına girmez. `currentPath` eşleşen öğe alt çizgiyle vurgulanır, " +
            "panel o kategoriyle açılır, link `aria-current=\"page\"` taşır. `mobileBreakpoint` altında hamburger + " +
            "kademeli `role=\"dialog\"` çekmece.",
        }),
      },
    },
  },
  argTypes: {
    mobileBreakpoint: { control: "select", options: ["md", "lg", "xl"], description: "Bu genişliğin altında öğeler gizlenir, hamburger + mobil çekmece gelir. Varsayılan `lg` (1024px)." },
    menuItemJustify: { control: "select", options: ["left", "center", "right"], description: "Menü öğelerinin yatay hizalanması." },
    menuPosition: { control: "select", options: ["default", "sticky", "fixed"], description: "Menünün sayfa kaydırmasına göre konumlanma davranışı." },
    actions: { control: false, description: "Sağ tarafta gösterilecek keyfi içerik (örn. \"Giriş Yap\" düğmesi, sepet ikonu)." },
    currentPath: { control: "text", description: "Aktif sayfa — eşleşen üst öğe vurgulanır, panel o kategoriyle açılır." },
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

type Story = StoryObj<typeof MegaMenu>;

/**
 * Faz 13.5 kullanıcı bulgusu (round 2): "Sola Yaslı"/"Sağa Yaslı" gibi soyut
 * hizalama demoları yerine gerçek dummy veriyle gerçek kullanım örnekleri.
 *
 * 2026-09-22: gerçek Trendyol tarzı 3 seviyeli veri — üst öğe (Elektronik) →
 * ray öğesi (Bilgisayarlar) → kolon grubu (Laptop/Bilgisayar Parçaları) →
 * leaf (marka). "Bilgisayarlar" ray öğesi ayrıca `promoTiles` taşıyor.
 */
const leaves = (prefix: string, titles: string[]) => titles.map((t) => ({ key: `${prefix}-${t}`, title: t, route: `/c/${prefix}/${t.toLowerCase()}` }));

const ecommerceData: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/", icon: icon(HomeIcon) },
  {
    key: "electronics",
    title: "Elektronik",
    icon: icon(SmartphoneIcon),
    children: [
      {
        key: "computers",
        title: "Bilgisayar / Tablet",
        route: "/c/bilgisayar",
        icon: icon(LaptopIcon),
        children: [
          { key: "laptop", title: "Laptop", route: "/c/laptop", children: leaves("laptop", ["Lenovo", "Asus", "MSI", "Macbook", "HP", "Casper", "Acer", "Huawei", "Monster", "Dell"]) },
          { key: "tablet", title: "Tablet", route: "/c/tablet", children: leaves("tablet", ["iPad", "Samsung", "Lenovo", "Huawei", "Tablet Klavyeleri", "Xiaomi"]) },
          { key: "desktop", title: "Masaüstü Bilgisayar", route: "/c/masaustu", children: leaves("desktop", ["All-in-One", "Macbook Mini", "Mini PC"]) },
          { key: "parts", title: "Bilgisayar Parçaları", route: "/c/parca", children: leaves("parts", ["Anakart", "Ekran Kartları", "Bellek (RAM)", "İşlemciler", "Disk", "Kasa", "SSD"]) },
          { key: "peripherals", title: "Çevre Birimleri", route: "/c/cevre", children: leaves("per", ["Klavye & Mouse Set", "Mouse", "Klavye", "Yazıcı", "Sanal Gerçeklik Gözlüğü"]) },
          { key: "monitor", title: "Monitör", route: "/c/monitor", children: leaves("mon", ["OLED", "Kavisli", "27 inç", "24 inç", "4K", "Asus", "Dell"]) },
        ],
        promoTiles: [
          { title: "Monitörler", image: "https://picsum.photos/seed/monitor/320/320", span: "sm" },
          { title: "Klavye & Mouse", image: "https://picsum.photos/seed/keyboard/320/320", span: "sm" },
          { title: "Ekran Kartları", image: "https://picsum.photos/seed/gpu/320/320", span: "sm" },
          { title: "Sony PlayStation 5", image: "https://picsum.photos/seed/ps5/320/320", span: "sm" },
          { title: "Yapay Zeka Destekli RTX Laptoplar", image: "https://picsum.photos/seed/rtx/640/280", span: "wide" },
        ],
      },
      {
        key: "phones",
        title: "Telefon & Aksesuar",
        route: "/c/telefon",
        icon: icon(SmartphoneIcon),
        children: [
          { key: "phone", title: "Cep Telefonu", route: "/c/cep-telefonu", children: leaves("phone", ["iPhone", "Samsung", "Xiaomi", "Honor", "Oppo", "Reeder", "Tecno"]) },
          { key: "phone-acc", title: "Telefon Aksesuarları", route: "/c/telefon-aksesuar", children: leaves("pacc", ["Kılıf", "Ekran Koruyucu", "Şarj Cihazı", "Powerbank", "Araç İçi Tutucu"]) },
        ],
        promoTiles: [{ title: "Haftanın Telefonları", image: "https://picsum.photos/seed/phones/640/280", span: "wide" }],
      },
      {
        key: "audio",
        title: "TV, Görüntü & Ses",
        route: "/c/tv-ses",
        icon: icon(HeadphonesIcon),
        children: [
          { key: "tv", title: "Televizyon", route: "/c/tv", children: leaves("tv", ["OLED TV", "QLED TV", "4K TV", "Samsung", "LG", "Philips"]) },
          { key: "headphone", title: "Kulaklık", route: "/c/kulaklik", children: leaves("hp", ["Bluetooth Kulaklık", "Kulak Üstü", "Steelseries", "JBL", "Sony", "Apple", "Anker"]) },
        ],
      },
      { key: "appliance", title: "Beyaz Eşya", route: "/c/beyaz-esya", icon: icon(SofaIcon), children: [{ key: "fridge", title: "Buzdolabı", route: "/c/buzdolabi", children: leaves("fr", ["No-Frost", "Gardırop Tipi", "Mini Buzdolabı"]) }] },
    ],
  },
  {
    key: "fashion",
    title: "Moda",
    icon: icon(ShirtIcon),
    children: [
      {
        key: "women",
        title: "Kadın",
        route: "/c/kadin",
        icon: icon(ShirtIcon),
        children: [
          { key: "w-clothing", title: "Giyim", route: "/c/kadin-giyim", children: leaves("wc", ["Elbise", "Tişört", "Gömlek", "Kot Pantolon", "Kot Ceket", "Etek", "Bluz", "Ceket"]) },
          { key: "w-shoes", title: "Ayakkabı", route: "/c/kadin-ayakkabi", children: leaves("ws", ["Topuklu Ayakkabı", "Sneaker", "Günlük Ayakkabı", "Babet", "Sandalet"]) },
          { key: "w-bag", title: "Çanta", route: "/c/kadin-canta", children: leaves("wb", ["Omuz Çantası", "Sırt Çantası", "El Çantası"]) },
          { key: "w-acc", title: "Aksesuar", route: "/c/kadin-aksesuar", children: leaves("wa", ["Saat", "Takı", "Cüzdan", "Atkı"]) },
          { key: "w-cosmetic", title: "Kozmetik", route: "/c/kozmetik", children: leaves("wcos", ["Parfüm", "Göz Makyajı", "Cilt Bakım", "Saç Bakımı", "Makyaj"]) },
        ],
      },
      {
        key: "men",
        title: "Erkek",
        route: "/c/erkek",
        icon: icon(UserIcon),
        children: [
          { key: "m-clothing", title: "Giyim", route: "/c/erkek-giyim", children: leaves("mc", ["Tişört", "Gömlek", "Pantolon", "Kot Pantolon", "Mont", "Sweatshirt"]) },
          { key: "m-shoes", title: "Ayakkabı", route: "/c/erkek-ayakkabi", children: leaves("ms", ["Sneaker", "Klasik Ayakkabı", "Bot", "Terlik"]) },
        ],
      },
    ],
  },
  { key: "campaigns", title: "Kampanyalar", route: "/campaigns", icon: icon(TagIcon) },
];

export const RealWorldEcommerce: Story = {
  name: "Gerçek Kullanım (E-Ticaret)",
  ...storyDoc(
    "Gerçek bir e-ticaret mega menüsü: logo sabit solda, ikonlu üst öğeler, \"Elektronik\"/\"Giyim\" üzerine gelince " +
      "sol tarafta kategori rayı + sağda çok kolonlu gruplar açılır. \"Bilgisayarlar\" ray öğesinin ayrıca " +
      "promosyon kartları var (span'lı ızgara) — diğer ray öğelerinde promosyon yok, panel otomatik daralır."
  ),
  args: {
    data: ecommerceData,
    menuItemJustify: "left",
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
  name: "Mobil (Kademeli Çekmece)",
  ...storyDoc(
    "`mobileBreakpoint` (varsayılan `lg`, 1024px) altında hover'a dayalı mega panel dokunmatikte kullanılamaz — yerine " +
      "hamburger + kademeli (drill-down) çekmece gelir: Elektronik → Bilgisayar / Tablet → Laptop → marka. Her alt seviyede " +
      "geri düğmesi, seviye başlığı ve (üst öğenin route'u varsa) \"Tümünü gör\"; ray öğesinin `promoTiles`'ı listenin altında. " +
      "Bu story mobil viewport'ta açılır."
  ),
  parameters: { viewport: { defaultViewport: "mobile2" } },
  args: RealWorldEcommerce.args,
};

export const EcommerceNoPromo: Story = {
  name: "Promosyonsuz",
  ...storyDoc("Hiçbir ray öğesinde `promoTiles` yoksa panel sadece ray + kolonlardan oluşur — promosyon alanı hiç render edilmez, kolonlar boşalan genişliği kullanır."),
  args: {
    data: ecommerceData.map((item) => ({
      ...item,
      children: item.children?.map((child) => ({ ...child, promoTiles: undefined })),
    })),
    menuItemJustify: "left",
    logo: <MariLogo size={36} />,
    logoHref: "/",
  },
};

export const StickyPosition: Story = {
  name: "Yapışkan (Sticky) Konum",
  ...storyDoc(
    "Sayfa kaydırılırken üstte yapışık kalır — aşağı kaydırın. Panel body'ye portal edilir ve çubuğun gerçek " +
      "konumunu izler; kaydırılan kapsayıcı onu kırpmaz.",
    `
<MegaMenu data={data} menuPosition="sticky" logo={<MariLogo size={36} />} logoHref="/" />
<main className="p-6">Sayfa içeriği — menü kaydırırken üstte kalır.</main>`
  ),
  render: (args) => (
    <div className="h-96 overflow-y-auto">
      <MegaMenu {...args} />
      <div className="h-[150vh] p-8 text-mari-muted">Sayfa içeriği — menü kaydırırken üstte yapışık kalmalı.</div>
    </div>
  ),
  args: {
    data: ecommerceData,
    menuItemJustify: "left",
    menuPosition: "sticky",
    logo: <MariLogo size={36} />,
    logoHref: "/",
  },
};

/** "Elektronik > Ses & Görüntü > Kulaklık > JBL" — ray'ın ilk öğesi DEĞİL, ön seçim görülebilsin diye. */
const ACTIVE_PATH = "/c/hp/jbl";

export const ActiveFromCurrentPath: Story = {
  name: "Mevcut Yoldan Aktif Öğe",
  ...storyDoc(
    "`currentPath` bir panel linkiyle eşleşirse üst öğe alt çizgiyle vurgulanır; panel açılınca ray o kategoriyle " +
      "gelir ve link vurgulu + `aria-current=\"page\"` olur — kullanıcı nerede olduğunu panelde de görür.",
    `<MegaMenu data={data} currentPath={pathname} onNavigate={(route) => router.push(route)} />`
  ),
  args: { ...RealWorldEcommerce.args, currentPath: ACTIVE_PATH },
};

function MegaMenuSkeleton(args: React.ComponentProps<typeof MegaMenu>) {
  return <SkeletonDemo>{(skeleton) => <MegaMenu {...args} skeleton={skeleton} />}</SkeletonDemo>;
}

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` logo, öğeler ve `actions`ı kendi kutularında yer tutucuya çevirir (kategori ağacı sunucudan " +
      "geliyorsa); yüklenince çubuk zıplamaz, iskeletteyken panel açılmaz.",
    `<MegaMenu data={categories ?? []} logo={<MariLogo size={36} />} logoHref="/" actions={actions} skeleton={!categories} />`
  ),
  render: (args) => <MegaMenuSkeleton {...args} />,
  args: { ...RealWorldEcommerce.args },
};

