// services/geminiService.ts
// SDK chính thống: @google/generative-ai
import { GoogleGenerativeAI } from "@google/generative-ai"

// LẤY KEY ĐÚNG CÁCH TRONG VITE
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

function ensureKey() {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Thiếu VITE_GEMINI_API_KEY. Vào Netlify → Site settings → Build & deploy → Environment variables để thêm."
    )
  }
}

export type InlineImage = {
  mimeType: string   // vd: "image/png" | "image/jpeg"
  data: string       // base64 không kèm prefix data:
}

/**
 * Gọi Gemini để chẩn đoán dựa trên miêu tả + (tuỳ chọn) ảnh
 * @param symptom  mô tả tình trạng
 * @param image    { mimeType, data(base64) } - TUỲ CHỌN
 */
export async function getDiagnosticHelp(symptom: string, image?: InlineImage) {
  ensureKey()
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const textPrompt =
    `Bạn là một chuyên gia sửa chữa xe máy giàu kinh nghiệm.\n` +
    `Triệu chứng: ${symptom}\n\n` +
    `Hãy phân tích nguyên nhân khả dĩ, các bước kiểm tra nhanh, cảnh báo an toàn, ` +
    `và đề xuất khắc phục theo mức độ ưu tiên. Trình bày bằng tiếng Việt súc tích.`

  const parts: any[] = [{ text: textPrompt }]
  if (image) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data, // lưu ý: CHỈ base64, không có 'data:image/png;base64,'
      },
    })
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
  })

  // SDK v4: text() truy ra phần text đầu tiên
  const out = result.response.text()
  return out
}
