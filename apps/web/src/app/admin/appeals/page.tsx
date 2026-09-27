"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";
import {
  getAdminAppeals,
  createAdminAppeal,
  updateAdminAppeal,
  deleteAdminAppeal,
  resolveAdminAppeal,
  getAdminClips,
  type AdminAppeal,
  type AdminClip,
} from "@/lib/api";
import {
  ShieldAlert,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit3,
  X,
  Check,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  Bot,
} from "lucide-react";

type StatusFilter = "ALL" | "PENDING" | "UPHELD" | "REJECTED";

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState<AdminAppeal[]>([]);
  const [clips, setClips] = useState<AdminClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modals state
  const [resolveTarget, setResolveTarget] = useState<AdminAppeal | null>(null);
  const [resolveDecision, setResolveDecision] = useState<"approve" | "reject">("approve");
  const [resolveNotes, setResolveNotes] = useState("");
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createClipId, setCreateClipId] = useState("");
  const [createReason, setCreateReason] = useState("");
  const [createStatus, setCreateStatus] = useState<"PENDING" | "UPHELD" | "REJECTED">("PENDING");
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const [editTarget, setEditTarget] = useState<AdminAppeal | null>(null);
  const [editReason, setEditReason] = useState("");
  const [editStatus, setEditStatus] = useState<"PENDING" | "UPHELD" | "REJECTED">("PENDING");
  const [editNotes, setEditNotes] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminAppeal | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appealsData, clipsData] = await Promise.all([
        getAdminAppeals().catch(() => [] as AdminAppeal[]),
        getAdminClips().catch(() => [] as AdminClip[]),
      ]);

      setAppeals(appealsData || []);
      setClips(clipsData || []);
    } catch {
      showNotification("Gagal menyinkronkan data dari server database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // Filtered appeals
  const filteredAppeals = useMemo(() => {
    return appeals.filter((item) => {
      const matchStatus =
        statusFilter === "ALL" ? true : item.status === statusFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.clipId.toLowerCase().includes(q) ||
        item.campaignTitle.toLowerCase().includes(q) ||
        item.clipperWallet.toLowerCase().includes(q) ||
        (item.clipperName && item.clipperName.toLowerCase().includes(q)) ||
        item.reason.toLowerCase().includes(q) ||
        (item.reviewNotes && item.reviewNotes.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [appeals, statusFilter, searchQuery]);

  // Summary counts
  const totalCount = appeals.length;
  const pendingCount = appeals.filter((a) => a.status === "PENDING").length;
  const upheldCount = appeals.filter((a) => a.status === "UPHELD").length;
  const rejectedCount = appeals.filter((a) => a.status === "REJECTED").length;

  // Handlers
  const handleOpenResolve = (appeal: AdminAppeal) => {
    setResolveTarget(appeal);
    setResolveDecision("approve");
    setResolveNotes(appeal.reviewNotes || "");
  };

  const handleExecuteResolve = async () => {
    if (!resolveTarget) return;
    try {
      setSubmittingResolve(true);
      await resolveAdminAppeal(resolveTarget.id, {
        decision: resolveDecision,
        reviewNotes: resolveNotes.trim() || undefined,
      });

      showNotification(
        resolveDecision === "approve"
          ? "Banding disetujui (Upheld). Klip diaktifkan untuk pencairan escrow."
          : "Banding ditolak (Rejected). Catatan peninjauan disimpan."
      );
      setResolveTarget(null);
      await fetchData();
    } catch {
      showNotification("Terjadi kendala jaringan saat memproses keputusan.");
    } finally {
      setSubmittingResolve(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateClipId(clips[0]?.id || "");
    setCreateReason("");
    setCreateStatus("PENDING");
    setCreateModalOpen(true);
  };

  const handleExecuteCreate = async () => {
    if (!createClipId.trim() || !createReason.trim()) {
      showNotification("Mohon lengkapi ID klip dan alasan pengajuan banding.");
      return;
    }

    try {
      setSubmittingCreate(true);
      await createAdminAppeal({
        clipId: createClipId.trim(),
        reason: createReason.trim(),
        status: createStatus,
      });

      showNotification("Tiket banding baru berhasil dicatat ke database.");
      setCreateModalOpen(false);
      await fetchData();
    } catch {
      showNotification("Terjadi kendala jaringan saat menyimpan tiket.");
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleOpenEdit = (appeal: AdminAppeal) => {
    setEditTarget(appeal);
    setEditReason(appeal.reason);
    setEditStatus(appeal.status);
    setEditNotes(appeal.reviewNotes || "");
  };

  const handleExecuteEdit = async () => {
    if (!editTarget || !editReason.trim()) return;

    try {
      setSubmittingEdit(true);
      await updateAdminAppeal(editTarget.id, {
        reason: editReason.trim(),
        status: editStatus,
        reviewNotes: editNotes.trim() || null,
      });

      showNotification("Data banding berhasil diperbarui.");
      setEditTarget(null);
      await fetchData();
    } catch {
      showNotification("Terjadi kendala jaringan saat memperbarui data.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleOpenDelete = (appeal: AdminAppeal) => {
    setDeleteTarget(appeal);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmittingDelete(true);
      await deleteAdminAppeal(deleteTarget.id);

      showNotification("Tiket banding berhasil dihapus dari database.");
      setDeleteTarget(null);
      await fetchData();
    } catch {
      showNotification("Terjadi kendala jaringan saat menghapus data.");
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <AuthGate
      requiredRole="admin"
      title="Portal Superadmin"
      description="Halaman ini hanya dapat diakses oleh akun dengan otorisasi Superadmin."
    >
      <div style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: "5.5rem", paddingBottom: "4rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>

          {/* Toast Notification */}
          {feedbackMessage && (
            <div
              style={{
                position: "fixed",
                bottom: "2rem",
                right: "2rem",
                zIndex: 9999,
                background: "#0f172a",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: "10px",
                fontSize: "0.875rem",
                fontWeight: 500,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <CheckCircle2 size={16} style={{ color: "#10b981", flexShrink: 0 }} />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Admin Sub Navigation Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "1.75rem",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "12px",
            }}
          >
            <Link
              href="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#64748b",
                textDecoration: "none",
                background: "transparent",
              }}
            >
              <SlidersHorizontal size={15} /> Ringkasan & Worker
            </Link>

            <Link
              href="/admin/appeals"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#7c3aed",
                textDecoration: "none",
                background: "rgba(124, 58, 237, 0.08)",
                border: "1px solid rgba(124, 58, 237, 0.2)",
              }}
            >
              <ShieldAlert size={15} /> Banding & Sengketa
              {pendingCount > 0 && (
                <span
                  style={{
                    background: "#d97706",
                    color: "#fff",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: "9999px",
                    marginLeft: "4px",
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/ai-monitoring"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#64748b",
                textDecoration: "none",
                background: "transparent",
              }}
            >
              <Bot size={15} /> Observabilitas AI &amp; Token
            </Link>

            <Link
              href="/admin/blog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#64748b",
                textDecoration: "none",
                background: "transparent",
              }}
            >
              <FileText size={15} /> Manajemen Artikel
            </Link>
          </div>

          {/* Header Title & Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.75rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  background: "rgba(124, 58, 237, 0.08)",
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                  marginBottom: "0.5rem",
                }}
              >
                <ShieldAlert size={12} style={{ color: "#7c3aed" }} />
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "#7c3aed",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Admin Dispute Desk
                </span>
              </div>
              <h1
                style={{
                  fontSize: "1.625rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Resolusi Banding & Sengketa Klip
              </h1>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>
                Verifikasi klaim kreator, atur validasi manual, dan perbarui status on-chain di database.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 14px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  color: "#334155",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: refreshing ? "not-allowed" : "pointer",
                }}
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                Sinkronkan
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={15} /> Buat Tiket Banding
              </button>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              marginBottom: "1.75rem",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: "1.25rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                Total Pengajuan
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                {totalCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                Tiket sengketa terdaftar di database
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                padding: "1.25rem",
                borderRadius: "12px",
                border: "1px solid #fed7aa",
                borderLeft: "4px solid #f59e0b",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b45309", textTransform: "uppercase" }}>
                Menunggu Review
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#b45309", marginTop: "4px" }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "4px" }}>
                Membutuhkan tindakan keputusan admin
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                padding: "1.25rem",
                borderRadius: "12px",
                border: "1px solid #a7f3d0",
                borderLeft: "4px solid #10b981",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#047857", textTransform: "uppercase" }}>
                Banding Disetujui
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#047857", marginTop: "4px" }}>
                {upheldCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#047857", marginTop: "4px" }}>
                Klip aktif dan berhak payout
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                padding: "1.25rem",
                borderRadius: "12px",
                border: "1px solid #fecaca",
                borderLeft: "4px solid #ef4444",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b91c1c", textTransform: "uppercase" }}>
                Banding Ditolak
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#b91c1c", marginTop: "4px" }}>
                {rejectedCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#b91c1c", marginTop: "4px" }}>
                Keputusan penolakan dikonfirmasi
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div
            style={{
              background: "#ffffff",
              padding: "1rem 1.25rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {/* Filter Status Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              {(
                [
                  { id: "ALL", label: "Semua", count: totalCount },
                  { id: "PENDING", label: "Menunggu Review", count: pendingCount },
                  { id: "UPHELD", label: "Disetujui", count: upheldCount },
                  { id: "REJECTED", label: "Ditolak", count: rejectedCount },
                ] as const
              ).map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "0.8125rem",
                      fontWeight: active ? 600 : 500,
                      background: active ? "#0f172a" : "#f1f5f9",
                      color: active ? "#ffffff" : "#475569",
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        padding: "1px 5px",
                        borderRadius: "9999px",
                        background: active ? "rgba(255,255,255,0.2)" : "#e2e8f0",
                        color: active ? "#ffffff" : "#64748b",
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "260px" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Cari ID, URL, wallet, atau alasan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 34px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.8125rem",
                  color: "#0f172a",
                  background: "#ffffff",
                  outline: "none",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#64748b" }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px auto", color: "#7c3aed" }} />
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}>
                  Memuat data banding dari server database...
                </p>
              </div>
            ) : filteredAppeals.length === 0 ? (
              <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#64748b" }}>
                <ShieldAlert size={32} style={{ margin: "0 auto 12px auto", color: "#94a3b8" }} />
                <h3 style={{ margin: "0 0 6px 0", fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>
                  Tidak ada tiket banding ditemukan
                </h3>
                <p style={{ margin: "0 0 1rem 0", fontSize: "0.8125rem", color: "#64748b" }}>
                  {searchQuery || statusFilter !== "ALL"
                    ? "Tidak ada data yang cocok dengan kriteria filter saat ini."
                    : "Belum ada pengajuan banding sengketa di dalam sistem."}
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Tambah Banding Manual
                </button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8125rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 }}>
                      <th style={{ padding: "12px 16px" }}>ID & Tanggal</th>
                      <th style={{ padding: "12px 16px" }}>Klip & Kampanye</th>
                      <th style={{ padding: "12px 16px" }}>Kreator</th>
                      <th style={{ padding: "12px 16px" }}>Alasan Banding</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                      <th style={{ padding: "12px 16px" }}>Catatan Review</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppeals.map((item, index) => {
                      const isPending = item.status === "PENDING";
                      const isUpheld = item.status === "UPHELD";
                      const isRejected = item.status === "REJECTED";

                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: index < filteredAppeals.length - 1 ? "1px solid #f1f5f9" : "none",
                            background: index % 2 === 0 ? "#ffffff" : "#fafafa",
                          }}
                        >
                          {/* ID & Date */}
                          <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                            <div style={{ fontWeight: 600, color: "#0f172a", fontFamily: "monospace" }}>
                              {item.id}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                              {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>

                          {/* Clip & Campaign */}
                          <td style={{ padding: "14px 16px", verticalAlign: "top", maxWidth: "260px" }}>
                            <div style={{ fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.campaignTitle}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                              <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>
                                {item.clipId.slice(0, 12)}...
                              </span>
                              {item.clipUrl && (
                                <a
                                  href={item.clipUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    fontSize: "0.6875rem",
                                    color: "#2563eb",
                                    textDecoration: "none",
                                  }}
                                >
                                  <ExternalLink size={11} /> Tonton
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Creator */}
                          <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                            <div style={{ fontWeight: 500, color: "#0f172a" }}>
                              {item.clipperName || "Kreator"}
                            </div>
                            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontFamily: "monospace", marginTop: "2px" }}>
                              {item.clipperWallet.slice(0, 6)}...{item.clipperWallet.slice(-4)}
                            </div>
                          </td>

                          {/* Reason */}
                          <td style={{ padding: "14px 16px", verticalAlign: "top", maxWidth: "280px" }}>
                            <div style={{ color: "#334155", lineHeight: 1.4 }}>
                              {item.reason}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                            {isPending && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  fontSize: "0.6875rem",
                                  fontWeight: 600,
                                }}
                              >
                                <Clock size={11} /> PENDING
                              </span>
                            )}
                            {isUpheld && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  background: "#d1fae5",
                                  color: "#047857",
                                  fontSize: "0.6875rem",
                                  fontWeight: 600,
                                }}
                              >
                                <CheckCircle2 size={11} /> UPHELD
                              </span>
                            )}
                            {isRejected && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  background: "#fee2e2",
                                  color: "#b91c1c",
                                  fontSize: "0.6875rem",
                                  fontWeight: 600,
                                }}
                              >
                                <XCircle size={11} /> REJECTED
                              </span>
                            )}
                          </td>

                          {/* Review Notes */}
                          <td style={{ padding: "14px 16px", verticalAlign: "top", maxWidth: "200px" }}>
                            <span style={{ color: item.reviewNotes ? "#475569" : "#94a3b8", fontStyle: item.reviewNotes ? "normal" : "italic" }}>
                              {item.reviewNotes || "-"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "14px 16px", verticalAlign: "top", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenResolve(item)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "5px 10px",
                                    borderRadius: "6px",
                                    background: "#7c3aed",
                                    color: "#ffffff",
                                    border: "none",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Putuskan
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                title="Edit Detail Banding"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  background: "#f1f5f9",
                                  color: "#334155",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                }}
                              >
                                <Edit3 size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDelete(item)}
                                title="Hapus Banding"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL: RESOLVE APPEAL ────────────────────────────────────────── */}
      {resolveTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                  Keputusan Banding
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>
                  ID: {resolveTarget.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setResolveTarget(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>Alasan dari Kreator:</div>
                <div style={{ fontSize: "0.8125rem", color: "#0f172a", marginTop: "4px", lineHeight: 1.4 }}>
                  {resolveTarget.reason}
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Pilih Keputusan:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setResolveDecision("approve")}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: resolveDecision === "approve" ? "2px solid #10b981" : "1px solid #cbd5e1",
                      background: resolveDecision === "approve" ? "#ecfdf5" : "#ffffff",
                      color: resolveDecision === "approve" ? "#047857" : "#475569",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Check size={14} /> Setujui (Upheld)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolveDecision("reject")}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: resolveDecision === "reject" ? "2px solid #ef4444" : "1px solid #cbd5e1",
                      background: resolveDecision === "reject" ? "#fef2f2" : "#ffffff",
                      color: resolveDecision === "reject" ? "#b91c1c" : "#475569",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <X size={14} /> Tolak Banding
                  </button>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px" }}>
                  {resolveDecision === "approve"
                    ? "Klip akan diubah menjadi ACTIVE di database dan siap untuk pencairan escrow."
                    : "Status klip tetap REJECTED dan kreator tidak akan menerima pencairan klaim."}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Catatan Admin / Bukti Verifikasi:
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan catatan verifikasi internal atau nomor referensi audit..."
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8125rem",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setResolveTarget(null)}
                  disabled={submittingResolve}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    color: "#475569",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteResolve}
                  disabled={submittingResolve}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    background: resolveDecision === "approve" ? "#047857" : "#b91c1c",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: submittingResolve ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {submittingResolve && <RefreshCw size={12} className="animate-spin" />}
                  Simpan Keputusan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE APPEAL ─────────────────────────────────────────── */}
      {createModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                Buat Tiket Banding Manual
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Pilih Klip Bersangkutan:
                </label>
                {clips.length > 0 ? (
                  <select
                    value={createClipId}
                    onChange={(e) => setCreateClipId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.8125rem",
                      color: "#0f172a",
                      background: "#ffffff",
                      outline: "none",
                    }}
                  >
                    {clips.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.status}] {c.campaignTitle} — {c.clipperName} ({c.id.slice(0, 10)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Masukkan Clip ID..."
                    value={createClipId}
                    onChange={(e) => setCreateClipId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.8125rem",
                      color: "#0f172a",
                      outline: "none",
                    }}
                  />
                )}
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Alasan Pengajuan Banding:
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsikan alasan banding atau bukti koreksi dari clipper..."
                  value={createReason}
                  onChange={(e) => setCreateReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8125rem",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Status Awal:
                </label>
                <select
                  value={createStatus}
                  onChange={(e) => setCreateStatus(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8125rem",
                    color: "#0f172a",
                    background: "#ffffff",
                    outline: "none",
                  }}
                >
                  <option value="PENDING">PENDING (Menunggu review)</option>
                  <option value="UPHELD">UPHELD (Langsung disetujui)</option>
                  <option value="REJECTED">REJECTED (Langsung ditolak)</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={submittingCreate}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    color: "#475569",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCreate}
                  disabled={submittingCreate}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: submittingCreate ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {submittingCreate && <RefreshCw size={12} className="animate-spin" />}
                  Simpan Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT APPEAL ───────────────────────────────────────────── */}
      {editTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                Edit Data Banding
              </h3>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Alasan Banding:
                </label>
                <textarea
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8125rem",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Status Banding:
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8125rem",
                    color: "#0f172a",
                    background: "#ffffff",
                    outline: "none",
                  }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="UPHELD">UPHELD (Disetujui)</option>
                  <option value="REJECTED">REJECTED (Ditolak)</option>
                </select>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Catatan Admin:
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan review admin..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8125rem",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  disabled={submittingEdit}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    color: "#475569",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteEdit}
                  disabled={submittingEdit}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: submittingEdit ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {submittingEdit && <RefreshCw size={12} className="animate-spin" />}
                  Perbarui
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE CONFIRMATION ──────────────────────────────────── */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "440px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "1.5rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                Hapus Tiket Banding?
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.5 }}>
                Tindakan ini akan menghapus tiket banding <strong style={{ color: "#0f172a" }}>{deleteTarget.id}</strong> secara permanen dari basis data sistem.
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={submittingDelete}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    color: "#475569",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  disabled={submittingDelete}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    background: "#dc2626",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: submittingDelete ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {submittingDelete && <RefreshCw size={12} className="animate-spin" />}
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGate>
  );
}
