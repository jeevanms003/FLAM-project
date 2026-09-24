import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are a travel planning assistant. When given a trip description, you must respond with ONLY valid JSON — no markdown, no prose, no code fences.

The JSON must exactly match this shape:
{
  "destination": "string",
  "summary": "string",
  "days": [
    {
      "id": "string",
      "day": number,
      "title": "string",
      "theme": "string",
      "stops": [
        {
          "id": "string",
          "name": "string",
          "type": "attraction" | "food" | "hotel" | "transport",
          "description": "string",
          "duration": "string",
          "tips": "string"
        }
      ]
    }
  ]
}

Rules:
- Every id must be a unique short string like "day-1", "stop-1-1", etc.
- Maximum 3 stops per day. Keep descriptions under 15 words. Keep tips under 12 words.
- days array must have at least 1 item.
- Each day must have at least 1 stop.
- type must be exactly one of: attraction, food, hotel, transport
- Return ONLY the raw JSON object. Nothing else.`;

app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "prompt is required" });
  }

  if (prompt.trim().length > 2000) {
    return res.status(400).json({ error: "prompt too long" });
  }

  try {
    dotenv.config({ path: resolve(__dirname, "../.env"), override: true });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Plan this trip: ${prompt.trim()}` },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const raw = completion.choices?.[0]?.message?.content;

    if (!raw || raw.trim().length === 0) {
      return res.status(502).json({ error: "empty response from model" });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      return res.status(502).json({ error: "model returned malformed JSON", raw });
    }

    return res.json({ result: parsed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
