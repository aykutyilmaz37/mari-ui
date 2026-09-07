import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Info } from "lucide-react";
import { Modal } from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  args: {
    open: true,
    title: "Example Modal Title",
    closeButtonPosition: "right",
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    color: "info",
    size: "md",
    footerButtonPosition: "left",
  },
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["primary", "accent", "success", "error", "warning", "info", "neutral"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    closeButtonPosition: {
      control: { type: "select" },
      options: ["left", "right"],
    },
    footerButtonPosition: {
      control: { type: "select" },
      options: ["left", "right"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

const ModalStory = (args: typeof meta.args) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="mb-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
        Open Modal
      </button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        title="Modal Title"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          alert("Confirmed!");
          setOpen(false);
        }}
        icon={<Info />}
      >
        <p>This is the modal body content.</p>
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: (args) => <ModalStory {...args} />,
};
