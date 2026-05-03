import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getMe, login, OnboardingInput, register } from "../src/api/client";
import { loadStoredSession, setSession } from "../src/state/session";
import { colors, radius, spacing } from "../src/theme";

type Mode = "login" | "register";

const defaultOnboarding: OnboardingInput = {
  gender: "male",
  age: 25,
  heightCm: 175,
  currentWeightKg: 80,
  bodyFatPercent: null,
  goal: "lose",
  targetWeightKg: 75,
  weeklyChangeKg: 0.5,
  deadline: null,
  activityLevel: "moderate",
  workoutDaysPerWeek: 4,
  equipment: "gym",
  experienceLevel: "beginner",
  limitations: null
};

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [onboarding, setOnboarding] = useState(defaultOnboarding);

  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = await loadStoredSession();
        if (stored) {
          await getMe();
          router.replace("/(tabs)");
        }
      } catch {
        // Invalid or expired stored sessions stay on the auth screen.
      } finally {
        setCheckingSession(false);
      }
    }

    restoreSession();
  }, []);

  async function submit() {
    try {
      setLoading(true);
      setError("");
      const result =
        mode === "login"
          ? await login(email, password)
          : await register({
              name,
              email,
              password,
              onboarding
            });
      await setSession(result);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.brand}>Gym Tracker</Text>
      {checkingSession ? <ActivityIndicator color={colors.green} style={styles.checking} /> : null}
      <Text style={styles.title}>{mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}</Text>
      <Text style={styles.subtitle}>ابدأ بحسابك الحقيقي، والبيانات تحفظ في Railway PostgreSQL.</Text>

      <View style={styles.switcher}>
        <Pressable style={[styles.switchButton, mode === "login" && styles.switchActive]} onPress={() => setMode("login")}>
          <Text style={[styles.switchText, mode === "login" && styles.switchTextActive]}>دخول</Text>
        </Pressable>
        <Pressable style={[styles.switchButton, mode === "register" && styles.switchActive]} onPress={() => setMode("register")}>
          <Text style={[styles.switchText, mode === "register" && styles.switchTextActive]}>حساب جديد</Text>
        </Pressable>
      </View>

      {mode === "register" ? <Field label="الاسم" value={name} onChangeText={setName} placeholder="مثال: عبدالرحمن" /> : null}
      <Field label="البريد" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
      <Field label="كلمة المرور" value={password} onChangeText={setPassword} placeholder="8 أحرف أو أكثر" secureTextEntry />

      {mode === "register" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>بيانات البداية</Text>
          <Segment label="الجنس" value={onboarding.gender} options={[["male", "ذكر"], ["female", "أنثى"]]} onChange={(gender) => setOnboarding({ ...onboarding, gender: gender as "male" | "female" })} />
          <NumberField label="العمر" value={onboarding.age} onChange={(age) => setOnboarding({ ...onboarding, age })} />
          <NumberField label="الطول cm" value={onboarding.heightCm} onChange={(heightCm) => setOnboarding({ ...onboarding, heightCm })} />
          <NumberField label="الوزن الحالي kg" value={onboarding.currentWeightKg} onChange={(currentWeightKg) => setOnboarding({ ...onboarding, currentWeightKg })} />
          <NumberField label="Body Fat % اختياري" value={onboarding.bodyFatPercent ?? 0} onChange={(bodyFatPercent) => setOnboarding({ ...onboarding, bodyFatPercent: bodyFatPercent || null })} />
          <Segment label="الهدف" value={onboarding.goal} options={[["lose", "تنشيف"], ["maintain", "ثبات"], ["gain", "زيادة"]]} onChange={(goal) => setOnboarding({ ...onboarding, goal: goal as OnboardingInput["goal"] })} />
          <NumberField label="الوزن المستهدف kg" value={onboarding.targetWeightKg} onChange={(targetWeightKg) => setOnboarding({ ...onboarding, targetWeightKg })} />
          <NumberField label="سرعة التغيير kg/week" value={onboarding.weeklyChangeKg} onChange={(weeklyChangeKg) => setOnboarding({ ...onboarding, weeklyChangeKg })} />
          <Segment label="النشاط" value={onboarding.activityLevel} options={[["light", "خفيف"], ["moderate", "متوسط"], ["active", "عالي"]]} onChange={(activityLevel) => setOnboarding({ ...onboarding, activityLevel: activityLevel as OnboardingInput["activityLevel"] })} />
          <NumberField label="أيام التمرين/أسبوع" value={onboarding.workoutDaysPerWeek} onChange={(workoutDaysPerWeek) => setOnboarding({ ...onboarding, workoutDaysPerWeek })} />
          <Segment label="المعدات" value={onboarding.equipment} options={[["gym", "نادي"], ["home", "منزل"], ["none", "بدون"]]} onChange={(equipment) => setOnboarding({ ...onboarding, equipment: equipment as OnboardingInput["equipment"] })} />
          <Segment label="المستوى" value={onboarding.experienceLevel} options={[["beginner", "مبتدئ"], ["intermediate", "متوسط"], ["advanced", "متقدم"]]} onChange={(experienceLevel) => setOnboarding({ ...onboarding, experienceLevel: experienceLevel as OnboardingInput["experienceLevel"] })} />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.primaryButton} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryText}>{mode === "login" ? "دخول" : "إنشاء الحساب"}</Text>}
      </Pressable>
    </ScrollView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.muted} {...inputProps} />
    </View>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <Field
      label={label}
      value={value ? String(value) : ""}
      onChangeText={(text) => onChange(Number(text.replace(",", ".")) || 0)}
      keyboardType="decimal-pad"
    />
  );
}

