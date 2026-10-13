import React, { useRef, useState } from "react";
import { Image as RNImage, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { Theme } from "@mari-ui/tokens";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { Button } from "../Button";
import { ImageViewer } from "../Image";
import { Progress } from "../Progress";
import { FileIcon, PlusIcon, RotateCcwIcon, UploadIcon, XIcon } from "../lib/icons";
import { SkeletonBox, SkeletonText, type SkeletonableProps } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";
import { useFieldControl } from "../lib/fieldContext";
import { formatBytes, isImageFile, nameFromUri, rejectMessage, splitPicked, type UploadPickedFile, type UploadRejectReason } from "./uploadUtils";

export type { UploadPickedFile, UploadRejectReason };

export type UploadFileStatus = "uploading" | "done" | "error";

export interface UploadFile {
  uid: string;
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  status: UploadFileStatus;
  /** 0–100 (`uploading`). */
  progress?: number;
  /** `error` durumunda gösterilen açıklama. */
  error?: string;
}

export interface UploadPickContext {
  /** `max` 1'den büyükse çoklu seçim açılsın. */
  multiple: boolean;
  /** Daha kaç dosya eklenebilir. */
  remaining: number;
  /** `fileType` olduğu gibi (seçiciye süzgeç olarak verilebilir). */
  accept?: string;
}

/** Web ile aynı adlar: `list` satırlar, `review` kare/daire önizleme ızgarası. */
export type UploadListType = "list" | "review";
export type UploadReviewType = "square" | "circle";

export interface UploadProps extends SkeletonableProps {
  /**
   * Dosya seçme işi — kütüphane hiçbir native seçiciye bağlı değil. expo-image-picker,
   * expo-document-picker ya da react-native-image-picker ile doldurun; iptalde `null`.
   * Kamera / galeri seçimi için burada ActionSheet açabilirsiniz.
   */
  onPick: (ctx: UploadPickContext) => Promise<UploadPickedFile[] | null | undefined>;
  /**
   * Gerçek yükleme (isteğe bağlı). Verilirse dosya `uploading` başlar, `report(0–100)`
   * ilerlemeyi gösterir; çözülünce `done`, reddedilince `error` (tekrar dene düğmesi).
   * Verilmezse dosyalar hemen `done` (yükleme formla birlikte yapılır).
   */
  onUpload?: (file: UploadFile, report: (progress: number) => void) => Promise<void>;
  value?: UploadFile[];
  defaultValue?: UploadFile[];
  /** Liste her değiştiğinde (ekleme, ilerleme, bitiş, silme). */
  onChange?: (files: UploadFile[]) => void;
  /** Reddedilen her dosya için (tür / boyut / sayı). Varsayılan mesaj yine alanın altında görünür. */
  onReject?: (reason: UploadRejectReason, file: UploadPickedFile) => void;
  /** Kabul edilen türler (web `accept` sözdizimi): "image/*", "image/png, .pdf". */
  fileType?: string;
  /** Bayt. Varsayılan: 5 MB. Boyutu bilinmeyen dosyada denetlenmez. */
  fileSize?: number;
  /** En fazla dosya. Varsayılan: 5. */
  max?: number;
  /** Varsayılan: `list`. */
  listType?: UploadListType;
  /** `review` döşemesi. Varsayılan: `square` (`circle`: profil fotoğrafı). */
  reviewType?: UploadReviewType;
  /** `list` düğme metni. Varsayılan: "Dosya seç". */
  triggerLabel?: string;
  /** Düğmenin altında kısa açıklama (ör. "PNG, JPG · en fazla 5 MB"). */
  hint?: React.ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const TILE = 88;
let uidSeq = 0;
const nextUid = () => `upload-${Date.now().toString(36)}-${(uidSeq++).toString(36)}`;

function ProgressLine({ file }: { file: UploadFile }) {
  if (file.status !== "uploading") return null;
  return <Progress percent={file.progress ?? 0} size="sm" showInfo={false} />;
}

interface ItemProps {
  file: UploadFile;
  disabled: boolean;
  onRemove: () => void;
  onRetry?: () => void;
  onPreview?: () => void;
  theme: Theme;
}

/** Liste satırı: [önizleme / dosya ikonu] ad + boyut / ilerleme / hata [tekrar dene] [sil]. */
function FileRow({ file, disabled, onRemove, onRetry, onPreview, theme }: ItemProps) {
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const image = isImageFile(file);
  const error = file.status === "error";
  let meta: string | undefined = file.size === undefined ? undefined : formatBytes(file.size);
  if (file.status === "uploading") meta = `Yükleniyor %${Math.round(file.progress ?? 0)}`;
  if (error) meta = file.error ?? "Yüklenemedi";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: error ? theme.color.error.border : c.border, borderRadius: 12, backgroundColor: c.surface }}>
      <Pressable accessibilityRole={image ? "imagebutton" : undefined} accessibilityLabel={image ? `${file.name} önizle` : undefined} disabled={!onPreview} onPress={onPreview}>
        {image ? (
          <RNImage source={{ uri: file.uri }} style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: c.surfaceAlt }} />
        ) : (
          <View style={{ width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceAlt }}>
            <FileIcon size={20} color={c.muted} />
          </View>
        )}
      </Pressable>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Text numberOfLines={1} style={{ fontFamily: font, fontSize: 15, color: c.foreground }}>{file.name}</Text>
        {meta ? <Text numberOfLines={1} style={{ fontFamily: font, fontSize: 13, color: error ? theme.color.error.text : c.muted }}>{meta}</Text> : null}
        <ProgressLine file={file} />
      </View>
      {error && onRetry ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`${file.name} tekrar yükle`} hitSlop={8} onPress={onRetry} disabled={disabled}>
          <RotateCcwIcon size={18} color={theme.color.primary.text} />
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityLabel={`${file.name} kaldır`} hitSlop={10} onPress={onRemove} disabled={disabled} style={{ opacity: disabled ? 0.4 : 1 }}>
        <XIcon size={18} color={c.muted} />
      </Pressable>
    </View>
  );
}

