import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Veri Girişi/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "`Input`ın üzerine bir arama butonu ekleyen ince sarmalayıcı. `onSearch`, arama butonuna tıklandığında " +
            "VEYA Enter'a basıldığında çağrılır. `Input`ın tüm prop'larını (`{...rest}` ile) devralır.",
          whenToUse: ["Bağımsız bir arama kutusu için (site arama, tablo/liste filtresi)."],
          whenNotToUse: ["Yazarken anlık filtreli öneri listesi gerekiyorsa — `AutoComplete`."],
        }),
      },
    },
  },
  argTypes: {
    placeholder: { control: "text" },
    size: baseSizeArgType,
    variant: { control: "select", options: ["outline", "soft", "ghost", "underlined"], description: "Kenarlık/arka plan stili." },
    color: { ...colorArgType, description: "Odak/kenarlık rengi." },
    shape: { control: "select", options: ["default", "pill", "square"], description: "Köşe geometrisi." },
    allowClear: { control: "boolean" },
    disabled: disabledArgType,
    maxLength: { control: "number" },
    onChange: { action: "onChange" },
    onPressEnter: { action: "onPressEnter" },
    onSearch: { action: "onSearch", description: "Arama butonuna tıklandığında VEYA Enter'a basıldığında güncel değerle çağrılır." },
    loading: { control: "boolean", description: "Arama sürüyor — ara ikonu yerine dönen gösterge; alan yazılabilir kalır.", table: { defaultValue: { summary: "false" } } },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet.", table: { defaultValue: { summary: "false" } } },
  },
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    "aria-label": "Ara",
    placeholder: "Ara...",
    allowClear: true,
    size: "md",
    variant: "outline",
    loading: false,
    disabled: false,
    skeleton: false,
  },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
};

export const AllVariants: Story = {
  name: "Tüm Varyant × Boyut",
  ...storyDoc(
    "4 kenarlık/arka plan stili (`outline`/`soft`/`ghost`/`underlined`) × 3 boyut.",
    `<SearchInput variant="outline" aria-label="Ara" />
<SearchInput variant="soft" aria-label="Ara" />
<SearchInput variant="ghost" aria-label="Ara" />
<SearchInput variant="underlined" aria-label="Ara" />`
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
                <SearchInput key={`${variant}-${size}`} aria-label={`${variant} ${size}`} variant={variant} size={size} placeholder={`Ürün, marka ara (${size})`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

const CATALOG = ["Kablosuz kulaklık", "Kablolu kulaklık", "Oyun kulaklığı", "Kulak içi kulaklık", "Mekanik klavye", "Kablosuz mouse"];

function ProductSearchDemo() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");
  const search = (value: string) => {
    setQuery(value);
    setLoading(true);
    setTimeout(() => {
      const q = value.trim().toLocaleLowerCase("tr");
      setResults(q ? CATALOG.filter((c) => c.toLocaleLowerCase("tr").includes(q)) : []);
      setLoading(false);
    }, 700);
  };
  return (
    <div className="flex max-w-md flex-col gap-3">
      <SearchInput aria-label="Ürün ara" placeholder="Ürün ara (ör. kulaklık)" allowClear loading={loading} onSearch={search} />
      {results && !loading && (
        <p className="text-sm text-mari-muted" aria-live="polite">
          “{query}” için {results.length} sonuç{results.length > 0 ? `: ${results.join(", ")}` : ""}
        </p>
      )}
    </div>
  );
}

export const WithSearch: Story = {
  name: "Ürün Arama (Enter + yükleniyor)",
  ...storyDoc(
    "`onSearch` Enter'a basınca VE ara butonuna tıklayınca çağrılır. Sonuç beklenirken `loading` ara ikonunu dönen göstergeye çevirir. " +
      "Mobil klavyede Enter tuşu \"Ara\" olarak görünür (`enterKeyHint=\"search\"`).",
    `<SearchInput
  aria-label="Ürün ara"
  placeholder="Ürün ara"
  allowClear
  loading={isSearching}
  onSearch={(value) => runSearch(value)}
/>`
  ),
  render: () => <ProductSearchDemo />,
};
