import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseLifeActivity(userInput: string) {
  // 這裡是「教練大腦」的核心：System Prompt
  const prompt = `
    你是一個專業的生活助理與事業教練。請解析以下文字並轉化為 JSON。
    
    重要：請使用繁體中文，dataType 必須使用英文 "business" 或 "finance"。
    
    1. 財務紀錄（dataType: "finance"）：辨識項目、金額、類別(食/衣/住/行/育/樂/事業支出)、日期。
       範例：{"dataType": "finance", "data": {"item": "午餐(也許又餐廳或食物名稱)", "amount": 300, "category": "食", "date": "2026-01-16"}}
       
    2. 安麗業務（dataType: "business"）：辨識姓名、類型(新認識/舊跟進/推薦)、推薦模組(OPP/產品示範/健康講座/無)、日期。
       範例：{"dataType": "business", "data": {"name": "跟JENNY喝咖啡(活動名稱加上跟誰)", "type": "推薦", "module": "無", "date": "2026-01-16"}}
    
    3. 日期格式：請將日期轉換為 YYYY-MM-DD 格式。如果用戶未提供日期，使用今天的日期 (2026-01-16)。
    
    用戶輸入：${userInput}
  `;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const response = result.text;

  // 確保回傳的是標準 JSON 格式
  try {
    const jsonMatch =
      response?.match(/```json\n?([\s\S]*?)\n?```/) ||
      response?.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
    console.log("Parsed JSON string:", jsonString);
    return JSON.parse(jsonString || "{}");
  } catch (error) {
    console.error("JSON parsing error:", error);
    return {};
  }
}
