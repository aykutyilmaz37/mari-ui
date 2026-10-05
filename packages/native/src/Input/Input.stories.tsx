import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Input> = {
  title: "Native/Input",
  component: Input,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "Tek satır metin girişi — web `Input` ile aynı eksenler: `variant`, `size`, `shape`, `color`.",
          whenToUse: ["Kısa serbest metin: ad, e-posta, arama.", "Şifre (`secureTextEntry`)."],
          whenNotToUse: ["Çok satırlı metin — Textarea (Dalga 1).", "Sabit seçenekler — Select / Segmented."],
          vsWeb: "`onChange` yerine `onChangeText` (doğrudan metin); `type=\"password\"` yerine `secureTextEntry`.",
        }),
      },
    },
  },
  args: { placeholder: "E-posta", variant: "outline", size: "md", shape: "default", disabled: false, allowClear: true, skeleton: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["outline", "soft", "ghost", "underlined"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["default", "pill", "square"] },
    color: { control: "select", options: [undefined, "primary", "success", "error", "warning", "info"] },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  render: (args) => (
    <Stack>
      <Input {...args} accessibilityLabel="E-posta" />
    </Stack>
  ),
};

export const Variants: Story = {
  name: "Varyantlar",
  ...storyDoc("outline · soft · ghost · underlined.", `<Input variant="soft" placeholder="Ara" />`),
  render: () => (
    <Stack>
      {(["outline", "soft", "ghost", "underlined"] as const).map((variant) => (
        <Input key={variant} variant={variant} placeholder={variant} accessibilityLabel={variant} />
      ))}
    </Stack>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc("Hata rengi, devre dışı, şifre, temizleme düğmesi.", `<Input color="error" placeholder="E-posta" />`),
  render: () => (
    <Stack>
      <Input color="error" defaultValue="hatali@" accessibilityLabel="Hatalı e-posta" />
      <Input disabled placeholder="Devre dışı" accessibilityLabel="Devre dışı" />
      <Input secureTextEntry placeholder="Şifre" accessibilityLabel="Şifre" />
      <Input allowClear defaultValue="Silinebilir metin" accessibilityLabel="Temizlenebilir" />
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Input skeleton={isLoading} placeholder="Ad Soyad" />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Stack>
          <Input skeleton={skeleton} placeholder="Ad Soyad" accessibilityLabel="Ad Soyad" />
          <Input skeleton={skeleton} size="lg" shape="pill" placeholder="Ara" accessibilityLabel="Ara" />
        </Stack>
      )}
    </SkeletonDemo>
  ),
};
