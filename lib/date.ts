/** ローカル日付を "YYYY-MM-DD" 形式で返す（toISOString は UTC になるため使わない） */
export function localDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** 月を "YYYY-MM" 形式で返す（0-based month を受け取る） */
export function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}
