import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getDiagnosticHelp = async (symptom: string, image?: { data: string; mimeType: string; }): Promise<string> => {
  try {
    const textPrompt = `Bạn là một chuyên gia sửa chữa xe máy giàu kinh nghiệm tại Việt Nam. Một khách hàng mô tả sự cố của xe như sau: "${symptom}". 
    
    Nếu có hình ảnh đính kèm, hãy phân tích cả hình ảnh đó cùng với mô tả.
    
    Dựa vào thông tin được cung cấp, hãy cung cấp các thông tin sau một cách rõ ràng và có cấu trúc:
    1.  **Chẩn đoán sơ bộ:** Liệt kê các nguyên nhân có khả năng cao nhất gây ra sự cố.
    2.  **Các bước kiểm tra:** Đề xuất các bước kiểm tra cụ thể mà một thợ sửa xe có thể thực hiện để xác định chính xác nguyên nhân.
    3.  **Phụ tùng có thể cần thay thế:** Liệt kê danh sách các phụ tùng có thể liên quan và cần thay thế.
    
    Hãy trình bày câu trả lời bằng tiếng Việt, sử dụng thuật ngữ chuyên ngành phổ thông, dễ hiểu. Định dạng câu trả lời bằng Markdown.`;

    const contents = [];
    contents.push({ text: textPrompt });

    if (image) {
      contents.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: contents },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Đã xảy ra lỗi khi kết nối với trợ lý AI. Vui lòng thử lại sau.";
  }
};

export const getBusinessAnalysis = async (branchData: string): Promise<string> => {
  try {
    const prompt = `Bạn là một chuyên gia tư vấn kinh doanh cho các cửa hàng sửa chữa xe máy tại Việt Nam. 
    Dựa vào dữ liệu tổng hợp của một chi nhánh dưới đây (định dạng JSON), hãy đưa ra những phân tích và đề xuất cụ thể để cải thiện hiệu quả kinh doanh.

    Dữ liệu:
    \`\`\`json
    ${branchData}
    \`\`\`

    Phân tích của bạn cần bao gồm 3 phần rõ ràng:
    1.  **Điểm mạnh:** Nhận xét những gì chi nhánh đang làm tốt dựa trên dữ liệu (ví dụ: tỷ suất lợi nhuận cao, sản phẩm bán chạy có lãi, v.v.).
    2.  **Điểm cần cải thiện:** Chỉ ra những vấn đề hoặc cơ hội bị bỏ lỡ (ví dụ: hàng tồn kho bán chậm, dịch vụ có doanh thu nhưng lợi nhuận thấp, v.v.).
    3.  **Kế hoạch hành động:** Đưa ra 3-5 gợi ý cụ thể, có thể thực hiện được ngay để giải quyết các điểm cần cải thiện và phát huy điểm mạnh.
    
    Hãy trả lời hoàn toàn bằng tiếng Việt và định dạng kết quả bằng Markdown để dễ đọc.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for business analysis:", error);
    return "Đã xảy ra lỗi khi tạo phân tích. Vui lòng thử lại sau.";
  }
};