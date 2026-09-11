import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { OtpInput } from "./OtpInput";

type Story = StoryObj<typeof OtpInput>;

const meta: Meta<typeof OtpInput> = {
  title: "Veri Girişi/OtpInput",
  component: OtpInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Tek karakterlik kutucuklar dizisi olarak render edilen doğrulama kodu (OTP/SMS kodu) girişi. Ok " +
            "tuşlarıyla gezinme ve yapıştırma (birden fazla karakter otomatik dağıtılır) desteklenir.",
          whenToUse: ["SMS/e-posta ile gönderilen sabit uzunluklu doğrulama kodu girişi için."],
          whenNotToUse: ["Serbest uzunlukta bir kod/parola için — `Input`."],
          a11y: "Her kutucuk bağımsız bir `Input`tır; Ok tuşları ve Backspace kutucuklar arası gezinmeyi klavyeyle sağlar.",
        }),
      },
    },
  },
  argTypes: {
    length: { control: { type: "number", min: 1, max: 12 }, description: "Kutucuk sayısı." },
    mask: { control: "boolean", description: "Girilen karakterleri `•` ile gizler." },
    disabled: disabledArgType,
    size: baseSizeArgType,
    variant: { control: "select", options: ["outline", "soft", "ghost", "underlined"], description: "Kenarlık/arka plan stili." },
    color: { ...colorArgType, description: "Odak/kenarlık rengi." },
    shape: { control: "select", options: ["default", "pill", "square"], description: "Köşe geometrisi." },
    separator: { control: "text", description: "Kutucuklar arası ayırıcı (örn. \"-\")." },
    onChange: { action: "onChange", description: "Tüm kutucuklar dolduğunda, birleşik değerle çağrılır." },
    onInput: { action: "onInput" },
  },
};
export default meta;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    length: 6,
    mask: false,
    disabled: false,
    size: "md",
    variant: "outline",
  },
};

export const AllVariants: Story = {
  name: "Tüm Varyant",
  ...storyDoc("4 kenarlık/arka plan stili (`outline`/`soft`/`ghost`/`underlined`)."),
  render: () => {
    const variants = ["outline", "soft", "ghost", "underlined"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="font-semibold capitalize">{variant}</h3>
            <OtpInput length={4} variant={variant} />
          </div>
        ))}
      </div>
    );
  },
};

export const Masked: Story = {
  name: "Gizli (Maskeli)",
  ...storyDoc("`mask` — girilen karakterleri `•` ile gizler (şifre benzeri gizli kodlar için)."),
  args: {
    length: 4,
    mask: true,
    size: "md",
    variant: "soft",
  },
};

export const WithSeparators: Story = {
  name: "Ayırıcılı",
  ...storyDoc("`separator` — kutucuklar arasına sabit bir ayırıcı (örn. \"-\") koyar."),
  args: {
    length: 6,
    mask: false,
    separator: "-",
    size: "lg",
  },
};

const ControlledExample = () => {
  const [value, setValue] = useState("123");

  return (
    <div className="flex flex-col gap-4">
      <OtpInput value={value} onChange={(v) => setValue(v)} length={6} />
      <p className="text-sm text-mari-muted">Güncel: {value || "boş"}</p>
    </div>
  );
};

export const Controlled: Story = {
  name: "Controlled Örneği",
  ...storyDoc("`value`+`onChange` ile tamamen dışarıdan yönetilir."),
  render: () => <ControlledExample />,
};
