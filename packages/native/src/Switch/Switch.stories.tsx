import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";
import { Divider } from "../Divider";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { Row, SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const COLORS = ["primary", "accent", "success", "warning", "error", "info", "neutral"] as const;

const meta: Meta<typeof Switch> = {
  title: "Native/Veri Girişi/Switch",
  component: Switch,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Anında etki eden açma/kapama.",
    whenToUse: ["Ayarlar: bildirimler, karanlık mod, konum.", "Değişikliğin hemen uygulandığı tercihler."],
    whenNotToUse: ["Kaydet düğmesiyle gönderilen form seçimleri — `Checkbox`."],
    vsWeb: "Prop'lar aynı. Ölçü iOS UISwitch: md 51×31 (topuz 27), sm 40×24, lg 60×36; topuz her zaman beyaz, kapalı hal her renkte nötr gri. `label` verilince tüm satır dokunulabilir (iOS ayar satırı: etiket solda, anahtar sağda). `loading` topuzda gösterge, anahtar kilitli. Hareket azaltmada geçiş anlık.",
  }) } } },
  argTypes: {
    label: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: { control: "select", options: COLORS },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { accessibilityLabel: "Bildirimler", size: "md", color: "primary", loading: false, disabled: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  ...storyDoc("Boyut, renk, yükleme ve etiketi deneyin."),
  render: (args) => <Switch {...args} />,
};

const SETTINGS = [
  { id: "orders", title: "Sipariş güncellemeleri", on: true },
  { id: "campaigns", title: "Kampanyalar", on: false },
  { id: "stock", title: "Stok bildirimleri", on: true },
];

function Settings() {
  const theme = useTheme();
  const [state, setState] = useState(Object.fromEntries(SETTINGS.map((s) => [s.id, s.on])));
  return (
    <View style={{ alignSelf: "stretch", borderRadius: 12, paddingHorizontal: 16, backgroundColor: theme.color.canvas.surfaceAlt }}>
      {SETTINGS.map((setting, i) => (
        <View key={setting.id}>
          {i > 0 ? <Divider size="sm" style={{ marginVertical: 0 }} /> : null}
          <Switch label={setting.title} checked={state[setting.id]} onChange={(on) => setState((s) => ({ ...s, [setting.id]: on }))} />
        </View>
      ))}
    </View>
  );
}

export const SettingsList: Story = {
  name: "Ayarlar Listesi",
  ...storyDoc("iOS ayar satırı: etiket solda, anahtar sağda, satırın tamamı dokunulabilir.", `<Switch label="Sipariş güncellemeleri" checked={on} onChange={setOn} />`),
  render: () => <Settings />,
};

export const InnerLabels: Story = {
  name: "İç Etiketli",
  ...storyDoc("`switchTrueLabel`/`switchFalseLabel` izin içinde; iz genişler.", `<Switch switchTrueLabel="Açık" switchFalseLabel="Kapalı" />`),
  render: () => (
    <Row>
      <Switch accessibilityLabel="Durum" switchTrueLabel="Açık" switchFalseLabel="Kapalı" />
      <Switch accessibilityLabel="Durum" defaultChecked color="success" switchTrueLabel="Açık" switchFalseLabel="Kapalı" />
    </Row>
  ),
};

function LoadingDemo() {
  const [on, setOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const state = on ? "açık" : "kapalı";
  const status = loading ? "Kaydediliyor…" : `Konum paylaşımı ${state}`;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Switch
        accessibilityLabel="Konum paylaşımı"
        checked={on}
        loading={loading}
        onChange={(next) => {
          setLoading(true);
          setTimeout(() => {
            setOn(next);
            setLoading(false);
          }, 1200);
        }}
      />
      <Text muted>{status}</Text>
    </View>
  );
}

export const Loading: Story = {
  name: "Yükleniyor",
  ...storyDoc("Sunucuya kaydedilirken topuzda gösterge; anahtar kilitli.", `<Switch checked={on} loading={saving} onChange={save} />`),
  render: () => <LoadingDemo />,
};

export const Colors: Story = {
  name: "Renk ve Boyut",
  ...storyDoc("Açık hal rol rengi, kapalı hal her renkte aynı gri; sm/md/lg.", `<Switch defaultChecked color="success" accessibilityLabel="Bildirimler" />
<Switch size="lg" defaultChecked accessibilityLabel="Konum" />`),
  render: () => (
    <Stack>
      <Row>{COLORS.map((color) => <Switch key={color} color={color} defaultChecked accessibilityLabel={color} />)}</Row>
      <Row>{(["sm", "md", "lg"] as const).map((size) => <Switch key={size} size={size} defaultChecked accessibilityLabel={size} />)}</Row>
    </Stack>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc("Devre dışı: durum rengi %50 korunur; dokunma yok.", `<Switch disabled defaultChecked accessibilityLabel="Kilitli ayar" />
<Switch loading accessibilityLabel="Kaydediliyor" />`),
  render: () => (
    <Row>
      <Switch disabled accessibilityLabel="Devre dışı" />
      <Switch disabled defaultChecked accessibilityLabel="Devre dışı, açık" />
      <Switch loading accessibilityLabel="Yükleniyor" />
    </Row>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Switch skeleton={isLoading} label="Sipariş güncellemeleri" />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View>
          <Switch skeleton={skeleton} label="Sipariş güncellemeleri" defaultChecked />
          <Switch skeleton={skeleton} accessibilityLabel="Kampanyalar" />
        </View>
      )}
    </SkeletonDemo>
  ),
};
