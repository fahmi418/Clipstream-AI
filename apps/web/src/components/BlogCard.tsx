"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogArticle } from "@/lib/blog-data";

export function BlogCard({ article }: { article: BlogArticle }) {
  return (
    <Link href={`/blog/${article.slug}`} style={{ textDecoration: "none" }}>
      <article
        style={{
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid rgba(17,17,17,0.07)",
          overflow: "hidden",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
          e.currentTarget.style.borderColor = "rgba(17,17,17,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.borderColor = "rgba(17,17,17,0.07)";
        }}
      >
        {/* Cover */}
        <div style={{ height: "190px", overflow: "hidden", background: "#111" }}>
          <img
            src={article.coverImage}
            alt={article.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem 1.375rem 1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.625rem" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#e8400d", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              {article.category}
            </span>
            <span style={{ color: "rgba(17,17,17,0.2)", fontSize: "0.75rem" }}>·</span>
            <span style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.45)" }}>{article.date}</span>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111", margin: "0 0 0.5rem", lineHeight: 1.4, letterSpacing: "-0.02em", flex: 1 }}>
            {article.title}
          </h2>

          {/* Excerpt */}
          <p style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.5)", margin: "0 0 1rem", lineHeight: 1.55 }}>
            {article.excerpt}
          </p>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.875rem", borderTop: "1px solid rgba(17,17,17,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "rgba(17,17,17,0.4)" }}>
              <Clock size={12} />
              <span>{article.readTime} baca</span>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 600, color: "#111" }}>
              Baca <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
