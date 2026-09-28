import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  id: "foundations-brand",
  title: "Foundations/Marka",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "mari-ui logosu, yumuşak iris morunu üç yapraklı bir iris ve ‘m’ monogramıyla birleştirir. Açık ve koyu zemin varyantları ile kompakt uygulama simgesi burada gösterilir.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LogoAilesi: Story = {
  name: "Logo ve uygulama simgesi",
  render: () => (
    <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
      <section className="rounded-2xl border border-mari-border bg-mari-surface p-6">
        <h2 className="mb-1 font-heading text-lg font-semibold">Yazı logosu</h2>
        <p className="mb-5 text-sm text-mari-muted">
          Dokümantasyon, web ve sunumlarda kullanılır.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex min-h-32 items-center justify-center rounded-xl border border-mari-border bg-white p-5">
            <img
              src="/mari-ui-logo.svg"
              alt="Mari UI yazı logosu, açık zemin"
              width={184}
              height={56}
              className="h-auto w-full max-w-[184px]"
            />
          </div>
          <div
            className="flex min-h-32 items-center justify-center rounded-xl p-5"
            style={{ backgroundColor: "#191822" }}
          >
            <img
              src="/mari-ui-logo-dark.svg"
              alt="Mari UI yazı logosu, koyu zemin"
              width={184}
              height={56}
              className="h-auto w-full max-w-[184px]"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-mari-border bg-mari-surface p-6">
        <h2 className="mb-1 font-heading text-lg font-semibold">Uygulama simgesi</h2>
        <p className="mb-5 text-sm text-mari-muted">
          Küçük alanlarda yalnızca iris monogramını kullan.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex min-h-32 items-center justify-center rounded-xl border border-mari-border bg-white p-5">
            <img
              src="/mari-ui-icon.svg"
              alt="Mari UI uygulama simgesi, açık zemin üzerinde"
              width={56}
              height={56}
              className="size-14"
            />
          </div>
          <div
            className="flex min-h-32 items-center justify-center rounded-xl p-5"
            style={{ backgroundColor: "#191822" }}
          >
            <img
              src="/mari-ui-icon.svg"
              alt="Mari UI uygulama simgesi, koyu zemin üzerinde"
              width={56}
              height={56}
              className="size-14"
            />
          </div>
        </div>
      </section>
    </div>
  ),
};