/** Önizleme döşemesi: görsel (ya da dosya ikonu), yüklenirken alt çubuk, köşede sil. */
function FileTile({ file, disabled, onRemove, onRetry, onPreview, theme, circle }: ItemProps & { circle: boolean }) {
  const c = theme.color.canvas;
  const radius = circle ? TILE / 2 : 12;
  const error = file.status === "error";
  return (
    <View style={{ width: TILE, height: TILE }}>
      <Pressable accessibilityRole="imagebutton" accessibilityLabel={`${file.name} önizle`} disabled={!onPreview} onPress={onPreview} style={{ width: TILE, height: TILE, borderRadius: radius, overflow: "hidden", backgroundColor: c.surfaceAlt, borderWidth: error ? 2 : 0, borderColor: theme.color.error.solid, alignItems: "center", justifyContent: "center" }}>
        {isImageFile(file) ? <RNImage source={{ uri: file.uri }} style={{ width: "100%", height: "100%" }} /> : <FileIcon size={28} color={c.muted} />}
        {file.status === "uploading" ? (
          <View style={{ position: "absolute", left: 8, right: 8, bottom: 8 }}>
            <Progress percent={file.progress ?? 0} size="sm" showInfo={false} />
          </View>
        ) : null}
      </Pressable>
      {error && onRetry ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`${file.name} tekrar yükle`} onPress={onRetry} disabled={disabled} style={{ position: "absolute", left: TILE / 2 - 16, top: TILE / 2 - 16, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: c.surface }}>
          <RotateCcwIcon size={16} color={theme.color.error.text} />
        </Pressable>
      ) : null}
      {disabled ? null : (
        <Pressable accessibilityRole="button" accessibilityLabel={`${file.name} kaldır`} hitSlop={8} onPress={onRemove} style={{ position: "absolute", top: circle ? 0 : -6, right: circle ? 0 : -6, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: c.foreground }}>
          <XIcon size={14} color={c.surface} />
        </Pressable>
      )}
    </View>
  );
}

