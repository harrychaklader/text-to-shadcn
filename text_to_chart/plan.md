## Blueprint

Build a Vite + React sandbox that turns natural language into chart data, renders shadcn/ui charts (Recharts), allows live inline edits, and exports data/image. Start with a mock parser and a single page UI, then progressively add chart renderers, inline editing, and export features, ensuring each step is integrated.

### Step-by-step build plan (detailed)
1. Scaffold Vite + React app, install shadcn/ui chart dependencies (Recharts + shadcn chart component), set up basic layout.
2. Add a chart type selector and prompt input with “Generate” action; add a placeholder results panel.
3. Implement a mock parser module that returns structured data for known prompts and a fallback dataset.
4. Create a chart data model and mapping utilities (labels + multi-series values) to Recharts-compatible shapes and shadcn `ChartConfig`.
5. Implement chart rendering for Area/Line/Bar using shared renderer components.
6. Implement chart rendering for Pie, Radar, Radial using specific renderer components.
7. Add inline editable data table bound to the chart state (live updates).
8. Add basic validation/error states for invalid numeric inputs.
9. Add data export: JSON and CSV.
10. Add image export: PNG/SVG (choose a client-side method like `html-to-image`).
11. Polish: loading states, empty states, and minor UX improvements.

## Iterative Chunks (Round 1)

1. **Foundation UI + mock data**  
   Scaffold app, add UI shell, and mock parser returning hardcoded datasets.

2. **Chart rendering core**  
   Add chart config + render Area/Line/Bar with shared components.

3. **Remaining chart types**  
   Add Pie/Radar/Radial renderers.

4. **Inline editing**  
   Add editable table with live updates.

5. **Exports + polish**  
   Add JSON/CSV export, then PNG/SVG export, and tidy UX.

## Iterative Chunks (Round 2 — smaller steps)

1.1 Scaffold app, add minimal layout  
1.2 Add input + chart type selector + “Generate”  
1.3 Add mock parser + sample datasets + wire generate

2.1 Define chart data model + mapping utils  
2.2 Implement Area chart renderer  
2.3 Implement Line + Bar renderer using shared code

3.1 Implement Pie renderer  
3.2 Implement Radar renderer  
3.3 Implement Radial renderer  
3.4 Wire type selection to renderer switch

4.1 Create read-only data table from parsed data  
4.2 Add inline editing for labels  
4.3 Add inline editing for values + live update  
4.4 Validate numeric inputs with inline error UI

5.1 Add JSON export  
5.2 Add CSV export  
5.3 Add PNG export  
5.4 Add SVG export  
5.5 Empty/error states and minor UX polish

## Prompts for Code-Generation LLM

### Prompt 1.1 — Scaffold app, minimal layout
`Create a Vite + React app structure with a single-page layout. Add a simple App shell with header, main content area, and footer. Keep styling minimal using existing global styles. Do not add chart logic yet.`

### Prompt 1.2 — Input UI + selector + generate action
`Add a text area for natural language input, a chart type selector (Area, Bar, Line, Pie, Radar, Radial), and a Generate button. Put these controls in a form-like panel at the top of the main content. Add a placeholder results panel below. No parsing or chart rendering yet.`

### Prompt 1.3 — Mock parser + sample datasets + wiring
`Implement a mock parser module that returns structured data (labels, series, unit, optional title) for known prompts and a fallback dataset. Wire the Generate button to call the parser and store the result in state. Show the parsed payload as formatted JSON in the results panel.`

### Prompt 2.1 — Data model + mapping utilities
`Define a chart data model interface (labels, series[], unit, title) and write mapping utilities to convert it into Recharts data arrays and shadcn ChartConfig (series name -> label/color). Replace JSON display with a small summary of parsed data (e.g., title, unit, series count) but keep JSON view accessible in a collapsible panel.`

### Prompt 2.2 — Area chart renderer
`Implement an Area chart renderer component using shadcn/ui ChartContainer and Recharts AreaChart. Use the mapping utilities and support multiple series. Wire it to render when the selected chart type is Area. Keep tooltips and legend using shadcn ChartTooltip/ChartLegend components.`

### Prompt 2.3 — Line and Bar renderers (shared)
`Add Line and Bar renderers, reusing shared logic for axes, grid, tooltip, and legend. Ensure the renderer switch uses the selected chart type and that all three (Area/Line/Bar) render from the same data model and mapping utilities.`

### Prompt 3.1 — Pie renderer
`Implement a Pie chart renderer using shadcn ChartContainer and Recharts PieChart. Map labels and series to slices; if multiple series exist, pick the first series or provide a series selector UI for pie charts. Add tooltip and legend using shadcn components.`

### Prompt 3.2 — Radar renderer
`Add a Radar chart renderer with RadarChart, polar grid, and tooltip. Ensure labels map to angle axis and support multiple series.`

### Prompt 3.3 — Radial renderer
`Add a Radial chart renderer using RadialBarChart. Map labels to radial bars using the first series by default. Include legend and tooltip.`

### Prompt 3.4 — Renderer switch wiring
`Wire the chart type selector to the renderer switch so that Area, Bar, Line, Pie, Radar, and Radial all render correctly from the parsed data. Include a fallback empty state when no data exists.`

### Prompt 4.1 — Read-only data table
`Create a data table under the chart that displays labels and all series values. Use a simple table layout. It should be read-only for now and reflect the parsed data state.`

### Prompt 4.2 — Inline edit labels
`Make label cells inline-editable (click to edit). Updates should immediately change the chart and table state.`

### Prompt 4.3 — Inline edit values
`Make value cells inline-editable for each series. Updates should be parsed as numbers and immediately update the chart.`

### Prompt 4.4 — Validation UI
`Add validation: if a value cell is not a valid number, show an inline error style and do not update the chart state until valid. Keep the previous valid value in state.`

### Prompt 5.1 — JSON export
`Add a “Download JSON” button that exports the current parsed data model as a JSON file. Wire it to the current state.`

### Prompt 5.2 — CSV export
`Add a “Download CSV” button. Generate a CSV with labels as the first column and each series as subsequent columns. Include unit in the header if available.`

### Prompt 5.3 — PNG export
`Add a “Download PNG” button that exports the chart container as a PNG image using a client-side library like html-to-image. Ensure it targets only the chart area.`

### Prompt 5.4 — SVG export
`Add a “Download SVG” button that exports the chart container as SVG. If the library doesn’t support SVG directly, explain and pick a viable approach compatible with Recharts.`

### Prompt 5.5 — UX polish
`Add loading/empty states, small UI polish (spacing, labels), and ensure the chart container has a min height. Verify there is no orphaned UI and everything is wired end-to-end.`
