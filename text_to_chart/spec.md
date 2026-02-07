# Text-to-Chart Spec

## Scope
- Build a sandbox Vite + React app that turns natural language into chart data and renders shadcn/ui charts (Area, Bar, Line, Pie, Radar, Radial) with tooltips and legends.
- User selects chart type; parsing is mock/placeholder for v1 (LLM backend later).
- Render immediately, then allow live editing of any label/value/unit via inline edits.
- Support multiple series per chart.
- Provide export of chart image (PNG/SVG) and parsed data (JSON/CSV).

## UX Flow
- Input area: large text box for natural language prompt.
- Chart type selector: Area/Bar/Line/Pie/Radar/Radial.
- Primary action: Generate chart.
- Result view:
  - Render chart using shadcn/ui chart components and Recharts.
  - Inline editable data table where each cell (labels/values/units/series) is clickable and updates chart live.
  - Export buttons: Download PNG/SVG and JSON/CSV.

## Data Model (client-side)
- Parsed payload returned by mock parser:
  - `title?: string`
  - `unit?: string`
  - `labels: string[]`
  - `series: Array<{ name: string; values: number[] }>`
- Chart config for shadcn/ui:
  - `ChartConfig` maps `series.name` to labels/colors; colors assigned from a palette.

## Parsing Strategy (v1)
- Mock parser module:
  - Deterministic mapping for example prompts (radial, radar, line) using the placeholder datasets we agreed on.
  - Fallback: return a simple single-series dataset or an empty state message.
- LLM backend deferred; design parser interface so it can be swapped later.

## Chart Rendering
- Use `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent` per shadcn/ui chart docs.
- For each chart type:
  - Area/Line/Bar: use `XAxis`, `CartesianGrid`, `Tooltip`, `Legend` and multiple series.
  - Pie/Radial: use `PieChart`/`RadialBarChart` with tooltip and legend.
  - Radar: use `RadarChart` with grid/angle axis and tooltip.
- Ensure `ChartContainer` has a minimum height class for responsiveness.

## Inline Edit Behavior
- Each data cell is content-editable or uses inline input components.
- Changes update state and re-render chart immediately.
- Basic validation: numeric fields parse to number; invalid input shows inline error styling and doesn’t update chart values until valid.

## Export
- JSON: export current parsed payload.
- CSV: `labels` as first column; each series as additional columns; include unit in header if present.
- PNG/SVG: render chart container to image (client-side library to be selected in implementation).

## Non-Goals (v1)
- No persistence between sessions.
- No auth, sharing, or saved charts.
- No LLM API integration yet.

## Deliverable
- Create `spec.md` in repo root with the above content and any implementation notes.

## Open Assumptions
- Placeholder datasets for mock parsing can be refined later.
- Colors assigned automatically per series (fixed palette).
