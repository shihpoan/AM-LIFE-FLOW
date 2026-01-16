// app/api/progress/route.ts
import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_KEY });

export async function GET() {
  try {
    // 計算本週起始日期（週一）
    const now = new Date();
    const day = now.getDay() || 7; // 今天週幾 (1-7，週日為7)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day + 1); // 設為本週一
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const response = await notion.dataSources.query({
      // 硬處理，強制拿掉 -
      data_source_id: process.env.BUSINESS_DB_SOURCE_ID!,
      filter: {
        and: [
          {
            property: "類型",
            select: {
              equals: "推薦",
            },
          },
          {
            property: "日期",
            date: {
              on_or_after: weekStart.toISOString(),
              on_or_before: weekEnd.toISOString(),
            },
          },
        ],
      },
    });
    const count = response.results.length;

    // 顯示第一筆資料
    console.log("First record of the week:", response.results[0]);

    return NextResponse.json({
      success: true,
      count,
      weekStart: weekStart.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("獲取進度失敗:", error);
    return NextResponse.json(
      { success: false, error: "無法獲取進度數據" },
      { status: 500 }
    );
  }
}
