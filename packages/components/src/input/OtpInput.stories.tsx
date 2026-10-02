import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { baseSizeArgType, colorArgType, disabledArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { OtpInput } from "./OtpInput";

type Story = StoryObj<typeof OtpInput>;

const meta: Meta<typeof OtpInput> = {
  title: "Veri Girişi/OtpInput",
  component: OtpInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Tek karakterlik kutucuklar dizisi olarak render edilen doğrulama kodu (OTP/SMS kodu) girişi. Ok " +
            "tuşlarıyla gezinme ve yapıştırma (birden fazla karakter otomatik dağıtılır) desteklenir.",
          whenToUse: ["SMS/e-posta ile gönderilen sabit uzunluklu doğrulama kodu girişi için."],
          whenNotToUse: ["Serbest uzunlukta bir kod/parola için — `Input`."],
          a11y: "Her kutucuk bağımsız bir `Input`tır; Ok tuşları ve Backspace kutucuklar arası gezinmeyi klavyeyle sağlar.",
        }),
      },
    },
  },
  argTypes: {
    length: { control: { type: "number", min: 1, max: 12 }, description: "Kutucuk sayısı." },
    mask: { control: "boolean", description: "Girilen karakterleri `•` ile gizler." },
    disabled: disabledArgType,
    size: baseSizeArgType,
    variant: { control: "select", options: ["outline", "soft", "ghost", "underlined"], description: "Kenarlık/arka plan stili." },
    color: { ...colorArgType, description: "Odak/kenarlık rengi." },
    shape: { control: "select", options: ["default", "pill", "square"], description: "Köşe geometrisi." },
    separator: { control: "text", description: "Kutucuklar arası ayırıcı (örn. \"-\")." },
    onChange: { action: "onChange", description: "Tüm kutucuklar dolduğunda, birleşik değerle çağrılır." },
    onInput: { action: "onInput" },
    layout: { control: "inline-radio", options: ["separated", "single"], description: "`separated`: ayrı kutucuklar. `single`: tek alan içinde hane yuvaları.", table: { defaultValue: { summary: "separated" } } },
    linePosition: { control: "inline-radio", options: ["center", "bottom"], description: "`layout=\"single\"`'da yuva çizgisi: `center` boş yuvada ortada, `bottom` hanenin altında (dolu olsa da).", table: { defaultValue: { summary: "center" } } },
    inputMode: { control: "select", options: ["numeric", "text"], description: "Mobil klavye — rakam kodları için `numeric` (varsayılan).", table: { defaultValue: { summary: "numeric" } } },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet.", table: { defaultValue: { summary: "false" } } },
  },
};
export default meta;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin. Bir kodu kopyalayıp ilk kutucuğa yapıştırmayı deneyin — hanelere dağılır."),
  args: {
    length: 6,
    mask: false,
    disabled: false,
    size: "md",
    variant: "outline",
    layout: "separated",
    linePosition: "center",
    skeleton: false,
  },
};

function VerificationDemo() {
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const colorByStatus = { idle: undefined, checking: undefined, ok: "success", error: "error" } as const;
  const verify = (code: string) => {
    setStatus("checking");
    setTimeout(() => setStatus(code === "482913" ? "ok" : "error"), 600);
  };
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <div>
        <p className="font-medium text-mari-foreground">Telefonunuzu doğrulayın</p>
        <p className="text-sm text-mari-muted">0(532) *** ** 47 numarasına gönderilen 6 haneli kodu girin. (Doğru kod: 482913)</p>
      </div>
      <OtpInput
        length={6}
        size="lg"
        aria-label="SMS doğrulama kodu"
        color={colorByStatus[status]}
        onChange={verify}
        onInput={() => status !== "idle" && status !== "checking" && setStatus("idle")}
      />
      <p className="min-h-5 text-sm" aria-live="polite">
        {status === "checking" && <span className="text-mari-muted">Kontrol ediliyor…</span>}
        {status === "ok" && <span className="text-mari-success">Numaranız doğrulandı.</span>}
        {status === "error" && <span className="text-mari-error">Kod hatalı. Tekrar deneyin.</span>}
      </p>
    </div>
  );
}

