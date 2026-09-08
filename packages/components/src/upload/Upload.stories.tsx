import type { Meta, StoryObj } from "@storybook/react";
import { Upload } from "./Upload";
import { ToastProvider } from "../toast";

const meta: Meta<typeof Upload> = {
  title: "Components/Upload",
  component: Upload,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Dosya yükleme kontrolü. Buton (`inputType=\"button\"`), sürükle-bırak alanı (`\"dragDrop\"`) veya " +
          "resim önizlemeli liste (`\"review\"`) modlarını destekler. Boyut/tip doğrulaması başarısız olursa " +
          "(`fileSize`/`fileType`) `useToast()` ile bir bildirim gösterir — bu yüzden her story bir " +
          "`ToastProvider` içine sarılı.",
      },
    },
  },
  argTypes: {
    inputType: { control: "select", options: ["button", "dragDrop", "review"], description: "Yükleme tetikleyicisinin görünüm modu." },
    listType: { control: "select", options: ["list", "review"], description: "Yüklenen dosyaların listelenme biçimi." },
    reviewType: { control: "select", options: ["square", "circle"], description: "`listType=\"review\"` iken önizleme çerçevesinin şekli." },
    fileSize: { control: "number", description: "Bayt cinsinden izin verilen azami dosya boyutu." },
    fileType: { control: "text", description: "Kabul edilen MIME tipi (örn. \"image/png\")." },
    max: { control: "number", description: "Azami dosya sayısı." },
  },
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
  name: "Temel",
  args: {},
};

export const WithDragDrop: Story = {
  name: "Sürükle-Bırak",
  args: {
    inputType: "dragDrop",
  },
};

export const WithReviewListSquare: Story = {
  name: "Önizlemeli Liste (Kare)",
  args: {
    listType: "review",
    inputType: "review",
    reviewType: "square",
  },
};

export const WithReviewListCircle: Story = {
  name: "Önizlemeli Liste (Daire)",
  args: {
    listType: "review",
    inputType: "review",
    reviewType: "circle",
  },
};

export const WithCustomFileSize: Story = {
  name: "Özel Boyut Sınırı",
  args: {
    fileSize: 1 * 1024 * 1024, // 1 MB
  },
};

export const WithCustomFileType: Story = {
  name: "Özel Dosya Tipi",
  args: {
    fileType: "image/png",
  },
};

export const MaxFilesLimit: Story = {
  name: "Azami Dosya Sayısı",
  args: {
    max: 2,
  },
};
