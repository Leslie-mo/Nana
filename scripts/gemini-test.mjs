const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const prompt =
  process.argv.slice(2).join(" ") ||
  "用中文简单说明：我已经成功调用 Gemini API。";

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY.");
  console.error("PowerShell example:");
  console.error('$env:GEMINI_API_KEY="paste-your-api-key-here"');
  process.exit(1);
}

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  }),
});

const data = await response.json();

if (!response.ok) {
  console.error(`Gemini API request failed: ${response.status}`);
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

const text =
  data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n") || JSON.stringify(data, null, 2);

console.log(text);
