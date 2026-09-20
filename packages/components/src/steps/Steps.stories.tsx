/**
 * Storybook CSF3'te `render` obje property'si Storybook tarafından gerçek
 * bir React function component GİBİ çağrılır (hook kuralları geçerlidir) —
 * ama `eslint-plugin-react-hooks`ın adlandırma sezgisi obje property'lerini
 * component olarak TANIMIYOR, yanlış pozitif üretiyor. `render`i ayrı, büyük
 * harfli bir component'e çıkarmak yerine (bkz. Faz 13.5 kullanıcı bulgusu:
 * Storybook'un "Show code" paneli o zaman `<HelperComponent />` gibi anlamsız
 * bir referans gösteriyordu, gerçek kullanım kodunu değil) bilinçli olarak
 * devre dışı bırakılıyor.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TicketIcon, TimerIcon, CheckCheckIcon, CheckCircle2Icon } from "lucide-react";
import { Steps } from "./Steps";
import { RadioGroup } from "../radio";
import { colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { StepsContent } from "./_components/StepsContent";

const meta: Meta<typeof Steps> = {
  title: "Navigasyon/Steps",
  component: Steps,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "Çok adımlı bir akışta (sihirbaz, kayıt formu, sipariş takibi) ilerlemeyi gösteren adım göstergesi. Yatay/dikey ve numara/nokta gösterim biçimlerini destekler.",
          whenToUse: ["Kullanıcıya çok adımlı bir sürecin hangi aşamasında olduğunu ve kalan adımları göstermek için."],
          whenNotToUse: ["Tek adımlı bir form için — gereksiz görsel karmaşıklık ekler."],
          a11y:
            "`onChange` verildiğinde adımlar gerçekten tıklanabilir/klavyeyle erişilebilir hâle gelir (`role=\"button\"`, " +
            "`tabIndex`, Enter/Space) — eskiden `role=\"none\"` bir `<div onClick>` idi, klavyeyle ASLA " +
            "erişilemiyordu. `onChange` VERİLMEZSE adımlar salt-okunur kalır (artık `cursor-pointer` gösterip " +
            "hiçbir şey yapmıyor değil) ve dahili \"Geri\"/\"İleri\" butonları render edilmez. Geçerli adım " +
            "`aria-current=\"step\"` taşır. **Buton konumu:** \"Geri\" ve \"İleri\"/\"Tamamla\" artık içerikten " +
            "üst çizgiyle ayrışan bir eylem çubuğunda, gerçek sihirbaz/checkout akışlarındaki gibi köşelere " +
            "yaslı (`justify-between`) duruyor — eskiden ikisi de sola yığılıp içerikle neredeyse iç içe geçiyordu.",
        }),
      },
    },
  },
  argTypes: {
    color: { ...colorArgType, description: "Aktif/tamamlanmış adımların rengi. Varsayılan: `primary`." },
  },
};

export default meta;
type Story = StoryObj<typeof Steps>;

const stepData = [
  { icon: TicketIcon, title: "Bilet", description: "Bilet Seç", step: 1 },
  { icon: TimerIcon, title: "Zaman", description: "Zaman Seç", step: 2 },
  { icon: CheckCheckIcon, title: "Onay", description: "Onayla", step: 3 },
];

const ticketOptions = [
  { label: "Standart — 150 ₺", value: "standard" },
  { label: "VIP — 350 ₺", value: "vip" },
  { label: "Öğrenci — 90 ₺", value: "student" },
];

const timeOptions = [
  { label: "Cumartesi, 14:00", value: "sat-14" },
  { label: "Cumartesi, 19:00", value: "sat-19" },
  { label: "Pazar, 16:00", value: "sun-16" },
];

/**
 * Faz 13.5 kullanıcı bulgusu: eskiden `content` prop'unu göstermek için
 * placeholder metin ("1. adım içeriği") kullanılıyordu — gerçek bir
 * uygulamada nasıl göründüğünü hiç göstermiyordu. Bu story artık gerçek bir
 * bilet satın alma sihirbazı: her adımda gerçek form içeriği (bilet tipi/saat
 * seçimi, özet) var ve "İleri"ye tıklamak gerçekten bir sonraki adıma geçiyor.
 */
