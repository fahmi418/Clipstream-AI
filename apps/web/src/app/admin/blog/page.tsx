"use client";

import { useState } from "react";
import { BLOG_ARTICLES, type BlogArticle } from "@/lib/blog-data";
import { AuthGate } from "@/components/AuthGate";
import Link from "next/link";
import {
  Plus, Eye, Pencil, Trash2, X, Save, ArrowLeft,
  BookOpen, Calendar, Clock, CheckCircle2
} from "lucide-react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(17,17,17,0.12)",
  fontSize: "0.875rem",
  color: "#111",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

type Mode = "list" | "create" | "edit";

export default function AdminBlogPage() {
  const [articles, setArticles] = useState<BlogArticle[]>(BLOG_ARTICLES);
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<BlogArticle | null>(null);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<Partial<BlogArticle>>({});

  const openCreate = () => {
    setForm({
      title: "",
      slug: "",
      category: "Panduan",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      coverImage: "/assets/blog-cover-clipper.jpg",
      excerpt: "",
      content: "",
      author: "Tim ClipStream AI",
      readTime: "5 menit",
    });
    setEditing(null);
    setMode("create");
  };

  const openEdit = (article: BlogArticle) => {
    setForm({ ...article });
    setEditing(article);
    setMode("edit");
  };

  const handleSave = () => {
    if (!form.title || !form.slug || !form.content) return;
    if (mode === "create") {
      const newArticle: BlogArticle = {
        id: String(Date.now()),
        slug: form.slug!,
        title: form.title!,
        category: form.category || "Panduan",
        date: form.date || "",
        coverImage: form.coverImage || "/assets/blog-cover-clipper.jpg",
        excerpt: form.excerpt || "",
        content: form.content!,
        author: form.author || "Tim ClipStream AI",
        readTime: form.readTime || "5 menit",
      };
      setArticles((prev) => [newArticle, ...prev]);
    } else if (mode === "edit" && editing) {
      setArticles((prev) =>
        prev.map((a) => (a.id === editing.id ? { ...a, ...form } as BlogArticle : a))
      );
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setMode("list"); }, 1200);
  };

  const handleDelete = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirm(null);
  };

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <AuthGate
      requiredRole="admin"
      title="Portal Superadmin"
      description="Halaman ini hanya bisa diakses oleh Superadmin."
    >
      <div style={{ minHeight: "100vh", background: "#f6f5f3", paddingTop: "5.5rem", paddingBottom: "4rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1.5rem" }}>

          {/* ── LIST MODE ─────────────────────────────────────── */}
          {mode === "list" && (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px", borderRadius: "9999px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", marginBottom: "0.5rem" }}>
                    <BookOpen size={11} style={{ color: "#7c3aed" }} />
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "1px" }}>Admin — Blog</span>
                  </div>
                  <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111", letterSpacing: "-0.03em", margin: 0 }}>Manajemen Artikel</h1>
                </div>
                <button
                  type="button"
                  onClick={openCreate}
                  style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", background: "#111", color: "#fff", fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer" }}
                >
                  <Plus size={15} /> Tulis Artikel Baru
                </button>
              </div>

              {/* Articles table */}
              <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid rgba(17,17,17,0.07)", overflow: "hidden" }}>
                {articles.map((article, i) => (
                  <div
                    key={article.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem 1.25rem",
                      borderBottom: i < articles.length - 1 ? "1px solid rgba(17,17,17,0.05)" : "none",
                      background: "#fff",
                    }}
                  >
                    {/* Thumbnail */}
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      style={{ width: "64px", height: "52px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                    />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                        <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "#e8400d", textTransform: "uppercase", letterSpacing: "0.5px" }}>{article.category}</span>
                        <span style={{ color: "rgba(17,17,17,0.2)" }}>·</span>
                        <span style={{ fontSize: "0.6875rem", color: "rgba(17,17,17,0.4)", display: "flex", alignItems: "center", gap: "3px" }}>
                          <Calendar size={10} /> {article.date}
                        </span>
                        <span style={{ color: "rgba(17,17,17,0.2)" }}>·</span>
                        <span style={{ fontSize: "0.6875rem", color: "rgba(17,17,17,0.4)", display: "flex", alignItems: "center", gap: "3px" }}>
                          <Clock size={10} /> {article.readTime}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {article.title}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <Link
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(17,17,17,0.1)", background: "#fff", fontSize: "0.75rem", fontWeight: 500, color: "#111", textDecoration: "none" }}
                      >
                        <Eye size={12} /> Preview
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(article)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(17,17,17,0.1)", background: "#fff", fontSize: "0.75rem", fontWeight: 500, color: "#111", cursor: "pointer" }}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(article.id)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)", background: "#fff5f5", fontSize: "0.75rem", fontWeight: 500, color: "#b91c1c", cursor: "pointer" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delete confirm modal */}
              {deleteConfirm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                  <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", maxWidth: "360px", width: "90%", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                      <Trash2 size={20} style={{ color: "#b91c1c" }} />
                    </div>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111", margin: "0 0 0.5rem" }}>Hapus Artikel?</h3>
                    <p style={{ fontSize: "0.875rem", color: "rgba(17,17,17,0.5)", margin: "0 0 1.5rem" }}>Tindakan ini tidak bisa dibatalkan.</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", borderRadius: "9px", border: "1px solid rgba(17,17,17,0.1)", background: "#fff", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer" }}>Batal</button>
                      <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "10px", borderRadius: "9px", background: "#b91c1c", color: "#fff", border: "none", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>Ya, Hapus</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── CREATE / EDIT MODE ────────────────────────────── */}
          {(mode === "create" || mode === "edit") && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
                <button
                  type="button"
                  onClick={() => setMode("list")}
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "9px", border: "1px solid rgba(17,17,17,0.1)", background: "#fff", fontSize: "0.8125rem", color: "#111", cursor: "pointer" }}
                >
                  <ArrowLeft size={13} /> Kembali
                </button>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111", letterSpacing: "-0.03em", margin: 0 }}>
                  {mode === "create" ? "Tulis Artikel Baru" : "Edit Artikel"}
                </h1>
              </div>

              <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid rgba(17,17,17,0.07)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Title */}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#111", marginBottom: "6px" }}>Judul Artikel *</label>
                  <input
                    type="text"
                    value={form.title || ""}
                    onChange={(e) => {
                      setForm((f) => ({
                        ...f,
                        title: e.target.value,
                        slug: slugify(e.target.value),
                      }));
                    }}
                    placeholder="Judul artikel..."
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#111")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {/* Slug */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#111", marginBottom: "6px" }}>Slug URL *</label>
                    <input
                      type="text"
                      value={form.slug || ""}
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      placeholder="url-artikel-kamu"
                      style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.8125rem" }}
                      onFocus={(e) => (e.target.style.borderColor = "#111")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#111", marginBottom: "6px" }}>Kategori</label>
                    <select
                      value={form.category || "Panduan"}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      style={{ ...inputStyle }}
                    >
                      {["Panduan", "Smart Contract", "AI Verifier", "Web3", "Tutorial", "Update"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#111", marginBottom: "6px" }}>Cover Image URL</label>
                    <select
                      value={form.coverImage || "/assets/blog-cover-clipper.jpg"}
                      onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                      style={{ ...inputStyle }}
                    >
                      <option value="/assets/blog-cover-clipper.jpg">🎬 Video Clipper (Orange)</option>
                      <option value="/assets/blog-cover-escrow.jpg">🔒 Escrow Contract (Purple)</option>
                      <option value="/assets/blog-cover-ai.jpg">🤖 AI Verifier (Green)</option>
                    </select>
                  </div>

                  {/* Read time */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#111", marginBottom: "6px" }}>Estimasi Waktu Baca</label>
                    <input
                      type="text"
                      value={form.readTime || ""}
                      onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
                      placeholder="5 menit"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#111")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#111", marginBottom: "6px" }}>Ringkasan / Excerpt</label>
                  <textarea
                    value={form.excerpt || ""}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    placeholder="Deskripsi singkat artikel untuk preview di homepage..."
                    style={textareaStyle}
                    rows={2}
                    onFocus={(e) => (e.target.style.borderColor = "#111")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")}
                  />
                </div>

                {/* Content */}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#111", marginBottom: "6px" }}>
                    Konten Artikel (HTML) *
                  </label>
                  <div style={{ fontSize: "0.6875rem", color: "rgba(17,17,17,0.4)", marginBottom: "8px" }}>
                    Gunakan tag HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
                  </div>
                  <textarea
                    value={form.content || ""}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="<p>Isi artikel kamu di sini...</p>"
                    style={{ ...textareaStyle, fontFamily: "monospace", fontSize: "0.8125rem", minHeight: "320px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#111")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", paddingTop: "0.75rem", borderTop: "1px solid rgba(17,17,17,0.06)" }}>
                  <button
                    type="button"
                    onClick={() => setMode("list")}
                    style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid rgba(17,17,17,0.1)", background: "#fff", fontSize: "0.875rem", fontWeight: 500, color: "rgba(17,17,17,0.6)", cursor: "pointer" }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!form.title || !form.slug || !form.content}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "10px 22px",
                      borderRadius: "10px",
                      background: saved ? "#059669" : "#111",
                      color: "#fff",
                      border: "none",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                    {saved ? "Tersimpan!" : "Simpan Artikel"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
