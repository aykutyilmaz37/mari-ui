import type { Meta, StoryObj } from "@storybook/react";
import { HeadphonesIcon, HomeIcon, LaptopIcon, ShirtIcon, ShoppingCartIcon, SmartphoneIcon, TagIcon, UserIcon } from "lucide-react";
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
            "bir alt panel (mega menu) açar; her alt öğe için bir `description` gösterebilir. `onNavigate` " +
            "verilmezse `window.location.href` ile tam sayfa geçiş yapar.",
          whenToUse: ["Alt öğe sayısı fazla ve her biri için kısa bir açıklama göstermek faydalıysa (basit bir dropdown yetersiz kalıyorsa)."],
          a11y:
            "Her üst öğe gerçek bir `<button>` (Button component'i) — BasicMenu'yle AYNI görsel dil: hover/aktifte " +
            "sadece metin/alt çizgi rengi değişir (rezerve edilmiş `border-b-2`, jitter yok), primary renk arka " +
            "plan olarak KULLANILMAZ. Alt panel üst öğe düğmesi klavyeyle odaklanınca (`onFocus`) da açılır, odak " +
            "ayrılınca (`onBlur`) kapanır. Panel açıkken **Escape** kapatır. Panel içeriği keyfi `Card`lardan " +
            "oluştuğundan (gerçek `menuitem`ler değil) sarmalayıcılara `role=\"menuitem\"`/`role=\"menu\"` UYGULANMAZ.",
        }),
      },
    },
  },
  argTypes: {
    menuItemPosition: { control: "select", options: ["left", "center", "right"], description: "Menü öğelerinin yatay hizalanması." },
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
 * Hem üst öğelerde hem panel kartlarında ikon var.
 */
const ecommerceData: MenuItemType[] = [
  { key: "home", title: "Ana Sayfa", route: "/", icon: icon(HomeIcon) },
  {
    key: "electronics",
    title: "Elektronik",
    icon: icon(SmartphoneIcon),
    children: [
      { key: "phones", title: "Telefonlar", route: "/electronics/phones", description: "Akıllı telefon ve aksesuarları.", icon: icon(SmartphoneIcon) },
      { key: "laptops", title: "Bilgisayarlar", route: "/electronics/laptops", description: "Dizüstü ve masaüstü bilgisayarlar.", icon: icon(LaptopIcon) },
      { key: "audio", title: "Ses Sistemleri", route: "/electronics/audio", description: "Kulaklık, hoparlör ve daha fazlası.", icon: icon(HeadphonesIcon) },
    ],
  },
  {
    key: "clothing",
    title: "Giyim",
    icon: icon(ShirtIcon),
    children: [
      { key: "women", title: "Kadın", route: "/clothing/women", description: "Kadın giyim koleksiyonu.", icon: icon(ShirtIcon) },
      { key: "men", title: "Erkek", route: "/clothing/men", description: "Erkek giyim koleksiyonu.", icon: icon(UserIcon) },
    ],
  },
  { key: "campaigns", title: "Kampanyalar", route: "/campaigns", icon: icon(TagIcon) },
];

export const RealWorldEcommerce: Story = {
  name: "Gerçek Kullanım (E-Ticaret)",
  ...storyDoc(
    "Gerçek bir e-ticaret mega menüsü: logo sabit solda, ikonlu üst öğeler, \"Elektronik\"/\"Giyim\" üzerine " +
      "gelince ikonlu + açıklamalı kategori panelleri açılır, \"Giriş Yap\" + sepet `actions` ile sabit sağda durur."
  ),
  args: {
    data: ecommerceData,
    menuItemPosition: "left",
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
    menuItemPosition: "left",
    menuPosition: "sticky",
    logo: <span className="text-lg font-bold text-mari-primary">Mari</span>,
  },
};
