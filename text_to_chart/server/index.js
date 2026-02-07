import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const EXA_API_KEY = process.env.EXA_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2.5";

function buildSystemPrompt(chartType) {
  return `You are a data extraction assistant for a text-to-chart app.
Your task: produce JSON that matches this schema:
{
  "title": string,
  "unit": string | null,
  "labels": string[],
  "series": [{ "name": string, "values": number[] }],
  "sources": [{ "title": string, "url": string }]
}
Rules:
- Always return valid JSON only (no markdown).
- Use exa_search to fetch current data from reliable sources.
- For pie or radial charts, output a single series only.
- Use concise labels and align series values to labels by index.
- If data is incomplete, make the best effort and note sources used.`;
}

function toolSpec() {
  return [
    {
      type: "function",
      function: {
        name: "exa_search",
        description: "Search the web for data and sources.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string" },
            numResults: { type: "number", minimum: 1, maximum: 10 },
            type: {
              type: "string",
              enum: ["auto", "neural", "fast", "deep"],
            },
          },
          required: ["query"],
        },
      },
    },
  ];
}

async function callOpenRouter(messages, tools, options = {}) {
  const { toolChoice = "auto" } = options;
  console.log("[OpenRouter] Request", {
    model: OPENROUTER_MODEL,
    toolCount: tools?.length || 0,
    messageCount: messages.length,
    toolChoice,
  });
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      tools,
      tool_choice: toolChoice,
      stream: false,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[OpenRouter] Error", response.status, text);
    throw new Error(`OpenRouter error: ${response.status} ${text}`);
  }

  const payload = await response.json();
  console.log(
    "[OpenRouter] Response",
    payload?.choices?.[0]?.message?.content?.slice(0, 500) || "<no content>"
  );
  return payload;
}

async function callExa({ query, numResults = 6, type = "auto" }) {
  console.log("[Exa] Search", { query, numResults, type });
  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "x-api-key": EXA_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      numResults,
      type,
      contents: { text: true },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[Exa] Error", response.status, text);
    throw new Error(`Exa error: ${response.status} ${text}`);
  }

  const data = await response.json();
  console.log("[Exa] Results", data?.results?.length || 0);
  const results = (data.results || []).map((result) => ({
    title: result.title,
    url: result.url,
    text: result.text ? result.text.slice(0, 1200) : undefined,
  }));

  return { results };
}

function safeJsonParse(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("[Parser] JSON parse failed. Raw content:", content);
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }
    throw new Error("Failed to parse JSON from model response.");
  }
}

function isSearchArgs(payload) {
  return (
    payload &&
    typeof payload === "object" &&
    typeof payload.query === "string" &&
    payload.query.length > 0
  );
}

function isValidChartData(payload) {
  return (
    payload &&
    Array.isArray(payload.labels) &&
    payload.labels.length > 0 &&
    Array.isArray(payload.series) &&
    payload.series.length > 0
  );
}

