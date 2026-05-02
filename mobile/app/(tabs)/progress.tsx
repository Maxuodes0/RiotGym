import { StyleSheet, View } from "react-native";
import { Card } from "../../src/components/Card";
import { LineChart } from "../../src/components/Charts";
import { ListItem } from "../../src/components/ListItem";
import { Screen } from "../../src/components/Screen";
import { records, weightTrend } from "../../src/data/mock";
import { spacing } from "../../src/theme";

export default function ProgressScreen() {
  return (
    <Screen title="التقدم" subtitle="الوزن والأرقام الشخصية">
      <Card eyebrow="Body" title="الوزن والقياسات">
        <LineChart values={weightTrend} />
      </Card>

      <Card eyebrow="Records" title="أرقام شخصية">
        <View style={styles.stack}>
          {records.map((record) => (
            <ListItem key={record.name} title={record.name} subtitle={record.change} pill={record.value} />
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm
  }
});
