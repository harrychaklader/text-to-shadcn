import { toPng, toSvg } from "html-to-image";
import { ChartRenderer } from "./ChartRenderer";
import { downloadBlob, toCsv } from "../lib/exporters";
import { ParsedChartData } from "../lib/types";

type ChartPanelProps = {
  data: ParsedChartData;
  chartType: "area" | "bar" | "line" | "pie" | "radar" | "radial";
  chartRef: React.RefObject<HTMLDivElement>;
  title: string;
  unit: string;
};

export function ChartPanel({
  data,
  chartType,
  chartRef,
  title,
  unit,
}: ChartPanelProps) {
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
    <div>
      <div className="meta">
        <div>
          <strong>{title}</strong>
        </div>
        <div>Unit: {unit}</div>
      </div>
      <div ref={chartRef}>
        <ChartRenderer data={data} type={chartType} />
      </div>
      <div className="export-row">
        <button className="secondary" onClick={handleExportJson}>
          Download JSON
        </button>
        <button className="secondary" onClick={handleExportCsv}>
          Download CSV
        </button>
        <button className="secondary" onClick={handleExportPng}>
          Download PNG
        </button>
        <button className="secondary" onClick={handleExportSvg}>
          Download SVG
        </button>
      </div>
      {data.sources && data.sources.length > 0 && (
        <div className="meta" style={{ marginTop: 12 }}>
          <div>
            <strong>Sources</strong>
          </div>
          {data.sources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              {source.title || source.url}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
