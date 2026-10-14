import type { Meta, StoryObj } from "@storybook/react";
import { AtSign, Lock, PhoneIcon, Search } from "lucide-react";
import { useState } from "react";
import { baseSizeArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, jsxProps, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
import { Input } from "./index";
import type { InputProps } from "./index";

const meta: Meta<typeof Input> = {
  title: "Veri Girişi/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Tek satırlık metin girişi. Maske (`mask`), karakter sayacı (`showCount`), temizleme butonu " +
            "(`allowClear`) ve şifre görünürlük toggle'ı destekler. `useControllableState` ile hem controlled hem " +
            "uncontrolled kullanılabilir.",
          whenToUse: [
            "Bir formda tek satırlık serbest metin, sayı, telefon (`mask`) veya şifre girişi için.",
            "Doğrulama durumunu görsel olarak göstermek için — `color=\"error\"`/`\"warning\"` (eski `status` prop'u hâlâ çalışır, deprecated).",
          ],
          whenNotToUse: [
            "Çok satırlı metin için — `Textarea`.",
            "Sabit uzunlukta kod/OTP girişi için — `OtpInput`.",
            "Bir listeden filtreli seçim için — `AutoComplete`.",
          ],
          a11y:
            "Her alanın görünür bir etiketi olmalı (`<label htmlFor>` + `id`, ya da `aria-label`) — placeholder etiket sayılmaz. " +
            "`color=\"error\"` iken otomatik `aria-invalid=\"true\"`; hata metnini `aria-describedby` ile bağlayın. Temizle ve şifre " +
            "butonları adlandırılmıştır (`clearLabel`). Odakta kenarlık rol rengine döner (≥3:1) ve yumuşak bir hale çıkar. " +
            "Mobilde metin 16px'tir (iOS odakta sayfayı yakınlaştırmasın); dokunmatikte tıklama alanı görünmez biçimde 44px'e genişler.",
        }),
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
    disabled: disabledArgType,
    allowClear: { control: "boolean", description: "Doluyken bir temizleme (X) butonu gösterir." },
    type: { control: "select", options: ["text", "email", "password", "tel", "number"], description: "Native input tipi. `password` göster/gizle butonu ekler." },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet.", table: { defaultValue: { summary: "false" } } },
    icon: { control: "select", options: ["yok", "Search", "AtSign"], mapping: { yok: undefined, Search: <Search size={16} />, AtSign: <AtSign size={16} /> }, description: "Alanın başında/sonunda ikon." },
    maxLength: { control: "number" },
    onChange: { action: "onChange" },
    onPressEnter: { action: "onPressEnter" },
    onClear: { action: "onClear" },
    visibilityToggle: { control: "boolean", description: "`type=\"password\"` iken bir göster/gizle butonu ekler." },
    visibilityIconRender: { control: false },
    replacement: { control: false },
  },
};
export default meta;

