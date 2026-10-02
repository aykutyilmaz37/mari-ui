/**
 * Faz 16.4: Mention ayrı bir bileşen değil, Input/Textarea'nın `mentions`
 * özelliği (16.0 kararı). Senaryolar: yorumda kişi etiketleme (avatar),
 * kişi + konu etiketi (iki tetik), sunucu araması (onSearch + loading),
 * tek satırlık sohbet kutusu. Story seviyesinde `parameters` YAZMAYIN.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Field } from "../field";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import type { MentionOption } from "./mention/types";

const meta: Meta<typeof Textarea> = {
  title: "Veri Girişi/Mentions",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      story: { height: "24rem" },
      description: {
        component: componentDoc({
          summary:
            "Input ve Textarea'nın `mentions` özelliği: tetik karakteri (`@`, istenirse `#` gibi başkaları) yazılınca imlecin " +
            "hemen altında öneri listesi açılır, seçilen değer metne yazılır (`@ayse.demir `). Liste Select'in listesiyle aynı " +
            "görünüm; arama Türkçe/aksansız. Kelime içindeki `@` (e-posta) tetiklemez.",
          whenToUse: ["Yorum, görev açıklaması, sohbet gibi serbest metinde kişi ya da konu etiketlemek."],
          whenNotToUse: [
            "Alıcı/atanan kişi seçimi gibi metinden bağımsız bir alan — Select (`mode=\"multiple\"`) ya da AutoComplete.",
            "Maskeli alan — `mask` ile birlikte çalışmaz.",
          ],
          a11y:
            "Input `role=\"combobox\"` + `aria-expanded`; Textarea `aria-autocomplete=\"list\"`. Odak hep alanda, aktif öneri " +
            "`aria-activedescendant`. ↑/↓ gezinir (devre dışı atlanır), Enter/Tab seçer, Escape listeyi kapatır (Modal'ı değil). " +
            "Liste açıkken Enter formu göndermez.",
        }),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {
  ...storyDoc("Textarea + `mentions`; kontrollerden satır sayısı ve yer tutucu. `@` yazın."),
  args: { rows: 3, placeholder: "Yorum yazın, @ ile birini etiketleyin", "aria-label": "Yorum" },
  render: (args) => <Textarea {...args} mentions={{ options: TEAM }} />,
};

const TEAM: MentionOption[] = [
  ["ayse.demir", "Ayşe Demir", "Ürün tasarımcısı"],
  ["mehmet.kaya", "Mehmet Kaya", "Arka uç geliştirici"],
  ["zeynep.arslan", "Zeynep Arslan", "Ürün yöneticisi"],
  ["can.ozturk", "Can Öztürk", "Mobil geliştirici"],
  ["elif.sahin", "Elif Şahin", "Müşteri destek"],
  ["burak.yildiz", "Burak Yıldız", "QA mühendisi"],
].map(([value, name, role]) => ({
  value: value!,
  label: name,
  description: role,
  searchText: `${value} ${name}`,
  icon: <Avatar size="sm" alt={name!} />,
}));

/* ─────────────────────────── 1. Yorum ─────────────────────────── */

