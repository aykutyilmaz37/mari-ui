import type { Meta, StoryObj } from "@storybook/react";
import { HeadphonesIcon, HomeIcon, LaptopIcon, ShirtIcon, ShoppingCartIcon, SmartphoneIcon, SofaIcon, TagIcon, UserIcon } from "lucide-react";
import { MegaMenu } from "./MegaMenu";
import type { MenuItemType } from "../types";
import { componentDoc, storyDoc } from "../../lib/storyMeta";
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
            "`BasicMenu`nun genişletilmiş hâli: `children`'ı olan öğeler üzerine gelindiğinde (hover) tam genişlikte " +
            "bir alt panel (mega menu) açar — sol tarafta kategori rayı, sağda seçili kategorinin çok kolonlu grupları " +
            "ve (varsa) promosyon kartları (bkz. `MegaPanel`, `menu/_shared`). `onNavigate` verilmezse `window.location.href` " +
            "ile tam sayfa geçiş yapar.",
          whenToUse: ["Gerçek bir e-ticaret kategori mega menüsü gerektiğinde: çok sayıda kategori, her birinin kendi alt gruplandırması ve isteğe bağlı görsel promosyonlar."],
          a11y:
            "Her üst öğe gerçek bir `<button>` (Button component'i) — BasicMenu'yle AYNI görsel dil: hover/aktifte " +
            "sadece metin/alt çizgi rengi değişir (rezerve edilmiş `border-b-2`, jitter yok), primary renk arka " +
            "plan olarak KULLANILMAZ. Alt panel üst öğe düğmesi klavyeyle odaklanınca (`onFocus`) da açılır, odak " +
            "ayrılınca (`onBlur`) kapanır. Panel açıkken **Escape** kapatır. Panel içeriği (ray/kolon/promosyon " +
            "satırları) gerçek `menuitem`ler değil, bu yüzden sarmalayıcılara `role=\"menuitem\"`/`role=\"menu\"` UYGULANMAZ " +
            "(kod tabanının geri kalanıyla aynı, belgelenmiş karar). `mobileBreakpoint` altında hover'a dayalı panel yerine " +
            "hamburger + kademeli (drill-down) bir `role=\"dialog\"` çekmece gelir: odak içeri taşınır ve içinde döner, " +
            "seviye değişince odak geri düğmesine / girilen satıra geçer, Escape/scrim kapatır.",
        }),
      },
    },
  },
  argTypes: {
    mobileBreakpoint: { control: "select", options: ["md", "lg", "xl"], description: "Bu genişliğin altında öğeler gizlenir, hamburger + mobil çekmece gelir. Varsayılan `lg` (1024px)." },
    menuItemJustify: { control: "select", options: ["left", "center", "right"], description: "Menü öğelerinin yatay hizalanması." },
    menuPosition: { control: "select", options: ["default", "sticky", "fixed"], description: "Menünün sayfa kaydırmasına göre konumlanma davranışı." },
    actions: { control: false, description: "Sağ tarafta gösterilecek keyfi içerik (örn. \"Giriş Yap\" düğmesi, sepet ikonu)." },
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
    logo: <span className="text-lg font-bold text-mari-primary">Mari</span>,
  },
};

export const StickyPosition: Story = {
  name: "Yapışkan (Sticky) Konum",
  ...storyDoc("Sayfa kaydırılırken üstte yapışık kalır — aşağı kaydırın."),
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
    logo: <span className="text-lg font-bold text-mari-primary">Mari</span>,
  },
};
