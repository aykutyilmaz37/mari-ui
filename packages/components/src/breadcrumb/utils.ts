import { cn } from "@mari-ui/core";

export function getNavClass(className?: string): string {
  return cn("flex items-center text-sm text-mari-muted", className);
}

export function getItemClass(itemClassName?: string): string {
  return cn("hover:underline", itemClassName);
}

/** Tıklanabilir ama link olmayan (`onClick` var, `href` yok) öğeler için — link'le aynı hover davranışı + native `<button>` reset. */
export function getButtonItemClass(itemClassName?: string): string {
  return cn("hover:underline cursor-pointer bg-transparent p-0 text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring", itemClassName);
}
