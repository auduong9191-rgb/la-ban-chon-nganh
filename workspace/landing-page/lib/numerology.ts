// Công thức thần số học theo đúng tài liệu "Cách tính các chỉ số 2.pptx" của Tiara Edu.
// Cả 4 chỉ số đều tính cứng ở đây — không còn phụ thuộc AI.

/** Bảng quy đổi chữ cái (Pythagoras) — dùng chữ cái La-tinh cơ bản sau khi đã chuẩn hóa. */
const LETTER_CHART: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

/** 5 nguyên âm cơ bản dùng để xét "Y đứng cạnh nguyên âm" theo đúng quy tắc chữ Y. */
const BASE_VOWELS = new Set(["a", "e", "i", "o", "u"]);

function digitSum(value: string): number {
  return value
    .split("")
    .filter((c) => c >= "0" && c <= "9")
    .reduce((sum, c) => sum + Number(c), 0);
}

/** Rút gọn về 1 chữ số, nhưng giữ nguyên số chủ đạo 11/22/33 nếu gặp (kể cả ngay từ đầu). */
function reduceKeepMaster(n: number): number {
  let value = n;
  while (value > 9 && value !== 11 && value !== 22 && value !== 33) {
    value = digitSum(String(value));
  }
  return value;
}

/**
 * Chuẩn hóa 1 ký tự tiếng Việt về chữ cái La-tinh gốc để tra bảng:
 * - Bỏ mọi dấu thanh + dấu phụ (ă,â,ê,ô,ơ,ư → a,a,e,o,o,u) bằng Unicode NFD.
 * - "đ" không tách được bằng NFD nên xử lý riêng → "d".
 * VD: ă,ằ,ắ,ẳ,ẵ,ặ → a | ễ,ệ,ế... → e | ư,ứ,ừ... → u
 */
const COMBINING_MARKS_REGEX = /[̀-ͯ]/g;

function normalizeLetter(ch: string): string {
  const lower = ch.toLowerCase();
  if (lower === "đ") return "d";
  return lower.normalize("NFD").replace(COMBINING_MARKS_REGEX, "").normalize("NFC");
}

/** Tách 1 từ thành mảng chữ cái đã chuẩn hóa, chỉ giữ a-z. */
function wordLetters(word: string): string[] {
  return word
    .split("")
    .map(normalizeLetter)
    .filter((c) => /^[a-z]$/.test(c));
}

/** dob dạng "YYYY-MM-DD" (giá trị chuẩn của <input type="date">). */

/** Chỉ số Đường Đời: rút gọn RIÊNG Ngày - Tháng - Năm rồi cộng lại, rút gọn lần nữa. */
export function calculateDuongDoi(dobIso: string): number {
  const [yearStr, monthStr, dayStr] = dobIso.split("-");
  const day = reduceKeepMaster(Number(dayStr));
  const month = reduceKeepMaster(Number(monthStr));
  const year = reduceKeepMaster(Number(yearStr));
  return reduceKeepMaster(day + month + year);
}

/** Chỉ số Ngày Sinh = ngày trong tháng, rút gọn giữ số chủ đạo. */
export function calculateNgaySinh(dobIso: string): number {
  const day = Number(dobIso.split("-")[2]);
  return reduceKeepMaster(day);
}

/**
 * Chỉ số Sứ Mệnh: cộng TẤT CẢ chữ cái của từng từ trong họ tên (đã chuẩn hóa),
 * rút gọn riêng từng từ, rồi cộng các từ lại và rút gọn lần cuối.
 */
export function calculateSuMenh(fullName: string): number {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const perWord = words.map((word) => {
    const letters = wordLetters(word);
    const sum = letters.reduce((acc, c) => acc + (LETTER_CHART[c] ?? 0), 0);
    return reduceKeepMaster(sum);
  });
  const total = perWord.reduce((a, b) => a + b, 0);
  return reduceKeepMaster(total);
}

/**
 * Quy tắc chữ Y: Y là nguyên âm nếu đứng cạnh phụ âm hoặc đứng một mình.
 * Y là phụ âm (không tính) nếu đứng cạnh nguyên âm khác (a, e, i, o, u).
 */
function isVowelForLinhHon(letters: string[], idx: number): boolean {
  const c = letters[idx];
  if (c === "y") {
    const prev = idx > 0 ? letters[idx - 1] : null;
    const next = idx < letters.length - 1 ? letters[idx + 1] : null;
    const adjacentToVowel =
      (prev !== null && BASE_VOWELS.has(prev)) || (next !== null && BASE_VOWELS.has(next));
    return !adjacentToVowel;
  }
  return BASE_VOWELS.has(c);
}

/**
 * Chỉ số Linh Hồn: cộng CÁC NGUYÊN ÂM (đã chuẩn hóa + áp quy tắc chữ Y) của từng từ,
 * rút gọn riêng từng từ, rồi cộng các từ lại và rút gọn lần cuối.
 */
export function calculateLinhHon(fullName: string): number {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const perWord = words.map((word) => {
    const letters = wordLetters(word);
    let sum = 0;
    letters.forEach((c, idx) => {
      if (isVowelForLinhHon(letters, idx)) {
        sum += LETTER_CHART[c] ?? 0;
      }
    });
    return reduceKeepMaster(sum);
  });
  const total = perWord.reduce((a, b) => a + b, 0);
  return reduceKeepMaster(total);
}

export type CoreNumerology = {
  duongDoi: number;
  ngaySinh: number;
  suMenh: number;
  linhHon: number;
};

export function calculateCoreNumerology(
  dobIso: string,
  fullName: string
): CoreNumerology {
  return {
    duongDoi: calculateDuongDoi(dobIso),
    ngaySinh: calculateNgaySinh(dobIso),
    suMenh: calculateSuMenh(fullName),
    linhHon: calculateLinhHon(fullName),
  };
}
