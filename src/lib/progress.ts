/**
 * 檢查當週進度是否落後
 * @param currentCount 目前完成次數
 * @param target 週目標次數（預設 10）
 * @returns 是否落後
 */
export const checkLagging = (currentCount: number, target: number = 10) => {
  const day = new Date().getDay() || 7; // 今天週幾 (1-7)
  const timeProgress = day / 7; // 時間已過比例
  const achievementProgress = currentCount / target; // 達成比例

  return achievementProgress < timeProgress; // 如果達成率低於時間率，就是落後
};

/**
 * 獲取進度狀態訊息
 * @param currentCount 目前完成次數
 * @param target 週目標次數（預設 10）
 * @returns 狀態訊息和狀態類型
 */
export const getProgressStatus = (
  currentCount: number,
  target: number = 10
) => {
  const isLagging = checkLagging(currentCount, target);

  if (isLagging) {
    return {
      status: "lagging" as const,
      message: `進度落後！目前 ${currentCount}/${target}，陳老師提醒您：簡單的事重複做，你就是專家。`,
      color: "text-orange-600 bg-orange-50",
    };
  } else {
    return {
      status: "good" as const,
      message: `目前狀況良好，繼續保持！（${currentCount}/${target}）`,
      color: "text-green-600 bg-green-50",
    };
  }
};

/**
 * 計算進度百分比
 * @param currentCount 目前完成次數
 * @param target 週目標次數（預設 10）
 * @returns 進度百分比
 */
export const getProgressPercentage = (
  currentCount: number,
  target: number = 10
) => {
  return Math.min(Math.round((currentCount / target) * 100), 100);
};
