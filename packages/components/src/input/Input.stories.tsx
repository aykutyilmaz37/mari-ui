import type { Meta, StoryObj } from "@storybook/react";
import { EyeIcon, EyeOffIcon, PhoneIcon, Search, XIcon } from "lucide-react";
import { useState } from "react";
import { baseSizeArgType, disabledArgType } from "../lib/storybookArgTypes";
import { Input } from "./index";
import type { InputProps } from "./index";

const meta: Meta<typeof Input> = {
  title: "Veri Girişi/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Tek satırlık metin girişi. Maske (`mask`), karakter sayacı (`showCount`), temizleme butonu " +
          "(`allowClear`) ve şifre görünürlük toggle'ı destekler. `useControllableState` ile hem controlled hem " +
          "uncontrolled kullanılabilir. `error`/`warning` doğrulama durumu `color` prop'unun kendisidir (eski " +
          "`status` prop'u hâlâ çalışır ama deprecated).",
      },
    },
  },
  argTypes: {
    placeholder: { control: "text", description: "Boşken gösterilecek ipucu metni." },
    size: baseSizeArgType,
    variant: { control: "select", options: ["outline", "soft", "ghost", "underlined"], description: "Kenarlık/arka plan stili." },
    color: { control: "select", options: ["primary", "accent", "success", "error", "warning", "info", "neutral"], description: "Odak/kenarlık rengi. `error`/`warning` doğrulama durumu olarak da işlev görür." },
    shape: { control: "select", options: ["default", "pill", "square"], description: "Köşe geometrisi." },
    mask: { control: "text", description: "Girişi belirli bir formata zorlar (örn. telefon numarası)." },
    replacement: { control: "object", description: "Maskedeki yer tutucu karakterlerin karşılık geldiği regex'ler." },
    disabled: disabledArgType,
    allowClear: { control: "boolean", description: "Doluyken bir temizleme (X) butonu gösterir." },
    maxLength: { control: "number" },
    onChange: { action: "onChange" },
    onPressEnter: { action: "onPressEnter" },
    onClear: { action: "onClear" },
    visibilityToggle: { control: "boolean", description: "`type=\"password\"` iken bir göster/gizle butonu ekler." },
    visibilityIconRender: { control: false },
  },
};
export default meta;

export const Playground: StoryObj<InputProps & { enableMask: boolean }> = {
  render: (args) => {
    const { enableMask, mask, replacement, visibilityToggle, type, ...rest } = args as InputProps & { enableMask?: boolean };
    // İç içe ternary yerine ayrık if (Faz 8, SonarJS `no-nested-conditional`).
    let resolvedType = type;
    if (visibilityToggle === true) resolvedType = "password";
    else if (type === "password") resolvedType = "text";

    return <Input {...rest} type={resolvedType} {...(enableMask ? { mask, replacement } : {})} visibilityToggle={visibilityToggle} />;
  },
  argTypes: {
    enableMask: { control: "boolean", description: "(Sadece bu story'de) maskeyi açar/kapatır." },
  },
  args: {
    placeholder: "Bir şeyler yazın...",
    allowClear: false,
    showCount: false,
    size: "md",
    variant: "outline",
    maxLength: 100,
    enableMask: false,
    mask: "0(5__) ___ __ __",
    replacement: { _: /\d/ },
    type: "text",
    visibilityToggle: false,
    visibilityIconRender: (visible: boolean) => (visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />),
  },
};

export const AllVariants: StoryObj = {
  name: "Tüm Varyant × Boyut",
  render: () => {
    const variants = ["outline", "soft", "ghost", "underlined"] as const;
    const sizes = ["lg", "md", "sm"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="font-semibold capitalize">{variant}</h3>
            <div className="flex gap-4 flex-wrap">
              {sizes.map((size) => (
                <Input key={`${variant}-${size}`} size={size} variant={variant} placeholder={`${variant} - ${size}`} icon={<Search size={16} />} allowClear={{ clearIcon: <XIcon size={16} /> }} showCount maxLength={30} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const ErrorStatus: StoryObj<InputProps> = {
  name: "Hata Durumu",
  args: {
    placeholder: "Hata durumu...",
    color: "error",
    icon: <Search size={16} />,
    allowClear: true,
  },
};

export const WarningStatus: StoryObj<InputProps> = {
  name: "Uyarı Durumu",
  args: {
    placeholder: "Uyarı durumu...",
    color: "warning",
    icon: <Search className="w-4 h-4 text-mari-muted" />,
    allowClear: true,
  },
};

export const PressEnterAction: StoryObj<InputProps> = {
  name: "Enter ile Tetikleme",
  args: {
    placeholder: "Tetiklemek için Enter'a basın",
    onPressEnter: () => alert("Enter'a basıldı!"),
  },
};

export const CustomCountFormatter: StoryObj<InputProps> = {
  name: "Özel Karakter Sayacı",
  args: {
    placeholder: "Özel sayaç formatı",
    maxLength: 50,
    showCount: true,
    count: {
      formatter: ({ count, maxLength }) => `${maxLength! - count} karakter kaldı`,
    },
  },
};

const ControlledInputExample = () => {
  const [value, setValue] = useState("Başlangıç değeri");

  return (
    <div className="flex flex-col gap-2 p-4">
      <Input value={value} onChange={(e) => setValue(e.target.value)} onClear={() => setValue("")} allowClear={{ clearIcon: <XIcon size={16} /> }} placeholder="Controlled + Varsayılan" />
      <span className="text-sm text-mari-muted">Güncel değer: {value}</span>
    </div>
  );
};

export const ControlledAndDefault: StoryObj = {
  name: "Controlled Örneği",
  render: () => <ControlledInputExample />,
};

export const MaskedInput: StoryObj<InputProps> = {
  name: "Maskeli",
  args: {
    placeholder: "0(5__) ___ __ __",
    mask: "0(5__) ___ __ __",
    replacement: { _: /\d/ },
    icon: <PhoneIcon size={16} />,
    allowClear: { clearIcon: <XIcon size={16} /> },
    showCount: true,
    size: "md",
    variant: "outline",
    maxLength: 16,
  },
};
