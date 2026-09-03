import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateCoreNumerology } from "@/lib/numerology";
import { toUppercaseName } from "@/lib/format";
import {
  isQuizComplete,
  scoreVakad,
  type VakadAnswers,
  type VakadGroup,
  type VakadScoreBreakdown,
} from "@/lib/vakad-questions";
import { generateFreeVakadReport } from "@/lib/gemini";
import { notifyCtvFreeReport } from "@/lib/ctv";

const DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_REGEX = /^0\d{9,10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Bắt buộc họ tên đầy đủ — ít nhất 2 từ cách nhau bởi khoảng trắng (Họ + Tên).
const FULL_NAME_REGEX = /^\S+(\s+\S+)+$/;

function toDisplayDate(dobIso: string): string {
  const [y, m, d] = dobIso.split("-");
  return `${d}/${m}/${y}`;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 }
    );
  }

  const { hoTen, tenPhuHuynh, dob, khoiHoc, hocLuc, noiO, email, phone, parentEmail, vakadAnswers, ctvCode } =
    (body ?? {}) as {
      hoTen?: string;
      tenPhuHuynh?: string;
      dob?: string;
      khoiHoc?: string;
      hocLuc?: string;
      // Tỉnh/thành phố nơi con đang sinh sống — dùng để báo cáo Chiến lược
      // 360° gợi ý trường sát vị trí thực tế thay vì chỉ dựa điểm chuẩn.
      noiO?: string;
      email?: string;
      phone?: string;
      // Chỉ dùng ở luồng học sinh — không bắt buộc. Nếu có, báo cáo trả phí
      // gửi thêm 1 bản riêng (văn phong "ba mẹ") tới email này.
      parentEmail?: string;
      // Không có (undefined) = luồng phụ huynh — bỏ qua bài test VAKAD, đi
      // thẳng thanh toán, không tạo báo cáo free (Gem 1) ngay lúc này.
      vakadAnswers?: VakadAnswers;
      ctvCode?: string;
    };
  const hasVakad = vakadAnswers !== undefined;

  if (!hoTen || !FULL_NAME_REGEX.test(hoTen.trim())) {
    return NextResponse.json(
      { error: "Vui lòng nhập đầy đủ họ và tên của con (ít nhất 2 từ)." },
      { status: 400 }
    );
  }
  if (!tenPhuHuynh || tenPhuHuynh.trim().length < 2) {
    return NextResponse.json(
      { error: "Vui lòng nhập họ tên phụ huynh." },
      { status: 400 }
    );
  }
  if (!dob || !DOB_REGEX.test(dob)) {
    return NextResponse.json(
      { error: "Ngày sinh không hợp lệ." },
      { status: 400 }
    );
  }
  if (!khoiHoc) {
    return NextResponse.json(
      { error: "Vui lòng chọn khối học." },
      { status: 400 }
    );
  }
  if (!hocLuc) {
    return NextResponse.json(
      { error: "Vui lòng chọn học lực." },
      { status: 400 }
    );
  }
  if (!noiO || !noiO.trim()) {
    return NextResponse.json(
      { error: "Vui lòng nhập tỉnh/thành phố nơi con đang sinh sống." },
      { status: 400 }
    );
  }
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
  }
  if (!phone || !PHONE_REGEX.test(phone.trim())) {
    return NextResponse.json(
      { error: "Số điện thoại không hợp lệ." },
      { status: 400 }
    );
  }
  if (parentEmail && !EMAIL_REGEX.test(parentEmail.trim())) {
    return NextResponse.json(
      { error: "Email phụ huynh không hợp lệ." },
      { status: 400 }
    );
  }
  if (hasVakad && (!vakadAnswers || !isQuizComplete(vakadAnswers))) {
    return NextResponse.json(
      { error: "Con chưa hoàn thành đủ 10 câu hỏi." },
      { status: 400 }
    );
  }

  const hoTenUpper = toUppercaseName(hoTen);

  // Thần số học (Đường Đời/Sứ Mệnh/Linh Hồn/Ngày Sinh) chỉ cần họ tên + ngày
  // sinh — tính được cho CẢ 2 luồng, không phụ thuộc bài test VAKAD.
  const { duongDoi, ngaySinh, suMenh, linhHon } = calculateCoreNumerology(
    dob,
    hoTenUpper
  );

  let scores: VakadScoreBreakdown | null = null;
  let dominant: VakadGroup | null = null;
  let freeReport: string | null = null;

  if (hasVakad && vakadAnswers) {
    const scored = scoreVakad(vakadAnswers);
    scores = scored.scores;
    dominant = scored.dominant;

    try {
      freeReport = await generateFreeVakadReport({
        hoTen: hoTenUpper,
        dobDisplay: toDisplayDate(dob),
        hocLuc,
        duongDoi,
        ngaySinh,
        suMenh,
        linhHon,
        vakadScores: scores,
        vakadDominant: dominant,
      });
    } catch (err) {
      console.error("[/api/quiz/submit] gemini error:", err);
      return NextResponse.json(
        {
          error:
            "Không thể tạo báo cáo lúc này, vui lòng thử lại sau ít phút.",
        },
        { status: 502 }
      );
    }
  }

  const { data, error } = await supabaseAdmin
    .from("quiz_leads")
    .insert({
      ten_phu_huynh: tenPhuHuynh.trim(),
      ho_ten: hoTenUpper,
      dob,
      khoi_hoc: khoiHoc,
      hoc_luc: hocLuc,
      noi_o: noiO.trim(),
      email: email.trim(),
      phone: phone.trim(),
      parent_email: parentEmail?.trim() || null,
      vakad_answers: hasVakad ? vakadAnswers : null,
      vakad_scores: scores,
      vakad_dominant: dominant,
      duong_doi: duongDoi,
      ngay_sinh: ngaySinh,
      su_menh: suMenh,
      linh_hon: linhHon,
      free_report: freeReport,
      has_vakad: hasVakad,
      ctv_code: ctvCode?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[/api/quiz/submit] supabase insert error:", error?.message);
    return NextResponse.json(
      { error: "Không thể lưu kết quả, vui lòng thử lại." },
      { status: 500 }
    );
  }

  // Trigger 1 — báo CTV ngay khi có báo cáo free thật (chỉ áp dụng luồng học
  // sinh đã làm VAKAD) — không được để lỗi gửi mail làm hỏng response trả về
  // cho học sinh đang chờ kết quả.
  if (ctvCode?.trim() && freeReport) {
    const [ctvNotifyResult] = await Promise.allSettled([
      notifyCtvFreeReport({
        ctvCode,
        hoTen: hoTenUpper,
        khoiHoc,
        hocLuc,
        freeReport,
      }),
    ]);
    if (ctvNotifyResult.status === "rejected") {
      console.error("[/api/quiz/submit] ctv notify failed:", ctvNotifyResult.reason);
    }
  }

  return NextResponse.json({
    leadId: data.id,
    hasVakad,
    freeReport,
    vakadDominant: dominant,
    duongDoi,
    ngaySinh,
    suMenh,
    linhHon,
  });
}
