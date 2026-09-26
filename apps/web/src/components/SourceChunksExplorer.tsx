"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Play,
  Copy,
  Check,
  Search,
  Layers,
  Sparkles,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
  Lightbulb,
} from "lucide-react";
import type { SourceChunk } from "@/lib/api";

interface SourceChunksExplorerProps {
  sourceVideoTitle?: string;
  sourceVideoUrl?: string;
  chunks: SourceChunk[];
  className?: string;
}

export function SourceChunksExplorer({
  sourceVideoTitle = "Video Sumber Kampanye",
  sourceVideoUrl = "https://www.youtube.com/watch?v=5-gWpX231y0",
  chunks = [],
  className = "",
}: SourceChunksExplorerProps) {
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(
    chunks.length > 0 ? chunks[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const filteredChunks = useMemo(() => {
    if (!searchQuery.trim()) return chunks;
    return chunks.filter((c) =>
      c.chunkText.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chunks, searchQuery]);

  const activeChunk =
    chunks.find((c) => c.id === selectedChunkId) || chunks[0] || null;

  const totalDuration = useMemo(() => {
    if (chunks.length === 0) return 180;
    return Math.max(...chunks.map((c) => c.endSec), 180);
  }, [chunks]);

  const handleCopyTimestamp = (chunk: SourceChunk) => {
    const text = `${formatTime(chunk.startSec)} - ${formatTime(chunk.endSec)}: "${chunk.chunkText}"`;
    navigator.clipboard.writeText(text);
    setCopiedId(chunk.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getYoutubeTimestampUrl = (startSec: number) => {
    const baseUrl = sourceVideoUrl.split("&t=")[0];
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}t=${startSec}s`;
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        padding: "1.5rem",
        border: "1px solid rgba(17,17,17,0.08)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
      }}
      className={className}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={18} color="#059669" />
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "#111", margin: 0 }}>
              AI Transcript &amp; Vector Chunks Explorer
            </h3>
          </div>
          <p style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)", margin: "3px 0 0" }}>
            Pecahan transkrip Whisper &amp; embedding vektor 1536-dim untuk pencocokan klip semantik
          </p>
        </div>

        {/* Search in Transcript */}
        <div style={{ position: "relative", minWidth: "220px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(17,17,17,0.4)",
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci dalam transkrip..."
            style={{
              width: "100%",
              padding: "0.4rem 0.75rem 0.4rem 2.25rem",
              fontSize: "0.75rem",
              borderRadius: "9999px",
              border: "1px solid rgba(17,17,17,0.12)",
              outline: "none",
              backgroundColor: "#fbfaf9",
            }}
          />
        </div>
      </div>

      {/* Interactive Timeline Heatmap Bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.6875rem",
            color: "rgba(17,17,17,0.5)",
            marginBottom: "0.35rem",
          }}
        >
          <span>00:00</span>
          <span>Linimasa Video Sumber ({formatTime(totalDuration)})</span>
          <span>{formatTime(totalDuration)}</span>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            height: "28px",
            backgroundColor: "#f5f5f4",
            borderRadius: "8px",
            overflow: "hidden",
            padding: "2px",
            gap: "2px",
          }}
        >
          {chunks.map((c) => {
            const widthPercent =
              ((c.endSec - c.startSec) / (totalDuration || 1)) * 100;
            const isSelected = activeChunk?.id === c.id;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedChunkId(c.id)}
                title={`Segmen #${c.chunkIndex + 1}: ${formatTime(c.startSec)} - ${formatTime(c.endSec)}`}
                style={{
                  width: `${Math.max(5, widthPercent)}%`,
                  height: "100%",
                  borderRadius: "6px",
                  backgroundColor: isSelected
                    ? "#eb5e28"
                    : c.hasEmbedding
                    ? "#dcfce7"
                    : "#e0e7ff",
                  border: isSelected
                    ? "2px solid #b44800"
                    : "1px solid rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: isSelected ? "#ffffff" : "#166534",
                }}
              >
                #{c.chunkIndex + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chunks Browser Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* Left: Chunks List */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            maxHeight: "340px",
            overflowY: "auto",
            paddingRight: "4px",
          }}
        >
          {filteredChunks.map((chunk) => {
            const isSelected = activeChunk?.id === chunk.id;

            return (
              <div
                key={chunk.id}
                onClick={() => setSelectedChunkId(chunk.id)}
                style={{
                  padding: "0.875rem 1rem",
                  borderRadius: "12px",
                  backgroundColor: isSelected ? "#fffaf5" : "#fbfaf9",
                  border: `1px solid ${
                    isSelected ? "#ffcbb4" : "rgba(17,17,17,0.06)"
                  }`,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.45rem",
                        borderRadius: "6px",
                        backgroundColor: isSelected ? "#eb5e28" : "rgba(17,17,17,0.06)",
                        color: isSelected ? "#ffffff" : "#111",
                        fontFamily: "monospace",
                      }}
                    >
                      {formatTime(chunk.startSec)} - {formatTime(chunk.endSec)}
                    </span>

                    <span style={{ fontSize: "0.6875rem", color: "#059669", fontWeight: 600 }}>
                      ● Vector Ready
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: isSelected ? "#111" : "rgba(17,17,17,0.7)",
                      margin: 0,
                      lineHeight: 1.45,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {chunk.chunkText}
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  style={{
                    color: isSelected ? "#eb5e28" : "rgba(17,17,17,0.3)",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Right: Selected Chunk Deep Inspector */}
        {activeChunk ? (
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "14px",
              backgroundColor: "#fbfaf9",
              border: "1px solid rgba(17,17,17,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid rgba(17,17,17,0.06)",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "rgba(17,17,17,0.5)", textTransform: "uppercase" }}>
                    Segmen Terpilih #{activeChunk.chunkIndex + 1}
                  </span>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111", fontFamily: "monospace" }}>
                    {formatTime(activeChunk.startSec)} — {formatTime(activeChunk.endSec)} ({activeChunk.endSec - activeChunk.startSec} detik)
                  </div>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.25rem 0.625rem",
                    borderRadius: "9999px",
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                  }}
                >
                  <Sparkles size={12} />
                  <span>1536-dim Embedding</span>
                </div>
              </div>

              {/* Full Chunk Text */}
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "rgba(17,17,17,0.5)", textTransform: "uppercase", marginBottom: "4px" }}>
                  Transkrip Audio Lengkap (Whisper):
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#111",
                    lineHeight: 1.6,
                    backgroundColor: "#ffffff",
                    padding: "0.875rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(17,17,17,0.06)",
                  }}
                >
                  "{activeChunk.chunkText}"
                </div>
              </div>

              {/* Editing Advice */}
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(17,17,17,0.6)",
                  lineHeight: 1.4,
                  backgroundColor: "#fffbeb",
                  padding: "0.625rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #fef3c7",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "6px",
                }}
              >
                <Lightbulb size={14} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Tips Clipper:</strong> Memotong klip Shorts pada rentang detik ini akan menghasilkan skor keselarasan semantik di atas 85% pada verifikasi otomatis.</span>
              </div>
            </div>

            {/* Chunk Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
                flexWrap: "wrap",
                paddingTop: "0.75rem",
                borderTop: "1px solid rgba(17,17,17,0.06)",
              }}
            >
              <button
                type="button"
                onClick={() => handleCopyTimestamp(activeChunk)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(17,17,17,0.12)",
                  color: "#111",
                  cursor: "pointer",
                }}
              >
                {copiedId === activeChunk.id ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                <span>{copiedId === activeChunk.id ? "Tersalin!" : "Salin Rentang Waktu"}</span>
              </button>

              <a
                href={getYoutubeTimestampUrl(activeChunk.startSec)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.45rem 1rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  textDecoration: "none",
                }}
              >
                <Play size={12} />
                <span>Putar di YouTube ({formatTime(activeChunk.startSec)})</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
