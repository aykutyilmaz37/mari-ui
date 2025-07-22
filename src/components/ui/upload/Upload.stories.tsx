import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Upload } from "./Upload";
import { ToastProvider } from "../toast/useToast";

const meta: Meta<typeof Upload> = {
  title: "Components/Upload",
  component: Upload,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Upload>;

export const Basic: Story = {
  args: {},
};

export const WithDragDrop: Story = {
  args: {
    dragDrop: true,
  },
};

export const WithCustomFileSize: Story = {
  args: {
    fileSize: 1 * 1024 * 1024, // 1 MB
  },
};

export const WithCustomFileType: Story = {
  args: {
    fileType: "image/png",
  },
};
