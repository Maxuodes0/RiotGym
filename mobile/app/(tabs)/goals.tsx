import { StyleSheet, Text, View } from "react-native";
import { Card } from "../../src/components/Card";
import { ProgressBar } from "../../src/components/Metric";
import { Screen } from "../../src/components/Screen";
import { goals } from "../../src/data/mock";
import { colors, spacing } from "../../src/theme";

export default function GoalsScreen() {
  return (
    <Screen title="الأهداف" subtitle="مؤشراتك الأسبوعية">
      <View style={styles.stack}>
        {goals.map((goal) => (
          <Card key={goal.title}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalValue}>{goal.value}</Text>
            <Text style={styles.goalDetails}>{goal.details}</Text>
            <ProgressBar value={goal.progress} />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md
  },
  goalTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right"
  },
  goalValue: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 6,
    textAlign: "right"
  },
  goalDetails: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    textAlign: "right"
  }
});
