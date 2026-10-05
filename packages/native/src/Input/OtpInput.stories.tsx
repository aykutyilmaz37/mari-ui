import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { OtpInput } from "./OtpInput";
import { Button } from "../Button";
import { Field } from "../Field";
import { Text, Title } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof OtpInput> = {
  title: "Native/Veri Girişi/OtpInput",
  component: OtpInput,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Tek kullanımlık kod (SMS, e-posta, PIN) girişi.",
    whenToUse: ["SMS/e-posta doğrulama kodu.", "Kısa PIN (`mask`)."],
    whenNotToUse: ["Uzun ya da serbest biçimli değer — `Input`."],
    vsWeb: "Prop'lar aynı. Arkada TEK gerçek alan: kutucuklara dokununca o odaklanır; SMS kodu iOS'ta klavye önerisinden (`oneTimeCode`), Android'de `sms-otp` ile tek dokunuşta dolar, yapıştırma da tek seferde çalışır. Kutular Input ölçüsünde kare (md 44). `onChange` yalnız tüm haneler dolunca, `onInput` her değişiklikte. `ghost` OTP'de `underlined` çizilir.",
  }) } } },
  argTypes: {
    length: { control: { type: "number", min: 4, max: 8 } },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["outline", "soft", "underlined"] },
    layout: { control: "select", options: ["separated", "single"] },
    linePosition: { control: "select", options: ["center", "bottom"] },
    mask: { control: "boolean" },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { length: 6, size: "md", variant: "outline", layout: "separated", linePosition: "center", mask: false, disabled: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof OtpInput>;

export const Playground: Story = {
  ...storyDoc("Uzunluk, boyut, varyant ve düzeni deneyin."),
  render: (args) => <OtpInput {...args} />,
};

function SmsDemo() {
  const [state, setState] = useState<"idle" | "checking" | "ok" | "wrong">("idle");
  const verify = (code: string) => {
    setState("checking");
    setTimeout(() => setState(code === "123456" ? "ok" : "wrong"), 800);
  };
  const theme = useTheme();
  return (
    <View style={{ alignSelf: "stretch", gap: 12 }}>
      <Title level={4}>Telefonunuzu doğrulayın</Title>
      <Text muted>0(5••) ••• •• 42 numarasına gönderilen 6 haneli kodu girin. (Doğru kod: 123456)</Text>
      <Field label="Doğrulama kodu" error={state === "wrong" ? "Kod hatalı, tekrar deneyin." : undefined}>
        <OtpInput onInput={() => state === "wrong" && setState("idle")} onChange={verify} disabled={state === "checking"} />
      </Field>
      {state === "ok" ? <Text style={{ color: theme.color.success.text }}>Telefon doğrulandı.</Text> : null}
      <Button variant="ghost" size="sm" style={{ alignSelf: "flex-start" }}>Kodu tekrar gönder</Button>
    </View>
  );
}

export const Sms: Story = {
  name: "SMS Doğrulama",
  ...storyDoc(
    "Field içinde: hatalı kodda kırmızı + mesaj, yeniden yazınca temizlenir; kontrol sırasında kilitli.",
    `<Field label="Doğrulama kodu" error={wrong ? "Kod hatalı, tekrar deneyin." : undefined}>
  <OtpInput onChange={verify} onInput={clearError} disabled={checking} />
</Field>`
  ),
  render: () => <SmsDemo />,
};

export const Pin: Story = {
  name: "Gizli (PIN)",
  ...storyDoc("`mask` haneleri • ile gizler.", `<OtpInput length={4} mask accessibilityLabel="PIN" />`),
  render: () => <OtpInput length={4} mask accessibilityLabel="PIN" />,
};

export const Separator: Story = {
  name: "Ayırıcılı",
  ...storyDoc("3+3 gruplama: üçüncü haneden sonra tire.", `<OtpInput separator={(i) => (i === 2 ? <Text muted>–</Text> : null)} />`),
  render: () => <OtpInput separator={(i) => (i === 2 ? <Text muted>–</Text> : null)} />,
};

export const Single: Story = {
  name: "Tek Alan Görünümü",
  ...storyDoc("`layout=\"single\"`: tek kutuda yuvalar; çizgi ortada (boşken) ya da altta.", `<OtpInput layout="single" />
<OtpInput layout="single" linePosition="bottom" inputMode="text" formatter={(c) => c.toLocaleUpperCase("tr")} />`),
  render: () => (
    <Stack>
      <OtpInput layout="single" />
      <OtpInput layout="single" linePosition="bottom" length={5} inputMode="text" formatter={(c) => c.toLocaleUpperCase("tr")} accessibilityLabel="Kupon kodu" />
    </Stack>
  ),
};

export const Variants: Story = {
  name: "Varyant ve Boyut",
  ...storyDoc("outline, soft, underlined; sm/lg.", `<OtpInput variant="underlined" size="sm" length={4} />`),
  render: () => (
    <Stack>
      <OtpInput variant="soft" length={4} />
      <OtpInput variant="underlined" length={4} />
      <OtpInput size="sm" length={4} />
      <OtpInput size="lg" length={4} />
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<OtpInput skeleton={isLoading} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Stack>
          <OtpInput skeleton={skeleton} defaultValue="482" />
          <OtpInput skeleton={skeleton} layout="single" />
        </Stack>
      )}
    </SkeletonDemo>
  ),
};
