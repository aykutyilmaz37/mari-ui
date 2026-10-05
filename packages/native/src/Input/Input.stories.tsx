/**
 * Web `Veri Girişi/Input` story'lerinin native karşılıkları — aynı adlar,
 * aynı senaryolar (web ↔ native ölçümü bu story çiftleri üzerinden).
 * Etiketli örnekler native `Field` ile (etiket = erişilebilir ad, hata rengi Field.ten).
 */
import React, { useState } from "react";
import { Text, View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { AtSign, Lock, Phone, Search } from "lucide-react-native";
import { Input } from "./Input";
import { Field } from "../Field";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";
import { useTheme } from "../theme/useTheme";

const meta: Meta<typeof Input> = {
  title: "Native/Veri Girişi/Input",
  component: Input,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Tek satır metin girişi — web `Input` ile aynı renkler, varyantlar ve özellikler (boyutlar native ölçekte: 36/44/50): `variant`, `size`, `shape`, doğrulama rengi " +
            "(`color` / `status`), `icon`, `allowClear`, `type=\"password\"` göster/gizle, `showCount` / `count`, `mask`, `onPressEnter`, `skeleton`.",
          whenToUse: ["Kısa serbest metin: ad, e-posta, arama, telefon.", "Biçimli giriş (`mask`): telefon, IBAN."],
          whenNotToUse: ["Çok satırlı metin — Textarea (Dalga 1).", "Sabit seçenekler — Select / Segmented."],
          vsWeb:
            "`onChange` → `onChangeText` (doğrudan metin); `onPressEnter` klavyenin gönder / bitti tuşuyla. `type` klavyeyi seçer " +
            "(email, number, tel, url). Alanın herhangi bir yerine dokununca yazma alanı odaklanır; dokunma alanı 44px. " +
            "Mentions (`@` ile anma) native'de ayrı component olacak.",
        }),
      },
    },
  },
  args: { accessibilityLabel: "Örnek alan", placeholder: "Bir şeyler yazın...", type: "text", allowClear: true, showCount: false, size: "md", variant: "outline", maxLength: 100, disabled: false, skeleton: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["outline", "soft", "ghost", "underlined"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["default", "pill", "square"] },
    type: { control: "inline-radio", options: ["text", "password", "email", "number", "tel", "url", "search"] },
    color: { control: "select", options: [undefined, "primary", "success", "error", "warning", "info"] },
    icon: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

/** Web `max-w-sm` (384px). */
const Narrow = ({ children }: { children: React.ReactNode }) => <View style={{ width: "100%", maxWidth: 384, gap: 16 }}>{children}</View>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  render: (args) => (
    <Narrow>
      <Input {...args} />
    </Narrow>
  ),
};

function SignUpFormDemo() {
  const [email, setEmail] = useState("aykut@ornek");
  const [local = "", domain = ""] = email.split("@");
  const looksValid = local !== "" && domain.includes(".") && !domain.endsWith(".");
  const emailError = email && !looksValid ? "Geçerli bir e-posta adresi girin (ör. ad@alan.com)." : undefined;
  return (
    <View style={{ width: "100%", maxWidth: 448, gap: 16 }}>
      <Field label="Ad">
        <Input autoComplete="given-name" placeholder="Aykut" />
      </Field>
      <Field label="Soyad">
        <Input autoComplete="family-name" placeholder="Yılmaz" />
      </Field>
      <Field label="E-posta" error={emailError}>
        <Input type="email" autoComplete="email" icon={<AtSign />} value={email} onChangeText={setEmail} onClear={() => setEmail("")} allowClear />
      </Field>
      <Field label="Şifre" hint="En az 8 karakter, bir rakam içermeli.">
        <Input type="password" autoComplete="new-password" icon={<Lock />} />
      </Field>
      <Field label="Cep telefonu">
        <Input type="tel" autoComplete="tel" mask="0(5__) ___ __ __" placeholder="0(5__) ___ __ __" icon={<Phone />} />
      </Field>
    </View>
  );
}

export const SignUpForm: Story = {
  name: "Kayıt Formu (etiketli, doğrulamalı)",
  ...storyDoc(
    "Gerçek bir form: her alanın görünür etiketi, yardımcı metni ve alanın hemen altında hata mesajı. `type` doğru klavyeyi açar " +
      "(e-posta, telefon), `autoComplete` otomatik doldurmayı. E-postayı düzeltin — hata kalkar.",
    `<Input
  accessibilityLabel="E-posta"
  type="email"
  autoComplete="email"
  icon={<AtSign />}
  value={email}
  onChangeText={setEmail}
  color={error ? "error" : undefined}
/>`
  ),
  render: () => <SignUpFormDemo />,
};

