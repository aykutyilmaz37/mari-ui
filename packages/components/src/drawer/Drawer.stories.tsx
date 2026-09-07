import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Drawer } from "./Drawer";

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  args: {
    position: "right",
    size: "md",
    showCloseButton: true,
    closeButtonPosition: "right",
    header: "Drawer Header",
    footer: "Drawer Footer",
    loading: false,
  },
};

export default meta;

type Story = StoryObj<typeof Drawer>;

const DefaultDrawer = (args: typeof meta.args) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Drawer</button>
      <Drawer {...args} open={open} onClose={() => setOpen(false)}>
        <p>This is the drawer content.</p>
      </Drawer>
    </>
  );
};

export const Default: Story = {
  render: (args) => <DefaultDrawer {...args} />,
};
