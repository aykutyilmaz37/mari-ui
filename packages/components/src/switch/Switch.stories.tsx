import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Switch>;

const DefaultStory = () => {
  const [value, setValue] = useState(false);
  return <Switch checked={value} onChange={setValue} label="Toggle" />;
};
export const Default: Story = {
  render: () => <DefaultStory />,
};

const WithLabelsStory = () => {
  const [value, setValue] = useState(false);
  return (
    <Switch
      checked={value}
      onChange={setValue}
      label="Notification"
      switchTrueLabel="On"
      switchFalseLabel="Off"
    />
  );
};
export const WithLabels: Story = {
  render: () => <WithLabelsStory />,
};

const SizesStory = () => {
  const [value, setValue] = useState(true);
  return (
    <div className="flex flex-col gap-4">
      <Switch checked={value} onChange={setValue} size="sm" label="Small" />
      <Switch
        checked={value}
        onChange={setValue}
        size="md"
        label="Middle"
      />
      <Switch checked={value} onChange={setValue} size="lg" label="Large" />
    </div>
  );
};
export const Sizes: Story = {
  render: () => <SizesStory />,
};

const LoadingStory = () => {
  const [value, setValue] = useState(true);
  return <Switch checked={value} onChange={setValue} loading label="Loading" />;
};
export const Loading: Story = {
  render: () => <LoadingStory />,
};

const DisabledStory = () => {
  return (
    <Switch checked={true} onChange={() => {}} disabled label="Disabled" />
  );
};
export const Disabled: Story = {
  render: () => <DisabledStory />,
};
