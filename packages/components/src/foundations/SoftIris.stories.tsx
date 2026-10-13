"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Check, Moon, Sun } from "lucide-react";
import { contrastRatio, darkTheme, lightTheme, personaNames, personas, resolveThemeConfig, type HexColor, type PersonaName, type Theme, type ThemeMode } from "@mari-ui/tokens";
import { Button } from "../button";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { Tag } from "../tag";

/** Faz 21 — araç çubuğundaki Kişilik seçimine göre tema ve etiket (oranlar da o temadan hesaplanır). */
function personaOf(globals: Record<string, unknown>): { label: string; themes: Record<ThemeMode, Theme> } {
  const name = globals.persona as PersonaName;
  if (!personaNames.includes(name)) return { label: "Yumuşak iris", themes: { light: lightTheme, dark: darkTheme } };
  const resolved = resolveThemeConfig({ persona: name });
  return { label: personas[name].label, themes: { light: resolved.light, dark: resolved.dark } };
}

function IrisForm({ mode, theme, label }: { mode: ThemeMode; theme: Theme; label: string }) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("Mari Studio");
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState("");
  const { canvas, primary } = theme.color;
  const modeLabel = mode === "light" ? "Açık tema" : "Koyu tema";
  const ModeIcon = mode === "light" ? Sun : Moon;
  const ratio = (a: string, b: string) => contrastRatio(a as HexColor, b as HexColor).toFixed(2);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setInvalid(!name.trim());
    if (!name.trim()) {
      inputRef.current?.focus();
      return;
    }
    setStatus(`“${name.trim()}” önizlemede oluşturuldu.`);
  }

  return (
    <section data-theme={mode} aria-label={modeLabel} className="min-w-0 overflow-hidden rounded-xl border border-mari-border bg-mari-surface text-mari-foreground">
      <header className="flex items-center justify-between gap-3 border-b border-mari-border px-6 py-5">
        <span className="font-heading text-2xl font-bold tracking-tight">mari<span className="text-mari-primary">-ui</span></span>
        <span className="flex items-center gap-2 text-xs text-mari-muted"><ModeIcon size={16} aria-hidden />{modeLabel}</span>
      </header>
      <div className="p-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-mari-primary">{label}</p>
        <h2 className="mb-2 font-heading text-2xl font-semibold tracking-tight">Yeni bir başlangıç.</h2>
        <p className="mb-6 text-sm leading-relaxed text-mari-muted">Fikrini web ve mobilde aynı özenle hayata geçir.</p>
        <form onSubmit={submit} noValidate>
          <label htmlFor={`${id}-name`} className="mb-2 block text-sm font-medium">Proje adı <span aria-hidden>*</span></label>
          <Input
            ref={inputRef}
            id={`${id}-name`}
            required
            value={name}
            size="lg"
            className="min-h-11"
            placeholder="Projene bir isim ver"
            color={invalid ? "error" : undefined}
            aria-describedby={`${id}-hint`}
            onChange={(event) => { setName(event.target.value); setInvalid(false); setStatus(""); }}
          />
          <p id={`${id}-hint`} className={invalid ? "mt-2 text-xs text-mari-error" : "mt-2 text-xs text-mari-muted"}>
            {invalid ? "Hata: Proje adı gerekli." : "Daha sonra değiştirebilirsin."}
          </p>
          <label htmlFor={`${id}-platform`} className="mb-2 mt-5 block text-sm font-medium">Platform</label>
          <select id={`${id}-platform`} className="mb-5 min-h-11 w-full rounded-md border border-mari-input bg-mari-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring">
            <option>Web + React Native</option><option>Web</option><option>React Native</option>
          </select>
          <div className="mb-5 flex min-h-11 items-center"><Checkbox defaultChecked label="Koyu tema desteğini etkinleştir" /></div>
          <div className="flex flex-wrap gap-2">
            <Button htmlType="submit" size="lg" className="min-h-11 flex-1" icon={<ArrowRight size={16} aria-hidden />} iconPosition="end">Proje oluştur</Button>
            <Button variant="outline" color="neutral" size="lg" className="min-h-11" onClick={() => { setName(""); setInvalid(false); setStatus(""); inputRef.current?.focus(); }}>Temizle</Button>
          </div>
          <p role="status" className="mt-3 min-h-6 text-xs text-mari-success">{status}</p>
        </form>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-mari-border pt-4">
          <Tag color="primary" variant="soft"><span className="inline-flex items-center gap-1"><Check size={12} aria-hidden />Seçili</span></Tag>
          <Tag color="primary" variant="soft">React</Tag><Tag color="primary" variant="soft">React Native</Tag>
        </div>
      </div>
      <footer className="flex flex-wrap gap-x-4 gap-y-1 border-t border-mari-border px-6 py-4 text-xs text-mari-muted">
        <span>Metin {ratio(canvas.foreground, canvas.surface)}:1</span>
        <span>Düğme {ratio(primary.solidContrast, primary.solid)}:1</span>
        <span>Alan sınırı {ratio(canvas.input, canvas.surface)}:1</span>
      </footer>
    </section>
  );
}

const meta = {
  id: "foundations-soft-iris",
  title: "Foundations/Yumuşak İris",
  parameters: { layout: "fullscreen", docs: { description: { component: "Varsayılan kişilik: Geist arayüz, Manrope başlıklar; araç çubuğundaki Kişilik seçimiyle diğer kişilikler aynı ekranda görülür. Açık ve koyu temalarda aynı gerçek bileşenler. Tab ile odağı; Temizle → Proje oluştur ile hata durumunu deneyin. Oranlar ortak token'lardan hesaplanır; tüm ürünün erişilebilirlik sertifikası değildir." } } },
  tags: ["autodocs"],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Karsilastirma: Story = {
  name: "Açık / koyu karşılaştırma",
  render: (_args, { globals }) => {
    const { label, themes } = personaOf(globals);
    return <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2"><IrisForm mode="light" theme={themes.light} label={label} /><IrisForm mode="dark" theme={themes.dark} label={label} /></div>;
  },
};
export const Acik: Story = { name: "Açık tema", render: (_args, { globals }) => { const { label, themes } = personaOf(globals); return <div className="max-w-md"><IrisForm mode="light" theme={themes.light} label={label} /></div>; } };
export const Koyu: Story = { name: "Koyu tema", render: (_args, { globals }) => { const { label, themes } = personaOf(globals); return <div className="max-w-md"><IrisForm mode="dark" theme={themes.dark} label={label} /></div>; } };
