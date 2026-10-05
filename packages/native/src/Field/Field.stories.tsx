import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Field } from "./Field";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Input, OtpInput, Textarea } from "../Input";
import { RadioGroup } from "../Radio";
import { Segmented } from "../Segmented";
import { Switch } from "../Switch";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Field> = {
  title: "Native/Veri Girişi/Field",
  component: Field,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Form alanı çerçevesi: etiket + kontrol + ipucu/hata. İçindeki mari-ui kontrolüne etiketini, hatasını, devre dışı ve iskelet durumunu geçirir.",
    whenToUse: ["Her form kontrolü için görünür etiket.", "Doğrulama mesajını alanın hemen altında göstermek."],
    whenNotToUse: ["Etiketi kontrolün kendisinde olanlar tek başına (Checkbox/Switch `label`)."],
    vsWeb: "Prop'lar aynı (`htmlFor` yok). RN'de etiket–alan bağı olmadığı için etiket kontrolün `accessibilityLabel`ı (zorunluysa \", zorunlu\" eklenir), hata/ipucu `accessibilityHint`i olur; görünür etiket ekran okuyucuda iki kez okunmasın diye gizlenir. Hata canlı bölgedir (yazınca duyurulur). Etiket HIG Subheadline 15/20, ipucu/hata Footnote 13/18. `horizontal`: etiket solda %35.",
  }) } } },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    layout: { control: "select", options: ["vertical", "horizontal"] },
    skeleton: { control: "boolean" },
  },
  args: { label: "E-posta", hint: "Sipariş bilgilerini buraya göndereceğiz.", required: true, disabled: false, layout: "vertical", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Field>;

export const Playground: Story = {
  ...storyDoc("Etiket, ipucu, hata, zorunluluk ve düzeni deneyin."),
  render: (args) => (
    <View style={{ alignSelf: "stretch" }}>
      <Field {...args}>
        <Input type="email" placeholder="ad@alan.com" />
      </Field>
    </View>
  ),
};

/** Basit biçim kontrolü: "ad@alan.uzantı". */
const looksLikeEmail = (value: string) => {
  const [local = "", domain = ""] = value.trim().split("@");
  return local !== "" && domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
};

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const errors = {
    name: submitted && !name.trim() ? "Adınızı girin." : undefined,
    email: submitted && !looksLikeEmail(email) ? "Geçerli bir e-posta girin (ör. ad@alan.com)." : undefined,
    terms: submitted && !terms ? "Devam etmek için onaylayın." : undefined,
  };
  return (
    <View style={{ alignSelf: "stretch", gap: 16 }}>
      <Field label="Ad soyad" required error={errors.name}>
        <Input value={name} onChangeText={setName} autoComplete="name" />
      </Field>
      <Field label="E-posta" required hint="Sipariş bilgilerini buraya göndereceğiz." error={errors.email}>
        <Input type="email" value={email} onChangeText={setEmail} autoComplete="email" />
      </Field>
      <Field label="Onay" error={errors.terms}>
        <Checkbox checked={terms} onChange={setTerms} color={errors.terms ? "error" : undefined} label="Kullanım koşullarını kabul ediyorum" />
      </Field>
      <Button block onPress={() => setSubmitted(true)}>Hesap oluştur</Button>
    </View>
  );
}

export const SignUpForm: Story = {
  name: "Kayıt Formu (Gönderimde Doğrulama)",
  ...storyDoc(
    "Hatalar gönderimde görünür; düzelttikçe kalkar. Etiket ve hata kontrolün erişilebilir adı/ipucu olur.",
    `<Field label="E-posta" required hint="Sipariş bilgilerini buraya göndereceğiz." error={errors.email}>
  <Input type="email" value={email} onChangeText={setEmail} />
</Field>`
  ),
  render: () => <SignUp />,
};

export const Settings: Story = {
  name: "Ayarlar Sayfası (Yatay Düzen)",
  ...storyDoc("`layout=\"horizontal\"`: etiket solda, kontrol sağda.", `<Field layout="horizontal" label="Dil">
  <Segmented options={["Türkçe", "English"]} />
</Field>`),
  render: () => (
    <View style={{ alignSelf: "stretch", gap: 8 }}>
      <Field layout="horizontal" label="Görünen ad">
        <Input defaultValue="Aykut" />
      </Field>
      <Field layout="horizontal" label="Dil">
        <Segmented block options={["Türkçe", "English"]} />
      </Field>
      <Field layout="horizontal" label="Bülten">
        <Switch defaultChecked />
      </Field>
    </View>
  ),
};

export const Controls: Story = {
  name: "Desteklenen Kontroller",
  ...storyDoc("Field'ın etiket/hata/iskelet aktardığı kontroller.", `<Field label="Teslimat"><RadioGroup options={["Standart", "Hızlı"]} /></Field>`),
  render: () => (
    <Stack>
      <Field label="Not" hint="İsteğe bağlı.">
        <Textarea rows={2} />
      </Field>
      <Field label="Doğrulama kodu">
        <OtpInput length={4} />
      </Field>
      <Field label="Teslimat">
        <RadioGroup orientation="horizontal" defaultValue="Standart" options={["Standart", "Hızlı"]} />
      </Field>
      <Field label="Dönem">
        <Segmented options={["Gün", "Hafta", "Ay"]} />
      </Field>
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Field label="E-posta" hint="…" skeleton={isLoading}>
  <Input defaultValue={user.email} />
</Field>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View style={{ gap: 16 }}>
          <Field label="E-posta" hint="Sipariş bilgilerini buraya göndereceğiz." skeleton={skeleton}>
            <Input defaultValue="aykut@ornek.com" />
          </Field>
          <Field label="Dönem" skeleton={skeleton}>
            <Segmented options={["Gün", "Hafta", "Ay"]} />
          </Field>
        </View>
      )}
    </SkeletonDemo>
  ),
};
