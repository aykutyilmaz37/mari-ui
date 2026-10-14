import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal, type ModalProps } from "./Modal";
import { Button } from "../Button";
import { Field } from "../Field";
import { Input } from "../Input";
import { Segmented } from "../Segmented";
import { Paragraph, Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { CircleCheckIcon } from "../lib/icons";
import { Row, SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Modal> = {
  title: "Native/Geri Bildirim/Modal",
  component: Modal,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Ekranın ortasında, bağlamı bölen pencere: başlık, içerik, Vazgeç/Onay.",
    whenToUse: ["Kısa form (davet, yeniden adlandırma).", "Ayrıntı görüntüleme, başarı onayı.", "Uzun metni okutup onaylatma."],
    whenNotToUse: ["Tek cümlelik evet/hayır — `Dialog`.", "Telefonda uzun liste/filtre — BottomSheet."],
    vsWeb: "Prop'lar aynı (`keyboard` = Android geri tuşu, web'de Escape). RN `Modal` üzerinde; klavye açılınca pencere yukarı kayar (iOS), uzun içerik kendi içinde kayar. Düğmeler telefonda eşit genişlikte; onay varsayılan sağda. `onConfirm` Promise dönerse çözülene kadar onay \"yükleniyor\". Ekran okuyucu pencereden çıkmaz (`accessibilityViewIsModal`).",
  }) } } },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    color: { control: "select", options: [undefined, "primary", "success", "warning", "error"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    confirmButtonText: { control: "text" },
    showCloseButton: { control: "boolean" },
    maskClosable: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { title: "Değişiklikleri kaydet?", description: "Kaydetmezseniz düzenlemeleriniz kaybolur.", confirmButtonText: "Kaydet", size: "md", showCloseButton: true, maskClosable: true, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Modal>;

function Trigger({ label, children }: Readonly<{ label: string; children: (close: () => void, open: boolean) => React.ReactNode }>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>{label}</Button>
      {children(() => setOpen(false), open)}
    </>
  );
}

export const Playground: Story = {
  ...storyDoc("Başlık, renk, boyut ve kapatma davranışını deneyin; düğmeyle açın."),
  render: (args) => <Trigger label="Pencereyi aç">{(close, open) => <Modal {...(args as ModalProps)} open={open} onClose={close} onConfirm={close} />}</Trigger>,
};

function InviteDemo() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | number>("Düzenleyici");
  const invite = () => new Promise<void>((resolve) => setTimeout(resolve, 1000)).then(() => setOpen(false));
  return (
    <>
      <Button onPress={() => setOpen(true)}>Ekibe davet et</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Ekibe davet et" description="Davet bağlantısı e-postayla gönderilir." confirmButtonText="Davet gönder" confirmDisabled={!email.includes("@")} onConfirm={invite}>
        <View style={{ gap: 16 }}>
          <Field label="E-posta" required>
            <Input type="email" value={email} onChangeText={setEmail} placeholder="ad@alan.com" autoFocus />
          </Field>
          <Field label="Rol">
            <Segmented block value={role} onChange={setRole} options={["Görüntüleyici", "Düzenleyici"]} />
          </Field>
        </View>
      </Modal>
    </>
  );
}

export const Invite: Story = {
  name: "Davet Formu",
  ...storyDoc("Form + async onay: e-posta geçerli olana dek onay kapalı; gönderirken \"yükleniyor\". Klavye açılınca pencere yukarı kayar.", `<Modal
  open={open}
  onClose={close}
  title="Ekibe davet et"
  confirmButtonText="Davet gönder"
  confirmDisabled={!email.includes("@")}
  onConfirm={() => api.invite(email).then(close)}
>
  <Field label="E-posta" required><Input type="email" value={email} onChangeText={setEmail} /></Field>
</Modal>`),
  render: () => <InviteDemo />,
};

function SuccessDemo() {
  const theme = useTheme();
  return (
    <Trigger label="Ödemeyi tamamla">
      {(close, open) => (
        <Modal open={open} onClose={close} color="success" icon={<CircleCheckIcon size={22} color={theme.color.success.text} />} title="Ödeme başarılı" description="Sipariş #48213 hazırlanıyor." footer={<Button block onPress={close}>Siparişe git</Button>} />
      )}
    </Trigger>
  );
}

export const Success: Story = {
  name: "Ödeme Başarılı",
  ...storyDoc("İkon + tek eylem (`footer`).", `<Modal open={open} onClose={close} color="success" icon={<CircleCheckIcon />} title="Ödeme başarılı" footer={<Button block onPress={goToOrder}>Siparişe git</Button>} />`),
  render: () => <SuccessDemo />,
};

const TERMS = Array.from({ length: 12 }, (_, i) => `${i + 1}. Madde — Hizmeti kullanarak bu koşulları kabul etmiş olursunuz. Hesabınızın güvenliğinden siz sorumlusunuz; şüpheli bir işlem fark ederseniz bizimle iletişime geçin.`);

export const LongContent: Story = {
  name: "Uzun İçerik (Kullanım Koşulları)",
  ...storyDoc("İçerik pencerenin içinde kayar; başlık ve düğmeler sabit kalır.", `<Modal open={open} onClose={close} title="Kullanım koşulları" confirmButtonText="Kabul ediyorum" onConfirm={accept}>
  <Paragraph>{terms}</Paragraph>
</Modal>`),
  render: () => (
    <Trigger label="Koşulları oku">
      {(close, open) => (
        <Modal open={open} onClose={close} title="Kullanım koşulları" confirmButtonText="Kabul ediyorum" onConfirm={close}>
          <View style={{ gap: 12 }}>{TERMS.map((t) => <Paragraph key={t}>{t}</Paragraph>)}</View>
        </Modal>
      )}
    </Trigger>
  ),
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("sm 320 · md 400 · lg 520; telefonda ekran genişliğini aşmaz (16pt kenar boşluğu).", `<Modal open={open} onClose={close} size="sm" title="Boyut sm" confirmButtonText="Tamam" onConfirm={close}>Pencere genişliği boyuta göre değişir.</Modal>
<Modal open={open} onClose={close} size="md" title="Boyut md" confirmButtonText="Tamam" onConfirm={close}>Pencere genişliği boyuta göre değişir.</Modal>
<Modal open={open} onClose={close} size="lg" title="Boyut lg" confirmButtonText="Tamam" onConfirm={close}>Pencere genişliği boyuta göre değişir.</Modal>`),
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Trigger key={size} label={size}>
          {(close, open) => <Modal open={open} onClose={close} size={size} title={`Boyut ${size}`} confirmButtonText="Tamam" onConfirm={close}>Pencere genişliği boyuta göre değişir.</Modal>}
        </Trigger>
      ))}
    </Row>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Önce durumu seçin, sonra pencereyi açın.", `<Modal open={open} onClose={close} title="Sipariş #48213" description="3 ürün · ₺1.240" skeleton={isLoading} confirmButtonText="Takip et" onConfirm={close}>
  <Text>Kargo yarın teslim edilecek.</Text>
</Modal>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Trigger label="Pencereyi aç">
          {(close, open) => (
            <Modal open={open} onClose={close} title="Sipariş #48213" description="3 ürün · ₺1.240" skeleton={skeleton} confirmButtonText="Takip et" onConfirm={close}>
              <Text>Kargo yarın teslim edilecek.</Text>
            </Modal>
          )}
        </Trigger>
      )}
    </SkeletonDemo>
  ),
};
