import type { Meta, StoryObj } from "@storybook/react";
import { MariLogo } from "../logo";
import { storyDoc } from "../lib/storyMeta";

const meta = {
  id: "foundations-brand",
  title: "Foundations/Marka",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "mari-ui logosu, üç yapraklı bir iris ile ‘m’ monogramını birleştirir. `MariLogo` temanın `primary` rengini kullanır: koyu temada ve seçili tasarım kişiliğinde kendiliğinden uyum sağlar. Dar alanlarda yalnız işaret (`variant=\"mark\"`) kullanılır.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TILE = "flex min-h-32 items-center justify-center rounded-xl border border-mari-border bg-mari-surface p-5";

export const LogoAilesi: Story = {
  name: "Logo ve uygulama simgesi",
  ...storyDoc(
    "Yazı logosu başlıklarda, işaret dar alanlarda (kenar çubuğu rayı, uygulama simgesi). Açık ve koyu zemin `data-theme` ile; renkler temadan gelir.",
    `
import { MariLogo } from "@mari-ui/components/logo";

<header data-theme="light" className="bg-mari-surface p-5">
  <MariLogo size={56} />
</header>
<header data-theme="dark" className="bg-mari-surface p-5">
  <MariLogo size={56} />
</header>

<MariLogo variant="mark" size={56} label="Mari UI" />
`
  ),
  render: () => (
    <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
      <section className="rounded-xl border border-mari-border bg-mari-surface p-6">
        <h2 className="mb-1 font-heading text-lg font-semibold">Yazı logosu</h2>
        <p className="mb-5 text-sm text-mari-muted">Dokümantasyon, web ve sunumlarda kullanılır.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-theme="light" className={TILE}>
            <MariLogo size={48} label="Mari UI yazı logosu, açık zemin" />
          </div>
          <div data-theme="dark" className={TILE}>
            <MariLogo size={48} label="Mari UI yazı logosu, koyu zemin" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-mari-border bg-mari-surface p-6">
        <h2 className="mb-1 font-heading text-lg font-semibold">Uygulama simgesi</h2>
        <p className="mb-5 text-sm text-mari-muted">Küçük alanlarda yalnızca iris monogramını kullan.</p>
        <div className="grid grid-cols-2 gap-4">
          <div data-theme="light" className={TILE}>
            <MariLogo variant="mark" size={56} label="Mari UI uygulama simgesi, açık zemin" />
          </div>
          <div data-theme="dark" className={TILE}>
            <MariLogo variant="mark" size={56} label="Mari UI uygulama simgesi, koyu zemin" />
          </div>
        </div>
      </section>
    </div>
  ),
};
