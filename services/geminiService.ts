// services/geminiService.ts — REST, không cần SDK
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

function assertKey() {
  if (!GEMINI_API_KEY) {
    throw new Error("Thiếu VITE_GEMINI_API_KEY (Netlify → Environment variables).");
  }
}

export async function getDiagnosticHelp(symptom: string, image?: { mimeType: string; data: string }) {
  assertKey();

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    GEMINI_API_KEY;

  const parts: any[] = [
    { text: `Bạn là chuyên gia sửa xe máy. Triệu chứng: ${symptom}. Hãy phân tích & đề xuất khắc phục bằng tiếng Việt.` },
  ];
  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