export const Verification: Story = {
  name: "SMS Doğrulama",
  ...storyDoc(
    "Gerçek akış: kod tamamlanınca `onChange` doğrulamayı başlatır, sonuç renk + metinle bildirilir (`aria-live`). Mobilde sayısal klavye açılır " +
      "ve telefon gelen SMS kodunu klavye üstünde önerir (`autocomplete=\"one-time-code\"`, ilk hücrede) — seçilince kod hanelere dağılır.",
    `<OtpInput
  length={6}
  size="lg"
  aria-label="SMS doğrulama kodu"
  color={error ? "error" : undefined}
  onChange={(code) => verify(code)}
/>`
  ),
  render: () => <VerificationDemo />,
};

export const Masked: Story = {
  name: "Gizli (PIN)",
  ...storyDoc("`mask` — girilen karakterleri `•` ile gizler (kart PIN'i gibi gizli kodlar)."),
  args: {
    length: 4,
    mask: true,
    size: "lg",
    variant: "soft",
    "aria-label": "Kart PIN'i",
  },
};

export const WithSeparators: Story = {
  name: "Ayırıcılı",
  ...storyDoc("`separator` — kutucuklar arasına sabit bir ayırıcı koyar (ekran okuyucudan gizli). Harf içeren kodlar için `inputMode=\"text\"`."),
  args: {
    length: 6,
    separator: "-",
    size: "md",
    inputMode: "text",
    "aria-label": "Hediye kartı kodu",
  },
};

function SkeletonDemo() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm text-mari-foreground">
        <input type="checkbox" checked={loaded} onChange={(e) => setLoaded(e.target.checked)} />
        Hazır
      </label>
      <OtpInput length={6} size="lg" skeleton={!loaded} />
    </div>
  );
}

export const SingleField: Story = {
  name: "Tek Alan Görünümü",
  ...storyDoc(
    "`layout=\"single\"` — haneler ayrı kutucuklar yerine tek bir alanın içindeki yuvalarda. Aktif yuvada yanıp sönen imleç. " +
      "Yuva çizgisi `linePosition` ile: `center` (boş yuvada ortada) ya da `bottom` (hanenin altında, dolu olsa da). " +
      "Arkada TEK bir gerçek `<input>` vardır: yapıştırma ve SMS otomatik doldurma doğal çalışır, ekran okuyucu tek bir adlandırılmış alan duyar. " +
      "`inputMode=\"numeric\"` iken harf ve boşluklar atılır. Tüm varyant/boyut/renk/`mask`/`separator` seçenekleri geçerli.",
    `<OtpInput layout="single" length={6} size="lg" aria-label="Doğrulama kodu" onChange={verify} />
<OtpInput layout="single" linePosition="bottom" length={6} size="lg" aria-label="Doğrulama kodu" />`
  ),
  render: () => <SingleLayoutDemo />,
};


export const AllVariants: Story = {
  name: "Tüm Varyant",
  ...storyDoc(
    "4 kenarlık/arka plan stili. OTP'de `ghost` kutucuklar görünmez olacağı için `underlined`'a düşer.",
    `<OtpInput length={4} variant="outline" />
<OtpInput length={4} variant="soft" />
<OtpInput length={4} variant="underlined" />`
  ),
  render: () => {
    const variants = ["outline", "soft", "ghost", "underlined"] as const;

    return (
      <div className="flex flex-col gap-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <h3 className="text-sm font-semibold text-mari-foreground">{variant}</h3>
            <OtpInput length={4} variant={variant} aria-label={`${variant} kod`} />
          </div>
        ))}
      </div>
    );
  },
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc("`skeleton` — kutucuklarla aynı boyutta yer tutucular.", `<OtpInput length={6} size="lg" skeleton={isLoading} />`),
  render: () => <SkeletonDemo />,
};

function SingleLayoutDemo() {
  const [code, setCode] = useState("");
  return (
    <div className="flex max-w-sm flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-1.5">
          <span className="text-xs text-mari-muted">{size}</span>
          <OtpInput layout="single" length={6} size={size} aria-label={`Doğrulama kodu ${size}`} />
        </div>
      ))}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-mari-muted">linePosition=&quot;bottom&quot; — çizgi hanenin altında, dolu yuvada da kalır</span>
        <OtpInput layout="single" length={6} size="lg" linePosition="bottom" defaultValue="48" aria-label="Doğrulama kodu (alt çizgi)" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-mari-foreground">E-postanıza gelen kod</span>
        <OtpInput layout="single" length={6} size="lg" separator="-" variant="soft" aria-label="E-postanıza gelen kod" onInput={(v) => setCode(v.join(""))} />
        <span className="text-xs text-mari-muted">Girilen: {code || "—"}</span>
      </div>
    </div>
  );
}
