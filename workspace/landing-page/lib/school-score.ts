// Ước lượng điểm TB đại diện từ phân loại học lực (quiz chỉ thu thập dạng
// phân loại text, không có điểm TB chính xác — theo yêu cầu chị Dương, dùng
// điểm đại diện cho từng nhóm thay vì hỏi thêm khách).
//
// Công thức 3 mốc điểm chuẩn (thang 30) tính CỨNG trong code, không để AI
// tính lại — đúng nguyên tắc "Zero Calculation" đang áp dụng cho toàn bộ
// project (numerology, VAKAD đều tính sẵn, AI chỉ viết diễn giải).

export function estimateTbFromHocLuc(hocLuc: string): number {
  const normalized = hocLuc.trim().toLowerCase();
  if (normalized.startsWith("giỏi")) return 8.5;
  if (normalized.startsWith("khá")) return 7.2;
  if (normalized.startsWith("trung bình")) return 5.75;
  if (normalized.startsWith("cần cố gắng")) return 4.0;
  return 6.5; // fallback trung tính nếu gặp giá trị lạ
}

export type SchoolScoreBenchmarks = {
  mor: number; // Mơ ước
  phuHop: number; // Phù hợp
  anToan: number; // An toàn
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function computeSchoolScoreBenchmarks(tb: number): SchoolScoreBenchmarks {
  const base = tb * 3;
  return {
    mor: round1(Math.min(30, base + 3)),
    phuHop: round1(Math.min(30, base)),
    anToan: round1(Math.max(0, base - 3)),
  };
}
