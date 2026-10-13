import React, { useRef, useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Upload, type UploadFile, type UploadPickContext, type UploadPickedFile } from "./Upload";
import { ActionSheet } from "../BottomSheet";
import { Button } from "../Button";
import { Field } from "../Field";
import { Text } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNarrow, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Upload> = {
  title: "Native/Veri Girişi/Upload",
  component: Upload,
  tags: ["autodocs"],
  decorators: [withNarrow, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Dosya / görsel ekleme alanı. Seçme işini uygulama yapar (`onPick`) — kütüphane hiçbir native seçiciye bağlı değil. Upload doğrular (`fileType`, `fileSize`, `max`), listeler (`list`) ya da önizleme ızgarasında gösterir (`review`, kare / daire), görsele dokununca tam ekran ImageViewer açar; isteğe bağlı gerçek yüklemenin (`onUpload`) ilerlemesini, hatasını ve tekrar denemesini gösterir.",
    whenToUse: ["Fotoğraf / belge ekleme: ilan fotoğrafları, iade formu, profil fotoğrafı.", "Sunucuya hemen yükleme (`onUpload`) ya da form ile birlikte gönderme."],
    whenNotToUse: ["Tek bir görseli yalnız göstermek — Image.", "Metin / bağlantı girişi — Input."],
    vsWeb: "Web `File` + gizli `<input type=file>` yerine `onPick` (zorunlu): expo-image-picker / expo-document-picker / react-native-image-picker ile doldurun, `{ uri, name?, size?, mimeType? }[]` ya da iptalde `null` döndürün. Kamera / galeri seçimi için `onPick` içinde ActionSheet açın. Sürükle-bırak yok (`inputType` yok). Web'deki simüle ilerleme yerine gerçek `onUpload(file, report)`; verilmezse dosyalar hemen `done`. Ret mesajları toast yerine alanın altında (+ `onReject`). `listType` / `reviewType` / `fileType` / `fileSize` (bayt) / `max` adları aynı. Story'ler gerçek galeri / kamerayı native-studio'da açar (studio'nun expo-image-picker'ı); web Storybook'ta seçici yoktur.",
  }) } } },
  argTypes: {
    listType: { control: "select", options: ["list", "review"] },
    reviewType: { control: "select", options: ["square", "circle"] },
    max: { control: "number" },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { listType: "list", reviewType: "square", max: 5, disabled: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Upload>;

const MB = 1024 * 1024;

/** native-studio'nun `globals.pickImages`i (expo-image-picker). Web Storybook'ta yok — seçim yapılmaz. */
type StoryPicker = (opts: { multiple: boolean; limit: number; camera?: boolean }) => Promise<UploadPickedFile[] | null>;
const studioPicker = (ctx: unknown): StoryPicker | undefined => (ctx as { globals?: { pickImages?: StoryPicker } } | undefined)?.globals?.pickImages;

/** Galeriden seçen `onPick` (gerçek uygulamada da aynısı: expo-image-picker). */
const galleryPick = (picker: StoryPicker | undefined) => async (ctx: UploadPickContext) => (picker ? picker({ multiple: ctx.multiple, limit: ctx.remaining }) : null);

function WebNote({ picker }: { picker?: StoryPicker }) {
  if (picker) return null;
  return <Text muted style={{ fontSize: 13 }}>Web Storybook'ta seçici yok — native-studio'da telefonun galerisi açılır.</Text>;
}

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin. native-studio'da telefonun galerisi açılır."),
  render: (args, ctx) => {
    const picker = studioPicker(ctx);
    return (
      <Stack>
        <Upload {...args} fileType="image/*" onPick={galleryPick(picker)} hint="Görsel · en fazla 5 MB" accessibilityLabel="Fotoğraf ekle" />
        <WebNote picker={picker} />
      </Stack>
    );
  },
};

function ListingDemo({ picker }: { picker?: StoryPicker }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  // Kamera / galeri: onPick bir söz döndürür, ActionSheet seçimiyle çözülür.
  const pending = useRef<((v: UploadPickedFile[] | null) => void) | null>(null);
  const remaining = useRef(1);
  const choosing = useRef(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const finish = (v: UploadPickedFile[] | null) => {
    pending.current?.(v);
    pending.current = null;
  };
  // Eylem panel kapandıktan SONRA çalışır (iOS: kapanan Modal varken seçici açılmaz).
  const choose = async (camera: boolean) => finish(picker ? await picker({ multiple: !camera, limit: remaining.current, camera }) : null);
  const startChoose = (camera: boolean) => {
    choosing.current = true;
    void choose(camera);
  };
  const onPick = (ctx: UploadPickContext) =>
    new Promise<UploadPickedFile[] | null>((resolve) => {
      pending.current = resolve;
      remaining.current = ctx.remaining;
      setSheetOpen(true);
    });
  return (
    <Stack>
      <Field label="İlan fotoğrafları" hint="İlk fotoğraf kapak olur. En fazla 6.">
        <Upload listType="review" max={6} fileType="image/*" value={files} onChange={setFiles} onPick={onPick} />
      </Field>
      <Text muted>{`${files.length} fotoğraf`}</Text>
      <WebNote picker={picker} />
      <ActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        // Eylem seçilmediyse (Vazgeç / dışarı dokunma) seçim iptal.
        onAfterClose={() => {
          if (pending.current && !choosing.current) finish(null);
          choosing.current = false;
        }}
        title="Fotoğraf ekle"
        actions={[
          { label: "Fotoğraf çek", onPress: () => startChoose(true) },
          { label: "Galeriden seç", onPress: () => startChoose(false) },
        ]}
      />
    </Stack>
  );
}

export const Listing: Story = {
  name: "İlan Fotoğrafları (Kare Önizleme)",
  ...storyDoc(
    "`listType=\"review\"`: kare döşemeler + \"Ekle\". `onPick` içinde ActionSheet ile kamera / galeri seçimi. Görsele dokununca tam ekran görüntüleyici; köşedeki ✕ kaldırır. `max` dolunca \"Ekle\" kaybolur. Not: simülatörde kamera yok.",
    `<Upload
  listType="review"
  max={6}
  fileType="image/*"
  value={files}
  onChange={setFiles}
  onPick={async (ctx) => {
    const source = await askCameraOrLibrary(); // ActionSheet
    const r = source === "camera"
      ? await ImagePicker.launchCameraAsync()
      : await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: ctx.multiple, selectionLimit: ctx.remaining });
    return r.canceled ? null : r.assets.map((a) => ({ uri: a.uri, name: a.fileName, size: a.fileSize, mimeType: a.mimeType }));
  }}
/>`
  ),
  render: (_args, ctx) => <ListingDemo picker={studioPicker(ctx)} />,
};

export const Avatar: Story = {
  name: "Profil Fotoğrafı (Daire)",
  ...storyDoc("`reviewType=\"circle\"` + `max={1}`: tek, yuvarlak profil fotoğrafı. Kaldırınca yeniden \"Ekle\".", `<Upload listType="review" reviewType="circle" max={1} fileType="image/*" onPick={pickAvatar} />`),
  render: (_args, ctx) => (
    <Field label="Profil fotoğrafı">
      <Upload listType="review" reviewType="circle" max={1} fileType="image/*" onPick={galleryPick(studioPicker(ctx))} />
    </Field>
  ),
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Sahte sunucu: %10 adımlarla ilerler; "Sunucu hatası" anahtarı açıksa her dosya %60'ta ilk denemede düşer. */
const failedOnce = new Set<string>();
const fakeUpload = (failFirst: boolean) => async (file: UploadFile, report: (p: number) => void) => {
  for (let p = 10; p <= 100; p += 10) {
    await wait(150);
    report(p);
    if (p === 60 && failFirst && !failedOnce.has(file.uid)) {
      failedOnce.add(file.uid);
      throw new Error("Bağlantı kesildi");
    }
  }
};

function ReturnDemo({ picker }: { picker?: StoryPicker }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [failFirst, setFailFirst] = useState(true);
  const uploading = files.some((f) => f.status === "uploading");
  const failed = files.some((f) => f.status === "error");
  return (
    <Stack>
      <Field label="Ürün fotoğrafları" hint="En fazla 4 · 5 MB">
        <Upload fileType="image/*" max={4} value={files} onChange={setFiles} onPick={galleryPick(picker)} onUpload={fakeUpload(failFirst)} triggerLabel="Fotoğraf ekle" />
      </Field>
      <Button size="sm" variant="ghost" onPress={() => setFailFirst((v) => !v)}>{failFirst ? "Sunucu hatası: açık" : "Sunucu hatası: kapalı"}</Button>
      <Button block disabled={files.length === 0 || uploading || failed}>
        {uploading ? "Yükleniyor…" : "İade talebini gönder"}
      </Button>
      <WebNote picker={picker} />
    </Stack>
  );
}

export const ReturnForm: Story = {
  name: "İade Formu (onUpload)",
  ...storyDoc(
    "`onUpload(file, report)`: dosya eklenir eklenmez yüklenir, `report(0–100)` ilerlemeyi gösterir; reddedilirse satır kırmızı + \"tekrar yükle\". Bu örnekte sunucu sahte: \"Sunucu hatası\" açıkken her fotoğraf ilk denemede %60'ta düşer. Gönder düğmesi yükleme bitene kadar pasif.",
    `<Upload
  fileType="image/*"
  max={4}
  value={files}
  onChange={setFiles}
  onPick={pickFromGallery}
  onUpload={async (file, report) => {
    await api.upload(file.uri, { onProgress: (e) => report((e.loaded / e.total) * 100) });
  }}
/>`
  ),
  render: (_args, ctx) => <ReturnDemo picker={studioPicker(ctx)} />,
};

export const Validation: Story = {
  name: "Tür ve Boyut Sınırı",
  ...storyDoc(
    "`fileSize` (bayt) ve `fileType` (web `accept` sözdizimi): uymayanlar eklenmez, nedeni alanın altında yazar (`onReject` ile de alınır). Bu örnekte sınır 1 MB — galeriden büyük bir fotoğraf seçerseniz reddedilir; 2'den fazla seçerseniz fazlası \"en fazla\" ile.",
    `<Upload fileType="image/*" fileSize={1 * 1024 * 1024} max={2} onReject={(reason, file) => log(reason, file.name)} />`
  ),
  render: (_args, ctx) => <Upload fileType="image/*" fileSize={1 * MB} max={2} onPick={galleryPick(studioPicker(ctx))} hint="Görsel · en fazla 1 MB · en fazla 2" accessibilityLabel="Fotoğraf ekle" />,
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc("Pasif: seçici açılmaz, kaldırma düğmeleri yok.", `<Upload disabled … />`),
  render: (_args, ctx) => (
    <View style={{ gap: 16 }}>
      <Upload disabled onPick={galleryPick(studioPicker(ctx))} hint="Görsel · en fazla 5 MB" />
      <Upload disabled listType="review" onPick={galleryPick(studioPicker(ctx))} />
    </View>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Listede düğme + ipucu satırı, önizlemede döşeme.", `<Field label="Belgeler" skeleton={isLoading}><Upload onPick={pick} hint="…" /></Field>`),
  render: (_args, ctx) => (
    <SkeletonDemo>
      {(skeleton) => (
        <Field label="Fotoğraflar" skeleton={skeleton}>
          <Upload onPick={galleryPick(studioPicker(ctx))} hint="Görsel · en fazla 5 MB" />
        </Field>
      )}
    </SkeletonDemo>
  ),
};
