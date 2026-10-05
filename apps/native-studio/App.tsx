import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { STORY_ENTRIES, renderStory, type StoryContext, type StoryEntry } from "./src/stories";

/**
 * native-studio — @mari-ui/native story tarayıcısı ("storybook gibi, yalnız
 * görünüm"). Story'ler packages/native içindeki *.stories.tsx dosyaları; web
 * Storybook'taki "Native/…" bölümüyle aynı kaynak.
 */

/** Marka fontu açılınca kullanılacak dosyalar — kayıt adları token aile adlarıyla aynı. */
const FONTS = {
  Geist: require("@mari-ui/tokens/fonts/Geist.ttf"),
  Manrope: require("@mari-ui/tokens/fonts/Manrope.ttf"),
  "Geist Mono": require("@mari-ui/tokens/fonts/GeistMono.ttf"),
};

/** Studio kabuğunun kendi renkleri (component'lerden bağımsız, sade). */
const SHELL = {
  light: { bg: "#f8f8fc", card: "#ffffff", text: "#242331", muted: "#696579", border: "#e2dfef", accent: "#6951ce" },
  dark: { bg: "#191822", card: "#242331", text: "#f1effa", muted: "#bcb5cf", border: "#403b54", accent: "#b7a5ff" },
};

export default function App() {
  const system = useColorScheme();
  const [theme, setTheme] = useState<StoryContext["globals"]["theme"]>(system === "dark" ? "dark" : "light");
  const [brandFonts, setBrandFonts] = useState(false);
  const [selected, setSelected] = useState<StoryEntry | null>(null);
  const [fontsLoaded, fontError] = useFonts(FONTS);
  if (!fontsLoaded && !fontError) return null;

  const c = SHELL[theme];
  const globals: StoryContext["globals"] = { theme, fonts: brandFonts ? "brand" : "system" };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={[styles.toolbar, { borderColor: c.border }]}>
        {selected ? (
          <Pressable onPress={() => setSelected(null)} accessibilityRole="button" accessibilityLabel="Listeye dön" hitSlop={10}>
            <Text style={[styles.back, { color: c.accent }]}>‹ Component'ler</Text>
          </Pressable>
        ) : (
          <Text style={[styles.brand, { color: c.text }]}>mari-ui native</Text>
        )}
        <View style={styles.toggles}>
          <Toggle label="Koyu" value={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} color={c.muted} />
          <Toggle label="Marka fontu" value={brandFonts} onChange={setBrandFonts} color={c.muted} />
        </View>
      </View>

      {selected ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: c.text }]}>{selected.title}</Text>
          {selected.stories.map(({ id, name, description, story }) => (
            <View key={id} style={styles.story}>
              <Text style={[styles.storyName, { color: c.text }]}>{name}</Text>
              {description ? <Text style={[styles.description, { color: c.muted }]}>{stripMarkdown(description)}</Text> : null}
              <View style={[styles.frame, { borderColor: c.border }]}>{renderStory(selected, story, globals)}</View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.description, { color: c.muted }]}>
            {STORY_ENTRIES.length} component · story'ler web Storybook'taki "Native" bölümüyle aynı dosyalardan.
          </Text>
          {STORY_ENTRIES.map((entry) => (
            <Pressable
              key={entry.title}
              onPress={() => setSelected(entry)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.row, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.rowTitle, { color: c.text }]}>{entry.title}</Text>
              <Text style={{ color: c.muted }}>{entry.stories.length} story ›</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Toggle({ label, value, onChange, color }: { label: string; value: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <View style={styles.toggle}>
      <Text style={{ color, fontSize: 12 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={label} />
    </View>
  );
}

/** Story açıklamalarındaki `kod` işaretlerini düz metne çevirir. */
const stripMarkdown = (text: string) => text.replace(/`/g, "").replace(/\*\*/g, "");

const styles = StyleSheet.create({
  screen: { flex: 1 },
  toolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  brand: { fontSize: 18, fontWeight: "600" },
  back: { fontSize: 16, fontWeight: "500" },
  toggles: { flexDirection: "row", gap: 12 },
  toggle: { alignItems: "center", gap: 2 },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  story: { gap: 6 },
  storyName: { fontSize: 15, fontWeight: "600" },
  description: { fontSize: 13, lineHeight: 18 },
  frame: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  rowTitle: { fontSize: 16, fontWeight: "500" },
});
