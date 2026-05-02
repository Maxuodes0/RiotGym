import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "../../src/components/Card";
import { Screen } from "../../src/components/Screen";
import { todayWorkout } from "../../src/data/mock";
import { colors, radius, spacing } from "../../src/theme";

export default function WorkoutsScreen() {
  const [workout, setWorkout] = useState(todayWorkout);
  const completedSets = useMemo(
    () => workout.flatMap((exercise) => exercise.sets).filter((set) => set.done).length,
    [workout]
  );
  const totalSets = workout.flatMap((exercise) => exercise.sets).length;

  function toggleSet(exerciseIndex: number, setIndex: number) {
    setWorkout((current) =>
      current.map((exercise, currentExerciseIndex) => {
        if (currentExerciseIndex !== exerciseIndex) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set, currentSetIndex) =>
            currentSetIndex === setIndex ? { ...set, done: !set.done } : set
          )
        };
      })
    );
  }

  return (
    <Screen
      title="التمارين"
      subtitle={`${completedSets}/${totalSets} sets مكتملة`}
      rightSlot={
        <Pressable style={styles.finishButton}>
          <Text style={styles.finishText}>إنهاء</Text>
        </Pressable>
      }
    >
      <View style={styles.planTabs}>
        {["Push", "Pull", "Legs", "Upper"].map((plan, index) => (
          <Pressable key={plan} style={[styles.planTab, index === 0 && styles.planTabActive]}>
            <Text style={[styles.planTabText, index === 0 && styles.planTabTextActive]}>{plan}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.stack}>
        {workout.map((exercise, exerciseIndex) => (
          <Card key={exercise.name} title={exercise.name} eyebrow={exercise.muscle}>
            <View style={styles.setHeader}>
              <Text style={styles.setHeaderText}>#</Text>
              <Text style={styles.setHeaderText}>Reps</Text>
              <Text style={styles.setHeaderText}>Kg</Text>
              <Text style={styles.setHeaderText}>RPE</Text>
              <Text style={styles.setHeaderText}>Done</Text>
            </View>
            {exercise.sets.map((set, setIndex) => (
              <View key={`${exercise.name}-${setIndex}`} style={styles.setRow}>
                <Text style={styles.setNumber}>{setIndex + 1}</Text>
                <TextInput style={styles.setInput} defaultValue={String(set.reps)} keyboardType="number-pad" />
                <TextInput style={styles.setInput} defaultValue={String(set.weight)} keyboardType="decimal-pad" />
                <TextInput style={styles.setInput} defaultValue={String(set.rpe)} keyboardType="number-pad" />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`toggle set ${setIndex + 1}`}
                  onPress={() => toggleSet(exerciseIndex, setIndex)}
                  style={[styles.checkButton, set.done && styles.checkButtonDone]}
                >
                  <Ionicons name="checkmark" size={18} color={set.done ? colors.surface : colors.muted} />
                </Pressable>
              </View>
            ))}
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  finishButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  finishText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "900"
  },
  planTabs: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  planTab: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  planTabActive: {
    backgroundColor: colors.green
  },
  planTabText: {
    color: colors.muted,
    fontWeight: "800"
  },
  planTabTextActive: {
    color: colors.surface
  },
  stack: {
    gap: spacing.md
  },
  setHeader: {
    flexDirection: "row-reverse",
    marginBottom: spacing.xs
  },
  setHeaderText: {
    color: colors.muted,
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center"
  },
  setRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  setNumber: {
    color: colors.text,
    flex: 1,
    fontWeight: "900",
    textAlign: "center"
  },
  setInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontWeight: "800",
    minHeight: 40,
    paddingHorizontal: 8,
    textAlign: "center"
  },
  checkButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    height: 40,
    justifyContent: "center"
  },
  checkButtonDone: {
    backgroundColor: colors.green,
    borderColor: colors.green
  }
});
