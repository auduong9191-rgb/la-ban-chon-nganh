// Báo cáo hiệu suất CTV theo tháng — số bản free / trả phí xuất ra, số đơn hoàn
// tiền, doanh số + hoa hồng. Dùng để vinh danh + đối chiếu thanh toán cho CTV.
"use client";

import { useState, useEffect, useCallback } from "react";
import { S, formatVND } from "@/app/admin/page";

type PerformanceRow = {
  ctvCode: string;
  name: string;
  groupType: string;
  isActive: boolean;
  freeCount: number;
  paidCount: number;
  refundCount: number;
  revenue: number;
  commission: number;
};

const GROUP_LABEL: Record<string, string> = { "1": "Nhóm 1", "2": "Nhóm 2" };

function currentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function CtvPerformanceReport({ adminPass }: { adminPass: string }) {
  const [month, setMonth] = useState(currentMonth());
  const [report, setReport] = useState<PerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ctv-performance?month=${month}`, {
        headers: { "x-admin-pass": adminPass },
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as { report: PerformanceRow[] };
      setReport(json.report ?? []);
    } finally {
      setLoading(false);
    }
  }, [adminPass, month]);

  useEffect(() => {
    if (adminPass) {
      // Fetch-on-mount/dependency-change — cùng idiom với fetchLeads/fetchQuizLeads
      // trong app/admin/page.tsx.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPass, month]);

  const totals = report.reduce(
    (acc, r) => ({
      freeCount: acc.freeCount + r.freeCount,
      paidCount: acc.paidCount + r.paidCount,
      refundCount: acc.refundCount + r.refundCount,
      revenue: acc.revenue + r.revenue,
      commission: acc.commission + r.commission,
    }),
    { freeCount: 0, paidCount: 0, refundCount: 0, revenue: 0, commission: 0 }
  );

  return (
    <div>
      <div style={S.filterBar}>
        <label style={{ fontSize: 13, color: "#666" }}>Tháng:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={S.dateInput}
        />
      </div>

      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.empty}>Đang tải...</div>
        ) : report.length > 0 ? (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>CTV</th>
                <th style={S.th}>Nhóm</th>
                <th style={{ ...S.th, textAlign: "right" }}>Số bản free</th>
                <th style={{ ...S.th, textAlign: "right" }}>Số bản trả phí</th>
                <th style={{ ...S.th, textAlign: "right" }}>Hoàn tiền</th>
                <th style={{ ...S.th, textAlign: "right" }}>Doanh số</th>
                <th style={{ ...S.th, textAlign: "right" }}>Hoa hồng</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.ctvCode} style={S.tr}>
                  <td style={S.td}>
                    {r.name} {!r.isActive && <span style={{ color: "#999", fontSize: 11 }}>(ngừng)</span>}
                  </td>
                  <td style={S.td}>{GROUP_LABEL[r.groupType] ?? r.groupType}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{r.freeCount}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{r.paidCount}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{r.refundCount}</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{formatVND(r.revenue)}</td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{formatVND(r.commission)}</td>
                </tr>
              ))}
              <tr style={{ ...S.tr, background: "#fafafa" }}>
                <td style={{ ...S.td, fontWeight: 700 }}>Tổng</td>
                <td style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totals.freeCount}</td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totals.paidCount}</td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totals.refundCount}</td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{formatVND(totals.revenue)}</td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{formatVND(totals.commission)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div style={S.empty}>Chưa có CTV nào — thêm CTV ở mục &quot;Quản lý CTV&quot; bên trên.</div>
        )}
      </div>
    </div>
  );
}
