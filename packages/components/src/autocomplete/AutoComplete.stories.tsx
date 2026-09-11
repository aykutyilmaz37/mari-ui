import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { AutoComplete } from "./AutoComplete";
import { Option } from "./types";

const meta: Meta<typeof AutoComplete> = {
  title: "Veri Girişi/AutoComplete",
  component: AutoComplete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Yazdıkça filtrelenen bir seçenek listesi açan metin girişi. `onSearch` her tuş vuruşunda, `onSelect` " +
            "bir seçenek tıklandığında çağrılır.",
          whenToUse: ["Kullanıcının serbest yazabildiği ama önceden tanımlı bir listeden de seçebildiği durumlarda (isim, şehir, etiket)."],
          whenNotToUse: ["Seçenekler SABİT ve serbest yazmaya gerek yoksa — `Dropdown`/`Select`."],
          a11y:
            "Tam bir ARIA \"combobox\" deseni: input `role=\"combobox\"` + `aria-expanded`/`aria-controls`/" +
            "`aria-activedescendant`, liste `role=\"listbox\"`, seçenekler `role=\"option\"`. Klavye: **Ok Aşağı/Yukarı** " +
            "vurgulu seçeneği taşır, **Enter** seçer, **Escape** listeyi kapatır.",
        }),
      },
      // Açılan liste `position: absolute` — normal akışta yükseklik
      // KATKISI yapmaz. Docs canvas'ı içeriğin doğal yüksekliğine göre
      // boyutlanınca (bkz. preview.tsx) liste açıldığında kanvasın dışına
      // taşıp kesiliyordu. Sabit bir minimum yükseklik bunu önler.
      story: { height: "260px" },
    },
  },
  argTypes: {
    placeholder: { control: "text" },
    closeOnBlur: { control: "boolean", description: "Odak kaybedildiğinde listeyi otomatik kapatır." },
    onSearch: { action: "onSearch" },
    onSelect: { action: "onSelect", description: "Bir seçenek seçildiğinde çağrılır." },
  },
};

export default meta;

type Story = StoryObj<typeof AutoComplete>;

const sampleOptions: Option[] = [
  { id: 1, value: "Ahmet" },
  { id: 2, value: "Aykut" },
  { id: 3, value: "Furkan" },
  { id: 4, value: "Yasemin" },
  { id: 5, value: "Sadık" },
];

export const Playground: Story = {
  ...storyDoc("Yazın ve Ok Aşağı/Yukarı + Enter ile de seçin — klavye ile fareyle aynı ölçüde kullanılabilir."),
  args: {
    options: sampleOptions,
    placeholder: "İsim yazın...",
  },
};

const ControlledExample = () => {
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <AutoComplete
        options={sampleOptions}
        value={value}
        onSearch={setValue}
        onSelect={setValue}
        placeholder="İsim yazın..."
      />
      <p className="text-sm text-mari-muted">Seçilen/yazılan: {value || "(boş)"}</p>
    </div>
  );
};

export const Controlled: Story = {
  name: "Controlled Örneği",
  ...storyDoc("`value`+`onSearch`/`onSelect` ile tamamen dışarıdan yönetilir."),
  render: () => <ControlledExample />,
};
