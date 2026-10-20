"use client";

import { buildThemeVars, defaultThemeSettings, type ThemeMode, type ThemeSettings } from "@mari-ui/tokens";

const DARK_QUERY = "(prefers-color-scheme: dark)";

interface AppliedState {
  /** İlk uygulamadan önceki öznitelikler — geri alırken bunlara dönülür. */
  original: { theme: string | null; density: string | null };
  vars: string[];
  stopListening?: () => void;
}

const appliedStates = /* @__PURE__ */ new WeakMap<HTMLElement, AppliedState>();

/** "system" tercihini o anki işletim sistemi ayarına çözer (SSR'da "light"). */
export function resolveColorScheme(mode: ThemeSettings["mode"]): ThemeMode {
  if (mode !== "system") return mode;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function restoreAttribute(el: HTMLElement, name: string, value: string | null) {
  if (value === null) el.removeAttribute(name);
  else el.setAttribute(name, value);
}

/** Vurgu renginin yazabileceği tüm değişken adları (hangi renk olursa olsun aynı set). */
let ownedVarNames: string[] | undefined;
const getOwnedVarNames = () => (ownedVarNames ??= Object.keys(buildThemeVars({ primary: "#000000" }, "light")));

function clearVars(el: HTMLElement, state: AppliedState) {
  for (const name of state.vars) el.style.removeProperty(name);
  state.vars = [];
}

/**
 * Son kullanıcı tema ayarını bir elemana uygular (varsayılan `<html>`) — provider
 * yok (Link kararıyla aynı). Mod `data-theme`, yoğunluk `data-density`
 * özniteliğiyle stylesheet'e bırakılır; yalnız vurgu rengi satır içi
 * `--mari-color-primary*` değişkenleri olarak yazılır. "system" modunda işletim
 * sistemi tercihi canlı izlenir.
 *
 * Aynı elemana tekrar çağrı öncekinin yerini alır. Dönen fonksiyon dinleyiciyi
 * bırakır ve elemanı ilk çağrıdan önceki haline döndürür (React effect temizliği).
 * Kalıcılık (localStorage, API…) tüketicinin işi.
 */
export function applyTheme(settings: Partial<ThemeSettings> = {}, target?: HTMLElement): () => void {
  if (typeof document === "undefined") return () => {};
  const el = target ?? document.documentElement;
  const { mode, primary } = { ...defaultThemeSettings, ...settings };
  const { spacing } = settings;

  const previous = appliedStates.get(el);
  if (previous) {
    previous.stopListening?.();
    clearVars(el, previous);
  } else {
    // Açılış script'i (`getThemeScript`) değişkenleri önceden yazmış olabilir;
    // yeni ayarda vurgu rengi yoksa eskisi takılı kalmasın.
    for (const name of getOwnedVarNames()) el.style.removeProperty(name);
  }
  const state: AppliedState = {
    original: previous?.original ?? { theme: el.getAttribute("data-theme"), density: el.getAttribute("data-density") },
    vars: [],
  };
  appliedStates.set(el, state);

  const paint = () => {
    const resolved = resolveColorScheme(mode);
    el.setAttribute("data-theme", resolved);
    clearVars(el, state);
    for (const [name, value] of Object.entries(buildThemeVars({ primary }, resolved))) {
      el.style.setProperty(name, value);
      state.vars.push(name);
    }
  };
  paint();

  // Yalnız açıkça verilen yoğunluk yazılır — "normal" da (config'teki varsayılan
  // `:root:not([data-density])` farklıysa kullanıcının "Normal" seçimi onu ezebilmeli).
  // Verilmediyse config varsayılanı geçerli kalsın: öznitelik ilk haline döner.
  if (spacing) el.setAttribute("data-density", spacing);
  else restoreAttribute(el, "data-density", state.original.density);

  if (mode === "system" && typeof window.matchMedia === "function") {
    const query = window.matchMedia(DARK_QUERY);
    query.addEventListener("change", paint);
    state.stopListening = () => query.removeEventListener("change", paint);
  }

  return () => {
    // Bu çağrının yerini daha yenisi aldıysa ona dokunma.
    if (appliedStates.get(el) !== state) return;
    state.stopListening?.();
    clearVars(el, state);
    restoreAttribute(el, "data-theme", state.original.theme);
    restoreAttribute(el, "data-density", state.original.density);
    appliedStates.delete(el);
  };
}
