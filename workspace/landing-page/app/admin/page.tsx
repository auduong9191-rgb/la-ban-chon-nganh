// Single-file admin dashboard. Mount -> popup "Nhập mã quản trị" -> đúng pass thì show bảng.
// Password lưu trong React state (refresh page = popup hiện lại - intended).

"use client";

import { useState, useEffect, useCallback, Fragment, FormEvent } from "react";
import { CtvManagement } from "@/components/admin/CtvManagement";
import { CtvPerformanceReport } from "@/components/admin/CtvPerformanceReport";

type QuizJoin = {
  ho_ten: string;
  dob: string;
  khoi_hoc: string;
  hoc_luc: string;
  noi_o: string | null;
  // null = luồng phụ huynh (bỏ qua bài test VAKAD, đi thẳng thanh toán)
  vakad_dominant: string | null;
  duong_doi: number;
  ngay_sinh: number;
  su_menh: number | null;
  linh_hon: number | null;
  ten_phu_huynh: string | null;
  free_report: string | null;
  has_vakad: boolean;
  parent_email: string | null;
} | null;

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string | null;
  order_id: string | null;
  product_name: string | null;
  amount: number | null;
  status: string | null;
  paid_at: string | null;
  created_at: string;
  ctv_code: string | null;
  refunded_at: string | null;
  discount_code: string | null;
  discount_percent: number | null;
  original_amount: number | null;
  career_map_text: string | null;
  career_map_file_path: string | null;
  career_map_file_name: string | null;
  career_map_updated_at: string | null;
  career_map_file_url?: string | null;
  strategy_text: string | null;
  strategy_file_path: string | null;
  strategy_file_name: string | null;
  strategy_updated_at: string | null;
  strategy_file_url?: string | null;
  vakad_report_file_path: string | null;
  vakad_report_file_name: string | null;
  vakad_report_updated_at: string | null;
  vakad_report_file_url?: string | null;
  quiz_leads: QuizJoin;
};

type LeadResponse = {
  leads: Lead[];
  stats: { totalAll: number; totalPaid: number; totalPending: number; revenue: number };
};

type QuizLead = {
  id: string;
  ten_phu_huynh: string | null;
  ho_ten: string;
  dob: string;
  khoi_hoc: string;
  hoc_luc: string;
  noi_o: string | null;
  email: string | null;
  phone: string | null;
  vakad_dominant: string | null;
  duong_doi: number;
  ngay_sinh: number;
  su_menh: number | null;
  linh_hon: number | null;
  free_report: string | null;
  has_vakad: boolean;
  created_at: string;
};

type QuizLeadResponse = { leads: QuizLead[] };

