import * as React from "react";
import { Tooltip, TooltipProps } from "recharts";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChartConfig() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) {
    throw new Error("Chart components must be used within ChartContainer.");
  }
  return ctx.config;
}

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
};

export function ChartContainer({
  config,
  className,
  style,
  ...props
}: ChartContainerProps) {
  const cssVars = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      `--color-${key}`,
      value.color ?? "#94a3b8",
    ])
  ) as React.CSSProperties;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={className}
        style={{ ...cssVars, ...style }}
        {...props}
      />
    </ChartContext.Provider>
  );
}

export function ChartTooltip(props: TooltipProps<number, string>) {
  return <Tooltip {...props} />;
}

type ChartTooltipContentProps = TooltipProps<number, string> & {
  labelKey?: string;
  nameKey?: string;
  hideLabel?: boolean;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelKey,
  nameKey,
  hideLabel,
}: ChartTooltipContentProps) {
  const config = useChartConfig();
  if (!active || !payload?.length) return null;

  const rows = payload.filter((entry) => entry.value != null);
  const displayLabel =
    (labelKey && (payload[0]?.payload as Record<string, string>)?.[labelKey]) ??
    label;

  return (
    <div
      style={{
        background: "hsl(var(--popover))",
        color: "hsl(var(--popover-foreground))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 10,
        padding: "10px 12px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.28)",
      }}
    >
      {!hideLabel && (
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{displayLabel}</div>
      )}
      <div style={{ display: "grid", gap: 4 }}>
        {rows.map((entry) => {
          const key = (nameKey && entry.payload?.[nameKey]) || entry.name;
          const color =
            (key && config[key as string]?.color) || entry.color || "#94a3b8";
          return (
            <div
              key={entry.dataKey?.toString()}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: color,
                }}
              />
              <span style={{ fontSize: 12 }}>
                {config[key as string]?.label ?? key}:{" "}
                <strong>{entry.value}</strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type ChartLegendEntry = {
  value?: string;
  color?: string;
  payload?: Record<string, unknown>;
};

type ChartLegendContentProps = {
  payload?: ChartLegendEntry[];
  nameKey?: string;
};

export function ChartLegendContent({ payload, nameKey }: ChartLegendContentProps) {
  const config = useChartConfig();
  if (!payload?.length) return null;

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {payload.map((entry) => {
        const payloadKey =
          nameKey && entry.payload
            ? (entry.payload as Record<string, string>)[nameKey]
            : undefined;
        const key = payloadKey || entry.value;
        const color =
          (key && config[key as string]?.color) || entry.color || "#94a3b8";
        return (
          <div key={entry.value} style={{ display: "flex", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: color,
                marginTop: 4,
              }}
            />
            <span style={{ fontSize: 12, color: "hsl(var(--foreground))" }}>
              {config[key as string]?.label ?? key}
            </span>
          </div>
        );
      })}
    </div>
  );
}
