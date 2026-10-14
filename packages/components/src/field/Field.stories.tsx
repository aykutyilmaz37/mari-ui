/**
 * Faz 16.1: gerçek senaryolar — kayıt formu (gönderimde doğrulama), ayarlar
 * sayfası (yatay düzen), tüm kontrollerle bağlantılar. "Show code" her
 * story'de `storyDoc`'un 2. argümanıyla verilen kopyalanabilir kod. Story
 * seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Field } from "./Field";
import { Button } from "../button";
import { Input, OtpInput, Textarea } from "../input";
import { InputNumber } from "../input-number";
import { RadioGroup } from "../radio";
import { Segmented } from "../segmented";
import { Select } from "../select";
import { Switch } from "../switch";

const meta: Meta<typeof Field> = {
  title: "Veri Girişi/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      story: { height: "520px" },
      description: {
        component: componentDoc({
          summary:
            "Bir form alanının etiketi, ipucu, hata metni ve zorunlu işareti — ve bunların kontrole bağlanması. Field bir " +
            "kontrol değil; içine koyduğunuz Input, Textarea, Select, InputNumber, OtpInput, RadioGroup ya da Segmented'a " +
            "id, `aria-describedby`, hata durumu (kırmızı kenarlık + `aria-invalid`), `required` ve `disabled` verir. " +
            "Kontrole açıkça verdiğiniz prop her zaman kazanır. Doğrulama YOK: kuralları react-hook-form / zod gibi " +
            "kütüphaneniz yürütür, Field yalnız sonucu (`error`) gösterir.",
          whenToUse: ["Etiketli her form alanı — id'leri ve aria bağlantılarını elle eşlemek yerine."],
          whenNotToUse: [
            "Kendi etiketi olan tek Checkbox/Switch (\"Beni hatırla\") — onlar zaten etiketli.",
            "Etiketsiz arama kutusu gibi araç çubuğu kontrolleri — `aria-label` yeter.",
          ],
          a11y:
            "Tek alanlı kontrollerde `<label htmlFor>` (etikete tıklamak alanı odaklar); gruplarda (RadioGroup, Segmented, " +
            "kutucuklu OtpInput) etiket grubun `aria-labelledby`si olur. İpucu ya da hata `aria-describedby` ile okunur; hata " +
            "varken ipucu gizlenir. Hata metni hep DOM'da duran bir `aria-live=\"polite\"` bölgede — gönderimde ortaya çıkınca " +
            "duyurulur. Yıldız yalnız görsel; zorunluluk kontrolün `required`ıyla okunur.",
        }),
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text", description: "Verilince kontrol hata durumuna geçer; metin ipucunun yerine okunur." },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    layout: { control: "inline-radio", options: ["vertical", "horizontal"] },
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

/* ─────────────────────────── 1. Kayıt formu ─────────────────────────── */

const countries = [
  { value: "TR", label: "Türkiye" },
  { value: "DE", label: "Almanya" },
  { value: "NL", label: "Hollanda" },
  { value: "GB", label: "Birleşik Krallık" },
];

/** Demo doğrulama (gerçek projede zod vb.): "@" ve ardından nokta. */
function emailError(email: string): string | undefined {
  if (!email) return "E-posta gerekli";
  const at = email.indexOf("@");
  const valid = at > 0 && email.indexOf(".", at) > at + 1 && !email.endsWith(".") && !/\s/.test(email);
  return valid ? undefined : "Geçerli bir e-posta girin";
}

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { label: "E-posta", hint: "İş adresiniz", error: "", required: true, disabled: false, layout: "vertical" },
  render: (args) => (
    <div className="max-w-md">
      <Field {...args}>
        <Input type="email" placeholder="ad@sirket.com" />
      </Field>
    </div>
  ),
};

export const SignupForm: Story = {
  name: "Kayıt Formu (Gönderimde Doğrulama)",
  ...storyDoc(
    "Hatalar \"Hesap oluştur\"a basınca görünür ve alanlara bağlanır; düzelttikçe kaybolur. Doğrulama story'nin kendi " +
      "basit fonksiyonu — gerçek projede react-hook-form/zod. Field yalnız `error`ı gösterir.",
    `
const [email, setEmail] = useState("");
const [country, setCountry] = useState<string | number | null>(null);
const errors = {
  email: email.includes("@") ? undefined : "Geçerli bir e-posta girin",
  country: country === null ? "Ülke seçin" : undefined,
};

<Field label="E-posta" hint="Faturalar bu adrese gelir" required error={errors.email}>
  <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
</Field>
<Field label="Ülke" required error={errors.country}>
  <Select
    showSearch
    options={[{ value: "TR", label: "Türkiye" }, { value: "DE", label: "Almanya" }, { value: "NL", label: "Hollanda" }]}
    value={country}
    onChange={setCountry}
  />
</Field>
<Field label="Ekip büyüklüğü" hint="Planı buna göre öneririz">
  <InputNumber min={1} max={500} precision={0} />
</Field>

// react-hook-form ile:
<Field label="E-posta" error={formState.errors.email?.message} required>
  <Input {...register("email", { required: "E-posta gerekli" })} />
</Field>`
  ),
  render: () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [country, setCountry] = useState<string | number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [done, setDone] = useState(false);

    const errors = {
      email: emailError(email),
      password: password.length < 8 ? `En az 8 karakter (${password.length}/8)` : undefined,
      country: country === null ? "Ülke seçin" : undefined,
    };
    const shown = (key: keyof typeof errors) => (submitted ? errors[key] : undefined);

    if (done) return <p className="text-sm text-mari-success">Hesap oluşturuldu.</p>;

    return (
      <form
        noValidate
        className="grid max-w-md gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (!Object.values(errors).some(Boolean)) setDone(true);
        }}
      >
        <Field label="E-posta" hint="Faturalar bu adrese gelir" required error={shown("email")}>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Şifre" hint="En az 8 karakter" required error={shown("password")}>
          <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Ülke" required error={shown("country")}>
          <Select showSearch options={countries} value={country} onChange={(v) => setCountry(v)} />
        </Field>
        <Field label="Ekip büyüklüğü" hint="Planı buna göre öneririz">
          <InputNumber min={1} max={500} precision={0} defaultValue={5} />
        </Field>
        <Button htmlType="submit" className="justify-self-start">
          Hesap oluştur
        </Button>
      </form>
    );
  },
};

