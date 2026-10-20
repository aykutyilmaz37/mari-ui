import type { Meta, StoryObj } from "@storybook/react";
import { CalendarIcon, CreditCardIcon, PhoneIcon } from "lucide-react";
import { useState } from "react";
import { baseSizeArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, jsxProps, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Field } from "../field";
import { MaskedInput } from "./index";
import type { MaskedInputProps } from "./index";

const meta: Meta<typeof MaskedInput> = {
  title: "Veri Girişi/MaskedInput",
  component: MaskedInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Girişi sabit bir biçime zorlayan Input: telefon, kart numarası, tarih, plaka… `mask` kalıptır; `replacement`'taki " +
            "yer tutucu karakterler (varsayılan `_` → rakam) kullanıcı girişiyle dolar, geri kalanı sabit kalır. Input'la aynı " +
            "görünüm ve prop'lar. Maske kütüphanesi (@react-input/mask) yalnız bu bileşenle gelir: " +
            "`import { MaskedInput } from \"@mari-ui/components/masked-input\"`.",
          whenToUse: [
            "Uzunluğu ve biçimi sabit değerler — telefon, IBAN, kart, son kullanma tarihi, plaka.",
            "Kullanıcının ayraçları (parantez, boşluk, eğik çizgi) kendisinin yazmaması gereken alanlar.",
          ],
          whenNotToUse: [
            "Serbest metin ya da uzunluğu değişken değer — `Input`.",
            "Sayısal değer ve artır/azalt — `InputNumber`.",
            "Takvimden tarih seçimi — `DatePicker` (elle yazılan tarih için MaskedInput uygun).",
          ],
          a11y:
            "Görünür etiket (`Field`) ya da `aria-label` şart; kalıbı placeholder'da da gösterin. Mobilde doğru klavye için " +
            "`inputMode` verin (`tel`, `numeric`). `color=\"error\"` iken otomatik `aria-invalid`.",
        }),
      },
    },
  },
  argTypes: {
    mask: { control: "text", description: "Biçim kalıbı. `replacement`'taki anahtar karakterler girişle dolar." },
    replacement: { control: false, description: "Yer tutucu → kabul edilen karakter. Varsayılan: `{ _: /\\d/ }`." },
    placeholder: { control: "text" },
    size: baseSizeArgType,
    variant: { control: "select", options: ["outline", "soft", "ghost", "underlined"], description: "Kenarlık/arka plan stili." },
    color: { control: "select", options: ["primary", "accent", "success", "error", "warning", "info", "neutral"], description: "Odak/kenarlık rengi. `error`/`warning` doğrulama durumu olarak da işlev görür." },
    disabled: disabledArgType,
    allowClear: { control: "boolean", description: "Doluyken bir temizleme (X) butonu gösterir." },
    inputMode: { control: "select", options: ["text", "tel", "numeric"], description: "Mobil klavye türü." },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet.", table: { defaultValue: { summary: "false" } } },
    onChange: { action: "onChange" },
    onPressEnter: { action: "onPressEnter" },
    onClear: { action: "onClear" },
  },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
};
export default meta;
type Story = StoryObj<MaskedInputProps>;

export const Playground: Story = {
  ...storyDoc("Kalıbı ve diğer prop'ları canlı deneyin.", (args) => `<MaskedInput ${jsxProps(args)} />`),
  args: {
    "aria-label": "Cep telefonu",
    mask: "0(5__) ___ __ __",
    placeholder: "0(5__) ___ __ __",
    inputMode: "tel",
    allowClear: true,
    size: "md",
    variant: "outline",
    disabled: false,
    skeleton: false,
  },
};

export const Phone: Story = {
  name: "Telefon",
  ...storyDoc(
    "Cep telefonu: kalıptaki `0(5` sabit, kullanıcı yalnız kalan 9 rakamı yazar. `inputMode=\"tel\"` mobilde sayı klavyesini açar.",
    `<Field label="Cep telefonu" hint="Başında 0 olmadan yazın.">
  <MaskedInput mask="0(5__) ___ __ __" placeholder="0(5__) ___ __ __" type="tel" inputMode="tel" autoComplete="tel" icon={<PhoneIcon size={16} />} />
</Field>`
  ),
  render: () => (
    <Field label="Cep telefonu" hint="Başında 0 olmadan yazın.">
      <MaskedInput mask="0(5__) ___ __ __" placeholder="0(5__) ___ __ __" type="tel" inputMode="tel" autoComplete="tel" icon={<PhoneIcon size={16} />} />
    </Field>
  ),
};

export const PaymentCard: Story = {
  name: "Ödeme Kartı",
  ...storyDoc(
    "Kart numarası, son kullanma tarihi ve CVC — her biri kendi kalıbıyla. `autoComplete` değerleri tarayıcının kayıtlı kartı doldurmasını sağlar.",
    `<Field label="Kart numarası">
  <MaskedInput mask="____ ____ ____ ____" placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="cc-number" icon={<CreditCardIcon size={16} />} />
</Field>
<div className="grid grid-cols-2 gap-3">
  <Field label="Son kullanma">
    <MaskedInput mask="__/__" placeholder="AA/YY" inputMode="numeric" autoComplete="cc-exp" />
  </Field>
  <Field label="CVC">
    <MaskedInput mask="___" placeholder="000" inputMode="numeric" autoComplete="cc-csc" />
  </Field>
</div>`
  ),
  render: () => (
    <div className="flex flex-col gap-4">
      <Field label="Kart numarası">
        <MaskedInput mask="____ ____ ____ ____" placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="cc-number" icon={<CreditCardIcon size={16} />} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Son kullanma">
          <MaskedInput mask="__/__" placeholder="AA/YY" inputMode="numeric" autoComplete="cc-exp" />
        </Field>
        <Field label="CVC">
          <MaskedInput mask="___" placeholder="000" inputMode="numeric" autoComplete="cc-csc" />
        </Field>
      </div>
    </div>
  ),
};

