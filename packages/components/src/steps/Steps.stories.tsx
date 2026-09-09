import type { Meta, StoryObj } from "@storybook/react";
import { Steps } from "./Steps";
import { TicketIcon, TimerIcon, CheckCheckIcon } from "lucide-react";
import { useState } from "react";
import { colorArgType } from "../lib/storybookArgTypes";
import { StepsContent } from "./_components/StepsContent";

const meta: Meta<typeof Steps> = {
  title: "Navigasyon/Steps",
  component: Steps,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Çok adımlı bir akışta (sihirbaz, kayıt formu, sipariş takibi) ilerlemeyi gösteren adım göstergesi. Yatay/" +
          "dikey ve numara/nokta gösterim biçimlerini destekler. Hook kullanmaz, sunucu bileşeni olarak render " +
          "edilebilir (`onChange` verildiğinde etkileşim client boundary'sine taşınır).",
      },
    },
  },
  argTypes: {
    color: { ...colorArgType, description: "Aktif/tamamlanmış adımların rengi. Varsayılan: `primary`." },
  },
};

export default meta;
type Story = StoryObj<typeof Steps>;

const stepData = [
  {
    icon: TicketIcon,
    title: "Bilet",
    description: "Bilet Seç",
    step: 1,
  },
  {
    icon: TimerIcon,
    title: "Zaman",
    description: "Zaman Seç",
    step: 2,
  },
  {
    icon: CheckCheckIcon,
    title: "Onay",
    description: "Onayla",
    step: 3,
  },
];

const HorizontalStory = () => {
  const [current, setCurrent] = useState(1);
  return <Steps data={stepData} currentStep={current} onChange={setCurrent} />;
};

const VerticalStory = () => {
  const [current, setCurrent] = useState(1);
  return (
    <Steps
      data={stepData}
      currentStep={current}
      onChange={setCurrent}
      vertical
    />
  );
};

const WithDotsStory = () => {
  const [current, setCurrent] = useState(1);
  return (
    <Steps data={stepData} currentStep={current} onChange={setCurrent} dot />
  );
};

const VerticalWithDotsStory = () => {
  const [current, setCurrent] = useState(1);
  return (
    <Steps
      data={stepData}
      currentStep={current}
      onChange={setCurrent}
      vertical
      dot
    />
  );
};

const WithContentStory = () => {
  const [current, setCurrent] = useState(1);
  return (
    <Steps
      data={stepData}
      currentStep={current}
      onChange={setCurrent}
      content={
        <>
          <StepsContent value={1} currentSteps={current}>
            1. adım içeriği
          </StepsContent>
          <StepsContent value={2} currentSteps={current}>
            2. adım içeriği
          </StepsContent>
          <StepsContent value={3} currentSteps={current}>
            3. adım içeriği
          </StepsContent>
        </>
      }
    />
  );
};

export const Horizontal: Story = {
  name: "Yatay",
  render: () => <HorizontalStory />,
};

export const Vertical: Story = {
  name: "Dikey",
  render: () => <VerticalStory />,
};

export const WithDots: Story = {
  name: "Nokta Gösterimli",
  render: () => <WithDotsStory />,
};

export const VerticalWithDots: Story = {
  name: "Dikey + Nokta Gösterimli",
  render: () => <VerticalWithDotsStory />,
};

export const WithContent: Story = {
  name: "İçerikli",
  render: () => <WithContentStory />,
};

export const AllColors: Story = {
  name: "Tüm Renkler",
  render: () => (
    <div className="flex flex-col gap-8">
      {(["primary", "accent", "success", "warning", "error", "info", "neutral"] as const).map((color) => (
        <Steps key={color} data={stepData} currentStep={2} color={color} />
      ))}
    </div>
  ),
};
