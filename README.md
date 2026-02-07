# Text-to-Chart Sandbox

Turn natural language into charts using shadcn/ui (Recharts), with live inline
editing and export tools. This sandbox is wired to OpenRouter + Exa for
tool-calling web search and data extraction.

## Features
- Natural-language prompt to chart data (OpenRouter + Exa).
- Area, Bar, Line, Pie, Radar, and Radial charts.
- Live inline editing of labels, series names, and values.
- Export JSON, CSV, PNG, and SVG.
- Dark-mode palette applied by default.

## Setup
1. Install dependencies:
   - `npm install`
2. Create `.env` based on `.env.example`:
   - `OPENROUTER_API_KEY=...`
   - `EXA_API_KEY=...`
   - `OPENROUTER_MODEL=moonshotai/kimi-k2.5` (optional)
3. Start dev servers:
   - `npm run dev`

Vite runs the client, and an Express server runs the OpenRouter/Exa backend.

## Scripts
- `npm run dev` - Run client + server with proxy.
- `npm run build` - Build the client.
- `npm run preview` - Preview the client build.
- `npm run start` - Run the backend server only.

## Notes
- The backend expects tool-calling JSON from the model and validates results.
- API keys are local only; `.env` is gitignored.