/* ─────────────────────────── 2. Ayarlar (yatay) ─────────────────────────── */

export const SettingsHorizontal: Story = {
  name: "Ayarlar Sayfası (Yatay Düzen)",
  ...storyDoc(
    "`layout=\"horizontal\"`: etiket solda sabit sütunda, alan sağda — ayar sayfaları. Dar ekranda (sm altı) alt alta.",
    `
<Field layout="horizontal" label="Görünen ad" hint="Yorumlarda görünür">
  <Input defaultValue="Deniz Kaya" />
</Field>
<Field layout="horizontal" label="Bildirim sıklığı">
  <Segmented options={["Anında", "Günlük", "Haftalık"]} />
</Field>`
  ),
  render: () => (
    <div className="max-w-2xl divide-y divide-mari-border rounded-xl border border-mari-border bg-mari-surface">
      {[
        <Field key="name" layout="horizontal" label="Görünen ad" hint="Yorumlarda ve bahsetmelerde görünür">
          <Input defaultValue="Deniz Kaya" />
        </Field>,
        <Field key="lang" layout="horizontal" label="Dil">
          <Select defaultValue="tr" options={[{ value: "tr", label: "Türkçe" }, { value: "en", label: "English" }]} />
        </Field>,
        <Field key="freq" layout="horizontal" label="Bildirim sıklığı" hint="Önemli uyarılar her zaman anında gelir">
          <Segmented options={["Anında", "Günlük", "Haftalık"]} defaultValue="Günlük" />
        </Field>,
        <Field key="bio" layout="horizontal" label="Hakkında">
          <Textarea rows={3} defaultValue="Ürün tasarımcısı, İstanbul." />
        </Field>,
      ].map((field) => (
        <div key={field.key} className="p-4">
          {field}
        </div>
      ))}
    </div>
  ),
};

/* ─────────────────────────── 3. Tüm kontroller ─────────────────────────── */

export const AllControls: Story = {
  name: "Desteklenen Kontroller",
  ...storyDoc(
    "Tek alanlı kontroller `<label htmlFor>` ile, gruplar (RadioGroup, Segmented, kutucuklu OtpInput) grubun adıyla " +
      "bağlanır. Hata ve devre dışı her birinde. Switch/Checkbox gibi kendi etiketi olanlarda Field gerekmez.",
    `
<Field label="Not" hint="İsteğe bağlı">
  <Textarea rows={2} />
</Field>
<Field label="Adet" error="Stokta en fazla 8 adet var">
  <InputNumber defaultValue={12} max={8} />
</Field>
<Field label="Teslimat" required error="Bir teslimat seçeneği seçin">
  <RadioGroup options={["Standart", "Hızlı (+49 ₺)"]} />
</Field>
<Field label="Faturalama" hint="Yıllıkta %20 indirim">
  <Segmented options={["Aylık", "Yıllık"]} />
</Field>
<Field label="Doğrulama kodu" hint="Telefonunuza gelen 4 haneli kod">
  <OtpInput length={4} />
</Field>
<Field label="Ülke" disabled hint="Hesap ülkesi değiştirilemez">
  <Select defaultValue="TR" options={[{ value: "TR", label: "Türkiye" }, { value: "DE", label: "Almanya" }]} />
</Field>`
  ),
  render: () => (
    <div className="grid max-w-3xl gap-x-6 gap-y-5 sm:grid-cols-2">
      <Field label="Not" hint="İsteğe bağlı">
        <Textarea rows={2} />
      </Field>
      <Field label="Adet" error="Stokta en fazla 8 adet var">
        <InputNumber defaultValue={12} max={8} />
      </Field>
      <Field label="Teslimat" required error="Bir teslimat seçeneği seçin">
        <RadioGroup options={["Standart", "Hızlı (+49 ₺)"]} />
      </Field>
      <Field label="Faturalama" hint="Yıllıkta %20 indirim">
        <Segmented options={["Aylık", "Yıllık"]} />
      </Field>
      <Field label="Doğrulama kodu" hint="Telefonunuza gelen 4 haneli kod">
        <OtpInput length={4} />
      </Field>
      <Field label="Ülke" disabled hint="Hesap ülkesi değiştirilemez">
        <Select defaultValue="TR" options={countries} />
      </Field>
      <div className="sm:col-span-2">
        <Switch label="Pazarlama e-postaları" defaultChecked />
      </div>
    </div>
  ),
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Field label="Ad soyad" hint="Faturada görünecek ad." skeleton>
  <Input />
</Field>`),
  render: () => <SkeletonDemo>{(skeleton) => (
        <div className="flex max-w-sm flex-col gap-4">
          <Field label="Ad soyad" hint="Faturada görünecek ad." skeleton={skeleton}>
            <Input defaultValue="Ayşe Demir" />
          </Field>
          <Field label="Bildirim sıklığı" skeleton={skeleton}>
            <Segmented options={["Anında", "Günlük", "Haftalık"]} />
          </Field>
        </div>
      )}</SkeletonDemo>,
};
