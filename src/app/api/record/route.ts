// app/api/record/route.ts
import { NextResponse } from "next/server";
import { parseLifeActivity } from "@/lib/gemini";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_KEY });

export async function POST(req: Request) {
  const { text, habit } = await req.json();

  // 支援兩種輸入方式：text（AI 解析）或 habit（直接記錄）
  const inputText = text || habit;

  try {
    const parsedData = await parseLifeActivity(inputText);

    // 根據 dataType 判斷寫入哪個 Notion 資料庫
    if (parsedData.dataType === "business") {
      console.log("Business data detected:", parsedData.data);
      await notion.pages.create({
        parent: { database_id: process.env.BUSINESS_DB_ID! },
        icon: {
          type: "external",
          external: { url: "https://www.notion.so/icons/aquarius_green.svg" },
        },
        properties: {
          "姓名/活動": { title: [{ text: { content: parsedData.data.name } }] },
          類型: { select: { name: parsedData.data.type } },
          日期: {
            date: {
              start:
                parsedData.data.date || new Date().toISOString().split("T")[0],
            },
          },
        },
      });
    } else if (parsedData.dataType === "finance") {
      console.log("Finance data detected:", parsedData.data);
      // console result icon
      const result = await notion.pages.create({
        parent: { database_id: process.env.FINANCE_DB_ID! },
        icon: {
          type: "emoji",
          emoji: "💎", // 既然是陳老師的學生，鑽石是必須的
        },
        properties: {
          名稱: { title: [{ text: { content: parsedData.data.item } }] },
          金額: { number: parsedData.data.amount },
          日期: {
            date: {
              start:
                parsedData.data.date || new Date().toISOString().split("T")[0],
            },
          },
        },
      });
      // console.log("Finance record created:", result);
    }

    return NextResponse.json({ success: true, parsedData });
  } catch (error) {
    console.error("API 錯誤:", error);
    return NextResponse.json(
      { success: false, error: "解析或記錄失敗" },
      { status: 500 }
    );
  }
}
