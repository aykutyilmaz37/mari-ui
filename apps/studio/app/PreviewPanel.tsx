import type { CSSProperties } from "react";
import type { ColorRole } from "@mari-ui/core";
import type { SpacingDensity } from "@mari-ui/tokens";
import { Button } from "@mari-ui/components/button";
import { Input } from "@mari-ui/components/input";
import { Card } from "@mari-ui/components/card";
import { Tag } from "@mari-ui/components/tag";
import { Switch } from "@mari-ui/components/switch";
import { Checkbox } from "@mari-ui/components/checkbox";

export interface PreviewPanelProps {
  mode: "light" | "dark";
  /** Son kullanıcı yoğunluğu (ThemeCustomizer) — `data-density`, `normal`de öznitelik yok. */
  spacing?: SpacingDensity;
  cssVars: Record<string, string>;
  fontFamilySans: string;
}

const PREVIEW_COLORS: ColorRole[] = ["primary", "accent"];

/**
 * Gerçek `@mari-ui/components`i, `cssVars`teki `--mari-color-primary-*`/
 * `--mari-color-accent-*` override'larıyla render eder — hook yok, sadece
 * `style` prop'u, bu yüzden `"use client"` gerekmiyor (yalnızca `StudioApp`
 * bu değerleri STATE'ten üretiyor, kendisi client).
 *
 * Font token'ları CSS değişkenlerinden, gövde ailesi miras yoluyla uygulanır.
 */
export function PreviewPanel({ mode, spacing = "normal", cssVars, fontFamilySans }: PreviewPanelProps) {
  const style: CSSProperties = { ...(cssVars as CSSProperties), fontFamily: fontFamilySans };

  return (
    <div className="studio-preview-surface" data-theme={mode} data-density={spacing === "normal" ? undefined : spacing} style={style}>
      <div className="studio-row">
        {PREVIEW_COLORS.map((color) => (
          <div key={color} className="studio-row">
            <Button color={color} variant="solid">
              {color === "primary" ? "Birincil" : "Vurgu"}
            </Button>
            <Button color={color} variant="outline">
              Outline
            </Button>
            <Button color={color} variant="soft">
              Soft
            </Button>
            <Button color={color} variant="ghost">
              Ghost
            </Button>
          </div>
        ))}
      </div>

      <div className="studio-row">
        <div style={{ maxWidth: 220 }}>
          <Input placeholder="Bir şeyler yazın..." color="primary" />
        </div>
        <Tag color="primary">Birincil Tag</Tag>
        <Tag color="accent" variant="solid">
          Vurgu Tag
        </Tag>
        <Switch defaultChecked color="primary" />
        <Checkbox defaultChecked color="accent" label="Onaylıyorum" />
      </div>

      <div style={{ maxWidth: 420 }}>
        <Card title="Örnek Kart" extra={<Tag color="accent">Yeni</Tag>}>
          <p style={{ margin: 0 }}>
            Bu kart, seçtiğiniz renk ve font ailesiyle gerçek zamanlı olarak güncellenir. Sol paneldeki ayarları
            değiştirdiğinizde burada hiçbir sayfa yenilemesi olmadan yansır.
          </p>
        </Card>
      </div>
    </div>
  );
}
