import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./Toast";
import { ToastProvider, useToast } from "./useToast";
import type { ToastPosition, ToastType } from "./types";

/**
 * Not: eskiden `Toast`'un kendisi `position` prop'u alıp kendi konumunu
 * (`absolute` + translate) taşıyordu. Artık konum/istifleme
 * `ToastProvider`ın işi (bkz. useToast.tsx) — `Toast`, `useToast()`
 * aracılığıyla tetiklenen bir bildirimin GÖVDESİ. Bu story hem tekil
 * görünümü hem gerçek `useToast()` akışını gösteriyor.
 */
const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Toast bileşeni, kullanıcılara bildirim göstermek için kullanılır. Gerçek kullanımda `useToast()` + `<ToastProvider>` ile tetiklenir.",
      },
    },
  },
  argTypes: {
    title: { description: "Toast başlığı", control: { type: "text" } },
    description: { description: "Toast açıklaması (opsiyonel)", control: { type: "text" } },
    type: { description: "Toast tipi", control: { type: "select" }, options: ["success", "info", "error", "warning", "none"] },
    closeIcon: { description: "Kapatma ikonu gösterilsin mi?", control: { type: "boolean" } },
    onClose: { description: "Kapatma fonksiyonu", action: "closed" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  name: "Başarılı",
  args: { title: "Başarılı!", description: "Verileriniz başarıyla kaydedildi.", type: "success" },
};

export const Error: Story = {
  name: "Hata",
  args: { title: "Hata!", description: "Bir hata oluştu. Lütfen tekrar deneyin.", type: "error" },
};

export const Warning: Story = {
  name: "Uyarı",
  args: { title: "Uyarı!", description: "Bu işlem geri alınamaz.", type: "warning" },
};

export const Info: Story = {
  name: "Bilgi",
  args: { title: "Bilgi", description: "Yeni bir güncelleme mevcut.", type: "info" },
};

export const TitleOnly: Story = {
  name: "Sadece Başlık",
  args: { title: "Sadece başlık", type: "none" },
};

export const WithoutCloseIcon: Story = {
  name: "Kapatma İkonu Yok",
  args: { title: "Kapatma İkonu Yok", description: "Bu toast'ta kapatma ikonu bulunmuyor.", type: "warning", closeIcon: false },
};

export const AllTypes: Story = {
  name: "Tüm Tipler",
  render: () => (
    <div className="space-y-4">
      <Toast title="Başarılı" description="İşlem başarıyla tamamlandı" type="success" />
      <Toast title="Hata" description="Bir hata oluştu" type="error" />
      <Toast title="Uyarı" description="Dikkatli olun" type="warning" />
      <Toast title="Bilgi" description="Bilgilendirme mesajı" type="info" />
      <Toast title="Varsayılan" description="Tip belirtilmemiş" type="none" />
    </div>
  ),
};

const DemoTrigger = ({ position, type }: { position: ToastPosition; type: ToastType }) => {
  const { showToast } = useToast();
  return (
    <button
      className="px-4 py-2 rounded bg-mari-primary-solid text-mari-primary-solid-contrast"
      onClick={() => showToast({ title: "Bildirim", description: `Konum: ${position}`, type, position })}
    >
      Toast Göster ({position})
    </button>
  );
};

export const LiveWithProvider: Story = {
  name: "Canlı Kullanım (Provider ile)",
  parameters: { layout: "fullscreen" },
  render: () => (
    <ToastProvider>
      <div className="grid grid-cols-3 gap-4 p-10">
        <DemoTrigger position="topLeft" type="info" />
        <DemoTrigger position="top" type="success" />
        <DemoTrigger position="topRight" type="warning" />
        <DemoTrigger position="bottomLeft" type="error" />
        <DemoTrigger position="bottom" type="none" />
        <DemoTrigger position="bottomRight" type="success" />
      </div>
    </ToastProvider>
  ),
};
