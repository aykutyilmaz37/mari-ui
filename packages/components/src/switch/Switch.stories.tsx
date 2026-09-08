import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Anlık açık/kapalı durumları için bir toggle — Checkbox'tan farkı, değişikliğin genelde ANINDA etkili " +
          "olmasıdır (bir formu submit etmeyi beklemez). `useControllableState` ile hem controlled hem uncontrolled " +
          "kullanılabilir. Bağımsız bir `<button role=\"switch\">` render eder — `Button` component'ine bağımlı değildir.",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean", description: "Controlled değer." },
    defaultChecked: { control: "boolean", description: "Uncontrolled başlangıç değeri." },
    onChange: { action: "onChange" },
    disabled: disabledArgType,
    label: { control: "text", description: "Yanında gösterilecek etiket." },
    switchTrueLabel: { control: "text", description: "Açık durumdayken toggle'ın içinde gösterilecek metin." },
    switchFalseLabel: { control: "text", description: "Kapalı durumdayken toggle'ın içinde gösterilecek metin." },
    size: baseSizeArgType,
    color: { ...colorArgType, description: "Açık durumdaki track rengi. Varsayılan: `primary`." },
    loading: { control: "boolean", description: "Yükleniyor durumu — toggle devre dışı kalır ve bir spinner gösterir." },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

const PlaygroundStory = () => {
  const [value, setValue] = useState(false);
  return <Switch checked={value} onChange={setValue} label="Bildirimler" />;
};
export const Playground: Story = {
  render: () => <PlaygroundStory />,
};

const WithLabelsStory = () => {
  const [value, setValue] = useState(false);
  return <Switch checked={value} onChange={setValue} label="Bildirim" switchTrueLabel="Açık" switchFalseLabel="Kapalı" />;
};
export const WithLabels: Story = {
  name: "İç Etiketli",
  render: () => <WithLabelsStory />,
};

const ColorsStory = () => {
  const [value, setValue] = useState(true);
  return (
    <div className="flex flex-col gap-4">
      {(["primary", "accent", "success", "warning", "error", "info", "neutral"] as const).map((color) => (
        <Switch key={color} checked={value} onChange={setValue} color={color} label={color} />
      ))}
    </div>
  );
};
export const Colors: Story = {
  name: "Renkler",
  render: () => <ColorsStory />,
};

const SizesStory = () => {
  const [value, setValue] = useState(true);
  return (
    <div className="flex flex-col gap-4">
      <Switch checked={value} onChange={setValue} size="sm" label="Küçük" />
      <Switch checked={value} onChange={setValue} size="md" label="Orta" />
      <Switch checked={value} onChange={setValue} size="lg" label="Büyük" />
    </div>
  );
};
export const Sizes: Story = {
  name: "Boyutlar",
  render: () => <SizesStory />,
};

const LoadingStory = () => {
  const [value, setValue] = useState(true);
  return <Switch checked={value} onChange={setValue} loading label="Yükleniyor" />;
};
export const Loading: Story = {
  name: "Yükleniyor",
  render: () => <LoadingStory />,
};

const DisabledStory = () => <Switch checked={true} onChange={() => {}} disabled label="Devre Dışı" />;
export const Disabled: Story = {
  name: "Devre Dışı",
  render: () => <DisabledStory />,
};