const STATUS_LABEL: Record<string, string> = {
  paid: "Đã thanh toán",
  pending: "Chưa thanh toán",
  refunded: "Đã hoàn tiền",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState<LeadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "paid" | "pending" | "refunded">("all");
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [quizData, setQuizData] = useState<QuizLeadResponse | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSearch, setQuizSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [copiedGem2Id, setCopiedGem2Id] = useState<string | null>(null);
  const [careerMapDraft, setCareerMapDraft] = useState<Record<string, string>>({});
  const [careerMapSaving, setCareerMapSaving] = useState<string | null>(null);
  const [careerMapUploading, setCareerMapUploading] = useState<string | null>(null);
  const [careerMapErrorId, setCareerMapErrorId] = useState<string | null>(null);

  const [sourcePdfUrlDraft, setSourcePdfUrlDraft] = useState<Record<string, string>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<Record<string, string>>({});
  const [generateResult, setGenerateResult] = useState<
    Record<
      string,
      | {
          emailSent: boolean;
          emailError: string | null;
          parentEmailSent: boolean | null;
          parentEmailError: string | null;
          vakad_report_file_url: string | null;
        }
      | undefined
    >
  >({});

  const fetchLeads = useCallback(
    async (pass: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (status !== "all") params.set("status", status);
        if (search.trim()) params.set("search", search.trim());
        if (fromDate) params.set("fromDate", new Date(fromDate).toISOString());
        if (toDate) {
          const end = new Date(toDate);
          end.setHours(23, 59, 59, 999);
          params.set("toDate", end.toISOString());
        }
        const res = await fetch(`/api/admin/leads?${params.toString()}`, {
          headers: { "x-admin-pass": pass },
          cache: "no-store",
        });
        if (res.status === 401) {
          setUnlocked(false);
          setError("Sai mã, thử lại");
          return;
        }
        if (!res.ok) throw new Error("Lỗi tải dữ liệu");
        const json = (await res.json()) as LeadResponse;
        setData(json);
        setUnlocked(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    },
    [search, status, fromDate, toDate]
  );

  useEffect(() => {
    if (unlocked && password) {
      fetchLeads(password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, fromDate, toDate]);

  const fetchQuizLeads = useCallback(
    async (pass: string) => {
      setQuizLoading(true);
      try {
        const params = new URLSearchParams();
        if (quizSearch.trim()) params.set("search", quizSearch.trim());
        const res = await fetch(`/api/admin/quiz-leads?${params.toString()}`, {
          headers: { "x-admin-pass": pass },
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as QuizLeadResponse;
        setQuizData(json);
      } finally {
        setQuizLoading(false);
      }
    },
    [quizSearch]
  );

  useEffect(() => {
    if (unlocked && password) {
      fetchQuizLeads(password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, quizSearch]);

  async function handleCopyReport(lead: QuizLead) {
    const text = [
      `Phụ huynh: ${lead.ten_phu_huynh ?? "—"}`,
      `Họ tên con: ${lead.ho_ten}`,
      `Ngày sinh: ${lead.dob}`,
      `Email: ${lead.email ?? "—"}`,
      `SĐT (Zalo): ${lead.phone ?? "—"}`,
      `Khối học: ${lead.khoi_hoc}`,
      `Học lực: ${lead.hoc_luc}`,
      `Nơi ở: ${lead.noi_o ?? "—"}`,
      `Đường Đời: ${lead.duong_doi} | Sứ Mệnh: ${lead.su_menh ?? "—"} | Linh Hồn: ${lead.linh_hon ?? "—"} | Ngày Sinh: ${lead.ngay_sinh} | VAKAD: ${lead.vakad_dominant ?? "Chưa làm bài test"}`,
      "",
      lead.free_report ?? "(Chưa làm bài test VAKAD — luồng phụ huynh)",
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId((cur) => (cur === lead.id ? null : cur)), 2000);
  }

  async function handleCopyGem2Input(lead: Lead) {
    const q = lead.quiz_leads;
    if (!q) return;
    const text = [
      `Phụ huynh: ${q.ten_phu_huynh ?? "—"}`,
      `Họ tên con: ${q.ho_ten}`,
      `Ngày sinh: ${q.dob}`,
      `Khối học: ${q.khoi_hoc}`,
      `Học lực: ${q.hoc_luc}`,
      `Nơi ở: ${q.noi_o ?? "—"}`,
      `Đường Đời: ${q.duong_doi} | Sứ Mệnh: ${q.su_menh ?? "—"} | Linh Hồn: ${q.linh_hon ?? "—"} | Ngày Sinh: ${q.ngay_sinh} | VAKAD: ${q.vakad_dominant ?? "Chưa làm bài test"}`,
      "",
      "--- Báo cáo free (tham khảo, không dùng để tính lại số) ---",
      q.free_report ?? "(Chưa làm bài test VAKAD — luồng phụ huynh)",
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedGem2Id(lead.id);
    setTimeout(() => setCopiedGem2Id((cur) => (cur === lead.id ? null : cur)), 2000);
  }

  function applyLeadUpdate(leadId: string, patch: Partial<Lead>) {
    setData((cur) => {
      if (!cur) return cur;
      return {
        ...cur,
        leads: cur.leads.map((l) => (l.id === leadId ? { ...l, ...patch } : l)),
      };
    });
  }

  async function submitCareerMap(lead: Lead, form: FormData) {
    setCareerMapErrorId(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/career-map`, {
        method: "PATCH",
        headers: { "x-admin-pass": password },
        body: form,
      });
      if (!res.ok) throw new Error("Lưu thất bại");
      const json = (await res.json()) as Partial<Lead>;
      applyLeadUpdate(lead.id, json);
    } catch {
      setCareerMapErrorId(lead.id);
    }
  }

  async function handleSaveCareerMapText(lead: Lead) {
    const text = careerMapDraft[lead.id] ?? lead.career_map_text ?? "";
    setCareerMapSaving(lead.id);
    const form = new FormData();
    form.set("text", text);
    await submitCareerMap(lead, form);
    setCareerMapSaving(null);
  }

  async function handleUploadCareerMapFile(lead: Lead, file: File) {
    setCareerMapUploading(lead.id);
    const form = new FormData();
    form.set("file", file);
    await submitCareerMap(lead, form);
    setCareerMapUploading(null);
  }

  async function handleGenerateCareerMap(lead: Lead) {
    const sourcePdfUrl = sourcePdfUrlDraft[lead.id]?.trim();
    if (!sourcePdfUrl) return;
    setGeneratingId(lead.id);
    setGenerateError((cur) => ({ ...cur, [lead.id]: "" }));
    setGenerateResult((cur) => ({ ...cur, [lead.id]: undefined }));
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/generate-career-map`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pass": password },
        body: JSON.stringify({ sourcePdfUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Tạo báo cáo thất bại.");
      applyLeadUpdate(lead.id, json);
      setGenerateResult((cur) => ({
        ...cur,
        [lead.id]: {
          emailSent: json.emailSent,
          emailError: json.emailError ?? null,
          parentEmailSent: json.parentEmailSent ?? null,
          parentEmailError: json.parentEmailError ?? null,
          vakad_report_file_url: json.vakad_report_file_url ?? null,
        },
      }));
    } catch (err) {
      setGenerateError((cur) => ({
        ...cur,
        [lead.id]: err instanceof Error ? err.message : "Lỗi không xác định.",
      }));
    } finally {
      setGeneratingId(null);
    }
  }

  async function handleMarkRefunded(lead: Lead) {
    if (!window.confirm(`Đánh dấu đơn ${lead.order_id ?? lead.name} đã hoàn tiền?`)) return;
    setRefundingId(lead.id);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/refund`, {
        method: "PATCH",
        headers: { "x-admin-pass": password },
      });
      if (res.ok) {
        const json = (await res.json()) as { status: string; refunded_at: string };
        applyLeadUpdate(lead.id, { status: json.status, refunded_at: json.refunded_at });
      }
    } finally {
      setRefundingId(null);
    }
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password) return;
    fetchLeads(password);
  }

  function handleExportCSV() {
    if (!data || data.leads.length === 0) return;
    const headers = [
      "Mã đơn",
      "Họ tên",
      "SĐT",
      "Email",
      "Mã CTV",
      "Sản phẩm",
      "Số tiền",
      "Trạng thái",
      "Ngày đăng ký",
      "Ngày thanh toán",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = data.leads
      .map((l) =>
        [
          l.order_id ?? "",
          l.name,
          l.phone,
          l.email,
          l.ctv_code ?? "",
          l.product_name ?? "",
          l.amount ?? "",
          STATUS_LABEL[l.status ?? ""] ?? l.status ?? "",
          formatDateTime(l.created_at),
          l.paid_at ? formatDateTime(l.paid_at) : "",
        ]
          .map(escape)
          .join(",")
      )
      .join("\n");
    const csv = "﻿" + headers.join(",") + "\n" + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (!unlocked) {
    return (
      <div style={S.overlay}>
        <form onSubmit={handlePasswordSubmit} style={S.card}>
          <h2 style={S.cardTitle}>Nhập mã quản trị</h2>
          <input
            type="password"
            placeholder="Mã quản trị"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            style={S.input}
            disabled={loading}
          />
          {error && <div style={S.error}>{error}</div>}
          <button type="submit" style={S.btnPrimary} disabled={loading || !password}>
            {loading ? "Đang kiểm tra..." : "Vào trang"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={S.wrapper}>
      <h1 style={S.h1}>Quản trị đơn hàng</h1>

      {data && (
        <div style={S.statsRow}>
          <Stat label="Tổng đơn" value={data.stats.totalAll.toLocaleString("vi-VN")} />
          <Stat label="Đã thanh toán" value={data.stats.totalPaid.toLocaleString("vi-VN")} color="#16a34a" />
          <Stat label="Chưa thanh toán" value={data.stats.totalPending.toLocaleString("vi-VN")} color="#ca8a04" />
          <Stat label="Doanh thu" value={formatVND(data.stats.revenue)} />
        </div>
      )}

      <div style={S.filterBar}>
        <input
          type="text"
          placeholder="Tìm theo tên, SĐT, email, mã đơn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={S.searchInput}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} style={S.select}>
          <option value="all">Tất cả trạng thái</option>
          <option value="paid">Đã thanh toán</option>
          <option value="pending">Chưa thanh toán</option>
          <option value="refunded">Đã hoàn tiền</option>
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={S.dateInput} />
        <span style={S.dateSep}>—</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={S.dateInput} />
        <button onClick={handleExportCSV} disabled={!data || data.leads.length === 0} style={S.btnPrimary}>
          Xuất CSV
        </button>
      </div>

      {error && <div style={S.errorBanner}>{error}</div>}

      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.empty}>Đang tải...</div>
        ) : data && data.leads.length > 0 ? (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Mã đơn</th>
                <th style={S.th}>Họ tên</th>
                <th style={S.th}>SĐT</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Mã CTV</th>
                <th style={{ ...S.th, textAlign: "right" }}>Số tiền</th>
                <th style={S.th}>Trạng thái</th>
                <th style={S.th}>Ngày đăng ký</th>
                <th style={S.th}>Ngày thanh toán</th>
                <th style={S.th}>Link báo cáo</th>
                <th style={S.th}>Career Map (Gem 2)</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {data.leads.map((l) => {
                const hasCareerMap = !!(l.career_map_text || l.career_map_file_path);
                return (
                  <Fragment key={l.id}>
                    <tr style={S.tr}>
                      <td style={S.tdMono}>{l.order_id ?? "—"}</td>
                      <td style={S.td}>{l.name}</td>
                      <td style={S.tdMono}>{l.phone}</td>
                      <td style={S.td}>{l.email}</td>
                      <td style={S.tdMono}>{l.ctv_code ?? "—"}</td>
                      <td style={{ ...S.td, textAlign: "right" }}>
                        {l.amount ? formatVND(l.amount) : "—"}
                      </td>
                      <td style={S.td}>
                        <span
                          style={{
                            ...S.badge,
                            ...(l.status === "paid" ? S.badgePaid : l.status === "refunded" ? S.badgeRefunded : S.badgePending),
                          }}
                        >
                          {STATUS_LABEL[l.status ?? ""] ?? "—"}
                        </span>
                      </td>
                      <td style={S.td}>{formatDateTime(l.created_at)}</td>
                      <td style={S.td}>{l.paid_at ? formatDateTime(l.paid_at) : "—"}</td>
                      <td style={S.td}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {l.career_map_file_url && (
                            <a href={l.career_map_file_url} target="_blank" rel="noreferrer" style={S.reportLink}>
                              Career Map
                            </a>
                          )}
                          {l.strategy_file_url && (
                            <a href={l.strategy_file_url} target="_blank" rel="noreferrer" style={S.reportLink}>
                              Chiến lược
                            </a>
                          )}
                          {l.vakad_report_file_url && (
                            <a href={l.vakad_report_file_url} target="_blank" rel="noreferrer" style={S.reportLink}>
                              Xu hướng học tập
                            </a>
                          )}
                          {!l.career_map_file_url && !l.strategy_file_url && !l.vakad_report_file_url && (
                            <span style={{ color: "#999" }}>—</span>
                          )}
                        </div>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              ...S.badge,
                              ...(hasCareerMap ? S.badgePaid : S.badgePending),
                            }}
                          >
                            {hasCareerMap ? "Đã đính" : "Chưa đính"}
                          </span>
                          <button
                            style={S.btnPrimary}
                            onClick={() =>
                              setExpandedLeadId((cur) => (cur === l.id ? null : l.id))
                            }
                          >
                            {expandedLeadId === l.id ? "Đóng" : "Quản lý"}
                          </button>
                        </div>
                      </td>
                      <td style={S.td}>
                        {l.status === "paid" ? (
                          <button
                            style={{ ...S.btnPrimary, background: "#991b1b" }}
                            disabled={refundingId === l.id}
                            onClick={() => handleMarkRefunded(l)}
                          >
                            {refundingId === l.id ? "..." : "Hoàn tiền"}
                          </button>
                        ) : l.status === "refunded" && l.refunded_at ? (
                          <span style={{ fontSize: 12, color: "#666" }}>{formatDateTime(l.refunded_at)}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                    {expandedLeadId === l.id && (
                      <tr>
                        <td colSpan={12} style={{ ...S.td, whiteSpace: "normal", background: "#fafafa" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 4px" }}>
                            <div
                              style={{
                                border: "1px solid #d1d1d6",
                                borderRadius: 8,
                                padding: 12,
                                background: "#fff",
                              }}
                            >
                              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                Cách A: Tự động (khuyến nghị) — dán link PDF Career Map gốc
                              </div>
                              {!l.quiz_leads ? (
                                <div style={{ fontSize: 13, color: "#991b1b" }}>
                                  Đơn này chưa liên kết dữ liệu quiz — không tự động được, dùng
                                  Cách B bên dưới.
                                </div>
                              ) : (
                                <>
                                  <input
                                    type="text"
                                    value={sourcePdfUrlDraft[l.id] ?? ""}
                                    onChange={(e) =>
                                      setSourcePdfUrlDraft((cur) => ({ ...cur, [l.id]: e.target.value }))
                                    }
                                    placeholder="https://... (link PDF Career Map từ bên thứ 3, phải public)"
                                    style={{
                                      width: "100%",
                                      maxWidth: 560,
                                      padding: "8px 10px",
                                      fontSize: 13,
                                      borderRadius: 6,
                                      border: "1px solid #d1d1d6",
                                      marginBottom: 8,
                                    }}
                                  />
                                  <div>
                                    <button
                                      style={S.btnPrimary}
                                      disabled={
                                        generatingId === l.id || !sourcePdfUrlDraft[l.id]?.trim()
                                      }
                                      onClick={() => handleGenerateCareerMap(l)}
                                    >
                                      {generatingId === l.id
                                        ? "Đang xử lý (30-60s)..."
                                        : "Tạo Báo Cáo & Gửi Mail"}
                                    </button>
                                  </div>
                                  {generateError[l.id] && (
                                    <div style={{ ...S.error, marginTop: 8 }}>{generateError[l.id]}</div>
                                  )}
                                  {(() => {
                                    const result = generateResult[l.id];
                                    if (!result) return null;
                                    return (
                                      <div
                                        style={{
                                          marginTop: 8,
                                          fontSize: 13,
                                          color: result.emailSent ? "#15803d" : "#a16207",
                                        }}
                                      >
                                        {(() => {
                                          // Dùng đúng kết quả file thật đã dựng được (trả về từ API sau khi
                                          // chạy xong) thay vì cờ has_vakad tĩnh — has_vakad=true không đảm
                                          // bảo báo cáo thứ 3 luôn dựng thành công (VD thiếu free_report ở
                                          // dữ liệu cũ), nên label phải khớp với thực tế đã gửi cho khách.
                                          const reportLabel = result.vakad_report_file_url
                                            ? "3 báo cáo PDF (Xu hướng Học tập + Career Map + Chiến lược xét tuyển)"
                                            : "2 báo cáo PDF (Career Map + Chiến lược xét tuyển)";
                                          const mainLine = result.emailSent
                                            ? `Đã tạo ${reportLabel} và gửi email cho ${l.email}.`
                                            : `Đã tạo ${reportLabel} nhưng gửi email thất bại (${result.emailError ?? "lỗi không xác định"}) — tải file ở mục B3 bên dưới để gửi tay.`;
                                          const parentEmail = l.quiz_leads?.parent_email;
                                          const parentLine =
                                            result.parentEmailSent === null
                                              ? null
                                              : result.parentEmailSent
                                                ? ` Đã gửi thêm bản riêng cho phụ huynh (${parentEmail}).`
                                                : ` Gửi bản cho phụ huynh (${parentEmail}) thất bại (${result.parentEmailError ?? "lỗi không xác định"}).`;
                                          return mainLine + (parentLine ?? "");
                                        })()}
                                      </div>
                                    );
                                  })()}
                                </>
                              )}
                            </div>

                            <div>
                              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                Cách B1: Copy input cho Gem 2 (chạy Gem 2 thủ công)
                              </div>
                              {l.quiz_leads ? (
                                <button style={S.btnPrimary} onClick={() => handleCopyGem2Input(l)}>
                                  {copiedGem2Id === l.id ? "Đã copy!" : "Copy input cho Gem 2"}
                                </button>
                              ) : (
                                <div style={{ fontSize: 13, color: "#991b1b" }}>
                                  Đơn này chưa liên kết với kết quả quiz (đơn cũ trước khi
                                  gắn quiz_lead_id) — tìm thủ công ở bảng &quot;Kết quả quiz
                                  VAKAD&quot; bên dưới theo tên.
                                </div>
                              )}
                            </div>

                            <div>
                              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                Cách B2: Nội dung Career Map (paste kết quả từ Gem 2)
                              </div>
                              <textarea
                                value={careerMapDraft[l.id] ?? l.career_map_text ?? ""}
                                onChange={(e) =>
                                  setCareerMapDraft((cur) => ({ ...cur, [l.id]: e.target.value }))
                                }
                                rows={6}
                                style={{
                                  width: "100%",
                                  maxWidth: 720,
                                  padding: 10,
                                  fontSize: 13,
                                  borderRadius: 6,
                                  border: "1px solid #d1d1d6",
                                  fontFamily: "inherit",
                                }}
                                placeholder="Dán nội dung Career Map từ Gem 2 vào đây..."
                              />
                              <div style={{ marginTop: 8 }}>
                                <button
                                  style={S.btnPrimary}
                                  disabled={careerMapSaving === l.id}
                                  onClick={() => handleSaveCareerMapText(l)}
                                >
                                  {careerMapSaving === l.id ? "Đang lưu..." : "Lưu nội dung"}
                                </button>
                              </div>
                            </div>

                            <div>
                              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                Cách B3: File Career Map (PDF/ảnh, tối đa 10MB)
                              </div>
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.docx"
                                disabled={careerMapUploading === l.id}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUploadCareerMapFile(l, file);
                                  e.target.value = "";
                                }}
                              />
                              {careerMapUploading === l.id && (
                                <span style={{ marginLeft: 8, fontSize: 13, color: "#666" }}>
                                  Đang tải lên...
                                </span>
                              )}
                              {l.career_map_file_path && (
                                <div style={{ marginTop: 8, fontSize: 13 }}>
                                  File hiện tại:{" "}
                                  {l.career_map_file_url ? (
                                    <a href={l.career_map_file_url} target="_blank" rel="noreferrer">
                                      {l.career_map_file_name ?? "tải xuống"}
                                    </a>
                                  ) : (
                                    l.career_map_file_name ?? "—"
                                  )}
                                  {l.career_map_updated_at && (
                                    <span style={{ color: "#666" }}>
                                      {" "}
                                      (cập nhật {formatDateTime(l.career_map_updated_at)})
                                    </span>
                                  )}
                                </div>
                              )}
                              {l.strategy_file_path && (
                                <div style={{ marginTop: 8, fontSize: 13 }}>
                                  File Chiến lược xét tuyển (tạo tự động ở Cách A):{" "}
                                  {l.strategy_file_url ? (
                                    <a href={l.strategy_file_url} target="_blank" rel="noreferrer">
                                      {l.strategy_file_name ?? "tải xuống"}
                                    </a>
                                  ) : (
                                    l.strategy_file_name ?? "—"
                                  )}
                                  {l.strategy_updated_at && (
                                    <span style={{ color: "#666" }}>
                                      {" "}
                                      (cập nhật {formatDateTime(l.strategy_updated_at)})
                                    </span>
                                  )}
                                </div>
                              )}
                              {l.vakad_report_file_path && (
                                <div style={{ marginTop: 8, fontSize: 13 }}>
                                  File Xu hướng Học tập (tạo tự động ở Cách A, chỉ có khi đã làm VAKAD):{" "}
                                  {l.vakad_report_file_url ? (
                                    <a href={l.vakad_report_file_url} target="_blank" rel="noreferrer">
                                      {l.vakad_report_file_name ?? "tải xuống"}
                                    </a>
                                  ) : (
                                    l.vakad_report_file_name ?? "—"
                                  )}
                                  {l.vakad_report_updated_at && (
                                    <span style={{ color: "#666" }}>
                                      {" "}
                                      (cập nhật {formatDateTime(l.vakad_report_updated_at)})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {careerMapErrorId === l.id && (
                              <div style={S.error}>Lưu/tải lên thất bại, thử lại.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={S.empty}>Chưa có đơn nào phù hợp</div>
        )}
      </div>

      <h1 style={{ ...S.h1, marginTop: 32 }}>Kết quả quiz VAKAD (miễn phí)</h1>
      <p style={{ ...S.dateSep, maxWidth: 1400, margin: "0 auto 12px", fontSize: 13 }}>
        Đối chiếu theo tên với đơn đã thanh toán ở trên để lấy khối học/học lực/VAKAD
        đưa vào Gem 2 chạy thủ công.
      </p>

      <div style={S.filterBar}>
        <input
          type="text"
          placeholder="Tìm theo tên, khối học..."
          value={quizSearch}
          onChange={(e) => setQuizSearch(e.target.value)}
          style={S.searchInput}
        />
      </div>

      <div style={S.tableWrap}>
        {quizLoading ? (
          <div style={S.empty}>Đang tải...</div>
        ) : quizData && quizData.leads.length > 0 ? (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Tên con</th>
                <th style={S.th}>SĐT (Zalo)</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Tên phụ huynh</th>
                <th style={{ ...S.th, borderLeft: "2px solid #d1d1d6" }}>Ngày sinh</th>
                <th style={S.th}>Khối học</th>
                <th style={S.th}>Học lực</th>
                <th style={S.th}>Nơi ở</th>
                <th style={{ ...S.th, borderLeft: "2px solid #d1d1d6" }}>VAKAD</th>
                <th style={S.th}>Đường Đời</th>
                <th style={S.th}>Sứ Mệnh</th>
                <th style={S.th}>Linh Hồn</th>
                <th style={S.th}>Ngày Sinh (số)</th>
                <th style={S.th}>Ngày làm bài</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {quizData.leads.map((l) => (
                <Fragment key={l.id}>
                  <tr style={S.tr}>
                    <td style={S.td}>{l.ho_ten}</td>
                    <td style={S.tdMono}>{l.phone ?? "—"}</td>
                    <td style={S.td}>{l.email ?? "—"}</td>
                    <td style={S.td}>{l.ten_phu_huynh ?? "—"}</td>
                    <td style={{ ...S.td, borderLeft: "2px solid #d1d1d6" }}>{l.dob}</td>
                    <td style={S.td}>{l.khoi_hoc}</td>
                    <td style={S.td}>{l.hoc_luc}</td>
                    <td style={S.td}>{l.noi_o ?? "—"}</td>
                    <td style={{ ...S.td, borderLeft: "2px solid #d1d1d6" }}>{l.vakad_dominant ?? "Chưa làm bài test"}</td>
                    <td style={S.td}>{l.duong_doi}</td>
                    <td style={S.td}>{l.su_menh ?? "—"}</td>
                    <td style={S.td}>{l.linh_hon ?? "—"}</td>
                    <td style={S.td}>{l.ngay_sinh}</td>
                    <td style={S.td}>{formatDateTime(l.created_at)}</td>
                    <td style={S.td}>
                      <button
                        style={S.btnPrimary}
                        onClick={() =>
                          setExpandedId((cur) => (cur === l.id ? null : l.id))
                        }
                      >
                        {expandedId === l.id ? "Đóng" : "Xem báo cáo"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === l.id && (
                    <tr>
                      <td colSpan={14} style={{ ...S.td, whiteSpace: "normal", background: "#fafafa" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                          <button style={S.btnPrimary} onClick={() => handleCopyReport(l)}>
                            {copiedId === l.id ? "Đã copy!" : "Copy toàn bộ"}
                          </button>
                        </div>
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "inherit",
                            fontSize: 13,
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {l.free_report ?? "(Chưa làm bài test VAKAD — luồng phụ huynh)"}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={S.empty}>Chưa có ai làm quiz</div>
        )}
      </div>

      <h1 style={{ ...S.h1, marginTop: 32 }}>Quản lý CTV</h1>
      <CtvManagement adminPass={password} />

      <h1 style={{ ...S.h1, marginTop: 32 }}>Hiệu suất CTV</h1>
      <CtvPerformanceReport adminPass={password} />
    </div>
  );
}

function Stat({ label, value, color = "#111" }: { label: string; value: string; color?: string }) {
  return (
    <div style={S.statCard}>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statValue, color }}>{value}</div>
    </div>
  );
}

export function formatVND(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0 đ";
  return n.toLocaleString("vi-VN") + " đ";
}

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return "—";
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "#f5f5f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: 360,
    background: "#fff",
    borderRadius: 12,
    padding: "28px 24px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 4px 0" },
  input: {
    padding: "12px 14px",
    fontSize: 15,
    borderRadius: 8,
    border: "1px solid #d1d1d6",
    outline: "none",
  },
  error: { background: "#fee2e2", color: "#991b1b", padding: "8px 12px", borderRadius: 6, fontSize: 13 },
  errorBanner: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: 8,
    marginBottom: 16,
    maxWidth: 1400,
    margin: "0 auto 16px",
  },
  btnPrimary: {
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    background: "#111",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  wrapper: {
    minHeight: "100vh",
    background: "#f5f5f7",
    padding: "24px 20px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "#111",
  },
  h1: { fontSize: 22, fontWeight: 700, margin: "0 auto 16px", maxWidth: 1400 },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
    maxWidth: 1400,
    margin: "0 auto 16px",
  },
  statCard: { background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 700 },
  filterBar: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
    background: "#fff",
    padding: 10,
    borderRadius: 10,
    maxWidth: 1400,
    margin: "0 auto 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  searchInput: {
    flex: "1 1 220px",
    padding: "8px 12px",
    fontSize: 13,
    border: "1px solid #d1d1d6",
    borderRadius: 6,
    outline: "none",
  },
  select: { padding: "8px 12px", fontSize: 13, border: "1px solid #d1d1d6", borderRadius: 6, background: "#fff", cursor: "pointer" },
  dateInput: { padding: "6px 10px", fontSize: 13, border: "1px solid #d1d1d6", borderRadius: 6 },
  dateSep: { color: "#666", fontSize: 13 },
  tableWrap: {
    background: "#fff",
    borderRadius: 10,
    overflow: "auto",
    maxWidth: 1400,
    margin: "0 auto",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  tr: { borderBottom: "1px solid #f0f0f0" },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "#666",
    background: "#fafafa",
    whiteSpace: "nowrap",
  },
  td: { padding: "12px 14px", color: "#111", whiteSpace: "nowrap" },
  tdMono: {
    padding: "12px 14px",
    whiteSpace: "nowrap",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12,
  },
  badge: { display: "inline-block", padding: "3px 8px", fontSize: 11, fontWeight: 600, borderRadius: 12 },
  badgePaid: { background: "#dcfce7", color: "#15803d" },
  badgePending: { background: "#fef3c7", color: "#a16207" },
  badgeRefunded: { background: "#fee2e2", color: "#991b1b" },
  reportLink: {
    display: "inline-block",
    padding: "3px 8px",
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 12,
    background: "#eef2ff",
    color: "#4338ca",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  empty: { padding: 40, textAlign: "center", color: "#666" },
};
