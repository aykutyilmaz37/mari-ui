import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";
import { Button } from "../Button";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const COLORS = ["info", "success", "warning", "error", "primary", "accent", "neutral"] as const;

const meta: Meta<typeof Alert> = {
  title: "Native/Geri Bildirim/Alert",
  component: Alert,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Ekranda kalan, bağlama ait bilgi/uyarı kutusu; isteğe bağlı eylem ve kapatma.",
    whenToUse: ["Bir işlemin sonucu ya da engel (ödeme reddedildi).", "Ekran üstünde süreli bilgi şeridi (`banner`)."],
    whenNotToUse: ["Kısa süreli onay — Toast.", "Kullanıcıyı durdurması gereken karar — Modal/Dialog."],
    vsWeb: "Prop'lar aynı. Metin HIG Subheadline 15/20. error/warning ekran okuyucuda hemen (`assertive`), diğerleri sırası gelince (`polite`) duyurulur; `role=\"none\"` duyurmaz. Kapatma düğmesi 28pt, `hitSlop` ile 44; kapanış 200 ms soluklaşma (hareket azaltmada anlık).",
  }) } } },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    color: { control: "select", options: COLORS },
    icon: { control: "boolean" },
    closable: { control: "boolean" },
    banner: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { title: "Senkronizasyon başarısız", description: "Bağlantınızı kontrol edip tekrar deneyin.", color: "warning", icon: true, closable: true, banner: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Playground: Story = {
  ...storyDoc("Renk, ikon, kapatma ve şerit modunu deneyin."),
  decorators: [withStretch],
  render: (args) => <Alert {...args} />,
};

function PaymentDemo() {
  const [retrying, setRetrying] = useState(false);
  const retry = () => {
    setRetrying(true);
    setTimeout(() => setRetrying(false), 1200);
  };
  return (
    <Alert
      color="error"
      title="Ödeme reddedildi"
      description="Kartınızın limiti yetersiz. Başka bir kartla deneyin ya da bankanızla görüşün."
      action={<Button size="sm" color="error" variant="outline" loading={retrying} onPress={retry}>Tekrar dene</Button>}
    />
  );
}

export const Payment: Story = {
  name: "Ödeme Hatası (Eylemli)",
  ...storyDoc("Hata + çözüm eylemi; dar ekranda eylem metnin altına iner.", `<Alert
  color="error"
  title="Ödeme reddedildi"
  description="Kartınızın limiti yetersiz."
  action={<Button size="sm" color="error" variant="outline" onPress={retry}>Tekrar dene</Button>}
/>`),
  decorators: [withStretch],
  render: () => <PaymentDemo />,
};

export const Banner: Story = {
  name: "Deneme Süresi Şeridi (banner)",
  ...storyDoc("Ekran üstünde kenardan kenara şerit; kapatılabilir, duyurulmaz (`role=\"none\"` — sayfa açılışında zaten görünür).", `<Alert banner role="none" closable color="accent" description="Pro denemenizin bitmesine 3 gün kaldı." action={<Button size="sm">Yükselt</Button>} />`),
  decorators: [withStretch],
  render: () => <Alert banner role="none" closable color="accent" description="Pro denemenizin bitmesine 3 gün kaldı." action={<Button size="sm">Yükselt</Button>} />,
};

function SavedDemo() {
  const [key, setKey] = useState(0);
  const [shown, setShown] = useState(true);
  return (
    <View style={{ gap: 12 }}>
      {shown ? <Alert key={key} closable color="success" title="Adres kaydedildi" description="Sonraki siparişlerinizde varsayılan adres olarak kullanılacak." onClose={() => setShown(false)} /> : null}
      {!shown ? <Button size="sm" variant="outline" onPress={() => { setKey((k) => k + 1); setShown(true); }}>Tekrar göster</Button> : null}
    </View>
  );
}

export const Closable: Story = {
  name: "Kaydetme Sonrası (Kapatılabilir)",
  ...storyDoc("Başarı bildirimi kapatılınca soluklaşarak kalkar.", `<Alert closable color="success" title="Adres kaydedildi" onClose={() => setShown(false)} />`),
  decorators: [withStretch],
  render: () => <SavedDemo />,
};

export const Colors: Story = {
  name: "Renkler",
  ...storyDoc("Rol renkleri ve varsayılan ikonları; başlıksız tek satır.", `<Alert color="success" description="Profil güncellendi." />
<Alert color="warning" icon={false} description="İkonsuz uyarı." />`),
  render: () => (
    <Stack>
      {COLORS.map((color) => <Alert key={color} color={color} description={`${color} — kısa bilgi metni.`} />)}
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Alert skeleton={isLoading} closable color="info" title="Yeni sürüm hazır" description="Uygulamayı yeniden başlattığınızda güncellenecek." />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => <Alert skeleton={skeleton} closable color="info" title="Yeni sürüm hazır" description="Uygulamayı yeniden başlattığınızda güncellenecek." />}
    </SkeletonDemo>
  ),
};