function Segment({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segment}>
        {options.map(([optionValue, title]) => (
          <Pressable key={optionValue} onPress={() => onChange(optionValue)} style={[styles.segmentButton, value === optionValue && styles.segmentActive]}>
            <Text style={[styles.segmentText, value === optionValue && styles.segmentTextActive]}>{title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 70 },
  checking: { marginTop: spacing.md },
  brand: { color: colors.green, fontSize: 15, fontWeight: "900", marginTop: 30, textAlign: "right" },
  title: { color: colors.text, fontSize: 36, fontWeight: "900", marginTop: spacing.sm, textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 22, marginBottom: spacing.lg, marginTop: spacing.xs, textAlign: "right" },
  switcher: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, flexDirection: "row-reverse", gap: 6, marginBottom: spacing.lg, padding: 5 },
  switchButton: { alignItems: "center", borderRadius: radius.sm, flex: 1, paddingVertical: 12 },
  switchActive: { backgroundColor: colors.surface },
  switchText: { color: colors.muted, fontWeight: "900" },
  switchTextActive: { color: colors.green },
  fieldWrap: { marginBottom: spacing.md },
  label: { color: colors.text, fontSize: 13, fontWeight: "900", marginBottom: 7, textAlign: "right" },
  input: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, color: colors.text, minHeight: 48, paddingHorizontal: spacing.md, textAlign: "right" },
  card: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.md, padding: spacing.md },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: spacing.md, textAlign: "right" },
  segment: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 7 },
  segmentButton: { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 9 },
  segmentActive: { backgroundColor: colors.green },
  segmentText: { color: colors.muted, fontSize: 12, fontWeight: "900" },
  segmentTextActive: { color: colors.surface },
  primaryButton: { alignItems: "center", backgroundColor: colors.green, borderRadius: radius.md, minHeight: 52, justifyContent: "center", marginTop: spacing.sm },
  primaryText: { color: colors.surface, fontSize: 16, fontWeight: "900" },
  error: { color: colors.red, fontSize: 13, marginBottom: spacing.sm, textAlign: "right" }
});
