export async function getAIRecommendations(userInput, products) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API key is missing in .env file");
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
User query: "${userInput}"
Product dataset: ${JSON.stringify(productSummary)}

Analyze the user's query carefully. Filter the dataset and return ONLY a raw JSON array containing the IDs of the matching products.
Example output format: [3, 14, 25]
Do not output markdown code blocks (like \`\`\`json), explanations, or extra text. Output ONLY the array.
`;

  const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `HTTP Error ${response.status}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]) {
    throw new Error("Invalid or empty response from Gemini API");
  }

  let rawText = data.candidates[0].content.parts[0].text.trim();

  rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  const matchedIds = JSON.parse(rawText);
  return matchedIds;
}