"use client";

import { useState, useEffect } from "react";
import { getProgressStatus, getProgressPercentage } from "@/lib/progress";

export default function Home() {
  const [currentCount, setCurrentCount] = useState(0);
  const [habit, setHabit] = useState("");
  const [loading, setLoading] = useState(false);
  const target = 10;

  // 載入當週進度
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch("/api/progress");
        const data = await response.json();

        if (data.success) {
          setCurrentCount(data.count);
        } else {
          console.error("獲取進度失敗:", data.error);
        }
      } catch (error) {
        console.error("獲取進度時發生錯誤:", error);
      }
    };

    fetchProgress();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit.trim()) return;

    setLoading(true);
    try {
      // TODO: 呼叫 API 記錄到 Notion
      const response = await fetch("/api/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit }),
      });

      if (response.ok) {
        // 重新獲取進度
        const progressResponse = await fetch("/api/progress");
        const progressData = await progressResponse.json();
        if (progressData.success) {
          setCurrentCount(progressData.count);
        }
        setHabit("");
        alert("✅ 記錄成功！");
      }
    } catch (error) {
      console.error("記錄失敗:", error);
      alert("❌ 記錄失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const progressStatus = getProgressStatus(currentCount, target);
  const progressPercentage = getProgressPercentage(currentCount, target);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <main className="w-full max-w-md space-y-6">
        {/* 標題 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">AM Life Flow</h1>
          <p className="mt-2 text-slate-600">習慣追蹤</p>
        </div>

        {/* 進度儀表板 */}
        <div
          className={`rounded-2xl p-6 shadow-lg border-2 ${
            progressStatus.status === "lagging"
              ? "bg-orange-50 border-orange-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          {/* 進度條 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">
                本週推薦進度
              </span>
              <span className="text-sm font-bold text-slate-900">
                {currentCount}/{target}
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 ${
                  progressStatus.status === "lagging"
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* 狀態訊息 */}
          <div
            className={`rounded-xl p-4 ${
              progressStatus.status === "lagging"
                ? "bg-orange-100 text-orange-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            <p className="text-sm font-medium leading-relaxed">
              {progressStatus.message}
            </p>
          </div>
        </div>

        {/* 快速輸入框 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="habit"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                記錄今日活動（支援自然語言）
              </label>
              <textarea
                id="habit"
                value={habit}
                onChange={(e) => setHabit(e.target.value)}
                placeholder="例如：&#10;- 晨跑 30 分鐘&#10;- 拜訪客戶張三&#10;- 午餐花費 150 元"
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !habit.trim()}
              className="w-full py-3 px-4 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "記錄中..." : "✨ AI 智能記錄"}
            </button>
          </form>

          {/* 使用說明 */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 leading-relaxed">
              💡 提示：可輸入財務記錄（如「買咖啡 80
              元」）或業務活動（如「拜訪客戶王小明」），AI
              會自動分類並記錄到對應的 Notion 資料庫。
            </p>
          </div>
        </div>

        {/* 小提示 */}
        <div className="text-center text-sm text-slate-500">
          <p>每週目標：完成 {target} 次推薦習慣</p>
        </div>
      </main>
    </div>
  );
}
