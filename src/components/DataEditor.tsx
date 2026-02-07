import { ParsedChartData } from "../lib/types";

export type CellState = {
  draft: string;
  invalid: boolean;
};

type DataEditorProps = {
  data: ParsedChartData;
  cellStates: Record<string, CellState>;
  onUpdateLabel: (index: number, value: string) => void;
  onUpdateSeriesName: (seriesIndex: number, value: string) => void;
  onUpdateUnit: (value: string) => void;
  onUpdateValue: (seriesIndex: number, labelIndex: number, value: string) => void;
};

export function DataEditor({
  data,
  cellStates,
  onUpdateLabel,
  onUpdateSeriesName,
  onUpdateUnit,
  onUpdateValue,
}: DataEditorProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Label</th>
          {data.series.map((series, seriesIndex) => (
            <th key={series.name}>
              <input
                type="text"
                value={series.name}
                onChange={(event) =>
                  onUpdateSeriesName(seriesIndex, event.target.value)
                }
              />
            </th>
          ))}
        </tr>
        <tr>
          <th>Unit</th>
          <th colSpan={data.series.length}>
            <input
              type="text"
              value={data.unit ?? ""}
              onChange={(event) => onUpdateUnit(event.target.value)}
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {data.labels.map((label, labelIndex) => (
          <tr key={`${label}-${labelIndex}`}>
            <td>
              <input
                type="text"
                value={label}
                onChange={(event) => onUpdateLabel(labelIndex, event.target.value)}
              />
            </td>
            {data.series.map((series, seriesIndex) => {
              const key = `${seriesIndex}:${labelIndex}`;
              const state = cellStates[key];
              const displayValue =
                state?.draft ?? series.values[labelIndex]?.toString() ?? "";
              return (
                <td key={`${series.name}-${labelIndex}`}>
                  <input
                    type="text"
                    value={displayValue}
                    className={state?.invalid ? "invalid" : undefined}
                    onChange={(event) =>
                      onUpdateValue(seriesIndex, labelIndex, event.target.value)
                    }
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