app.post("/api/parse", async (req, res) => {
  try {
    console.log("[API] /api/parse", {
      hasKeys: Boolean(OPENROUTER_API_KEY && EXA_API_KEY),
      chartType: req.body?.chartType,
    });
    console.log("[API] Body", req.body);
    if (!OPENROUTER_API_KEY || !EXA_API_KEY) {
      return res.status(400).json({
        error:
          "Missing OPENROUTER_API_KEY or EXA_API_KEY. Add them to your environment.",
      });
    }

    const { prompt, chartType } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const messages = [
      { role: "system", content: buildSystemPrompt(chartType) },
      {
        role: "user",
        content: `Prompt: ${prompt}\nChart type: ${chartType}`,
      },
    ];

    const tools = toolSpec();
    const first = await callOpenRouter(messages, tools, { toolChoice: "auto" });
    const firstMessage = first.choices?.[0]?.message;
    console.log("[OpenRouter] First message", firstMessage);
    const toolCalls = firstMessage?.tool_calls ?? [];

    console.log("[OpenRouter] Tool calls", toolCalls.length);
    if (toolCalls.length > 0) {
      const toolResults = [];
      for (const toolCall of toolCalls) {
        console.log("[OpenRouter] Tool call", toolCall);
        if (toolCall.function?.name !== "exa_search") continue;
        let args = {};
        try {
          args =
            typeof toolCall.function.arguments === "string"
              ? JSON.parse(toolCall.function.arguments || "{}")
              : toolCall.function.arguments || {};
        } catch (parseError) {
          console.error(
            "[OpenRouter] Tool args parse failed",
            toolCall.function.arguments,
            parseError
          );
          throw parseError;
        }
        console.log("[OpenRouter] Tool args", args);
        const result = await callExa(args);
        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      console.log("[OpenRouter] Tool results", toolResults);
      const second = await callOpenRouter(
        [...messages, firstMessage, ...toolResults],
        tools,
        { toolChoice: "none" }
      );
      const content = second.choices?.[0]?.message?.content || "";
      console.log("[OpenRouter] Final content", content);
      if (!content) {
        console.error("[OpenRouter] Empty content", second);
        throw new Error("Model returned empty content.");
      }
      const parsed = safeJsonParse(content);
      if (!isValidChartData(parsed)) {
        console.warn("[Parser] Invalid chart data from tools", parsed);
      } else {
        return res.json(parsed);
      }
    }

    const content = firstMessage?.content || "";
    console.log("[OpenRouter] Final content (no tools)", content);
    if (!content) {
      console.error("[OpenRouter] Empty content", first);
      throw new Error("Model returned empty content.");
    }

    const maybeArgs = safeJsonParse(content);
    if (isSearchArgs(maybeArgs)) {
      console.log("[OpenRouter] Treating content as tool args", maybeArgs);
      const result = await callExa(maybeArgs);
      const toolResults = [
        {
          role: "tool",
          tool_call_id: "functions.exa_search:0",
          content: JSON.stringify(result),
        },
      ];
      const second = await callOpenRouter(
        [...messages, ...toolResults],
        tools,
        { toolChoice: "none" }
      );
      const secondContent = second.choices?.[0]?.message?.content || "";
      console.log("[OpenRouter] Final content (manual tools)", secondContent);
      if (!secondContent) {
        console.error("[OpenRouter] Empty content", second);
        throw new Error("Model returned empty content.");
      }
      const parsed = safeJsonParse(secondContent);
      return res.json(parsed);
    }

    if (isValidChartData(maybeArgs)) {
      return res.json(maybeArgs);
    }

    console.warn("[Parser] Invalid chart data, running fallback search");
    const fallbackSearch = await callExa({ query: prompt, numResults: 6 });
    const fallbackToolResults = [
      {
        role: "tool",
        tool_call_id: "functions.exa_search:0",
        content: JSON.stringify(fallbackSearch),
      },
    ];
    const final = await callOpenRouter(
      [
        ...messages,
        {
          role: "system",
          content:
            "You must return chart JSON with non-empty labels and series.",
        },
        ...fallbackToolResults,
      ],
      tools,
      { toolChoice: "none" }
    );
    const finalContent = final.choices?.[0]?.message?.content || "";
    console.log("[OpenRouter] Final content (fallback)", finalContent);
    if (!finalContent) {
      console.error("[OpenRouter] Empty content", final);
      throw new Error("Model returned empty content.");
    }
    const finalParsed = safeJsonParse(finalContent);
    if (!isValidChartData(finalParsed)) {
      console.error("[Parser] Invalid chart data after fallback", finalParsed);
      throw new Error("Model returned invalid chart data.");
    }
    return res.json(finalParsed);
  } catch (error) {
    console.error("[API] Error", error);
    if (error?.stack) {
      console.error("[API] Stack", error.stack);
    }
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
