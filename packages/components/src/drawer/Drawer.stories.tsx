import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType } from "../lib/storybookArgTypes";
import { Drawer } from "./Drawer";

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Ekranın kenarından kayarak açılan panel. `position` ile hangi kenardan açılacağı, `size` ile genişlik/" +
          "yükseklik belirlenir. `header`/`footer` opsiyonel React node kabul eder — string veya JSX olabilir.",
      },
    },
  },
  argTypes: {
    position: { control: "select", options: ["top", "bottom", "left", "right"], description: "Panelin açılacağı kenar." },
    size: baseSizeArgType,
    showCloseButton: { control: "boolean", description: "Sağ üstte bir kapatma (X) butonu gösterir." },
    closeButtonPosition: { control: "select", options: ["left", "right"], description: "Kapatma butonunun header içindeki konumu." },
    loading: { control: "boolean", description: "İçerik yerine bir yükleniyor göstergesi render eder." },
    header: { control: "text" },
    footer: { control: "text" },
  },
  args: {
    position: "right",
    size: "md",
    showCloseButton: true,
    closeButtonPosition: "right",
    header: "Drawer Başlığı",
    footer: "Drawer Alt Bilgisi",
    loading: false,
  },
};

export default meta;

type Story = StoryObj<typeof Drawer>;

const DrawerStory = (args: typeof meta.args) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded bg-mari-primary-solid text-mari-primary-solid-contrast">
        Drawer'ı Aç
      </button>
      <Drawer {...args} open={open} onClose={() => setOpen(false)}>
        <p>Bu, drawer içeriğidir.</p>
      </Drawer>
    </>
  );
};

export const Playground: Story = {
  name: "Oynama Alanı",
  render: (args) => <DrawerStory {...args} />,
};

const PositionDrawerButton = ({ position }: { position: "top" | "bottom" | "left" | "right" }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded bg-mari-primary-solid text-mari-primary-solid-contrast">
        {position}
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} position={position} header={`Konum: ${position}`}>
        <p>Bu drawer {position} kenarından açıldı.</p>
      </Drawer>
    </div>
  );
};

export const Positions: Story = {
  name: "Konumlar",
  render: () => (
    <div className="flex gap-4">
      {(["top", "bottom", "left", "right"] as const).map((position) => (
        <PositionDrawerButton key={position} position={position} />
      ))}
    </div>
  ),
};

export const LoadingState: Story = {
  name: "Yükleniyor Durumu",
  render: (args) => <DrawerStory {...args} loading />,
  args: { loading: true },
};
