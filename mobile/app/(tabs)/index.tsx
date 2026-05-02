import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "../../src/components/Card";
import { ListItem } from "../../src/components/ListItem";
import { Metric, ProgressBar } from "../../src/components/Metric";
import { Screen } from "../../src/components/Screen";
import { DashboardSummary, getDashboardSummary } from "../../src/api/client";
import { getSessionName } from "../../src/state/session";
import { colors, radius, spacing } from "../../src/theme";

export default function DashboardScreen() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSummary() {
    try {
      setLoading(true);
      setError("");
      setSummary(await getDashboardSummary());
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  const caloriesPct = percent(summary?.calories.value, summary?.calories.target);
  const proteinPct = percent(summary?.protein.value, summary?.protein.target);

  return (
    <Screen
      title="الرئيسية"
      subtitle={`أهلًا ${getSessionName()}`}
      rightSlot={
        <Pressable style={styles.iconButton} onPress={loadSummary}>
          <Ionicons name="refresh" size={22} color={colors.surface} />
        </Pressable>
      }
    >
      <LinearGradient colors={["#E2F1EA", "#FFFDF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroEyebrow}>بيانات حقيقية</Text>
          <Text style={styles.heroTitle}>كل رقم هنا جاي من قاعدة البيانات</Text>
          <Text style={styles.heroBody}>بعد تسجيل وجباتك وتمارينك، الداشبورد يتحدث من Railway PostgreSQL.</Text>
        </View>
        <View style={styles.progressStack}>
          <Text style={styles.progressLabel}>السعرات {caloriesPct}%</Text>
          <ProgressBar value={caloriesPct} />
          <Text style={styles.progressLabel}>البروتين {proteinPct}%</Text>
          <ProgressBar value={proteinPct} color={colors.amber} />
        </View>
      </LinearGradient>

      {loading ? <ActivityIndicator color={colors.green} style={styles.loader} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.metrics}>
        <Metric label="السعرات" value={formatValue(summary?.calories.value)} helper={targetLabel(summary?.calories.target, "kcal")} />
        <Metric label="البروتين" value={`${formatValue(summary?.protein.value)}g`} helper={targetLabel(summary?.protein.target, "g")} tone="amber" />
        <Metric label="الوزن" value={summary?.weight ? String(summary.weight) : "-"} helper="آخر قياس محفوظ" tone="blue" />
        <Metric label="التمارين" value={summary?.workouts ? `${summary.workouts.value}/${summary.workouts.target ?? "-"}` : "-"} helper="هذا الأسبوع" />
      </View>

      <Card eyebrow="Workout" title="تمرين اليوم">
        <View style={styles.stack}>
          {summary?.todayWorkout?.exercises.length ? (
            summary.todayWorkout.exercises.map((exercise) => {
              const done = exercise.sets.filter((set) => set.completed).length;
              const reps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);
              return (
                <ListItem
                  key={exercise.id}
                  title={exercise.name}
                  subtitle={`${exercise.muscleGroup} · ${done}/${exercise.sets.length} sets`}
                  pill={`${reps} reps`}
                />
              );
            })
          ) : (
            <Text style={styles.empty}>ما فيه تمرين محفوظ لليوم حتى الآن.</Text>
          )}
        </View>
      </Card>
    </Screen>
  );
}

function percent(value?: number, target?: number | null) {
  if (!value || !target) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

function formatValue(value?: number) {
  return value === undefined ? "-" : value.toLocaleString();
}

function targetLabel(target?: number | null, unit?: string) {
  return target ? `من ${target.toLocaleString()} ${unit}` : "لا يوجد هدف محفوظ";
}

const styles = StyleSheet.create({
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: radius.md,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  hero: {
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg
  },
  heroText: {
    alignItems: "flex-start"
  },
  heroEyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 34,
    textAlign: "right"
  },
  heroBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "right"
  },
  progressStack: {
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  progressLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right"
  },
  loader: {
    marginBottom: spacing.md
  },
  error: {
    color: colors.red,
    marginBottom: spacing.md,
    textAlign: "right"
  },
  metrics: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  stack: {
    gap: spacing.sm
  },
  empty: {
    color: colors.muted,
    lineHeight: 22,
    textAlign: "right"
  }
});
