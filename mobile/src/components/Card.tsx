import { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

type CardProps = PropsWithChildren<{
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
}>;

export function Card({ title, eyebrow, action, children }: CardProps) {
  return (
    <View style={styles.card}>
      {title || eyebrow || action ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
          </View>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    shadowColor: "#1F2825",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 2
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md
  },
  headerText: {
    flex: 1,
    alignItems: "flex-start"
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "right"
  }
});
