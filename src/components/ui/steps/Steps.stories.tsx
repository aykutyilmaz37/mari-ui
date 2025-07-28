import type { Meta, StoryObj } from "@storybook/react";
import { Steps } from "./Steps";
import { TicketIcon, TimerIcon, CheckCheckIcon } from "lucide-react";
import { useState } from "react";
import { StepsContent } from "./_components/StepsContent";

const meta: Meta<typeof Steps> = {
  title: "Components/Steps",
  component: Steps,
  tags: ["autodocs"],
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
  render: () => <HorizontalStory />,
};

export const Vertical: Story = {
  render: () => <VerticalStory />,
};

export const WithDots: Story = {
  render: () => <WithDotsStory />,
};

export const VerticalWithDots: Story = {
  render: () => <VerticalWithDotsStory />,
};

export const WithContent: Story = {
  render: () => <WithContentStory />,
};
