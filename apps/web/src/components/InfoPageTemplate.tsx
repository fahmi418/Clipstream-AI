import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { InfoPage } from "@/lib/footer-pages-data";

export function InfoPageTemplate({ page }: { page: InfoPage }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f6f5f3", paddingTop: "5.5rem", paddingBottom: "5rem" }}>
      <div className="am-container" style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "clamp(1rem, 3vw, 2rem)", paddingRight: "clamp(1rem, 3vw, 2rem)" }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.8125rem",
              color: "rgba(17,17,17,0.6)",
              textDecoration: "none",
              padding: "0.35rem 0.75rem",
              borderRadius: "9999px",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(17,17,17,0.08)",
            }}
            className="hover:text-black transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Beranda</span>
          </Link>
          <span style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.3)" }}>/</span>
          <span style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", fontWeight: 500 }}>
            {page.category}
          </span>
        </div>

        {/* Hero Card Header */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            padding: "clamp(1.75rem, 5vw, 3.5rem)",
            border: "1px solid rgba(17, 17, 17, 0.08)",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.03)",
            marginBottom: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              right: "-10%",
              width: "350px",
              height: "350px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0, 208, 132, 0.12) 0%, rgba(245, 158, 11, 0.1) 40%, transparent 70%)",
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          {page.badge && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.3rem 0.85rem",
                borderRadius: "9999px",
                backgroundColor: "rgba(17, 17, 17, 0.05)",
                border: "1px solid rgba(17, 17, 17, 0.08)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#111111",
                letterSpacing: "0.02em",
                marginBottom: "1.25rem",
              }}
            >
              <Zap size={13} style={{ color: "#e8400d" }} />
              <span>{page.badge}</span>
            </div>
          )}

          <h1
            style={{
              fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.18,
              color: "#111111",
              marginBottom: "1rem",
              fontFamily: "'Labil Grotesk Variable', sans-serif",
            }}
          >
            {page.title}
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.1875rem)",
              lineHeight: 1.6,
              color: "rgba(17, 17, 17, 0.68)",
              maxWidth: "46rem",
              marginBottom: "2rem",
            }}
          >
            {page.subtitle}
          </p>

          {/* Action CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {page.ctaHref.startsWith("http") || page.ctaHref.startsWith("mailto") ? (
              <a
                href={page.ctaHref}
                target={page.ctaHref.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                style={{
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  borderRadius: "9999px",
                  padding: "0.75rem 1.625rem",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                }}
              >
                <span>{page.ctaText}</span>
                <ArrowRight size={15} />
              </a>
            ) : (
              <Link
                href={page.ctaHref}
                style={{
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  borderRadius: "9999px",
                  padding: "0.75rem 1.625rem",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                }}
              >
                <span>{page.ctaText}</span>
                <ArrowRight size={15} />
              </Link>
            )}

            {page.secondaryCtaText && page.secondaryCtaHref && (
              <Link
                href={page.secondaryCtaHref}
                style={{
                  backgroundColor: "rgba(17, 17, 17, 0.04)",
                  color: "#111111",
                  border: "1px solid rgba(17, 17, 17, 0.12)",
                  borderRadius: "9999px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                }}
              >
                <span>{page.secondaryCtaText}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Highlights Cards Grid */}
        {page.highlights && page.highlights.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {page.highlights.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "18px",
                  padding: "1.5rem",
                  border: "1px solid rgba(17, 17, 17, 0.06)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(0, 208, 132, 0.12)",
                      color: "#059669",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111" }}>
                    {item.title}
                  </div>
                </div>
                <div style={{ fontSize: "0.8125rem", color: "rgba(17, 17, 17, 0.65)", lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Body HTML Content Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            padding: "clamp(1.5rem, 4.5vw, 3rem)",
            border: "1px solid rgba(17, 17, 17, 0.08)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.02)",
            marginBottom: "3rem",
          }}
        >
          <div
            className="info-page-content"
            dangerouslySetInnerHTML={{ __html: page.contentHtml }}
            style={{
              fontSize: "0.9375rem",
              lineHeight: 1.75,
              color: "rgba(17, 17, 17, 0.8)",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          />
        </div>

        {/* Bottom Navigation Quick Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "1.5rem",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid rgba(17, 17, 17, 0.06)",
          }}
        >
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111" }}>
            Siap untuk mencoba sistem ClipStream AI?
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link
              href="/campaigns"
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#111",
                textDecoration: "none",
                padding: "0.4rem 0.875rem",
                borderRadius: "9999px",
                border: "1px solid rgba(17, 17, 17, 0.12)",
              }}
            >
              Marketplace Kampanye
            </Link>
            <Link
              href="/clipper"
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "#111111",
                textDecoration: "none",
                padding: "0.4rem 0.875rem",
                borderRadius: "9999px",
              }}
            >
              Daftar Clipper
            </Link>
          </div>
        </div>

      </div>

      <style>{`
        .info-page-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.02em;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .info-page-content h2:first-child {
          margin-top: 0;
        }
        .info-page-content p {
          margin-bottom: 1rem;
        }
        .info-page-content ul {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .info-page-content li {
          margin-bottom: 0.5rem;
        }
        .info-page-content strong {
          color: #111;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
