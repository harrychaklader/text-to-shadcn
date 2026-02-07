import { ParsedChartData } from "./types";

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function toCsv(data: ParsedChartData) {
  const header = [
    "Label",
    ...data.series.map((series) =>
      data.unit ? `${series.name} (${data.unit})` : series.name
    ),
  ];
  const rows = data.labels.map((label, index) => [
    label,
    ...data.series.map((series) => series.values[index] ?? ""),
  ]);

  return [header, ...rows]
    .map((row) =>
      row
        .map((value) => {
          const str = String(value ?? "");
          return str.includes(",") ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(",")
    )
    .join("\n");
}
