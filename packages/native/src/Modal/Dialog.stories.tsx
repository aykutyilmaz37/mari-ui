import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dialog, type DialogAction } from "./Dialog";
import { Button } from "../Button";
import { Text } from "../Typography";
import { Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Dialog> = {
  title: "Native/Geri Bildirim/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Kısa onay penceresi: başlık, tek cümle, 1–3 eylem. iOS uyarısının ölçüleri, kendi temamız.",
    whenToUse: ["Geri alınamaz işlem onayı (sil, çıkış yap).", "Kullanıcının karar vermesi gereken kısa durum (oturum süresi doluyor)."],
    whenNotToUse: ["İçerik, form ya da uzun metin — `Modal`.", "Bilgilendirme — Toast / Alert."],
    vsWeb: "Web'de karşılığı yok (web'de `Modal` `color=\"error\"` ile). 270pt, ortalanmış metin; iki eylem yan yana, bir ya da üç alt alta. `cancel` kalın, `destructive` hata renginde. Karartmaya dokununca kapanmaz (karar bekler); Android geri tuşu `cancel` eylemini çağırır. Platform `Alert.alert` yerine kendi çizimimiz — tema ve marka fontu uygulanır.",
  }) } } },
};
export default meta;
type Story = StoryObj<typeof Dialog>;

function Demo({ trigger, title, message, actions }: Readonly<{ trigger: string; title: string; message?: string; actions?: DialogAction[] }>) {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string>();
  const wrapped = actions?.map((a) => ({ ...a, onPress: () => (a.onPress ? Promise.resolve(a.onPress()).then(() => setLast(a.label)) : setLast(a.label)) }));
  return (
    <Stack>
      <Button variant="outline" onPress={() => setOpen(true)}>{trigger}</Button>
      {last ? <Text muted>{`Seçilen: ${last}`}</Text> : null}
      <Dialog open={open} onClose={() => setOpen(false)} title={title} message={message} actions={wrapped} />
    </Stack>
  );
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const Delete: Story = {
  name: "Silme Onayı (Yıkıcı)",
  ...storyDoc("İki eylem yan yana; sil hata renginde, async işlemde gösterge.", `<Dialog
  open={open}
  onClose={close}
  title="Adres silinsin mi?"
  message="Ev adresi kalıcı olarak silinecek."
  actions={[
    { label: "Vazgeç", style: "cancel" },
    { label: "Sil", style: "destructive", onPress: () => api.deleteAddress(id) },
  ]}
/>`),
  render: () => <Demo trigger="Adresi sil" title="Adres silinsin mi?" message="Ev adresi kalıcı olarak silinecek. Bu işlem geri alınamaz." actions={[{ label: "Vazgeç", style: "cancel" }, { label: "Sil", style: "destructive", onPress: () => wait(800) }]} />,
};

export const Session: Story = {
  name: "Oturum Süresi Doluyor",
  ...storyDoc("Tek eylem.", `<Dialog open={open} onClose={close} title="Oturumunuz sona ermek üzere" message="Güvenliğiniz için 2 dakika sonra çıkış yapılacak." actions={[{ label: "Oturumu uzat" }]} />`),
  render: () => <Demo trigger="Süre uyarısı" title="Oturumunuz sona ermek üzere" message="Güvenliğiniz için 2 dakika sonra çıkış yapılacak." actions={[{ label: "Oturumu uzat" }]} />,
};

export const ThreeActions: Story = {
  name: "Üç Eylem (Kaydetmeden Çık)",
  ...storyDoc("Üç eylem alt alta; vazgeç en altta ve kalın.", `<Dialog
  open={open}
  onClose={close}
  title="Değişiklikler kaydedilsin mi?"
  actions={[
    { label: "Kaydet", onPress: save },
    { label: "Kaydetmeden çık", style: "destructive", onPress: discard },
    { label: "Vazgeç", style: "cancel" },
  ]}
/>`),
  render: () => <Demo trigger="Düzenlemeden çık" title="Değişiklikler kaydedilsin mi?" message="Kaydetmezseniz son düzenlemeleriniz kaybolur." actions={[{ label: "Kaydet" }, { label: "Kaydetmeden çık", style: "destructive" }, { label: "Vazgeç", style: "cancel" }]} />,
};
