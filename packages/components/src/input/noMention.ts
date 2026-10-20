import type { useMention } from "../mentions/useMention";

// Bahsetme kapalıyken `useMention`'ın döndürdüğüyle birebir aynı — Input ve
// Textarea öneri panelini (Select'in listesi) bundle'a almadan aynı yolu izler.
const NO_MENTION: ReturnType<typeof useMention> = { controlProps: {}, panel: null, handleKeyDown: () => false, close: () => {} };
export const useNoMention: typeof useMention = () => NO_MENTION;
