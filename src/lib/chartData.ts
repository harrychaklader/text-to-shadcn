import { ChartConfig } from "../components/ui/chart";
import { ParsedChartData } from "./types";

const palette = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
];

export function toRechartsData(data: ParsedChartData) {
  return data.labels.map((label, index) => {
    const row: Record<string, string | number> = { label };
    data.series.forEach((series) => {
      row[series.name] = series.values[index] ?? 0;
    });
    return row;
  });
}

export function toChartConfig(data: ParsedChartData): ChartConfig {
  return data.series.reduce<ChartConfig>((acc, series, index) => {
    acc[series.name] = {
      label: series.name,
      color: palette[index % palette.length],
    };
    return acc;
  }, {});
}

export function toLabelConfig(data: ParsedChartData): ChartConfig {
  return data.labels.reduce<ChartConfig>((acc, label, index) => {
    acc[label] = {
      label,
      color: palette[index % palette.length],
    };
    return acc;
  }, {});
}

export function toPieData(data: ParsedChartData, config: ChartConfig) {
  const series = data.series[0];
  return data.labels.map((label, index) => ({
    name: label,
    value: series?.values[index] ?? 0,
    fill: config[label]?.color ?? palette[index % palette.length],
  }));
}