function PressEnterDemo() {
  const theme = useTheme();
  const [items, setItems] = useState<string[]>(["Süt", "Ekmek"]);
  const [draft, setDraft] = useState("");
  return (
    <Narrow>
      <Input
        accessibilityLabel="Listeye ekle"
        placeholder="Ürün yazıp Enter'a basın"
        returnKeyType="done"
        value={draft}
        onChangeText={setDraft}
        onPressEnter={() => {
          if (draft.trim()) setItems((prev) => [...prev, draft.trim()]);
          setDraft("");
        }}
      />
      <View style={{ gap: 4 }}>
        {items.map((item, i) => (
          <Text key={`${item}-${i}`} style={{ fontSize: 14, lineHeight: 20, color: theme.color.canvas.foreground }}>
            • {item}
          </Text>
        ))}
      </View>
    </Narrow>
  );
}

export const PressEnterAction: Story = {
  name: "Enter ile Tetikleme",
  ...storyDoc(
    "`onPressEnter` — klavyenin gönder / bitti tuşuna bağlı eylemler (listeye ekleme, gönderme). Tuş etiketi için `returnKeyType`.",
    `<Input
  accessibilityLabel="Listeye ekle"
  returnKeyType="done"
  value={draft}
  onChangeText={setDraft}
  onPressEnter={() => { addItem(draft); setDraft(""); }}
/>`
  ),
  render: () => <PressEnterDemo />,
};

export const CustomCountFormatter: Story = {
  name: "Özel Karakter Sayacı",
  ...storyDoc("`count.formatter` ile varsayılan `n / max` yerine özel bir metin gösterilebilir."),
  args: { accessibilityLabel: "Ürün başlığı", placeholder: "Ürün başlığı", maxLength: 50, showCount: true, allowClear: false, count: { formatter: ({ count, maxLength }) => `${maxLength! - count} karakter kaldı` } },
  render: (args) => (
    <Narrow>
      <Input {...args} />
    </Narrow>
  ),
};

export const MaskedInput: Story = {
  name: "Maskeli",
  ...storyDoc("`mask` + `replacement` ile girişi bir formata zorlar (ör. telefon numarası); maskeli alanda sayı klavyesi açılır."),
  args: { accessibilityLabel: "Cep telefonu", placeholder: "0(5__) ___ __ __", mask: "0(5__) ___ __ __", type: "tel", icon: <Phone />, allowClear: true, maxLength: undefined },
  render: (args) => (
    <Narrow>
      <Input {...args} />
    </Narrow>
  ),
};

export const AllVariants: Story = {
  name: "Tüm Varyant × Boyut",
  ...storyDoc(
    "4 kenarlık/arka plan stili (`outline`/`soft`/`ghost`/`underlined`) × 3 boyut. `underlined` her zaman köşesizdir.",
    `<Input variant="outline" size="md" accessibilityLabel="Ara" icon={<Search />} allowClear />
<Input variant="soft" size="md" accessibilityLabel="Ara" />
<Input variant="ghost" size="md" accessibilityLabel="Ara" />
<Input variant="underlined" size="md" accessibilityLabel="Ara" />`
  ),
  render: () => <AllVariantsDemo />,
};

function AllVariantsDemo() {
  const theme = useTheme();
  return (
    <View style={{ alignSelf: "stretch", gap: 24 }}>
      {(["outline", "soft", "ghost", "underlined"] as const).map((variant) => (
        <View key={variant} style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: theme.color.canvas.foreground }}>{variant}</Text>
          <Stack>
            {(["lg", "md", "sm"] as const).map((size) => (
              <Input key={size} accessibilityLabel={`${variant} ${size}`} size={size} variant={variant} placeholder={`Ürün ara (${size})`} icon={<Search />} allowClear />
            ))}
          </Stack>
        </View>
      ))}
    </View>
  );
}

function ValidationDemo() {
  const theme = useTheme();
  return (
    <Narrow>
      <Field label="IBAN" error="IBAN 26 karakter olmalı.">
        <Input defaultValue="TR12 3456" allowClear />
      </Field>
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: theme.color.canvas.foreground }}>Kullanıcı adı</Text>
        <Input accessibilityLabel="Kullanıcı adı" color="warning" defaultValue="aykut" />
        <Text style={{ fontSize: 12, lineHeight: 16, color: theme.color.warning.text }}>Bu ad alınmış olabilir — kaydederken kontrol edeceğiz.</Text>
      </View>
    </Narrow>
  );
}

export const ValidationStates: Story = {
  name: "Doğrulama Durumları",
  ...storyDoc(
    "`Field` `error` verilince alan hata rengine geçer ve ekran okuyucuya geçersiz olarak bildirilir; `color=\"warning\"` engelleyici olmayan uyarı. Renge ek olarak metin de anlamı taşır.",
    `<Field label="IBAN" error="IBAN 26 karakter olmalı.">
  <Input defaultValue="TR12 3456" />
</Field>`
  ),
  render: () => <ValidationDemo />,
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Field label="Firma adı" skeleton={isLoading}>
  <Input defaultValue={company.name} />
</Field>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Narrow>
          <Field label="Firma adı" skeleton={skeleton}>
            <Input defaultValue="Mari Yazılım A.Ş." />
          </Field>
          <Field label="Vergi no" skeleton={skeleton}>
            <Input size="lg" defaultValue="1234567890" />
          </Field>
        </Narrow>
      )}
    </SkeletonDemo>
  ),
};