export const RealWorldWizard: Story = {
  name: "Gerçek Kullanım (Bilet Sihirbazı)",
  ...storyDoc(
    "Uçtan uca gerçek bir akış: her adımda gerçek form içeriği var, \"İleri\" gerçekten sonraki adıma geçiriyor, " +
      "son adımda \"Tamamla\"ya tıklamak bir onay ekranı gösteriyor."
  ),
  render: () => {
    const [current, setCurrent] = useState(1);
    const [ticket, setTicket] = useState("standard");
    const [time, setTime] = useState("sat-14");
    const [completed, setCompleted] = useState(false);

    if (completed) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-mari-border p-8 text-center">
          <CheckCircle2Icon size={40} className="text-mari-success" />
          <p className="font-semibold">Biletiniz onaylandı!</p>
          <p className="text-sm text-mari-muted">{ticketOptions.find((o) => o.value === ticket)?.label} — {timeOptions.find((o) => o.value === time)?.label}</p>
        </div>
      );
    }

    return (
      <div className="w-full max-w-lg rounded-xl border border-mari-border p-6">
        <Steps
          data={stepData}
          currentStep={current}
          onChange={setCurrent}
          onComplete={() => setCompleted(true)}
          content={
            <>
              <StepsContent value={1} currentSteps={current}>
                <RadioGroup aria-label="Bilet tipi" options={ticketOptions} value={ticket} onChange={(v) => setTicket(String(v))} />
              </StepsContent>
              <StepsContent value={2} currentSteps={current}>
                <RadioGroup aria-label="Zaman" options={timeOptions} value={time} onChange={(v) => setTime(String(v))} />
              </StepsContent>
              <StepsContent value={3} currentSteps={current}>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-mari-muted">Bilet: </span>
                    {ticketOptions.find((o) => o.value === ticket)?.label}
                  </p>
                  <p>
                    <span className="text-mari-muted">Zaman: </span>
                    {timeOptions.find((o) => o.value === time)?.label}
                  </p>
                </div>
              </StepsContent>
            </>
          }
        />
      </div>
    );
  },
};

export const Horizontal: Story = {
  name: "Yatay",
  ...storyDoc("Adımlara tıklanabilir veya Tab+Enter ile klavyeyle geçilebilir."),
  render: () => {
    const [current, setCurrent] = useState(1);
    return <Steps data={stepData} currentStep={current} onChange={setCurrent} />;
  },
};

export const Vertical: Story = {
  name: "Dikey",
  ...storyDoc("Aynı etkileşim yatay ile aynı, sadece dikey akış."),
  render: () => {
    const [current, setCurrent] = useState(1);
    return <Steps data={stepData} currentStep={current} onChange={setCurrent} vertical />;
  },
};

export const WithDots: Story = {
  name: "Nokta Gösterimli",
  ...storyDoc("`dot` numara/ikon yerine sade bir nokta gösterir — daha minimal bir ilerleme çubuğu hissi."),
  render: () => {
    const [current, setCurrent] = useState(1);
    return <Steps data={stepData} currentStep={current} onChange={setCurrent} dot />;
  },
};

export const VerticalWithDots: Story = {
  name: "Dikey + Nokta Gösterimli",
  ...storyDoc("`vertical` + `dot` birlikte."),
  render: () => {
    const [current, setCurrent] = useState(1);
    return <Steps data={stepData} currentStep={current} onChange={setCurrent} vertical dot />;
  },
};

export const ReadOnly: Story = {
  name: "Salt Okunur",
  ...storyDoc(
    "`onChange` verilmediğinde adımlar tıklanabilir GÖRÜNMEZ (eskiden `cursor-pointer` her zaman vardı, tıklansa " +
      "hiçbir şey olmazdı) ve dahili \"Geri\"/\"İleri\" butonları render edilmez — sadece bir ilerleme göstergesi " +
      "olarak kullanılabilir (örn. bir sipariş takip sayfasında)."
  ),
  args: {
    data: stepData,
    currentStep: 2,
  },
};

export const AllColors: Story = {
  name: "Tüm Renkler",
  ...storyDoc("7 renk rolü — aktif/tamamlanmış adımların rengini belirler."),
  render: () => (
    <div className="flex flex-col gap-8">
      {(["primary", "accent", "success", "warning", "error", "info", "neutral"] as const).map((color) => (
        <Steps key={color} data={stepData} currentStep={2} color={color} />
      ))}
    </div>
  ),
};
