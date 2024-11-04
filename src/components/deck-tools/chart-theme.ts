import { MQ_FLOATING_SIDEBAR } from "@/utils/constants";
import type {
  AnimatePropTypeInterface,
  VictoryLabelStyleObject,
  VictoryThemeDefinition,
} from "victory";

const baseChartProps = {
  height: window.matchMedia(MQ_FLOATING_SIDEBAR).matches ? 200 : 250,
};

export const animateProps: AnimatePropTypeInterface = {
  duration: 550,
  easing: "expInOut",
  onLoad: { duration: 50 },
};

const baseLabelStyles: VictoryLabelStyleObject = {
  fontFamily: "var(--font-family-ui)",
  fill: "var(--palette-4)",
  fontSize: 12,
  lineHeight: 16,
};

export const chartsTheme: VictoryThemeDefinition = {
  chart: {
    ...baseChartProps,
    padding: 0,
  },
  line: {
    ...baseChartProps,
    style: {
      data: {
        stroke: "var(--nord-10)",
        strokeWidth: 2,
      },
    },
  },
  scatter: {
    ...baseChartProps,
    style: {
      data: { fill: "var(--nord-10)" },
    },
  },
  axis: {
    ...baseChartProps,
    style: {
      axisLabel: { ...baseLabelStyles, padding: 30 },
      axis: { stroke: "var(--palette-2)", strokeWidth: 2 },
      grid: {
        stroke: "var(--palette-2)",
        strokeDasharray: "5, 15",
        strokeWidth: 1,
      },
      tickLabels: { ...baseLabelStyles, padding: 10 },
    },
  },
  tooltip: {
    pointerLength: 0,
    style: baseLabelStyles,
    flyoutStyle: {
      fill: "var(--palette-1)",
      stroke: "var(--palette-2)",
      strokeWidth: 1,
    },
    flyoutHeight: 40,
  },
  pie: {
    ...baseChartProps,
    padding: 0,
    style: {
      labels: {
        ...baseLabelStyles,
        padding: 8,
      },
      data: {
        stroke: "var(--palette-0)",
        strokeWidth: 2,
      },
    },
  },
};