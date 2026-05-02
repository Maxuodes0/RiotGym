import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

type ListItemProps = {
  title: string;
  subtitle: string;
  pill?: string;
};

export function ListItem({ title, subtitle, pill }: ListItemProps) {
  return (
    <View style={styles.item}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {pill ? (
        <View style={styles.pill}>
          <Text style={styles.pillText}>{pill}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    flexDirection: "row-reverse",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.md
  },
  textWrap: {
    flex: 1,
    alignItems: "flex-start"
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
    textAlign: "right"
  },
  pill: {
    backgroundColor: colors.greenSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  pillText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "800"
  }
});
