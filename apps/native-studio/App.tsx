import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Button, Card, Input, ThemeProvider, useTheme } from "@mari-ui/native";
import { darkTheme, lightTheme } from "@mari-ui/tokens";

/**
 * Token'lardaki aileler ("Geist", "Manrope", "Geist Mono") RN'de kayıtlı font
 * olmalı — kayıt adları aile adıyla birebir aynı. Dosyalar @mari-ui/tokens
 * paketinde (OFL lisanslı).
 */
const FONTS = {
  Geist: require("@mari-ui/tokens/fonts/Geist.ttf"),
  Manrope: require("@mari-ui/tokens/fonts/Manrope.ttf"),
  "Geist Mono": require("@mari-ui/tokens/fonts/GeistMono.ttf"),
};

const COLORS = ["primary", "accent", "success", "error", "warning", "info", "neutral"] as const;
const VARIANTS = ["solid", "outline", "soft", "ghost", "link"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

/** @mari-ui/native vitrini — gerçek cihazda (Expo Go) ve web'de aynı ekran. */
export default function App() {
  const system = useColorScheme();
  const [dark, setDark] = useState(system === "dark");
  const [fontsLoaded, fontError] = useFonts(FONTS);
  // Font yüklenemezse sistem fontuyla devam (bekletme).
  if (!fontsLoaded && !fontError) return null;
  return (
    <ThemeProvider theme={dark ? darkTheme : lightTheme}>
      <Showcase dark={dark} onToggleDark={setDark} />
    </ThemeProvider>
  );
}

function Showcase({ dark, onToggleDark }: { dark: boolean; onToggleDark: (v: boolean) => void }) {
  const theme = useTheme();
  const c = theme.color.canvas;
  const [email, setEmail] = useState("");
  const [pressed, setPressed] = useState(0);
  const [loading, setLoading] = useState(false);

  const save = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.surface }]}>
      <StatusBar style={dark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.foreground }]}>mari-ui native</Text>
          <View style={styles.row}>
            <Text style={{ color: c.muted }}>Koyu</Text>
            <Switch value={dark} onValueChange={onToggleDark} />
          </View>
        </View>

        <Section title="Button — renk × varyant" color={c.muted}>
          {VARIANTS.map((variant) => (
            <View key={variant} style={styles.wrap}>
              {COLORS.map((color) => (
                <Button key={color} color={color} variant={variant} size="sm" onPress={() => setPressed((n) => n + 1)}>
                  {color}
                </Button>
              ))}
            </View>
          ))}
          <Text style={{ color: c.muted }}>Basılma: {pressed}</Text>
        </Section>

        <Section title="Button — boyut, durum, şekil" color={c.muted}>
          <View style={styles.wrap}>
            {SIZES.map((size) => (
              <Button key={size} size={size}>
                {size}
              </Button>
            ))}
          </View>
          <View style={styles.wrap}>
            <Button loading={loading} onPress={save}>
              Kaydet (yükleniyor dener)
            </Button>
            <Button disabled>Devre dışı</Button>
            <Button shape="pill" variant="soft">
              Hap
            </Button>
          </View>
          <Button block color="primary">
            Tam genişlik
          </Button>
        </Section>

        <Section title="Input" color={c.muted}>
          <Input placeholder="E-posta" value={email} onChangeText={setEmail} allowClear accessibilityLabel="E-posta" />
          <Input placeholder="Şifre" secureTextEntry accessibilityLabel="Şifre" />
          <Input placeholder="Soft varyant" variant="soft" accessibilityLabel="Soft" />
          <Input placeholder="Alt çizgili" variant="underlined" accessibilityLabel="Alt çizgili" />
          <Input placeholder="Hata rengi" color="error" accessibilityLabel="Hata" />
          <Input placeholder="Devre dışı" disabled accessibilityLabel="Devre dışı" />
          <View style={styles.wrap}>
            {(["sm", "md", "lg"] as const).map((size) => (
              <Input key={size} size={size} placeholder={size} style={styles.third} accessibilityLabel={size} />
            ))}
          </View>
        </Section>

        <Section title="Card" color={c.muted}>
          <Card title="Sipariş #4821" extra={<Text style={{ color: c.muted }}>3 Eki</Text>} footer={<Button size="sm" variant="soft">Detay</Button>}>
            <Text style={{ color: c.foreground }}>2 ürün · ₺1.284,50 · Kargoda</Text>
          </Card>
          <Card title="Yükleniyor" loading>
            <Text>—</Text>
          </Card>
          <Card title="Dokunulabilir kart" onPress={() => setPressed((n) => n + 1)}>
            <Text style={{ color: c.foreground }}>Dokununca sayaç artar.</Text>
          </Card>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8 },
  title: { fontSize: 22, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  third: { flexBasis: "30%", flexGrow: 1 },
});
