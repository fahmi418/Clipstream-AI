import { BLOG_ARTICLES } from "@/lib/blog-data";
import { BlogCard } from "@/components/BlogCard";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "Blog & Panduan — ClipStream AI",
  description: "Artikel, panduan, dan insight seputar monetisasi video klip, smart contract escrow, dan teknologi AI verifikasi di ekosistem Web3.",
};

export default function BlogPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f3" }}>
      {/* Hero */}
      <div
        style={{
          background: "#111",
          color: "#fff",
          padding: "8rem 1.5rem 5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 14px",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              marginBottom: "1.25rem",
            }}
          >
            <BookOpen size={11} style={{ color: "#e8400d" }} />
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "1.2px", textTransform: "uppercase" }}>
              Blog & Panduan
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              margin: "0 0 1rem",
              color: "#fff",
            }}
          >
            Tingkatkan skill &amp; penghasilan klip kamu
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>
            Panduan teknis, tutorial Web3, dan insight dari ekosistem video clipper ClipStream AI.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {BLOG_ARTICLES.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
