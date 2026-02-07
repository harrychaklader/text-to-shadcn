export type ChartSeries = {
  name: string;
  values: number[];
};

export type ParsedChartData = {
  title?: string;
  unit?: string;
  labels: string[];
  series: ChartSeries[];
  sources?: { title: string; url: string }[];
};

export type ChartType = "area" | "bar" | "line" | "pie" | "radar" | "radial";
