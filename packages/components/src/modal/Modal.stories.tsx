import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Info } from "lucide-react";
import { colorArgType, baseSizeArgType } from "../lib/storybookArgTypes";
import { Modal } from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Odak kilitleyen (focus-trap) diyalog penceresi. `color` verilirse başlıkta bir ikon ve vurgu rengi " +
          "gösterir (verilmezse ikon hiç render edilmez). `onConfirm`/`onCancel` verilirse alt kısımda bir onay " +
          "footer'ı belirir; ikisi de yoksa footer gösterilmez.",
      },
    },
  },
  argTypes: {
    color: { ...colorArgType, description: "İkon/vurgu rengi. Verilmezse ikon hiç gösterilmez." },
    size: baseSizeArgType,
    closeButtonPosition: { control: "select", options: ["left", "right"], description: "Kapatma (X) butonunun başlıktaki konumu." },
    footerButtonPosition: { control: "select", options: ["left", "right"], description: "Onay/iptal butonlarının footer'daki konumu." },
    title: { control: "text" },
    confirmButtonText: { control: "text" },
    cancelButtonText: { control: "text" },
  },
  args: {
    open: true,
    title: "Örnek Modal Başlığı",
    closeButtonPosition: "right",
    confirmButtonText: "Onayla",
    cancelButtonText: "Vazgeç",
    color: "info",
    size: "md",
    footerButtonPosition: "left",
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

const ModalStory = (args: typeof meta.args) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="mb-4 px-4 py-2 rounded bg-mari-primary-solid text-mari-primary-solid-contrast">
        Modalı Aç
      </button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        title="Modal Başlığı"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          alert("Onaylandı!");
          setOpen(false);
        }}
        icon={<Info />}
      >
        <p>Bu, modal gövde içeriğidir.</p>
      </Modal>
    </>
  );
};

export const Playground: Story = {
  name: "Oynama Alanı",
  render: (args) => <ModalStory {...args} />,
};

export const WithoutFooter: Story = {
  name: "Footer'sız",
  render: (args) => <ModalStory {...args} onConfirm={undefined} onCancel={undefined} />,
  args: { onConfirm: undefined, onCancel: undefined },
};

const SizeModalButton = ({ size }: { size: "sm" | "md" | "lg" }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded bg-mari-primary-solid text-mari-primary-solid-contrast">
        {size.toUpperCase()} Aç
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`${size.toUpperCase()} boyutlu modal`} size={size} color="primary" icon={<Info />}>
        <p>Boyut: {size}</p>
      </Modal>
    </div>
  );
};

export const Sizes: Story = {
  name: "Boyutlar",
  render: () => (
    <div className="flex flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SizeModalButton key={size} size={size} />
      ))}
    </div>
  ),
};
