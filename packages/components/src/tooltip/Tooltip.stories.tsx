import type { Meta, StoryObj } from "@storybook/react";
import { Bold, Info, Italic, Underline } from "lucide-react";
import { Button } from "../button";
import { colorArgType, placementArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Veri Gösterimi/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "Bir elemanın üzerine gelindiğinde veya odaklanıldığında kısa bir açıklama gösteren balon.",
          whenToUse: ["Bir ikon-only butonun/kontrolün ne işe yaradığını kısaca açıklamak için."],
          whenNotToUse: ["Kritik bilgi taşıyorsa — tooltip'ler dokunmatik cihazlarda güvenilir açılmaz, önemli bilgiyi görünür metinde tutun."],
          a11y:
            "Fare (`hover`) kadar klavye/odak (`focus`) ile de açılır; balon `role=\"tooltip\"` taşır ve trigger'a " +
            "`aria-describedby` ile bağlanır; görünürken `Escape` kapatır. **Not:** eskiden her trigger `<Button>` " +
            "içine sarılıyordu — bir ikon/link'e tooltip eklendiğinde iç içe buton render ediliyordu (gerçek bir " +
            "a11y/DOM bug'ıydı). Artık trigger düz bir `<span>` içinde; kendi bir buton/link ise davranışı korunur.",
        }),
      },
    },
  },
  argTypes: {
    content: { control: "text", description: "Balon içinde gösterilecek içerik." },
    trigger: { control: false, description: "Üzerine gelindiğinde/odaklanıldığında tooltip'i tetikleyecek eleman." },
    placement: placementArgType,
    color: { ...colorArgType, description: "Balonun rengi. Varsayılan: `neutral` (koyu tooltip)." },
    variant: {
      control: "select",
      options: ["solid", "soft"],
      description: "`solid` (varsayılan) dolu/koyu balon. `soft` daha az göze batan, tonlanmış bir arka plan kullanır.",
    },
    alwaysVisible: { control: "boolean", description: "Hover/focus beklemeden her zaman görünür yapar." },
    disabled: { control: "boolean", description: "Tooltip'i tamamen devre dışı bırakır (hiç render edilmez)." },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
  ...storyDoc("Fareyle üzerine gelin veya Tab'layarak odaklanın — ikisi de tooltip'i açar."),
  // `pt-16`: varsayılan `placement="top"` balonu tetikleyicinin ÜSTÜNE açar —
  // yeterli boşluk olmadan Storybook'un kendi araç çubuğuyla (yakınlaştırma/
  // arama ikonları) çakışıp kesiliyordu (kullanıcının ekran görüntüsünde
  // yakalanan gerçek bir görsel bug).
  render: (args) => (
    <div className="pt-16">
      <Tooltip {...args} trigger={<Button variant="soft">Üzerine gel / Tab'la</Button>} />
    </div>
  ),
  args: { content: "Bu bir tooltip", placement: "top", color: "neutral" },
};

export const AllPlacements: Story = {
  name: "Tüm Konumlar",
  ...storyDoc("4 ana yön (`top`/`bottom`/`left`/`right`) — 12 değerli `Placement` sözleşmesindeki `-start`/`-end` sonekleri temel yöne indirgenir."),
  render: () => (
    <div className="flex flex-wrap gap-8 justify-center items-center p-10 mt-20">
      <Tooltip content="Üst tooltip" placement="top" trigger={<Info />} />
      <Tooltip content="Alt tooltip, biraz daha uzun bir metin içeriyor" placement="bottom" trigger={<Info />} />
      <Tooltip content="Sol tooltip" placement="left" trigger={<Info />} />
      <Tooltip content="Sağ tooltip" placement="right" trigger={<Info />} />
    </div>
  ),
};

export const AllVariants: Story = {
  name: "Tüm Varyantlar",
  ...storyDoc(
    "`solid` (varsayılan, dolu koyu balon) ve `soft` (tonlanmış, daha az göze batan arka plan) — her renk " +
      "rolüyle birlikte kullanılabilir. `alwaysVisible` balonlar yan yana bir satırda sığmadığı için (her biri " +
      "kendi genişliğinde) her renk kendi satırında, balon sağa doğru açılacak şekilde (`placement=\"right\"`) " +
      "listeleniyor — kullanıcının ekran görüntüsünde yakalanan gerçek bir üst üste binme bug'ıydı."
  ),
  render: () => (
    <div className="flex gap-24 p-4">
      {(["solid", "soft"] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-4">
          <span className="text-sm font-medium text-mari-muted">{variant}</span>
          {(["primary", "accent", "success", "warning", "error", "info", "neutral"] as const).map((color) => (
            <Tooltip key={color} content={color} color={color} variant={variant} alwaysVisible placement="right" trigger={<Info />} />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const IconToolbar: Story = {
  name: "İkon Araç Çubuğu",
  ...storyDoc("İkon-only butonların görünür bir etiketi yok — tooltip hem görsel ipucu hem (trigger'a `aria-label` verildiyse) ekran okuyucu için tek açıklama kaynağı."),
  render: () => (
    <div className="flex items-center gap-1 rounded-lg border border-mari-border p-1">
      <Tooltip content="Kalın" trigger={<Button variant="ghost" size="sm" aria-label="Kalın" icon={<Bold size={16} />} />} />
      <Tooltip content="İtalik" trigger={<Button variant="ghost" size="sm" aria-label="İtalik" icon={<Italic size={16} />} />} />
      <Tooltip content="Altı Çizili" trigger={<Button variant="ghost" size="sm" aria-label="Altı Çizili" icon={<Underline size={16} />} />} />
    </div>
  ),
};

export const AllColors: Story = {
  name: "Tüm Renkler",
  ...storyDoc(
    "7 renk rolü — varsayılan `neutral` (koyu balon) dışındakiler vurgu amaçlı kullanılabilir. `alwaysVisible` " +
      "balonlar yan yana sığmadığı için her biri kendi satırında, sağa doğru açılacak şekilde listeleniyor."
  ),
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      {(["primary", "accent", "success", "warning", "error", "info", "neutral"] as const).map((color) => (
        <Tooltip key={color} content={`${color} tooltip`} color={color} alwaysVisible placement="right" trigger={<Info />} />
      ))}
    </div>
  ),
};
