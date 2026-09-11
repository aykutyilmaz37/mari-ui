import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Upload } from "./Upload";
import { ToastProvider } from "../toast";

const meta: Meta<typeof Upload> = {
  title: "Veri Girişi/Upload",
  component: Upload,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Dosya yükleme kontrolü. Buton (`inputType=\"button\"`), sürükle-bırak alanı (`\"dragDrop\"`) veya " +
            "resim önizlemeli liste (`\"review\"`) modlarını destekler. Boyut/tip doğrulaması başarısız olursa " +
            "(`fileSize`/`fileType`) `useToast()` ile bir bildirim gösterir — bu yüzden her story bir " +
            "`ToastProvider` içine sarılı.",
          whenToUse: ["Kullanıcının bir veya daha fazla dosya (belge, resim) yüklemesi gerektiğinde."],
          whenNotToUse: ["Tek bir metin/URL girişi yeterliyse — `Input`."],
          a11y:
            "`max > 1` iken gizli native `<input type=\"file\">` `multiple` taşır (eskiden \"gözat\" ile her zaman " +
            "TEK dosya seçilebiliyordu — sürükle-bırak zaten çokluyu destekliyordu, gerçek eksiklik yalnızca " +
            "tıklama yolundaydı). `fileType` hem \"png\" hem \"image/png\" biçiminde verilebilir.",
        }),
      },
    },
  },
  argTypes: {
    inputType: { control: "select", options: ["button", "dragDrop", "review"], description: "Yükleme tetikleyicisinin görünüm modu." },
    listType: { control: "select", options: ["list", "review"], description: "Yüklenen dosyaların listelenme biçimi." },
    reviewType: { control: "select", options: ["square", "circle"], description: "`listType=\"review\"` iken önizleme çerçevesinin şekli." },
    fileSize: { control: "number", description: "Bayt cinsinden izin verilen azami dosya boyutu." },
    fileType: { control: "text", description: "Kabul edilen dosya türü — uzantı (\"png\") veya MIME tipi (\"image/png\")." },
    max: { control: "number", description: "Azami dosya sayısı — 1'den büyükse \"gözat\" da çoklu seçime izin verir." },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Upload>;

export const Basic: Story = {
  name: "Temel",
  ...storyDoc("Tıklayarak gözat, tek dosya."),
  args: {},
};

export const WithDragDrop: Story = {
  name: "Sürükle-Bırak",
  ...storyDoc("dragDrop modu: dosyaları alana bırakarak da yükleyebilirsiniz."),
  args: {
    inputType: "dragDrop",
  },
};

export const WithReviewListSquare: Story = {
  name: "Önizlemeli Liste (Kare)",
  ...storyDoc("listType=review + reviewType=square: resim önizlemeleri kare çerçevede."),
  args: {
    listType: "review",
    inputType: "review",
    reviewType: "square",
  },
};

export const WithReviewListCircle: Story = {
  name: "Önizlemeli Liste (Daire)",
  ...storyDoc("reviewType=circle: örn. profil fotoğrafı yükleme."),
  args: {
    listType: "review",
    inputType: "review",
    reviewType: "circle",
  },
};

export const WithCustomFileSize: Story = {
  name: "Özel Boyut Sınırı",
  ...storyDoc("Sınırı aşan bir dosya seçilince bir hata toastı çıkar."),
  args: {
    fileSize: 1 * 1024 * 1024, // 1 MB
  },
};

export const WithCustomFileType: Story = {
  name: "Özel Dosya Tipi",
  ...storyDoc("Yalnızca PNG kabul eder — hem gözat diyaloğu (accept) hem doğrulama bunu uygular."),
  args: {
    fileType: "image/png",
  },
};

export const MaxFilesLimit: Story = {
  name: "Azami Dosya Sayısı",
  ...storyDoc("max=2: hem gözat (multiple) hem sürükle-bırak bu sınırı uygular."),
  args: {
    max: 2,
  },
};
