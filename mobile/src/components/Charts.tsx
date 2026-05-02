import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { View } from "react-native";
import { colors } from "../theme";

type RingProps = {
  value: number;
  label: string;
  color?: string;
};

export function RingProgress({ value, label, color = colors.green }: RingProps) {
  const size = 118;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.surfaceMuted} strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
      <SvgText x="50%" y="48%" textAnchor="middle" fontSize="25" fontWeight="900" fill={colors.text}>
        {value}%
      </SvgText>
      <SvgText x="50%" y="66%" textAnchor="middle" fontSize="12" fontWeight="700" fill={colors.muted}>
        {label}
      </SvgText>
    </Svg>
  );
}

type BarChartProps = {
  values: number[];
  labels: string[];
  color?: string;
};

export function BarChart({ values, labels, color = colors.green }: BarChartProps) {
  const width = 320;
  const height = 172;
  const max = Math.max(...values) * 1.18;
  const gap = 12;
  const barWidth = (width - gap * (values.length + 1)) / values.length;

  return (
    <View>
      <Svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {values.map((value, index) => {
          const barHeight = (value / max) * 120;
          const x = gap + index * (barWidth + gap);
          const y = 132 - barHeight;
          return (
            <Rect
              key={labels[index]}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={8}
              fill={color}
              opacity={index === 3 ? 1 : 0.72}
            />
          );
        })}
        {labels.map((label, index) => (
          <SvgText key={label} x={gap + index * (barWidth + gap) + barWidth / 2} y={160} textAnchor="middle" fontSize="12" fill={colors.muted}>
            {label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

export function LineChart({ values }: { values: number[] }) {
  const width = 320;
  const height = 190;
  const min = Math.min(...values) - 0.4;
  const max = Math.max(...values) + 0.4;
  const points = values.map((value, index) => {
    const x = 16 + index * ((width - 32) / (values.length - 1));
    const y = 20 + ((max - value) / (max - min)) * 120;
    return { x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <Svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      {[40, 80, 120].map((y) => (
        <Line key={y} x1={12} x2={width - 12} y1={y} y2={y} stroke={colors.line} strokeWidth={1} />
      ))}
      <Path d={path} fill="none" stroke={colors.green} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => (
        <Circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={5} fill={index === points.length - 1 ? colors.amber : colors.green} />
      ))}
      <SvgText x={width - 18} y={168} textAnchor="end" fontSize="12" fill={colors.muted}>
        آخر 6 قياسات
      </SvgText>
    </Svg>
  );
}
