import * as ImagePicker from "expo-image-picker";

/**
 * Story'lere `globals.pickImages` olarak verilen gerçek seçici (yalnız studio —
 * @mari-ui/native Expo'ya bağlı değil; Upload story'leri bunu `onPick` içinde
 * kullanır, yoksa sahte fotoğrafa düşer).
 */
export interface StudioPickOptions {
  multiple: boolean;
  limit: number;
  /** Galeri yerine kamera. */
  camera?: boolean;
}

export interface StudioPickedFile {
  uri: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export async function pickImages({ multiple, limit, camera = false }: StudioPickOptions): Promise<StudioPickedFile[] | null> {
  const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.8, allowsMultipleSelection: multiple && !camera, selectionLimit: multiple ? limit : 1 };
  const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return null;
  return result.assets.map((a) => ({ uri: a.uri, name: a.fileName ?? undefined, size: a.fileSize ?? undefined, mimeType: a.mimeType ?? undefined }));
}
