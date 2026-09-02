import "server-only";

// Tên học sinh luôn hiển thị/lưu dạng VIẾT HOA TOÀN BỘ (email, PDF, tên file,
// bảng admin...) — chuẩn hoá 1 lần duy nhất tại điểm nhập liệu (submit quiz)
// để mọi nơi đọc lại đều đã đúng, không cần lặp lại ở từng chỗ hiển thị.
export function toUppercaseName(name: string): string {
  return name.trim().toUpperCase();
}
