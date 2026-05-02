import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

type MetricProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "green" | "amber" | "blue" | "red";
};

const toneColor = {
  green: colors.green,
  amber: colors.amber,
  blue: colors.blue,
  red: colors.red
};

export function Metric({ label, value, helper, tone = "green" }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: toneColor[tone] }]}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

type ProgressBarProps = {
  value: number;
  color?: string;
};

export function ProgressBar({ value, color = colors.green }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  metric: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "right"
  },
  value: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
    textAlign: "right"
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
    textAlign: "right"
  },
  track: {
    height: 9,
    overflow: "hidden",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted
  },
  fill: {
    height: "100%",
    borderRadius: radius.sm
  }
});
