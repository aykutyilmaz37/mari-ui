import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Radio } from "./index";
import type { RadioProps } from "./index";

const meta: Meta<typeof Radio> = {
  title: "Veri Girişi/Radio",
  component: Radio,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Bir grup seçenekten TEK birini seçmek için kullanılır — tek tek `Radio` yerine genelde `RadioGroup` " +
            "tercih edin (grup semantiği ve düzeni hazır gelir). `useControllableState` ile controlled/uncontrolled " +
            "ikisini de destekler. Aynı `name` değerini paylaşan Radio'lar native olarak bir grup oluşturur.",
          whenToUse: ["Birbirini dışlayan (yalnızca biri seçilebilir) bir seçenek grubu için — 3+ seçenekte `RadioGroup` kullanın."],
          whenNotToUse: ["Bağımsız açık/kapalı bir ayar için — `Checkbox` veya `Switch`."],
          a11y:
            "`color` verilmediyse dinlenme halinde kenarlık nötr/gridir; sadece seçilince (veya `color` açıkça " +
            "verildiyse her zaman) renkli olur. Bir grup içinde kullanırken kapsayıcıya `role=\"radiogroup\"` için `RadioGroup`'u tercih edin.",
        }),
      },
    },
  },
  argTypes: {
    autoFocus: { control: "boolean", description: "Mount olduğunda otomatik odaklanır." },
    checked: { control: "boolean", description: "Controlled değer." },
    defaultChecked: { control: "boolean", description: "Uncontrolled başlangıç değeri." },
    disabled: disabledArgType,
    size: baseSizeArgType,
    color: { ...colorArgType, description: "Semantik renk. `error`/`warning` doğrulama durumu olarak da işlev görür." },
    variant: { control: "select", options: ["outline", "solid"], description: "Dolgu stili." },
    label: { control: "text", description: "Yanındaki etiket." },
    value: { control: "text", description: "Bu seçeneğin değeri." },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
  },
};
export default meta;

export const Playground: StoryObj<RadioProps> = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    label: "Radio Seçeneği",
    defaultChecked: false,
    disabled: false,
    size: "md",
    color: "primary",
    variant: "outline",
    value: "radio-1",
  },
};

export const Controlled: StoryObj = {
  name: "Controlled Örneği",
  ...storyDoc(
    "Tek tek `Radio` ile elle kurulan bir grup — aynı `name` ve bir `role=\"radiogroup\"` sarmalayıcı şart (ok tuşlarıyla gezinme bunlara bağlı). Genelde `RadioGroup` daha kolaydır.",
    `<div role="radiogroup" aria-label="Ödeme">
  <Radio name="odeme" value="kart" label="Kredi kartı" checked={v === "kart"} onChange={() => setV("kart")} />
  <Radio name="odeme" value="havale" label="Havale / EFT" checked={v === "havale"} onChange={() => setV("havale")} />
</div>`
  ),
  render: () => <ControlledExample />,
};

export const AllVariants: StoryObj = {
  name: "Tüm Renk × Varyant × Boyut",
  ...storyDoc(
    "`md` boyutlar önceden seçili — dinlenme (gri) ve seçili (renkli) halleri yan yana. `solid`'de seçilmemiş radio artık dolu değil (eskiden hepsi seçili görünüyordu).",
    `<Radio name="plan" value="aylik" label="Aylık" variant="outline" />
<Radio name="plan" value="yillik" label="Yıllık" variant="solid" defaultChecked />`
  ),
  render: () => {
    const colors = ["primary", "neutral", "error", "warning"] as const;
    const variants = ["outline", "solid"] as const;
    const sizes = ["sm", "md", "lg"] as const;

    return (
      <div className="flex flex-col gap-6">
        {colors.map((color) => (
          <div key={color} className="space-y-4">
            <h3 className="font-semibold capitalize">{color}</h3>
            {variants.map((variant) => (
              <div key={variant} className="space-y-2">
                <h4 className="capitalize text-sm text-mari-muted">{variant}</h4>
                <div className="flex gap-4 flex-wrap">
                  {sizes.map((size) => (
                    <Radio key={`${color}-${variant}-${size}`} label={`${color} · ${variant} · ${size}`} color={color} variant={variant} size={size} value={`${color}-${variant}-${size}`} defaultChecked={size === "md"} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

const ControlledExample = () => {
  const [selected, setSelected] = useState("kart");
  return (
    <div role="radiogroup" aria-label="Ödeme" className="flex flex-col gap-2">
      <Radio name="odeme" label="Kredi kartı" value="kart" checked={selected === "kart"} onChange={() => setSelected("kart")} />
      <Radio name="odeme" label="Havale / EFT" value="havale" checked={selected === "havale"} onChange={() => setSelected("havale")} />
    </div>
  );
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: StoryObj = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Radio label="Kapıda ödeme" skeleton />`),
  render: () => <SkeletonDemo>{(skeleton) => <Radio name="odeme-iskelet" label="Kapıda ödeme" description="Teslimatta nakit ya da kartla." skeleton={skeleton} />}</SkeletonDemo>,
};