function BirthDateDemo() {
  const [value, setValue] = useState("");
  const complete = /^\d{2}\.\d{2}\.\d{4}$/.test(value);
  return (
    <Field label="Doğum tarihi" hint={complete ? `Girilen: ${value}` : "GG.AA.YYYY"}>
      <MaskedInput mask="__.__.____" placeholder="GG.AA.YYYY" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} icon={<CalendarIcon size={16} />} />
    </Field>
  );
}

export const BirthDate: Story = {
  name: "Tarih (kontrollü)",
  ...storyDoc(
    "Kontrollü kullanım: `value` biçimli metni taşır (`12.05.1990`). Takvim gerekmeyen, elle yazılan tarihler için.",
    `const [value, setValue] = useState("");
const complete = /^\\d{2}\\.\\d{2}\\.\\d{4}$/.test(value);

<Field label="Doğum tarihi" hint={complete ? \`Girilen: \${value}\` : "GG.AA.YYYY"}>
  <MaskedInput mask="__.__.____" placeholder="GG.AA.YYYY" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} icon={<CalendarIcon size={16} />} />
</Field>`
  ),
  render: () => <BirthDateDemo />,
};

export const CustomReplacement: Story = {
  name: "Özel Yer Tutucu (Plaka, IBAN)",
  ...storyDoc(
    "`replacement` ile yer tutucunun kabul ettiği karakteri değiştirin: plakada harf + rakam, IBAN'da `TR` sabit ve rakamlar. Kalıba uymayan karakter yazılmaz.",
    `<Field label="Plaka">
  <MaskedInput mask="__ ___ __" replacement={{ _: /[\\dA-Z]/ }} placeholder="34 ABC 12" />
</Field>
<Field label="IBAN">
  <MaskedInput mask="TR__ ____ ____ ____ ____ ____ __" placeholder="TR00 0000 0000 0000 0000 0000 00" inputMode="numeric" />
</Field>`
  ),
  render: () => (
    <div className="flex flex-col gap-4">
      <Field label="Plaka">
        <MaskedInput mask="__ ___ __" replacement={{ _: /[\dA-Z]/ }} placeholder="34 ABC 12" />
      </Field>
      <Field label="IBAN">
        <MaskedInput mask="TR__ ____ ____ ____ ____ ____ __" placeholder="TR00 0000 0000 0000 0000 0000 00" inputMode="numeric" />
      </Field>
    </div>
  ),
};

export const WithClear: Story = {
  name: "Temizle",
  ...storyDoc(
    "`allowClear`: doluyken X butonu; tıklayınca alan boşalır (`onClear` çağrılır) ve odak alana döner.",
    `<MaskedInput aria-label="Cep telefonu" mask="(___) ___ __ __" defaultValue="(532) 123 45 67" inputMode="tel" allowClear />`
  ),
  render: () => (
    <MaskedInput aria-label="Cep telefonu" mask="(___) ___ __ __" defaultValue="(532) 123 45 67" inputMode="tel" allowClear />
  ),
};

export const States: Story = {
  name: "Durumlar ve Boyutlar",
  ...storyDoc(
    "Input'un tüm görünüm eksenleri geçerli: `size`, `variant`, `color` (doğrulama) ve `disabled`.",
    `<MaskedInput aria-label="Telefon (sm)" mask="(___) ___ __ __" placeholder="(___) ___ __ __" size="sm" />
<MaskedInput aria-label="Telefon (md)" mask="(___) ___ __ __" placeholder="(___) ___ __ __" size="md" />
<MaskedInput aria-label="Telefon (lg)" mask="(___) ___ __ __" placeholder="(___) ___ __ __" size="lg" />
<Field label="Kart numarası" error="Kart numarası 16 hane olmalı.">
  <MaskedInput mask="____ ____ ____ ____" defaultValue="4111 1111" inputMode="numeric" />
</Field>
<MaskedInput aria-label="Kayıtlı telefon" mask="(___) ___ __ __" defaultValue="(532) 123 45 67" variant="soft" disabled />`
  ),
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <MaskedInput key={size} aria-label={`Telefon (${size})`} mask="(___) ___ __ __" placeholder="(___) ___ __ __" size={size} />
      ))}
      <Field label="Kart numarası" error="Kart numarası 16 hane olmalı.">
        <MaskedInput mask="____ ____ ____ ____" defaultValue="4111 1111" inputMode="numeric" />
      </Field>
      <MaskedInput aria-label="Kayıtlı telefon" mask="(___) ___ __ __" defaultValue="(532) 123 45 67" variant="soft" disabled />
    </div>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    SKELETON_STORY_DOC,
    `<Field label="Cep telefonu">
  <MaskedInput mask="0(5__) ___ __ __" defaultValue="0(532) 123 45 67" skeleton={isLoading} />
</Field>`
  ),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Field label="Cep telefonu">
          <MaskedInput mask="0(5__) ___ __ __" defaultValue="0(532) 123 45 67" skeleton={skeleton} />
        </Field>
      )}
    </SkeletonDemo>
  ),
};
