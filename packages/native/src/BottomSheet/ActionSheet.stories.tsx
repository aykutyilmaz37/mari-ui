import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Copy, Pencil, Share2, Trash2 } from "lucide-react-native";
import { ActionSheet } from "./ActionSheet";
import { Button } from "../Button";
import { Dialog } from "../Modal";
import { Text } from "../Typography";
import { Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof ActionSheet> = {
  title: "Native/Geri Bildirim/ActionSheet",
  component: ActionSheet,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Bir öğe için eylem listesi (Paylaş / Düzenle / Sil) — alttan açılır.",
    whenToUse: ["Bir satırın \"…\" menüsü.", "Uzun basınca açılan eylemler."],
    whenNotToUse: ["Tek onay — `Dialog`.", "Seçim + uygula (filtre) — `BottomSheet`."],
    vsWeb: "Web'de karşılığı yok (web'de Dropdown menüsü). BottomSheet üzerine kurulu, iki platformda aynı görünüm (kendi çizimimiz, `ActionSheetIOS` değil). Satır 56pt; `destructive` hata renginde; Vazgeç en altta, kalın. Eylem, panel tamamen kapandıktan sonra çalışır — böylece ardından açılan Dialog iOS'ta da görünür.",
  }) } } },
};
export default meta;
type Story = StoryObj<typeof ActionSheet>;

function AddressActions() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [last, setLast] = useState<string>();
  return (
    <Stack>
      <Button variant="outline" onPress={() => setOpen(true)}>Ev adresi · Kadıköy  •••</Button>
      {last ? <Text muted>{`Son eylem: ${last}`}</Text> : null}
      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Ev adresi"
        message="Moda Cad. No: 12, Kadıköy / İstanbul"
        actions={[
          { label: "Paylaş", icon: <Share2 />, onPress: () => setLast("Paylaş") },
          { label: "Kopyala", icon: <Copy />, onPress: () => setLast("Kopyala") },
          { label: "Düzenle", icon: <Pencil />, onPress: () => setLast("Düzenle") },
          { label: "Sil", icon: <Trash2 />, destructive: true, onPress: () => setConfirm(true) },
        ]}
      />
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Adres silinsin mi?"
        message="Bu işlem geri alınamaz."
        actions={[{ label: "Vazgeç", style: "cancel" }, { label: "Sil", style: "destructive", onPress: () => setLast("Silindi") }]}
      />
    </Stack>
  );
}

export const Address: Story = {
  name: "Adres Eylemleri (Sil → Onay)",
  ...storyDoc(
    "Dört eylem; \"Sil\" panel kapandıktan sonra onay Dialog'u açar (iOS'ta iki pencere art arda).",
    `<ActionSheet
  open={open}
  onClose={close}
  title="Ev adresi"
  actions={[
    { label: "Paylaş", icon: <Share2 />, onPress: share },
    { label: "Sil", icon: <Trash2 />, destructive: true, onPress: () => setConfirmOpen(true) },
  ]}
/>`
  ),
  render: () => <AddressActions />,
};

export const Plain: Story = {
  name: "Başlıksız, İkonsuz",
  ...storyDoc("En sade hal: yalnız eylemler ve Vazgeç; bir eylem devre dışı.", `<ActionSheet open={open} onClose={close} actions={[{ label: "Fotoğraf çek" }, { label: "Galeriden seç" }, { label: "Fotoğrafı kaldır", destructive: true, disabled: true }]} />`),
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onPress={() => setOpen(true)}>Profil fotoğrafı</Button>
          <ActionSheet open={open} onClose={() => setOpen(false)} actions={[{ label: "Fotoğraf çek" }, { label: "Galeriden seç" }, { label: "Fotoğrafı kaldır", destructive: true, disabled: true }]} />
        </>
      );
    };
    return <Demo />;
  },
};
