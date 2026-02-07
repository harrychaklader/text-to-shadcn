import { ParsedChartData } from "./types";

const datasets: Record<string, ParsedChartData> = {
  cloud: {
    title: "Cloud Service Provider Market Share",
    unit: "%",
    labels: ["AWS", "Azure", "GCP"],
    series: [{ name: "MarketShare", values: [34, 24, 11] }],
  },
  mag7: {
    title: "Mag 7 CapEx",
    unit: "USD_B",
    labels: ["Apple", "Microsoft", "Amazon", "Alphabet", "Meta", "Nvidia", "Tesla"],
    series: [{ name: "CapEx", values: [40, 38, 32, 28, 24, 20, 16] }],
  },
  bitcoin: {
    title: "Average Bitcoin Price (5 Years)",
    unit: "USD",
    labels: ["2021", "2022", "2023", "2024", "2025"],
    series: [{ name: "BTC", values: [47000, 28000, 30000, 52000, 61000] }],
  },
};

const fallback: ParsedChartData = {
  title: "Sample Multi-Series Data",
  unit: "Users",
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  series: [
    { name: "Desktop", values: [186, 305, 237, 73, 209, 214] },
    { name: "Mobile", values: [80, 200, 120, 190, 130, 140] },
  ],
};

export function parsePrompt(prompt: string): ParsedChartData {
  const normalized = prompt.toLowerCase();
  if (normalized.includes("cloud") || normalized.includes("market share")) {
    return datasets.cloud;
  }
  if (normalized.includes("mag 7") || normalized.includes("capex")) {
    return datasets.mag7;
  }
  if (normalized.includes("bitcoin") || normalized.includes("btc")) {
    return datasets.bitcoin;
  }
  return fallback;
}
