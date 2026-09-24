import Groq from "groq-sdk";

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
- days array must have at least 1 item.
- Each day must have at least 1 stop.
- type must be exactly one of: attraction, food, hotel, transport
- Return ONLY the raw JSON object. Nothing else.`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "prompt is required" });
  }

  if (prompt.trim().length > 2000) {
    return res.status(400).json({ error: "prompt too long" });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Plan this trip: ${prompt.trim()}` },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const raw = completion.choices?.[0]?.message?.content;

    if (!raw || raw.trim().length === 0) {
      return res.status(502).json({ error: "empty response from model" });
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ error: "model returned malformed JSON" });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(502).json({ error: "model returned malformed JSON" });
    }

    return res.json({ result: parsed });
  } catch (err) {
    return res.status(500).json({ error: err.message || "server error" });
  }
}
