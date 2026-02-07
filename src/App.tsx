import { useRef, useState } from "react";
import { ChartPanel } from "./components/ChartPanel";
import { DataEditor, CellState } from "./components/DataEditor";
import { parsePrompt } from "./lib/mockParser";
import { ChartType } from "./lib/types";
import { useChartData } from "./lib/useChartData";

const chartTypes: { value: ChartType; label: string }[] = [
  { value: "area", label: "Area" },
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Pie" },
  { value: "radar", label: "Radar" },
  { value: "radial", label: "Radial" },
];

const defaultPrompt =
  "Display the market share out of 100% for Cloud Service Providers";

export default function App() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [chartType, setChartType] = useState<ChartType>("radial");
  const initialData = parsePrompt(defaultPrompt);
  const { data, setData, isLoading, error, meta, generate } = useChartData(
    defaultPrompt,
    initialData
  );
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});
  const chartRef = useRef<HTMLDivElement>(null);
  const handleGenerate = async () => {
    await generate(prompt, chartType);
    setCellStates({});
  };

  function updateLabel(index: number, value: string) {
    setData((prev) => ({
      ...prev,
      labels: prev.labels.map((label, i) => (i === index ? value : label)),
    }));
  }

  function updateSeriesName(seriesIndex: number, value: string) {
    setData((prev) => ({
      ...prev,
      series: prev.series.map((series, i) =>
        i === seriesIndex ? { ...series, name: value } : series
      ),
    }));
  }

  function updateUnit(value: string) {
    setData((prev) => ({ ...prev, unit: value }));
  }

  function updateValue(seriesIndex: number, labelIndex: number, value: string) {
    const key = `${seriesIndex}:${labelIndex}`;
    const numeric = Number(value);
    const isValid = value.trim() !== "" && Number.isFinite(numeric);

    setCellStates((prev) => ({
      ...prev,
      [key]: { draft: value, invalid: !isValid },
    }));

    if (!isValid) return;

    setData((prev) => ({
      ...prev,
      series: prev.series.map((series, sIndex) => {
        if (sIndex !== seriesIndex) return series;
        return {
          ...series,
          values: series.values.map((point, pIndex) =>
            pIndex === labelIndex ? numeric : point
          ),
        };
      }),
    }));
  }

  async function handleExportPng() {
    if (!chartRef.current) return;
    const dataUrl = await toPng(chartRef.current, { cacheBust: true });
    const blob = await (await fetch(dataUrl)).blob();
    downloadBlob("chart.png", blob);
  }

  async function handleExportSvg() {
    if (!chartRef.current) return;
    const dataUrl = await toSvg(chartRef.current);
    const blob = await (await fetch(dataUrl)).blob();
    downloadBlob("chart.svg", blob);
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    downloadBlob("chart-data.json", blob);
  }

  function handleExportCsv() {
    const blob = new Blob([toCsv(data)], { type: "text/csv" });
    downloadBlob("chart-data.csv", blob);
  }

  return (
    <div className="app">
      <header className="header container">
        <h1>Text-to-Chart Sandbox</h1>
        <p>Paste natural language, pick a chart type, and edit live.</p>
      </header>

      <main className="container">
        <section className="panel form-grid">
          <div className="form-row">
            <label className="label">Prompt</label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the chart you want..."
            />
          </div>
          <div className="form-row">
            <label className="label">Chart Type</label>
            <select
              value={chartType}
              onChange={(event) => setChartType(event.target.value as ChartType)}
            >
              {chartTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="actions">
            <button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? "Fetching..." : "Generate"}
            </button>
            <span className="badge">
              {meta.seriesCount} series • {meta.points} points
            </span>
            {error && <span className="badge">Fallback: {error}</span>}
          </div>
        </section>

        <section className="panel split">
          <ChartPanel
            data={data}
            chartType={chartType}
            chartRef={chartRef}
            title={meta.title}
            unit={meta.unit}
          />

          <div>
            <div className="meta" style={{ marginBottom: 10 }}>
              <div>
                <strong>Edit data</strong>
              </div>
              <div>Click any cell to update live.</div>
            </div>
            <DataEditor
              data={data}
              cellStates={cellStates}
              onUpdateLabel={updateLabel}
              onUpdateSeriesName={updateSeriesName}
              onUpdateUnit={updateUnit}
              onUpdateValue={updateValue}
            />
          </div>
        </section>
      </main>

      <footer className="foot container">
        OpenRouter + Exa search enabled.
      </footer>
    </div>
  );
}
