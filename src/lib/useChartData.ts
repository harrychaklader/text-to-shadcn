import { useMemo, useState } from "react";
import { parsePrompt } from "./mockParser";
import { ChartType, ParsedChartData } from "./types";

type UseChartDataReturn = {
  data: ParsedChartData;
  setData: React.Dispatch<React.SetStateAction<ParsedChartData>>;
  isLoading: boolean;
  error: string | null;
  meta: {
    title: string;
    unit: string;
    seriesCount: number;
    points: number;
  };
  generate: (prompt: string, chartType: ChartType) => Promise<void>;
};

export function useChartData(
  initialPrompt: string,
  initialData: ParsedChartData
): UseChartDataReturn {
  const [data, setData] = useState<ParsedChartData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = useMemo(() => {
    return {
      title: data.title ?? "Untitled Chart",
      unit: data.unit ?? "N/A",
      seriesCount: data.series.length,
      points: data.labels.length,
    };
  }, [data]);

  async function generate(prompt: string, chartType: ChartType) {
    setIsLoading(true);
    setError(null);
    console.log("[UI] Generate clicked", { prompt, chartType });
    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, chartType }),
      });

      console.log("[UI] Response status", response.status);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        console.error("[UI] Error payload", payload);
        throw new Error(payload.error || "Failed to fetch chart data.");
      }

      const parsed = (await response.json()) as ParsedChartData;
      console.log("[UI] Parsed payload", parsed);
      if (!parsed?.labels?.length || !parsed?.series?.length) {
        throw new Error("Invalid response from model.");
      }

      setData(parsed);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "LLM request failed.";
      console.error("[UI] Generate failed", err);
      setError(message);
      const fallback = parsePrompt(prompt || initialPrompt);
      setData(fallback);
    } finally {
      setIsLoading(false);
    }
  }

  return { data, setData, isLoading, error, meta, generate };
}
