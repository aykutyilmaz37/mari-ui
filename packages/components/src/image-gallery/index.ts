// Native'le aynı subpath adı (`@mari-ui/native/image-gallery`; Metro tree-shaking
// yapmadığı için orada ayrı entry şart). Web'de `@mari-ui/components/image` de
// ImageGallery'yi vermeye devam eder; yalnız Image kullanan web bundle'ı galeriyi
// zaten tree-shaking ile atar.
export { ImageGallery } from "../image/ImageGallery";
export type { ImageGalleryItem, ImageGalleryProps, GalleryView } from "../image/ImageGallery";