function AddTile({ circle, disabled, busy, onPress, label, theme }: { circle: boolean; disabled: boolean; busy: boolean; onPress: () => void; label: string; theme: Theme }) {
  const c = theme.color.canvas;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => ({ width: TILE, height: TILE, borderRadius: circle ? TILE / 2 : 12, borderWidth: 1.5, borderStyle: "dashed", borderColor: c.input, alignItems: "center", justifyContent: "center", gap: 4, opacity: disabled ? 0.5 : 1, backgroundColor: pressed ? c.surfaceAlt : "transparent" })}
    >
      <PlusIcon size={22} color={c.muted} />
      <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 12, color: c.muted }}>Ekle</Text>
    </Pressable>
  );
}

/** İskelet: önizlemede döşeme, listede düğme + ipucu satırı (yüklü hal ile aynı boyutlar). */
function UploadSkeleton({ review, circle, hint, style }: { review: boolean; circle: boolean; hint: React.ReactNode; style: StyleProp<ViewStyle> }) {
  if (review) return <SkeletonBox style={[{ width: TILE, height: TILE, borderRadius: circle ? TILE / 2 : 12 }, style]} />;
  return (
    <View style={[{ alignSelf: "stretch", gap: 10, alignItems: "flex-start" }, style]}>
      <SkeletonBox style={{ height: 44, width: 140, borderRadius: 10 }} />
      {hint ? (
        <SkeletonText fontSize={13}>
          <Text style={{ fontSize: 13 }}>{hint}</Text>
        </SkeletonText>
      ) : null}
    </View>
  );
}

/** Liste ve yükleme durumu: ekle, ilerleme bildir, bitir / hata, sil, tekrar dene. */
function useUploadList(props: UploadProps) {
  const [files, setFilesState] = useControllable<UploadFile[]>(props.value, props.defaultValue ?? []);
  // Eşzamanlı ilerleme bildirimleri en güncel listeye uygulansın.
  const live = useRef(files);
  live.current = files;
  const commit = (next: UploadFile[]) => {
    live.current = next;
    setFilesState(next);
    props.onChange?.(next);
  };
  const patch = (uid: string, changes: Partial<UploadFile>) => commit(live.current.map((f) => (f.uid === uid ? { ...f, ...changes } : f)));
  const start = (file: UploadFile) => {
    if (!props.onUpload) return;
    props
      .onUpload(file, (progress) => patch(file.uid, { progress: Math.max(0, Math.min(100, progress)) }))
      .then(() => patch(file.uid, { status: "done", progress: 100 }))
      .catch((e: unknown) => patch(file.uid, { status: "error", error: e instanceof Error ? e.message : undefined }));
  };
  const add = (picked: UploadPickedFile[]) => {
    const status: UploadFileStatus = props.onUpload ? "uploading" : "done";
    const added: UploadFile[] = picked.map((p) => ({ uid: nextUid(), uri: p.uri, name: p.name ?? nameFromUri(p.uri), size: p.size, mimeType: p.mimeType, status, progress: 0 }));
    commit([...live.current, ...added]);
    added.forEach(start);
  };
  const remove = (uid: string) => commit(live.current.filter((f) => f.uid !== uid));
  const retry = (file: UploadFile) => {
    patch(file.uid, { status: "uploading", progress: 0, error: undefined });
    start({ ...file, status: "uploading", progress: 0 });
  };
  return { files, add, remove, retry, canRetry: Boolean(props.onUpload) };
}

