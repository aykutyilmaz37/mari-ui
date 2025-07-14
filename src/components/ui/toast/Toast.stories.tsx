import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Toast bileşeni, kullanıcılara bildirim göstermek için kullanılır. Farklı pozisyonlarda ve tiplerde görüntülenebilir.",
      },
    },
  },
  argTypes: {
    title: {
      description: "Toast başlığı",
      control: { type: "text" },
    },
    description: {
      description: "Toast açıklaması (opsiyonel)",
      control: { type: "text" },
    },
    type: {
      description: "Toast tipi",
      control: { type: "select" },
      options: ["success", "info", "error", "warning", "none"],
    },
    position: {
      description: "Toast pozisyonu",
      control: { type: "select" },
      options: [
        "top",
        "bottom",
        "topRight",
        "topLeft",
        "bottomLeft",
        "bottomRight",
      ],
    },
    closeIcon: {
      description: "Kapatma ikonu gösterilsin mi?",
      control: { type: "boolean" },
    },
    onClose: {
      description: "Kapatma fonksiyonu",
      action: "closed",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Varsayılan Toast
export const Default: Story = {
  args: {
    title: "Başarılı!",
    description: "İşleminiz başarıyla tamamlandı.",
    type: "success",
    position: "bottomRight",
    closeIcon: true,
  },
};

// Başarı Toast'u
export const Success: Story = {
  args: {
    title: "Başarılı!",
    description: "Verileriniz başarıyla kaydedildi.",
    type: "success",
    position: "bottomRight",
  },
};

// Hata Toast'u
export const Error: Story = {
  args: {
    title: "Hata!",
    description: "Bir hata oluştu. Lütfen tekrar deneyin.",
    type: "error",
    position: "bottomRight",
  },
};

// Uyarı Toast'u
export const Warning: Story = {
  args: {
    title: "Uyarı!",
    description: "Bu işlem geri alınamaz.",
    type: "warning",
    position: "bottomRight",
  },
};

// Bilgi Toast'u
export const Info: Story = {
  args: {
    title: "Bilgi",
    description: "Yeni bir güncelleme mevcut.",
    type: "info",
    position: "bottomRight",
  },
};

// Sadece Başlık
export const TitleOnly: Story = {
  args: {
    title: "Sadece başlık",
    type: "none",
    position: "bottomRight",
  },
};

// Farklı Pozisyonlar
export const TopRight: Story = {
  args: {
    title: "Sağ Üst",
    description: "Bu toast sağ üst köşede görünür.",
    type: "info",
    position: "topRight",
  },
};

export const TopLeft: Story = {
  args: {
    title: "Sol Üst",
    description: "Bu toast sol üst köşede görünür.",
    type: "info",
    position: "topLeft",
  },
};

export const BottomLeft: Story = {
  args: {
    title: "Sol Alt",
    description: "Bu toast sol alt köşede görünür.",
    type: "info",
    position: "bottomLeft",
  },
};

export const Top: Story = {
  args: {
    title: "Üst Orta",
    description: "Bu toast üst orta kısımda görünür.",
    type: "info",
    position: "top",
  },
};

export const Bottom: Story = {
  args: {
    title: "Alt Orta",
    description: "Bu toast alt orta kısımda görünür.",
    type: "info",
    position: "bottom",
  },
};

// Kapatma İkonu Olmadan
export const WithoutCloseIcon: Story = {
  args: {
    title: "Kapatma İkonu Yok",
    description: "Bu toast'ta kapatma ikonu bulunmuyor.",
    type: "warning",
    position: "bottomRight",
    closeIcon: false,
  },
};

// Uzun İçerik
export const LongContent: Story = {
  args: {
    title: "Çok Uzun Başlık Bu Toast'un Başlığı Gerçekten Çok Uzun",
    description:
      "Bu toast'un açıklaması da oldukça uzun. Kullanıcıya detaylı bilgi vermek için yazılmış bir açıklama metni. Bu metin çok uzun olabilir ve toast bileşeni bu durumu nasıl handle ediyor görmek istiyoruz.",
    type: "info",
    position: "bottomRight",
  },
};

// Tüm Toast Tipleri
export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <Toast
        title="Başarılı"
        description="İşlem başarıyla tamamlandı"
        type="success"
        position="topRight"
      />
      <Toast
        title="Hata"
        description="Bir hata oluştu"
        type="error"
        position="topRight"
      />
      <Toast
        title="Uyarı"
        description="Dikkatli olun"
        type="warning"
        position="topRight"
      />
      <Toast
        title="Bilgi"
        description="Bilgilendirme mesajı"
        type="info"
        position="topRight"
      />
      <Toast
        title="Varsayılan"
        description="Tip belirtilmemiş"
        type="none"
        position="topRight"
      />
    </div>
  ),
};
