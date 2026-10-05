import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Row, SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const COLORS = ["primary", "accent", "success", "error", "warning", "info", "neutral"] as const;
const VARIANTS = ["solid", "outline", "soft", "ghost", "link"] as const;

const meta: Meta<typeof Button> = {
  title: "Native/Button",
  component: Button,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "Aksiyon tetikleyen temel öğe — web `Button` ile aynı eksenler: `color`, `variant`, `size`, `shape`.",
          whenToUse: ["Bir eylemi başlatmak: kaydet, gönder, devam et.", "Formun ana eylemi (`block` ile tam genişlik)."],
          whenNotToUse: ["Sayfa geçişi — router'ınızın bağlantısı."],
          vsWeb: "`onClick` yerine `onPress`; `href` / `target` yok (navigasyon uygulamanın router'ında).",
        }),
      },
    },
  },
  args: { children: "Kaydet", color: "primary", variant: "solid", size: "md", shape: "default", disabled: false, loading: false, block: false, skeleton: false },
  argTypes: {
    color: { control: "select", options: COLORS },
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    shape: { control: "inline-radio", options: ["default", "pill", "circle", "square"] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
};

export const ColorsAndVariants: Story = {
  name: "Renk × Varyant",
  ...storyDoc("Yedi renk rolü × beş varyant.", `<Button color="success" variant="soft">Onayla</Button>`),
  render: () => (
    <Stack>
      {VARIANTS.map((variant) => (
        <Row key={variant}>
          {COLORS.map((color) => (
            <Button key={color} color={color} variant={variant} size="sm">
              {color}
            </Button>
          ))}
        </Row>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("xs → xl.", `<Button size="lg">Devam et</Button>`),
  render: () => (
    <Row>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Button key={size} size={size}>
          {size}
        </Button>
      ))}
    </Row>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc("Yükleniyor (eylem sürüyor, basılamaz), devre dışı, tam genişlik.", `<Button loading>Kaydediliyor</Button>`),
  render: () => (
    <Stack>
      <Row>
        <Button loading>Kaydediliyor</Button>
        <Button disabled>Devre dışı</Button>
        <Button shape="pill" variant="soft">
          Hap
        </Button>
      </Row>
      <Button block>Tam genişlik</Button>
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Button skeleton={isLoading}>Siparişi onayla</Button>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Row>
          <Button skeleton={skeleton}>Siparişi onayla</Button>
          <Button skeleton={skeleton} variant="outline" size="sm">
            Vazgeç
          </Button>
          <Button skeleton={skeleton} shape="pill" variant="soft">
            Hap
          </Button>
        </Row>
      )}
    </SkeletonDemo>
  ),
};
