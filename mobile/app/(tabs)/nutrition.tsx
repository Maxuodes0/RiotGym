import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "../../src/components/Card";
import { ListItem } from "../../src/components/ListItem";
import { ProgressBar } from "../../src/components/Metric";
import { Screen } from "../../src/components/Screen";
import { macros, meals } from "../../src/data/mock";
import { colors, radius, spacing } from "../../src/theme";

export default function NutritionScreen() {
  return (
    <Screen
      title="التغذية"
      subtitle="تتبع السعرات والماكروز"
      rightSlot={
        <Pressable style={styles.addButton}>
          <Text style={styles.addText}>وجبة</Text>
        </Pressable>
      }
    >
      <Card eyebrow="Macros" title="تغذية اليوم">
        <View style={styles.macroStack}>
          {macros.map((macro) => {
            const pct = Math.round((macro.value / macro.target) * 100);
            return (
              <View key={macro.label}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroValue}>{macro.value}/{macro.target}{macro.unit}</Text>
                  <Text style={styles.macroLabel}>{macro.label}</Text>
                </View>
                <ProgressBar value={pct} color={macro.color} />
              </View>
            );
          })}
        </View>
      </Card>

      <Card eyebrow="Meals" title="الوجبات">
        <View style={styles.meals}>
          {meals.map((meal) => (
            <ListItem
              key={meal.name}
              title={meal.name}
              subtitle={meal.details}
              pill={`${meal.calories} kcal · ${meal.protein}g`}
            />
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  addText: {
    color: colors.surface,
    fontWeight: "900"
  },
  macroStack: {
    gap: spacing.lg
  },
  macroHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs
  },
  macroLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  macroValue: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  meals: {
    gap: spacing.sm
  }
});
