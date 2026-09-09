import type { Meta, StoryObj } from "@storybook/react";
import { Info } from "lucide-react";
import { colorArgType, placementArgType } from "../lib/storybookArgTypes";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Veri Gösterimi/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bir elemanın üzerine gelindiğinde kısa bir açıklama gösteren balon. **Not:** eskiden her trigger " +
          "`<Button>` içine sarılıyordu — bir ikon/link'e tooltip eklendiğinde iç içe buton render ediliyordu " +
          "(gerçek bir a11y/DOM bug'ıydı). Artık trigger düz bir `<span>` içinde; kendi bir buton/link ise " +
          "davranışı korunur.",
      },
    },
  },
  argTypes: {
    content: { control: "text", description: "Balon içinde gösterilecek içerik." },
    trigger: { control: false, description: "Üzerine gelindiğinde tooltip'i tetikleyecek eleman." },
    placement: placementArgType,
    color: { ...colorArgType, description: "Balonun rengi. Varsayılan: `neutral` (koyu tooltip)." },
    alwaysVisible: { control: "boolean", description: "Hover beklemeden her zaman görünür yapar." },
    disabled: { control: "boolean", description: "Tooltip'i tamamen devre dışı bırakır." },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
  render: (args) => <Tooltip {...args} trigger={<button className="px-4 py-2 rounded bg-mari-surface-alt">Üzerine gel</button>} />,
  args: { content: "Bu bir tooltip", placement: "top", color: "neutral" },
};

export const AllPlacements: Story = {
  name: "Tüm Konumlar",
  render: () => (
    <div className="flex flex-wrap gap-8 justify-center items-center p-10 mt-20">
      <Tooltip content="Üst tooltip" placement="top" trigger={<Info />} />
      <Tooltip content="Alt tooltip, biraz daha uzun bir metin içeriyor" placement="bottom" trigger={<Info />} />
      <Tooltip content="Sol tooltip" placement="left" trigger={<Info />} />
      <Tooltip content="Sağ tooltip" placement="right" trigger={<Info />} />
    </div>
  ),
};

export const AllColors: Story = {
  name: "Tüm Renkler",
  render: () => (
    <div className="flex flex-wrap gap-4 p-4 mt-10">
      {(["primary", "accent", "success", "warning", "error", "info", "neutral"] as const).map((color) => (
        <Tooltip key={color} content={`${color} tooltip`} color={color} alwaysVisible trigger={<Info />} />
      ))}
    </div>
  ),
};
