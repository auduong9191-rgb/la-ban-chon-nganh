"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { VAKAD_QUESTIONS, type VakadAnswers } from "@/lib/vakad-questions";
import { RankQuestion } from "./RankQuestion";

type Step =
  | "intro"
  | "form1"
  | "role"
  | "parentForm"
  | "form2"
  | "questions"
  | "submitting"
  | "error";

const KHOI_HOC_OPTIONS = [
  "A00 (Toán - Lý - Hóa)",
  "A01 (Toán - Lý - Anh)",
  "B00 (Toán - Hóa - Sinh)",
  "C00 (Văn - Sử - Địa)",
  "D01 (Toán - Văn - Anh)",
  "D07 (Toán - Hóa - Anh)",
  "Khác / Chưa xác định",
];

const HOC_LUC_OPTIONS = [
  "Giỏi (điểm TB các môn từ 8.0 trở lên)",
  "Khá (điểm TB các môn từ 6.5 đến dưới 8.0)",
  "Trung bình (điểm TB các môn từ 5.0 đến dưới 6.5)",
  "Cần cố gắng thêm (điểm TB các môn dưới 5.0)",
];

const PHONE_REGEX = /^0\d{9,10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Bắt buộc họ tên đầy đủ — ít nhất 2 từ cách nhau bởi khoảng trắng (Họ + Tên),
// không chấp nhận chỉ gõ 1 từ.
const FULL_NAME_REGEX = /^\S+(\s+\S+)+$/;

export function QuizApp() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");

  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Chỉ dùng ở luồng học sinh — không bắt buộc. Nếu có điền, báo cáo trả phí
  // sẽ gửi thêm 1 bản riêng (đúng văn phong "ba mẹ") tới email này.
  const [parentEmail, setParentEmail] = useState("");
  const [form1Error, setForm1Error] = useState("");

  const [tenPhuHuynh, setTenPhuHuynh] = useState("");
  const [dob, setDob] = useState("");
  const [khoiHoc, setKhoiHoc] = useState("");
  const [hocLuc, setHocLuc] = useState("");
  const [form2Error, setForm2Error] = useState("");

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<VakadAnswers>({});
  const [submitError, setSubmitError] = useState("");
  // Bước "error" dùng chung cho cả 2 luồng (học sinh làm VAKAD / phụ huynh bỏ
  // qua VAKAD) — cần biết nút "Thử lại" phải gọi lại hàm nào.
  const [retryAction, setRetryAction] = useState<"quiz" | "parent">("quiz");

  // Đọc trực tiếp window.location thay vì useSearchParams để khỏi cần bọc
  // Suspense boundary — link CTV dạng /quiz?r=<mã> (tham số đặt tên trung
  // tính "r", không phải "ctv", để không lộ đây là link giới thiệu/cộng tác
  // viên). Lazy initializer (không phải effect) vì giá trị có sẵn ngay lúc
  // render đầu tiên trên client.
  const [ctvCode] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return new URLSearchParams(window.location.search).get("r") ?? undefined;
  });

  function handleForm1Submit(e: FormEvent) {
    e.preventDefault();
    if (!FULL_NAME_REGEX.test(hoTen.trim())) {
      setForm1Error("Vui lòng nhập đầy đủ họ và tên (ít nhất 2 từ).");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setForm1Error("Email không hợp lệ.");
      return;
    }
    if (!PHONE_REGEX.test(phone.trim())) {
      setForm1Error("Số điện thoại không hợp lệ.");
      return;
    }
    if (parentEmail.trim() && !EMAIL_REGEX.test(parentEmail.trim())) {
      setForm1Error("Email phụ huynh không hợp lệ.");
      return;
    }
    setForm1Error("");
    setStep("form2");
  }

  function handleForm2Submit(e: FormEvent) {
    e.preventDefault();
    if (tenPhuHuynh.trim().length < 2) {
      setForm2Error("Vui lòng nhập họ tên phụ huynh.");
      return;
    }
    if (!dob) {
      setForm2Error("Vui lòng chọn ngày sinh.");
      return;
    }
    if (!khoiHoc) {
      setForm2Error("Vui lòng chọn khối học.");
      return;
    }
    if (!hocLuc) {
      setForm2Error("Vui lòng chọn học lực hiện tại.");
      return;
    }
    setForm2Error("");
    setStep("questions");
  }

  function handleQuestionComplete(ranks: Record<number, number>) {
    const question = VAKAD_QUESTIONS[questionIndex];
    const nextAnswers = { ...answers, [question.id]: ranks };
    setAnswers(nextAnswers);

    if (questionIndex + 1 < VAKAD_QUESTIONS.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      submitQuiz(nextAnswers);
    }
  }

  function handleParentFormSubmit(e: FormEvent) {
    e.preventDefault();
    if (!FULL_NAME_REGEX.test(hoTen.trim())) {
      setForm2Error("Ba mẹ vui lòng nhập đầy đủ họ và tên học sinh (ít nhất 2 từ).");
      return;
    }
    if (!dob) {
      setForm2Error("Ba mẹ vui lòng chọn ngày sinh của học sinh.");
      return;
    }
    if (!khoiHoc) {
      setForm2Error("Ba mẹ vui lòng chọn khối học của con.");
      return;
    }
    if (!hocLuc) {
      setForm2Error("Ba mẹ vui lòng chọn học lực hiện tại của con.");
      return;
    }
    if (tenPhuHuynh.trim().length < 2) {
      setForm2Error("Ba mẹ vui lòng nhập họ và tên phụ huynh.");
      return;
    }
    if (!PHONE_REGEX.test(phone.trim())) {
      setForm2Error("Số điện thoại phụ huynh không hợp lệ.");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setForm2Error("Email phụ huynh không hợp lệ.");
      return;
    }
    setForm2Error("");
    submitParentFlow();
  }

  // Luồng phụ huynh: bỏ qua bài test VAKAD — tạo kết quả (không có free
  // report) rồi tạo đơn hàng ngay, đi thẳng tới trang thanh toán.
  async function submitParentFlow() {
    setRetryAction("parent");
    setStep("submitting");
    setSubmitError("");
    try {
      const submitRes = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hoTen: hoTen.trim(),
          tenPhuHuynh: tenPhuHuynh.trim(),
          dob,
          khoiHoc,
          hocLuc,
          email: email.trim(),
          phone: phone.trim(),
          ctvCode,
          // Không gửi vakadAnswers -> báo hiệu cho API bỏ qua bài test VAKAD.
        }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        setSubmitError(submitData.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
        setStep("error");
        return;
      }

      const checkoutRes = await fetch("/api/quiz/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizLeadId: submitData.leadId }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        setSubmitError(
          checkoutData.error ?? "Không thể tạo đơn hàng, vui lòng thử lại."
        );
        setStep("error");
        return;
      }
      router.push(`/checkout/${checkoutData.orderId}`);
    } catch {
      setSubmitError("Không thể kết nối, vui lòng thử lại.");
      setStep("error");
    }
  }

  async function submitQuiz(finalAnswers: VakadAnswers) {
    setRetryAction("quiz");
    setStep("submitting");
    setSubmitError("");
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hoTen: hoTen.trim(),
          tenPhuHuynh: tenPhuHuynh.trim(),
          dob,
          khoiHoc,
          hocLuc,
          email: email.trim(),
          phone: phone.trim(),
          parentEmail: parentEmail.trim() || undefined,
          vakadAnswers: finalAnswers,
          ctvCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
        setStep("error");
        return;
      }
      router.push(`/quiz/ket-qua/${data.leadId}`);
    } catch {
      setSubmitError("Không thể kết nối, vui lòng thử lại.");
      setStep("error");
    }
  }

  if (step === "intro") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center">
        <p className="text-xs font-medium tracking-widest uppercase text-accent mb-4">
          Tiara Edu · Trắc nghiệm miễn phí
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-ink mb-4">
          Con học hiệu quả nhất theo cách nào?
        </h1>
        <p className="text-ink-soft mb-8 leading-relaxed">
          10 câu trắc nghiệm VAKAD giúp con tìm ra phong cách tiếp thu kiến thức
          tự nhiên của mình — để việc học bớt vất vả mà vào đầu nhanh hơn.
          Kết quả có ngay sau vài phút, hoàn toàn miễn phí.
        </p>
        <button
          type="button"
          onClick={() => setStep("role")}
          className="rounded-full bg-accent-dark hover:bg-primary-dark text-white font-medium px-8 py-4 text-base transition-colors duration-200 cursor-pointer"
        >
          Bắt đầu bài test miễn phí →
        </button>
        <p className="text-xs text-ink-soft mt-4">
          10 câu hỏi · Khoảng 4-5 phút · Không cần đăng ký
        </p>
      </div>
    );
  }

  if (step === "role") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="font-heading text-2xl font-semibold text-ink mb-2">
          Bạn là ai?
        </h2>
        <p className="text-sm text-ink-soft mb-8">
          Bài test dành riêng cho học sinh 15-18 tuổi làm trực tiếp.
        </p>
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setStep("form1")}
            className="w-full rounded-full bg-accent-dark hover:bg-primary-dark text-white font-medium py-4 text-base transition-colors duration-200 cursor-pointer"
          >
            Tôi là học sinh
          </button>
          <button
            type="button"
            onClick={() => setStep("parentForm")}
            className="w-full rounded-full border border-border-soft bg-surface hover:bg-background text-ink font-medium py-4 text-base transition-colors duration-200 cursor-pointer"
          >
            Tôi là phụ huynh
          </button>
        </div>
      </div>
    );
  }

  if (step === "form1") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <h2 className="font-heading text-2xl font-semibold text-ink mb-1 text-center">
          Đăng ký làm bài test & nhận báo cáo VAKAD
        </h2>
        <p className="text-sm text-ink-soft mb-8 text-center">
          Con điền thông tin của mình — chỉ mất 1 phút.
        </p>
        <form
          onSubmit={handleForm1Submit}
          className="rounded-2xl bg-surface border border-border-soft p-6 sm:p-8 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Số điện thoại (có Zalo)
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-ink-soft mt-1">
              Quà tặng thêm: nhận tài liệu hỗ trợ học tập qua Zalo khi mua trọn bộ.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@email.com"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-ink-soft mt-1">
              Để gửi Career Map và Chiến lược đỗ đại học mơ ước qua email trong 24h sau khi mua trọn bộ.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Email phụ huynh <span className="text-ink-soft font-normal">(không bắt buộc)</span>
            </label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="ba-me@email.com"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-ink-soft mt-1">
              Để ba mẹ cũng nhận được bộ báo cáo khi con hoàn tất mua trọn bộ.
            </p>
          </div>

          {form1Error && (
            <p className="text-sm text-red-600" role="alert">
              {form1Error}
            </p>
          )}

          <p className="text-xs text-ink-soft">
            Thông tin con cung cấp (họ tên, ngày sinh, số điện thoại/Zalo) chỉ
            dùng để tính toán và gửi báo cáo cá nhân hoá cho con, không chia
            sẻ cho bên thứ ba. Con có thể yêu cầu xoá thông tin bất cứ lúc
            nào qua Zalo Tiara Edu.
          </p>

          <button
            type="submit"
            className="w-full rounded-full bg-accent-dark hover:bg-primary-dark text-white font-medium py-4 text-base transition-colors duration-200 cursor-pointer"
          >
            Tiếp tục →
          </button>
        </form>
      </div>
    );
  }

  if (step === "parentForm") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <h2 className="font-heading text-2xl font-semibold text-ink mb-1 text-center">
          Ba mẹ cho Tiara Edu biết thêm về con
        </h2>
        <p className="text-sm text-ink-soft mb-8 text-center">
          Chỉ cần vài thông tin để tính chỉ số và cá nhân hóa Career Map +
          Chiến lược đỗ đại học mơ ước cho con. Sau bước này, ba mẹ sẽ tới
          thẳng trang thanh toán — không cần làm bài test VAKAD.
        </p>
        <form
          onSubmit={handleParentFormSubmit}
          className="rounded-2xl bg-surface border border-border-soft p-6 sm:p-8 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Họ và tên học sinh
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Ngày sinh học sinh
            </label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-ink-soft mt-1">
              Dùng để tính thần số học và xác nhận độ tuổi 15-18 của con.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Khối học / Tổ hợp xét tuyển của con
            </label>
            <select
              required
              value={khoiHoc}
              onChange={(e) => setKhoiHoc(e.target.value)}
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Chọn khối học --</option>
              {KHOI_HOC_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Học lực hiện tại của con
            </label>
            <select
              required
              value={hocLuc}
              onChange={(e) => setHocLuc(e.target.value)}
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Chọn học lực --</option>
              {HOC_LUC_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Họ và tên phụ huynh
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={tenPhuHuynh}
              onChange={(e) => setTenPhuHuynh(e.target.value)}
              placeholder="Nguyễn Thị B"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Số điện thoại phụ huynh (có Zalo)
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-ink-soft mt-1">
              Quà tặng thêm: nhận tài liệu hỗ trợ học tập qua Zalo khi mua trọn bộ.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Email phụ huynh
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ba-me@email.com"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-ink-soft mt-1">
              Để Tiara Edu liên hệ đúng ba mẹ và gửi Career Map + Chiến lược đỗ đại học mơ ước qua email trong 24h sau khi thanh toán.
            </p>
          </div>

          {form2Error && (
            <p className="text-sm text-red-600" role="alert">
              {form2Error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-accent-dark hover:bg-primary-dark text-white font-medium py-4 text-base transition-colors duration-200 cursor-pointer"
          >
            Tiếp tục tới thanh toán →
          </button>

          <p className="text-xs text-ink-soft text-center">
            Con vẫn có thể tự làm thêm bài test Xu hướng Học tập (VAKAD) sau
            này để báo cáo định hướng chính xác hơn.
          </p>
        </form>
        <button
          type="button"
          onClick={() => setStep("role")}
          className="mt-6 text-sm text-ink-soft underline cursor-pointer block mx-auto"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  if (step === "form2") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <h2 className="font-heading text-2xl font-semibold text-ink mb-1 text-center">
          Thêm vài thông tin nữa trước khi bắt đầu
        </h2>
        <p className="text-sm text-ink-soft mb-8 text-center">
          Dùng để tính chỉ số và cá nhân hóa kết quả cho đúng con.
        </p>
        <form
          onSubmit={handleForm2Submit}
          className="rounded-2xl bg-surface border border-border-soft p-6 sm:p-8 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Họ và tên phụ huynh
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={tenPhuHuynh}
              onChange={(e) => setTenPhuHuynh(e.target.value)}
              placeholder="Nguyễn Thị B"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-ink-soft mt-1">
              Để Tiara Edu liên hệ đúng phụ huynh nếu cần hỗ trợ thêm.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Ngày sinh
            </label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-ink-soft mt-1">
              Dùng để tính thần số học và xác nhận độ tuổi 15-18.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Khối học / Tổ hợp xét tuyển
            </label>
            <select
              required
              value={khoiHoc}
              onChange={(e) => setKhoiHoc(e.target.value)}
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Chọn khối học --</option>
              {KHOI_HOC_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Học lực hiện tại
            </label>
            <select
              required
              value={hocLuc}
              onChange={(e) => setHocLuc(e.target.value)}
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-base text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Chọn học lực --</option>
              {HOC_LUC_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {form2Error && (
            <p className="text-sm text-red-600" role="alert">
              {form2Error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-accent-dark hover:bg-primary-dark text-white font-medium py-4 text-base transition-colors duration-200 cursor-pointer"
          >
            Tiếp tục làm bài test →
          </button>
        </form>
      </div>
    );
  }

  if (step === "questions") {
    const progress = Math.round((questionIndex / VAKAD_QUESTIONS.length) * 100);
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="h-1.5 w-full rounded-full bg-border-soft mb-8 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <RankQuestion
          key={questionIndex}
          question={VAKAD_QUESTIONS[questionIndex]}
          index={questionIndex}
          total={VAKAD_QUESTIONS.length}
          onComplete={handleQuestionComplete}
        />
      </div>
    );
  }

  if (step === "submitting") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="font-heading text-2xl font-semibold text-ink mb-2">
          Đang phân tích kết quả của con…
        </p>
        <p className="text-sm text-ink-soft">Chỉ mất vài giây, vui lòng đợi.</p>
      </div>
    );
  }

  // step === "error"
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="font-heading text-2xl font-semibold text-ink mb-2">
        Có lỗi xảy ra
      </p>
      <p className="text-sm text-ink-soft mb-6">{submitError}</p>
      <button
        type="button"
        onClick={() =>
          retryAction === "parent" ? submitParentFlow() : submitQuiz(answers)
        }
        className="rounded-full bg-accent-dark hover:bg-primary-dark text-white font-medium px-8 py-3 text-base transition-colors duration-200 cursor-pointer"
      >
        Thử lại
      </button>
    </div>
  );
}
