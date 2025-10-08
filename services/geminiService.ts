// services/geminiService.ts — REST API, không cần @google/generative-ai
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

function assertKey() {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Thiếu VITE_GEMINI_API_KEY. Vào Netlify → Site settings → Build & deploy → Environment variables để thêm, rồi Clear cache and deploy."
    )
  }
}

export async function getDiagnosticHelp(
  symptom: string,
  image?: { mimeType: string; data: string } // base64 không kèm prefix
) {
  assertKey()

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    GEMINI_API_KEY

  const parts: any[] = [
    {
      text: `Bạn là chuyên gia sửa xe máy. Triệu chứng: ${symptom}. 
      Hãy phân tích nguyên nhân và đề xuất cách khắc phục bằng tiếng Việt, ngắn gọn, có cảnh báo an toàn.`,
    },
  ]
  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } })
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts }] }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Gemini API error: ${res.status} ${txt}`)
  }

  const json = await res.json()
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}

// Alias để tương thích với code cũ (ExecutiveSummary.tsx, nếu có dùng)
export const getBusinessAnalysis = getDiagnosticHelp
