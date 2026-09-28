import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Checkbox } from "./index";
import type { CheckboxProps } from "./index";

const meta: Meta<typeof Checkbox> = {
  title: "Veri Girişi/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Bir açık/kapalı veya çoklu seçim durumunu temsil eden form kontrolü; `indeterminate` durumu (bazı alt " +
            "öğeler seçili) destekler. `useControllableState` ile hem controlled (`checked`+`onChange`) hem " +
            "uncontrolled (`defaultChecked`) kullanılabilir.",
          whenToUse: [
            "Bağımsız bir açık/kapalı ayar veya çoklu seçim listesi için.",
            "\"Tümünü seç\" gibi bir üst kontrolde `indeterminate` ile kısmi seçim durumunu göstermek için.",
          ],
          whenNotToUse: ["Karşılıklı dışlayan (yalnızca biri seçilebilir) seçenekler için — `Radio`/`RadioGroup`."],
          a11y:
            "Gerçek bir `<input type=\"checkbox\">` render eder, `<label>` ile sarmalanır (etikete tıklamak da " +
            "değiştirir). `color` verilmediyse dinlenme halinde kenarlık nötr/gridir; sadece işaretlenince (veya " +
            "`color` açıkça verildiyse her zaman) renkli olur.",
        }),
      },
    },
  },
  argTypes: {
    autoFocus: { control: "boolean", description: "Mount olduğunda otomatik odaklanır." },
    checked: { control: "boolean", description: "Controlled değer." },
    defaultChecked: { control: "boolean", description: "Uncontrolled başlangıç değeri." },
    disabled: disabledArgType,
    indeterminate: { control: "boolean", description: "Belirsiz (ne tam seçili ne boş) durumu gösterir." },
    size: baseSizeArgType,
    shape: { control: "select", options: ["default", "pill", "square"], description: "Geometri." },
    color: { ...colorArgType, description: "Semantik renk. `error`/`warning` doğrulama durumu olarak da işlev görür." },
    variant: { control: "select", options: ["outline", "solid"], description: "Dolgu stili." },
    label: { control: "text", description: "Kutucuğun yanındaki etiket." },
    description: { control: "text", description: "Etiketin altında gösterilecek yardımcı metin." },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet.", table: { defaultValue: { summary: "false" } } },
    className: { control: "text" },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
  },
};
export default meta;

export const Playground: StoryObj<CheckboxProps> = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    label: "Checkbox örneği",
    defaultChecked: false,
    disabled: false,
    indeterminate: false,
    size: "md",
    shape: "default",
    color: "primary",
    variant: "outline",
    description: "Açıklama metni örneği",
  },
};

export const AllVariants: StoryObj = {
  name: "Tüm Renk × Varyant × Boyut",
  ...storyDoc(
    "`md` boyutlar önceden işaretli — dinlenme (gri) ve işaretli (renkli dolgu) halleri yan yana karşılaştırın. Çentik kutu boyutuyla orantılı.",
    `<Checkbox label="Kabul ediyorum" variant="outline" size="md" />
<Checkbox label="Kabul ediyorum" variant="solid" color="error" size="lg" defaultChecked />`
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
                    <Checkbox key={`${color}-${variant}-${size}`} label={`${color} · ${variant} · ${size}`} color={color} variant={variant} size={size} defaultChecked={size === "md"} />
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

const IndeterminateExample = () => {
  const options = ["Siparişler", "Kampanyalar", "Stok bildirimleri"];
  const [checkedItems, setCheckedItems] = useState<string[]>(["Siparişler"]);

  const allChecked = checkedItems.length === options.length;
  const isIndeterminate = checkedItems.length > 0 && checkedItems.length < options.length;

  const toggleItem = (value: string) => {
    setCheckedItems((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-mari-foreground">E-posta bildirimleri</legend>
      <Checkbox label="Tümünü seç" indeterminate={isIndeterminate} checked={allChecked} onChange={(e) => setCheckedItems(e.target.checked ? [...options] : [])} />
      <div className="ml-6 flex flex-col gap-2">
        {options.map((option) => (
          <Checkbox key={option} label={option} checked={checkedItems.includes(option)} onChange={() => toggleItem(option)} />
        ))}
      </div>
    </fieldset>
  );
};

export const IndeterminateCheckbox: StoryObj = {
  name: "Belirsiz (Indeterminate) Örneği",
  ...storyDoc(
    "Klasik \"Tümünü seç\" deseni — bazı alt öğeler seçiliyken üst kutucuk `indeterminate` gösterir: dolu kutu + yatay çizgi.",
    `const all = checked.length === options.length;
const some = checked.length > 0 && !all;

<Checkbox label="Tümünü seç" indeterminate={some} checked={all} onChange={(e) => setChecked(e.target.checked ? options : [])} />`
  ),
  render: () => <IndeterminateExample />,
};

export const WithDescription: StoryObj = {
  name: "Açıklamalı (izinler)",
  ...storyDoc(
    "`description` etiketin altında soluk yardımcı metindir ve `aria-describedby` ile kutuya bağlıdır — ekran okuyucu etiketten sonra okur.",
    `<Checkbox label="Pazarlama e-postaları" description="Kampanya ve indirimlerden haberdar olun. İstediğiniz zaman vazgeçebilirsiniz." />`
  ),
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Checkbox label="Kullanım koşullarını okudum ve kabul ediyorum" defaultChecked />
      <Checkbox label="Pazarlama e-postaları" description="Kampanya ve indirimlerden haberdar olun. İstediğiniz zaman vazgeçebilirsiniz." />
      <Checkbox label="KVKK aydınlatma metni" description="Onay vermeden devam edemezsiniz." color="error" />
    </div>
  ),
};

function SkeletonDemo() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm text-mari-foreground">
        <input type="checkbox" checked={loaded} onChange={(e) => setLoaded(e.target.checked)} />
        Veri yüklendi
      </label>
      {["Siparişler", "Kampanyalar", "Stok bildirimleri"].map((l, i) => (
        <Checkbox key={l} skeleton={!loaded} label={l} defaultChecked={i === 0} />
      ))}
    </div>
  );
}

export const Skeleton: StoryObj = {
  name: "İskelet",
  ...storyDoc("`skeleton` — kayıtlı tercihler gelene kadar kutu ve etiket genişliğinde yer tutucu.", `<Checkbox skeleton={isLoading} label="Siparişler" checked={prefs.orders} />`),
  render: () => <SkeletonDemo />,
};

