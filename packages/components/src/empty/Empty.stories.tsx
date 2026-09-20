import type { Meta, StoryObj } from "@storybook/react";
import { RefreshCcw } from "lucide-react";
import { Empty } from "./Empty";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SearchInput } from "../input";

const meta: Meta<typeof Empty> = {
  title: "Veri Gösterimi/Empty",
  component: Empty,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "Bir liste/tablo boş olduğunda gösterilecek yer tutucu.",
          whenToUse: ["Veri yüklendi ama sonuç yoksa — arama sonucu boş, filtre sonucu boş, yeni oluşturulan bir liste."],
          whenNotToUse: ["Veri henüz yükleniyorsa — o durumda `Skeleton`/`Loading` kullanılır."],
          a11y: "Hook kullanmaz, sunucu bileşeni olarak render edilebilir.",
        }),
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Ana başlık." },
    description: { control: "text", description: "Açıklayıcı alt metin (opsiyonel)." },
    buttonText: { control: "text", description: "Verilirse bir eylem butonu render edilir (örn. \"Tekrar Dene\")." },
    onClick: { description: "Buton tıklamasında çağrılır. Verilmezse buton devre dışı görünür." },
  },
  args: {
    title: "Veri Bulunamadı",
    description: "Kriterlerinize uyan herhangi bir veri bulamadık.",
    buttonText: "Tekrar Dene",
    buttonIcon: <RefreshCcw size={16} />,
    onClick: () => alert("Tekrar Dene tıklandı"),
  },
};

export default meta;

type Story = StoryObj<typeof Empty>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
};

export const SearchResults: Story = {
  name: "Arama Sonucu",
  ...storyDoc("Bir arama kutusunun altında, sonuç bulunamadığında gösterilen hâl."),
  render: () => (
    <div className="w-full max-w-md rounded-lg border border-mari-border p-4">
      <SearchInput placeholder="Ürün, marka veya kategori ara" defaultValue="pembe kazak" />
      <Empty title="Sonuç Bulunamadı" description={'"pembe kazak" için hiçbir sonuç bulamadık. Farklı bir arama terimi deneyin.'} />
    </div>
  ),
};

export const Varyantlar: Story = {
  name: "Varyantlar",
  ...storyDoc("`description` ve `buttonText` opsiyoneldir — en yalın hâlden (sadece başlık) eylem butonlu tam hâle."),
  render: () => (
    <div className="flex flex-col gap-8">
      <Empty title="Sadece başlık" />
      <Empty title="Başlık ve açıklama" description="Ek bir açıklama metni burada gösterilir." />
      <Empty title="Eylem butonlu" description="Kullanıcıyı bir aksiyona yönlendirir." buttonText="Yeniden Dene" onClick={() => {}} />
    </div>
  ),
};
