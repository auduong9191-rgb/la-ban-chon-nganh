// Quản lý danh sách CTV: thêm mới (tự sinh mã + link tracking), sửa, bật/tắt active.
"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { S } from "@/app/admin/page";

type Ctv = {
  id: string;
  ctv_code: string;
  name: string;
  email: string;
  group_type: string;
  commission_amount: number;
  is_active: boolean;
  created_at: string;
};

const GROUP_LABEL: Record<string, string> = {
  "1": "Nhóm 1 — chỉ GT",
  "2": "Nhóm 2 — GT + Career Map",
};

const DEFAULT_COMMISSION: Record<string, number> = { "1": 50000, "2": 200000 };

export function CtvManagement({ adminPass }: { adminPass: string }) {
  const [ctvList, setCtvList] = useState<Ctv[]>([]);
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [groupType, setGroupType] = useState<"1" | "2">("1");
  const [commission, setCommission] = useState<number>(DEFAULT_COMMISSION["1"]);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Ctv>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchCtv = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ctv", { headers: { "x-admin-pass": adminPass }, cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { ctv: Ctv[] };
      setCtvList(json.ctv ?? []);
    } finally {
      setLoading(false);
    }
  }, [adminPass]);

  useEffect(() => {
    if (adminPass) {
      // Fetch-on-mount/dependency-change — cùng idiom với fetchLeads/fetchQuizLeads
      // trong app/admin/page.tsx.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCtv();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPass]);

  // Nhóm 1 (chỉ giới thiệu, lan tỏa) trỏ vào trang chủ "/" — có đủ phần giới
  // thiệu chuyên môn (ExpertSection, CertificatesSection...) trước khi vào
  // bài test, vì người họ chia sẻ tới chưa chắc biết Tiara Edu là ai. Nhóm 2
  // (tự định vị vai trò chuyên gia, đã giới thiệu trực tiếp) trỏ thẳng /quiz
  // như cũ. Các nút CTA trên trang chủ đã tự mang theo ?r= khi dẫn qua /quiz
  // (xem lib/use-quiz-href.ts) nên mã CTV không bị rơi mất ở bước này. Tham
  // số đặt tên trung tính "r" (không phải "ctv") để không lộ đây là link
  // giới thiệu/cộng tác viên.
  function buildLink(code: string, groupType: string): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const path = groupType === "2" ? "/quiz" : "/";
    return `${origin}${path}?r=${code}`;
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/ctv", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pass": adminPass },
        body: JSON.stringify({ name, email, groupType, commissionAmount: commission }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCreateError(json.error ?? "Tạo CTV thất bại.");
        return;
      }
      setNewLink(buildLink(json.ctvCode, groupType));
      setName("");
      setEmail("");
      setGroupType("1");
      setCommission(DEFAULT_COMMISSION["1"]);
      await fetchCtv();
    } catch {
      setCreateError("Không thể kết nối, thử lại.");
    } finally {
      setCreating(false);
    }
  }

  async function handleCopyLink(link: string) {
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function startEdit(ctv: Ctv) {
    setEditingId(ctv.id);
    setEditDraft({
      name: ctv.name,
      email: ctv.email,
      group_type: ctv.group_type,
      commission_amount: ctv.commission_amount,
    });
  }

  async function handleSaveEdit(id: string) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/ctv/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pass": adminPass },
        body: JSON.stringify({
          name: editDraft.name,
          email: editDraft.email,
          groupType: editDraft.group_type,
          commissionAmount: editDraft.commission_amount,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        await fetchCtv();
      }
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggleActive(ctv: Ctv) {
    setSavingId(ctv.id);
    try {
      const res = await fetch(`/api/admin/ctv/${ctv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pass": adminPass },
        body: JSON.stringify({ isActive: !ctv.is_active }),
      });
      if (res.ok) await fetchCtv();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1400, margin: "0 auto 12px" }}>
        <div />
        <button style={S.btnPrimary} onClick={() => setAdding((cur) => !cur)}>
          {adding ? "Đóng" : "+ Thêm cộng tác viên"}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={handleCreate}
          style={{ ...S.filterBar, flexDirection: "column", alignItems: "stretch", gap: 10 }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Tên CTV"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ ...S.searchInput, flex: "1 1 200px" }}
            />
            <input
              type="email"
              placeholder="Email nhận thông báo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ ...S.searchInput, flex: "1 1 220px" }}
            />
            <select
              value={groupType}
              onChange={(e) => {
                const g = e.target.value as "1" | "2";
                setGroupType(g);
                setCommission(DEFAULT_COMMISSION[g]);
              }}
              style={S.select}
            >
              <option value="1">Nhóm 1 — chỉ GT</option>
              <option value="2">Nhóm 2 — GT + Career Map</option>
            </select>
            <input
              type="number"
              min={0}
              step={1000}
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              style={{ ...S.dateInput, width: 130 }}
              title="Hoa hồng/đơn trả phí (VND)"
            />
            <button type="submit" style={S.btnPrimary} disabled={creating}>
              {creating ? "Đang tạo..." : "Tạo CTV"}
            </button>
          </div>
          {createError && <div style={S.error}>{createError}</div>}
        </form>
      )}

      {newLink && (
        <div style={{ ...S.filterBar, background: "#f0fdf4" }}>
          <span style={{ fontSize: 13 }}>Đã tạo CTV — link gửi cho họ:</span>
          <code style={{ fontSize: 12, background: "#fff", padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d1d6" }}>
            {newLink}
          </code>
          <button style={S.btnPrimary} onClick={() => handleCopyLink(newLink)}>
            {copiedLink ? "Đã copy!" : "Copy link"}
          </button>
        </div>
      )}

      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.empty}>Đang tải...</div>
        ) : ctvList.length > 0 ? (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Mã CTV</th>
                <th style={S.th}>Tên</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Nhóm</th>
                <th style={{ ...S.th, textAlign: "right" }}>Hoa hồng/đơn</th>
                <th style={S.th}>Link tracking</th>
                <th style={S.th}>Trạng thái</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {ctvList.map((ctv) => {
                const isEditing = editingId === ctv.id;
                return (
                  <tr key={ctv.id} style={S.tr}>
                    <td style={S.tdMono}>{ctv.ctv_code}</td>
                    <td style={S.td}>
                      {isEditing ? (
                        <input
                          value={editDraft.name ?? ""}
                          onChange={(e) => setEditDraft((cur) => ({ ...cur, name: e.target.value }))}
                          style={{ ...S.searchInput, width: 140 }}
                        />
                      ) : (
                        ctv.name
                      )}
                    </td>
                    <td style={S.td}>
                      {isEditing ? (
                        <input
                          value={editDraft.email ?? ""}
                          onChange={(e) => setEditDraft((cur) => ({ ...cur, email: e.target.value }))}
                          style={{ ...S.searchInput, width: 180 }}
                        />
                      ) : (
                        ctv.email
                      )}
                    </td>
                    <td style={S.td}>
                      {isEditing ? (
                        <select
                          value={editDraft.group_type ?? "1"}
                          onChange={(e) =>
                            setEditDraft((cur) => ({ ...cur, group_type: e.target.value }))
                          }
                          style={S.select}
                        >
                          <option value="1">Nhóm 1</option>
                          <option value="2">Nhóm 2</option>
                        </select>
                      ) : (
                        GROUP_LABEL[ctv.group_type] ?? ctv.group_type
                      )}
                    </td>
                    <td style={{ ...S.td, textAlign: "right" }}>
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={editDraft.commission_amount ?? 0}
                          onChange={(e) =>
                            setEditDraft((cur) => ({ ...cur, commission_amount: Number(e.target.value) }))
                          }
                          style={{ ...S.dateInput, width: 100 }}
                        />
                      ) : (
                        `${ctv.commission_amount.toLocaleString("vi-VN")} đ`
                      )}
                    </td>
                    <td style={S.td}>
                      <button style={S.btnPrimary} onClick={() => handleCopyLink(buildLink(ctv.ctv_code, ctv.group_type))}>
                        Copy link
                      </button>
                    </td>
                    <td style={S.td}>
                      <span
                        style={{
                          ...S.badge,
                          ...(ctv.is_active ? S.badgePaid : S.badgePending),
                        }}
                      >
                        {ctv.is_active ? "Đang hoạt động" : "Ngừng"}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {isEditing ? (
                          <>
                            <button
                              style={S.btnPrimary}
                              disabled={savingId === ctv.id}
                              onClick={() => handleSaveEdit(ctv.id)}
                            >
                              {savingId === ctv.id ? "Đang lưu..." : "Lưu"}
                            </button>
                            <button style={S.btnPrimary} onClick={() => setEditingId(null)}>
                              Huỷ
                            </button>
                          </>
                        ) : (
                          <>
                            <button style={S.btnPrimary} onClick={() => startEdit(ctv)}>
                              Sửa
                            </button>
                            <button
                              style={S.btnPrimary}
                              disabled={savingId === ctv.id}
                              onClick={() => handleToggleActive(ctv)}
                            >
                              {ctv.is_active ? "Tắt" : "Bật lại"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={S.empty}>Chưa có CTV nào — bấm &quot;+ Thêm cộng tác viên&quot; để tạo.</div>
        )}
      </div>
    </div>
  );
}
