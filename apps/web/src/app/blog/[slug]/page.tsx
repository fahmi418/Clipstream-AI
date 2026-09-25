import { BLOG_ARTICLES } from "@/lib/blog-data";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";

// Next.js 15: params is a Promise
interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };
  return {
    title: `${article.title} — ClipStream AI Blog`,
    description: article.excerpt,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);
  if (!article) return notFound();

  const related = BLOG_ARTICLES.filter((a) => a.id !== article.id).slice(0, 2);

  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f3" }}>
      {/* Cover Hero */}
      <div
        style={{
          height: "clamp(280px, 40vw, 420px)",
          background: "#111",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={article.coverImage}
          alt={article.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.65 }}
        />
        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
          }}
        />
        {/* Back button */}
        <Link
          href="/blog"
          style={{
            position: "absolute",
            top: "5.5rem",
            left: "1.5rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} />
          Semua Artikel
        </Link>

        {/* Title overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "760px",
            padding: "0 1.5rem",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "#e8400d",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            {article.category}
          </span>
          <h1
            style={{
              fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {article.title}
          </h1>
        </div>
      </div>

      {/* Article Content */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Meta bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            padding: "1.25rem 0",
            borderBottom: "1px solid rgba(17,17,17,0.08)",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: <User size={13} />, label: article.author },
            { icon: <Calendar size={13} />, label: article.date },
            { icon: <Clock size={13} />, label: `${article.readTime} baca` },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8125rem", color: "rgba(17,17,17,0.5)" }}>
              {m.icon}
              <span>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Article body */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid rgba(17,17,17,0.07)",
            padding: "clamp(1.25rem, 4vw, 2.25rem)",
            marginBottom: "3rem",
          }}
        >
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "#1a1a1a", wordBreak: "break-word", overflowWrap: "break-word" }}
          />
        </div>

        {/* Related articles — no JS hover, pure CSS */}
        {related.length > 0 && (
          <div style={{ marginBottom: "5rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#111",
                letterSpacing: "-0.02em",
                marginBottom: "1rem",
              }}
            >
              Artikel Terkait
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {related.map((rel) => (
                <Link key={rel.id} href={`/blog/${rel.slug}`} className="related-card" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "12px",
                      border: "1px solid rgba(17,17,17,0.07)",
                      overflow: "hidden",
                      display: "flex",
                      gap: "1rem",
                      padding: "1rem",
                    }}
                  >
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "#e8400d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                        {rel.category}
                      </div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111", lineHeight: 1.35 }}>
                        {rel.title}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        .blog-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.02em;
          margin: 1.75rem 0 0.75rem;
        }
        .blog-content p { margin: 0 0 1rem; color: rgba(17,17,17,0.8); }
        .blog-content ul { margin: 0 0 1rem; padding-left: 1.5rem; }
        .blog-content li { margin-bottom: 0.375rem; color: rgba(17,17,17,0.75); }
        .blog-content strong { color: #111; font-weight: 600; }
        .blog-content em { font-style: italic; color: rgba(17,17,17,0.7); }

        .related-card > div {
          transition: border-color 0.15s;
        }
        .related-card:hover > div {
          border-color: rgba(17,17,17,0.2) !important;
        }
      `}</style>
    </div>
  );
}
