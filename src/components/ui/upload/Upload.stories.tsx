import { Meta, StoryObj } from "@storybook/react";
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
    inputType: "dragDrop",
  },
};

export const WithReviewListSquare: Story = {
  args: {
    listType: "review",
    inputType: "review",
    reviewType: "square",
  },
};

export const WithReviewListCircle: Story = {
  args: {
    listType: "review",
    inputType: "review",
    reviewType: "circle",
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

export const MaxFilesLimit: Story = {
  args: {
    max: 2,
  },
};