const Field = ({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium text-mari-foreground">
      {label}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="text-xs text-mari-error">
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${id}-hint`} className="text-xs text-mari-muted">
          {hint}
        </p>
      )
    )}
  </div>
);

export const Playground: StoryObj<InputProps> = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    "aria-label": "Örnek alan",
    placeholder: "Bir şeyler yazın...",
    type: "text",
    allowClear: true,
    showCount: false,
    size: "md",
    variant: "outline",
    maxLength: 100,
    disabled: false,
    skeleton: false,
  },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
};

function SignUpFormDemo() {
  const [email, setEmail] = useState("aykut@ornek");
  // Basit kontrol (story için): bir "@" ve ardından noktalı bir alan adı.
  const [local = "", domain = ""] = email.split("@");
  const looksValid = local !== "" && domain.includes(".") && !domain.endsWith(".");
  const emailError = email && !looksValid ? "Geçerli bir e-posta adresi girin (ör. ad@alan.com)." : undefined;
  return (
    <form className="grid max-w-md grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
      <Field id="signup-name" label="Ad">
        <Input id="signup-name" name="givenName" autoComplete="given-name" placeholder="Aykut" />
      </Field>
      <Field id="signup-surname" label="Soyad">
        <Input id="signup-surname" name="familyName" autoComplete="family-name" placeholder="Yılmaz" />
      </Field>
      <div className="sm:col-span-2">
        <Field id="signup-email" label="E-posta" error={emailError}>
          <Input
            id="signup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            icon={<AtSign size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onClear={() => setEmail("")}
            allowClear
            color={emailError ? "error" : undefined}
            aria-describedby={emailError ? "signup-email-error" : undefined}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="signup-password" label="Şifre" hint="En az 8 karakter, bir rakam içermeli.">
          <Input id="signup-password" type="password" autoComplete="new-password" icon={<Lock size={16} />} aria-describedby="signup-password-hint" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="signup-phone" label="Cep telefonu">
          <Input id="signup-phone" type="tel" inputMode="tel" autoComplete="tel" mask="0(5__) ___ __ __" placeholder="0(5__) ___ __ __" icon={<PhoneIcon size={16} />} />
        </Field>
      </div>
    </form>
  );
}

export const SignUpForm: StoryObj = {
  name: "Kayıt Formu (etiketli, doğrulamalı)",
  ...storyDoc(
    "Gerçek bir form: her alanın görünür etiketi, yardımcı metni ve alanın hemen altında hata mesajı (`aria-describedby` ile bağlı). " +
      "Mobil klavye ve otomatik doldurma için `type`/`inputMode`/`autoComplete`. 640px altında tek sütun. E-postayı düzeltin — hata kalkar.",
    `<label htmlFor="email">E-posta</label>
<Input
  id="email"
  type="email"
  inputMode="email"
  autoComplete="email"
  icon={<AtSign size={16} />}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  color={error ? "error" : undefined}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <p id="email-error" className="text-xs text-mari-error">{error}</p>}`
  ),
  render: () => <SignUpFormDemo />,
};

export const PressEnterAction: StoryObj = {
  name: "Enter ile Tetikleme",
  ...storyDoc(
    "`onPressEnter` — Enter'a bağlı eylemler (listeye ekleme, gönderme). Mobil klavyede tuş etiketi için `enterKeyHint`.",
    `<Input
  aria-label="Listeye ekle"
  enterKeyHint="done"
  value={draft}
  onChange={(e) => setDraft(e.target.value)}
  onPressEnter={() => { addItem(draft); setDraft(""); }}
/>`
  ),
  render: () => <PressEnterDemo />,
};

export const CustomCountFormatter: StoryObj<InputProps> = {
  name: "Özel Karakter Sayacı",
  ...storyDoc(
    "`count.formatter` ile varsayılan `n / max` yerine özel bir metin gösterilebilir.",
    (args) => `<Input ${jsxProps(args, { skip: ["count"] })} count={{ formatter: ({ count, maxLength }) => \`\${maxLength - count} karakter kaldı\` }} />`
  ),
  args: {
    "aria-label": "Ürün başlığı",
    placeholder: "Ürün başlığı",
    maxLength: 50,
    showCount: true,
    count: {
      formatter: ({ count, maxLength }) => `${maxLength! - count} karakter kaldı`,
    },
  },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
};

export const MaskedInput: StoryObj<InputProps> = {
  name: "Maskeli",
  ...storyDoc("`mask`+`replacement` ile girişi bir formata zorlar (örn. telefon numarası). Mobilde sayısal klavye için `inputMode=\"tel\"`."),
  args: {
    "aria-label": "Cep telefonu",
    placeholder: "0(5__) ___ __ __",
    mask: "0(5__) ___ __ __",
    inputMode: "tel",
    icon: <PhoneIcon size={16} />,
    allowClear: true,
  },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
};

function InputSkeleton() {
  return (
    <SkeletonDemo>
      {(skeleton) => (
        <div className="flex max-w-sm flex-col gap-4">
          <Field id="sk-name" label="Firma adı">
            <Input id="sk-name" skeleton={skeleton} defaultValue="Mari Yazılım A.Ş." />
          </Field>
          <Field id="sk-tax" label="Vergi no">
            <Input id="sk-tax" skeleton={skeleton} size="lg" defaultValue="1234567890" />
          </Field>
        </div>
      )}
    </SkeletonDemo>
  );
}

export const AllVariants: StoryObj = {
  name: "Tüm Varyant × Boyut",
  ...storyDoc(
    "4 kenarlık/arka plan stili (`outline`/`soft`/`ghost`/`underlined`) × 3 boyut. `underlined` her zaman köşesizdir.",
    `<Input variant="outline" size="md" aria-label="Ara" icon={<Search size={16} />} allowClear />
<Input variant="soft" size="md" aria-label="Ara" />
<Input variant="ghost" size="md" aria-label="Ara" />
<Input variant="underlined" size="md" aria-label="Ara" />`
  ),
  render: () => {
    const variants = ["outline", "soft", "ghost", "underlined"] as const;
    const sizes = ["lg", "md", "sm"] as const;

    return (
      <div className="flex flex-col gap-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="text-sm font-semibold text-mari-foreground">{variant}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {sizes.map((size) => (
                <Input key={`${variant}-${size}`} aria-label={`${variant} ${size}`} size={size} variant={variant} placeholder={`Ürün ara (${size})`} icon={<Search size={16} />} allowClear />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const ValidationStates: StoryObj = {
  name: "Doğrulama Durumları",
  ...storyDoc(
    "`color=\"error\"` engelleyici hata (otomatik `aria-invalid`), `color=\"warning\"` engelleyici olmayan uyarı. Renge ek olarak metin de anlamı taşır.",
    `<Input id="iban" color="error" aria-describedby="iban-error" defaultValue="TR12 3456" />
<p id="iban-error">IBAN 26 karakter olmalı.</p>`
  ),
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <Field id="val-iban" label="IBAN" error="IBAN 26 karakter olmalı.">
        <Input id="val-iban" color="error" defaultValue="TR12 3456" aria-describedby="val-iban-error" allowClear />
      </Field>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="val-username" className="text-sm font-medium text-mari-foreground">
          Kullanıcı adı
        </label>
        <Input id="val-username" color="warning" defaultValue="aykut" aria-describedby="val-username-warn" />
        <p id="val-username-warn" className="text-xs text-mari-warning">
          Bu ad alınmış olabilir — kaydederken kontrol edeceğiz.
        </p>
      </div>
    </div>
  ),
};

function PressEnterDemo() {
  const [items, setItems] = useState<string[]>(["Süt", "Ekmek"]);
  const [draft, setDraft] = useState("");
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input
        aria-label="Listeye ekle"
        placeholder="Ürün yazıp Enter'a basın"
        enterKeyHint="done"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onPressEnter={() => {
          if (draft.trim()) setItems((prev) => [...prev, draft.trim()]);
          setDraft("");
        }}
      />
      <ul className="list-inside list-disc text-sm text-mari-foreground">
        {items.map((item, i) => (
          <li key={`${item}-${i}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export const Skeleton: StoryObj = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` — düzenleme formu verisi gelene kadar alanın kendi boyutunda yer tutucu. Etiketler gerçek kalır; yalnızca değer beklenir.",
    `<label htmlFor="company">Firma adı</label>
<Input id="company" skeleton={isLoading} defaultValue={company.name} />`
  ),
  render: () => <InputSkeleton />,
};
