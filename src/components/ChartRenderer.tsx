import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from "./ui/chart";
import { ParsedChartData, ChartType } from "../lib/types";
import {
  toChartConfig,
  toLabelConfig,
  toPieData,
  toRechartsData,
} from "../lib/chartData";

type ChartRendererProps = {
  data: ParsedChartData;
  type: ChartType;
};

export function ChartRenderer({ data, type }: ChartRendererProps) {
  const chartConfig =
    type === "pie" || type === "radial"
      ? toLabelConfig(data)
      : toChartConfig(data);
  const chartData = toRechartsData(data);
  const pieData = toPieData(data, chartConfig);

  if (!data.labels.length || !data.series.length) {
    return <div className="panel">No data available.</div>;
  }

  const chartNode =
    type === "area" ? (
      <AreaChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={<ChartLegendContent />} />
        {data.series.map((series) => (
          <Area
            key={series.name}
            type="monotone"
            dataKey={series.name}
            stroke={`var(--color-${series.name})`}
            fill={`var(--color-${series.name})`}
            fillOpacity={0.2}
          />
        ))}
      </AreaChart>
    ) : type === "line" ? (
      <LineChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={<ChartLegendContent />} />
        {data.series.map((series) => (
          <Line
            key={series.name}
            type="monotone"
            dataKey={series.name}
            stroke={`var(--color-${series.name})`}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    ) : type === "bar" ? (
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={<ChartLegendContent />} />
        {data.series.map((series) => (
          <Bar
            key={series.name}
            dataKey={series.name}
            fill={`var(--color-${series.name})`}
            radius={6}
          />
        ))}
      </BarChart>
    ) : type === "pie" ? (
      <PieChart>
        <Tooltip content={<ChartTooltipContent labelKey="name" />} />
        <Legend content={<ChartLegendContent nameKey="name" />} />
        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120} />
      </PieChart>
    ) : type === "radar" ? (
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="label" />
        <PolarRadiusAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={<ChartLegendContent />} />
        {data.series.map((series) => (
          <Radar
            key={series.name}
            name={series.name}
            dataKey={series.name}
            stroke={`var(--color-${series.name})`}
            fill={`var(--color-${series.name})`}
            fillOpacity={0.2}
          />
        ))}
      </RadarChart>
    ) : (
      <RadialBarChart data={pieData} innerRadius="30%" outerRadius="90%">
        <Tooltip content={<ChartTooltipContent labelKey="name" />} />
        <Legend content={<ChartLegendContent nameKey="name" />} />
        <RadialBar dataKey="value" background />
      </RadialBarChart>
    );

  return (
    <ChartContainer config={chartConfig} className="chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
        {chartNode}
      </ResponsiveContainer>
    </ChartContainer>
  );
}