/**
 * Dosya / görsel ekleme alanı. Seçme işini uygulama yapar (`onPick` — kütüphane
 * native bağımlılık taşımaz); Upload doğrular (tür, boyut, sayı), listeler,
 * önizler (görsel → tam ekran ImageViewer), isteğe bağlı gerçek yüklemenin
 * (`onUpload`) ilerlemesini ve hatasını gösterir.
 */
export function Upload(props: UploadProps) {
  const { onPick, onReject, fileType, fileSize = 5 * 1024 * 1024, max = 5, listType = "list", reviewType = "square", triggerLabel = "Dosya seç", hint, style } = props;
  const field = useFieldControl({ disabled: props.disabled, skeleton: props.skeleton, accessibilityLabel: props.accessibilityLabel });
  const theme = useTheme();
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const list = useUploadList(props);
  const [picking, setPicking] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [viewer, setViewer] = useState<number | null>(null);
  const remaining = Math.max(0, max - list.files.length);
  const full = remaining === 0;
  const disabled = field.disabled;
  const review = listType === "review";
  const circle = review && reviewType === "circle";

  const pick = async () => {
    setPicking(true);
    try {
      const picked = await onPick({ multiple: max > 1 && remaining > 1, remaining, accept: fileType });
      if (!picked?.length) return;
      const named = picked.map((p) => ({ ...p, name: p.name ?? nameFromUri(p.uri) }));
      const { accepted, rejected } = splitPicked(named, remaining, fileType, fileSize);
      rejected.forEach((r) => onReject?.(r.reason, r.file));
      // "En fazla" mesajı bir kez yeter.
      setMessages([...new Set(rejected.map((r) => rejectMessage(r.reason, r.file.name, { max, maxSize: fileSize, fileType })))]);
      if (accepted.length) list.add(accepted);
    } finally {
      setPicking(false);
    }
  };

  if (field.skeleton) return <UploadSkeleton review={review} circle={circle} hint={hint} style={style} />;

  const images = list.files.filter(isImageFile);
  const preview = (file: UploadFile) => (isImageFile(file) ? () => setViewer(images.findIndex((f) => f.uid === file.uid)) : undefined);
  const itemProps = (file: UploadFile) => ({ file, disabled, onRemove: () => list.remove(file.uid), onRetry: list.canRetry ? () => list.retry(file) : undefined, onPreview: preview(file), theme });
  const label = field.accessibilityLabel ?? (review ? "Görsel ekle" : triggerLabel);

  return (
    <View style={[{ alignSelf: "stretch", gap: 10 }, style]}>
      {review ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {list.files.map((f) => (
            <FileTile key={f.uid} {...itemProps(f)} circle={circle} />
          ))}
          {full ? null : <AddTile circle={circle} disabled={disabled} busy={picking} onPress={() => void pick()} label={label} theme={theme} />}
        </View>
      ) : (
        <>
          <View style={{ alignItems: "flex-start", gap: 6 }}>
            <Button variant="outline" icon={<UploadIcon size={18} color={theme.color.primary.text} />} onPress={() => void pick()} disabled={disabled || full} loading={picking} accessibilityLabel={label}>
              {triggerLabel}
            </Button>
          </View>
          {list.files.map((f) => (
            <FileRow key={f.uid} {...itemProps(f)} />
          ))}
        </>
      )}
      {hint ? <Text style={{ fontFamily: font, fontSize: 13, color: c.muted }}>{full ? `En fazla ${max} dosya eklendi.` : hint}</Text> : null}
      {messages.length ? (
        <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={{ gap: 2 }}>
          {messages.map((m) => (
            <Text key={m} style={{ fontFamily: font, fontSize: 13, color: theme.color.error.text }}>{m}</Text>
          ))}
        </View>
      ) : null}
      <ImageViewer
        open={viewer !== null}
        onClose={() => setViewer(null)}
        index={viewer ?? 0}
        onIndexChange={setViewer}
        items={images.map((f) => ({ key: f.uid, src: f.uri, alt: f.name, caption: f.name }))}
      />
    </View>
  );
}
