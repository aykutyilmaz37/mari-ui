import React, { useState } from "react";
import { Animated, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { STORY_CATEGORIES, STORY_ENTRIES, renderStory, type StoryContext, type StoryEntry } from "./src/stories";
import { MariLogo } from "./src/MariLogo";
import { useStackTransition } from "./src/useStackTransition";

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
  const stack = useStackTransition<StoryEntry>();
  const selected = stack.item;
  const [fontsLoaded, fontError] = useFonts(FONTS);
  if (!fontsLoaded && !fontError) return null;

  const c = SHELL[theme];
  // radius: çerçeve kırpmaz (taşan baloncuk kesilmesin), zemin köşesi story tarafında yuvarlanır.
  const globals: StoryContext["globals"] = { theme, fonts: brandFonts ? "brand" : "system", radius: FRAME_RADIUS };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={[styles.toolbar, { borderColor: c.border }]}>
        {selected ? (
          <Pressable onPress={stack.pop} accessibilityRole="button" accessibilityLabel="Listeye dön" hitSlop={10}>
            <Text style={[styles.back, { color: c.accent }]}>‹ Component'ler</Text>
          </Pressable>
        ) : (
          <MariLogo dark={theme === "dark"} />
        )}
        <View style={styles.toggles}>
          <Toggle label="Koyu" value={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} color={c.muted} />
          <Toggle label="Marka fontu" value={brandFonts} onChange={setBrandFonts} color={c.muted} />
        </View>
      </View>

      <View style={styles.stage}>
        {/* Liste her zaman altta; detay üstüne kayar (iOS yığın geçişi). */}
        <Animated.View style={[StyleSheet.absoluteFill, stack.underStyle]} importantForAccessibility={selected ? "no-hide-descendants" : "auto"} accessibilityElementsHidden={Boolean(selected)}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.description, { color: c.muted }]}>
              {STORY_ENTRIES.length} component · story'ler web Storybook'taki "Native" bölümüyle aynı dosyalardan.
            </Text>
            {STORY_CATEGORIES.map((category) => (
              <View key={category} style={styles.category}>
                <Text accessibilityRole="header" style={[styles.categoryTitle, { color: c.muted }]}>{category}</Text>
                {STORY_ENTRIES.filter((entry) => entry.category === category).map((entry) => (
                  <Pressable
                    key={entry.title}
                    onPress={() => stack.push(entry)}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.row, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={[styles.rowTitle, { color: c.text }]}>{entry.title}</Text>
                    <Text style={{ color: c.muted }}>{entry.stories.length} story ›</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {selected ? (
          <>
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "#000", opacity: stack.scrimOpacity }]} />
            <Animated.View {...stack.panHandlers} style={[StyleSheet.absoluteFill, styles.top, { backgroundColor: c.bg }, stack.topStyle]}>
              {/* Kenardan geri çekerken dikey kaydırma kilitli (yerel kaydırma JS responder'ı dinlemez). */}
              <ScrollView scrollEnabled={!stack.swiping} contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: c.text }]}>{selected.title}</Text>
                {selected.stories.map(({ id, name, description, story }) => (
                  <View key={id} style={styles.story}>
                    <Text style={[styles.storyName, { color: c.text }]}>{name}</Text>
                    {description ? <Text style={[styles.description, { color: c.muted }]}>{stripMarkdown(description)}</Text> : null}
                    <View style={[styles.frame, { borderColor: c.border }]}>{renderStory(selected, story, globals)}</View>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          </>
        ) : null}
      </View>
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

/** Story çerçevesinin köşesi — çerçeve kırpmaz, story zemini aynı yarıçapla yuvarlanır. */
const FRAME_RADIUS = 10;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  toolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  stage: { flex: 1, overflow: "hidden" },
  top: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: -4, height: 0 }, elevation: 8 },
  back: { fontSize: 16, fontWeight: "500" },
  toggles: { flexDirection: "row", gap: 12 },
  toggle: { alignItems: "center", gap: 2 },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  story: { gap: 6 },
  storyName: { fontSize: 15, fontWeight: "600" },
  description: { fontSize: 13, lineHeight: 18 },
  frame: { borderWidth: StyleSheet.hairlineWidth, borderRadius: FRAME_RADIUS },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  rowTitle: { fontSize: 16, fontWeight: "500" },
  category: { gap: 8 },
  categoryTitle: { marginTop: 8, fontSize: 12, fontWeight: "700", letterSpacing: 0.7, textTransform: "uppercase" },
});
