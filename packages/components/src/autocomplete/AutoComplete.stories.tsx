import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AutoComplete } from "./AutoComplete";
import { Option } from "./types";

const meta: Meta<typeof AutoComplete> = {
  title: "Components/AutoComplete",
  component: AutoComplete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Yazdıkça filtrelenen bir seçenek listesi açan metin girişi. `onSearch` her tuş vuruşunda, `onSelect` " +
          "bir seçenek tıklandığında çağrılır. **Not:** eskiden liste `opacity-0` ile gizlenirken hâlâ tıklanabilir " +
          "kalıyordu ve seçeneğe tıklamak input'un `onBlur`'unu (listeyi kapatanı) tıklamadan önce tetikliyordu — " +
          "ikisi de düzeltildi (`pointer-events-none` + seçenek üzerinde `onMouseDown` ile `preventDefault`).",
      },
    },
  },
  argTypes: {
    placeholder: { control: "text" },
    closeOnBlur: { control: "boolean", description: "Odak kaybedildiğinde listeyi otomatik kapatır." },
    onSearch: { action: "onSearch" },
    onSelect: { action: "onSelect", description: "Bir seçenek seçildiğinde çağrılır." },
  },
};

export default meta;

type Story = StoryObj<typeof AutoComplete>;

const sampleOptions: Option[] = [
  { id: 1, value: "Ahmet" },
  { id: 2, value: "Aykut" },
  { id: 3, value: "Furkan" },
  { id: 4, value: "Yasemin" },
  { id: 5, value: "Sadık" },
];

export const Playground: Story = {
  name: "Oynama Alanı",
  args: {
    options: sampleOptions,
    placeholder: "İsim yazın...",
  },
};

const ControlledExample = () => {
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <AutoComplete
        options={sampleOptions}
        value={value}
        onSearch={setValue}
        onSelect={setValue}
        placeholder="İsim yazın..."
      />
      <p className="text-sm text-mari-muted">Seçilen/yazılan: {value || "(boş)"}</p>
    </div>
  );
};

export const Controlled: Story = {
  name: "Controlled Örneği",
  render: () => <ControlledExample />,
};