export const Comment: Story = {
  name: "Yorumda Kişi Etiketleme",
  ...storyDoc(
    "Textarea'da `@` yazınca ekip listesi; avatar `icon`, unvan `description`. `searchText` hem kullanıcı adında hem " +
      "görünen adda aramayı sağlar (\"ayşe\", \"demir\", \"ayse.d\"). Bahsedilenler `onSelect` ile toplanır.",
    `<Textarea value={text} onChange={(e) => setText(e.target.value)} mentions={{ options: team, onSelect: (o) => notify(o.value) }} />`
  ),
  render: () => {
    const [text, setText] = useState("Tasarım hazır, ");
    const [mentioned, setMentioned] = useState<string[]>([]);
    return (
      <div className="flex max-w-lg flex-col gap-3">
        <Field label="Yorum" hint="Birini etiketlemek için @ yazın.">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 8 }}
            mentions={{ options: TEAM, onSelect: (o) => setMentioned((prev) => [...new Set([...prev, o.value])]) }}
          />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-mari-muted">{mentioned.length ? "Bildirim gidecek: " + mentioned.map((m) => "@" + m).join(", ") : "Henüz kimse etiketlenmedi."}</p>
          <Button size="sm">Gönder</Button>
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Kişi + konu ─────────────────────────── */

const TOPICS: MentionOption[] = ["fatura", "iade", "kargo", "acil", "hata", "öneri"].map((t) => ({ value: t }));

export const PeopleAndTopics: Story = {
  name: "Kişi ve Konu (İki Tetik)",
  ...storyDoc(
    "`prefix={[\"@\", \"#\"]}` ve `options` fonksiyonu: hangi tetik yazıldıysa ona göre liste.",
    `<Textarea mentions={{ prefix: ["@", "#"], options: (prefix) => (prefix === "#" ? topics : team) }} />`
  ),
  render: () => (
    <div className="max-w-lg">
      <Field label="Destek notu" hint="@ kişi, # konu etiketi.">
        <Textarea rows={4} defaultValue="Müşteri ikinci kez yazdı #" mentions={{ prefix: ["@", "#"], options: (prefix) => (prefix === "#" ? TOPICS : TEAM) }} />
      </Field>
    </div>
  ),
};

/* ─────────────────────────── 3. Sunucu araması ─────────────────────────── */

export const ServerSearch: Story = {
  name: "Sunucu Araması",
  ...storyDoc(
    "Büyük kullanıcı tabanında liste sunucudan gelir: `filterOption: false` (yerel süzme kapalı), `onSearch` sorguyu " +
      "bildirir, sonuç gelene kadar `loading`.",
    `<Textarea mentions={{ options: results, filterOption: false, loading, onSearch: (q) => fetchUsers(q) }} />`
  ),
  render: () => {
    const [query, setQuery] = useState<string | null>(null);
    const [results, setResults] = useState<MentionOption[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      if (query === null) return;
      setLoading(true);
      const t = setTimeout(() => {
        const q = query.toLocaleLowerCase("tr");
        setResults(TEAM.filter((o) => (o.searchText ?? "").toLocaleLowerCase("tr").includes(q)).slice(0, 4));
        setLoading(false);
      }, 600);
      return () => clearTimeout(t);
    }, [query]);
    return (
      <div className="max-w-lg">
        <Field label="Görev açıklaması">
          <Textarea rows={3} placeholder="@ ile birini ekleyin" mentions={{ options: results, filterOption: false, loading, onSearch: (q) => setQuery(q) }} />
        </Field>
      </div>
    );
  },
};

/* ─────────────────────────── 4. Tek satır ─────────────────────────── */

export const ChatInput: Story = {
  name: "Sohbet Kutusu (Input)",
  ...storyDoc(
    "Tek satırlık Input'ta da aynı özellik. Liste açıkken Enter öneriyi seçer; kapalıyken `onPressEnter` mesajı gönderir.",
    `<Input mentions={{ options: team }} onPressEnter={send} />`
  ),
  render: () => {
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<string[]>(["@zeynep.arslan sürüm notlarını paylaşabilir misin?"]);
    const send = () => {
      if (!text.trim()) return;
      setMessages((m) => [...m, text.trim()]);
      setText("");
    };
    return (
      <div className="flex max-w-lg flex-col gap-3 rounded-lg border border-mari-border p-3">
        <ul className="flex flex-col gap-1 text-sm">
          {messages.map((m, i) => (
            // Mesajlar yalnız eklenir.
            <li key={i} className="rounded-md bg-mari-surface-alt px-3 py-1.5">
              {m}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input aria-label="Mesaj" placeholder="Mesaj yazın, @ ile etiketleyin" value={text} onChange={(e) => setText(e.target.value)} onPressEnter={send} mentions={{ options: TEAM }} />
          <Button onClick={send}>Gönder</Button>
        </div>
      </div>
    );
  },
};
