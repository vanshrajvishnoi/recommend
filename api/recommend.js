export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;   
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfiguration: API key missing" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
  }

  const { query, products } = body || {};
  if (!query || !Array.isArray(products)) {
    return res.status(400).json({ error: "Missing query or products array" });
  }

  const GEMINI_MODEL = "gemini-3.1-flash-lite"; 
  const GEMINI_API_VERSION = "v1beta";

  const productSummary = products.map(p => ({
    id: p.id, 
    name: p.name, 
    price: p.price, 
    desc: p.description
  }));

  const prompt = `
You are an expert phone recommendation assistant in India.
User query: "${query}"
Product dataset: ${JSON.stringify(productSummary)}

Analyze the user's query carefully. Filter the dataset and return ONLY a raw JSON array containing the IDs of the matching products.
Example output format: [3, 14, 25]
Do not output markdown code blocks (like \`\`\`json), explanations, or extra text. Output ONLY the array.
`;

  const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(502).json({ 
        error: errorData.error?.message || `Gemini HTTP error ${response.status}` 
      });
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      return res.status(502).json({ error: "Invalid or empty response from Gemini API" });
    }

    let rawText = data.candidates[0].content.parts[0].text.trim();
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    let matchedIds;
    try {
      matchedIds = JSON.parse(rawText);
    } catch {
      return res.status(502).json({ error: "AI returned an unexpected response format" });
    }

    return res.status(200).json({ matchedIds });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reach Gemini API server" });
  }
}