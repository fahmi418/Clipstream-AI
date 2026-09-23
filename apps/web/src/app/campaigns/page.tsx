"use client";

import { useState, useEffect } from "react";
import { listCampaigns, type Campaign, type CampaignStatus } from "@/lib/api";
import { CampaignCard } from "@/components/CampaignCard";
import { Search, SlidersHorizontal, Megaphone, RotateCcw, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// Curated live mock campaigns for instant zero-lag preview if API returns empty
const defaultCuratedCampaigns: Campaign[] = [
  {
    id: "camp-seed-1",
    onchainId: "1",
    brandId: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    title: "BNB Chain Ecosystem Spotlight",
    description:
      "Highlight inovasi dApps dan proyek Web3 unggulan di BNB Chain. Fokus pada kecepatan transaksi, ekosistem DeFi, dan efisiensi gas fee.",
    sourceUrl: "https://www.youtube.com/watch?v=5-gWpX231y0",
    rules: "Wajib menyertakan watermark sponsor dan tagar #BNBChain. Durasi klip minimal 30 detik.",
    cpmRate: "1748466",
    totalBudget: "1500000000",
    remainingBudget: "1120000000",
    maxPayoutPerClip: "250000000",
    minViews: 1000,
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: "ACTIVE",
    clippersCount: 24,
    clipsCount: 68,
    txHash: "0xaaaabbbbccccddddeeeeffff0000111122223333444455556666777788889999",
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-seed-2",
    onchainId: "2",
    brandId: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    title: "DeFi DEX Launch Campaign",
    description:
      "Promosikan peluncuran DEX generasi terbaru di BNB Chain dengan fitur gasless swap dan yield farming terdesentralisasi.",
    sourceUrl: "https://www.youtube.com/watch?v=k891023948a",
    rules: "Highlight fitur auto-routing dan keamanan kontrak audit. Tanpa klaim keuntungan finansial berlebihan.",
    cpmRate: "1503067",
    totalBudget: "800000000",
    remainingBudget: "640000000",
    maxPayoutPerClip: "150000000",
    minViews: 1000,
    deadline: new Date(Date.now() + 9 * 86400000).toISOString(),
    status: "ACTIVE",
    clippersCount: 18,
    clipsCount: 42,
    txHash: "0xbbbbccccddddeeeeffff0000111122223333444455556666777788889999aaaa",
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-seed-3",
    onchainId: "3",
    brandId: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    title: "AI Agent Trading Hackathon Teaser",
    description:
      "Bagikan cuplikan highlight tim dan ide autonomous agent terbaik di ajang AI Agent Hackathon 2026. Fokus pada integrasi Web3 & LLM.",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    rules: "Gunakan visual resolusi 1080p, audio jernih, dan watermark akun clipper terpasang.",
    cpmRate: "1963190",
    totalBudget: "2000000000",
    remainingBudget: "1650000000",
    maxPayoutPerClip: "350000000",
    minViews: 1500,
    deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
    status: "ACTIVE",
    clippersCount: 31,
    clipsCount: 89,
    txHash: "0xccccdddd0000111122223333444455556666777788889999aaaabbbbccccdddd",
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-seed-4",
    onchainId: "4",
    brandId: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    title: "Web3 Creator Showcase: Panduan Smart Contract BNB Chain",
    description:
      "Edukasi developer pemula cara deploy contract Solidity dan escrow dengan gas fee murah. Klip harus fokus pada kemudahan ekosistem BNB.",
    sourceUrl: "https://www.youtube.com/watch?v=sample-web3-bounty",
    rules: "Highlight biaya gas murah dan kecepatan konfirmasi di BNB Chain.",
    cpmRate: "1595092",
    totalBudget: "1200000000",
    remainingBudget: "900000000",
    maxPayoutPerClip: "200000000",
    minViews: 1000,
    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    status: "ACTIVE",
    clippersCount: 15,
    clipsCount: 37,
    txHash: "0xdddd0000111122223333444455556666777788889999aaaabbbbccccddddeeee",
    createdAt: new Date().toISOString(),
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCuratedCampaigns);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "ALL">("ACTIVE");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"ending_soon" | "cpm_desc" | "budget_desc" | "newest">("ending_soon");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCampaignList = async () => {
    setLoading(true);
    try {
      const data = await listCampaigns({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        sort: sortBy,
      });
      if (data && data.length > 0) {
        setCampaigns(data);
      } else {
        setCampaigns(defaultCuratedCampaigns);
      }
    } catch {
      setCampaigns(defaultCuratedCampaigns);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignList();
  }, [statusFilter, sortBy]);

  const filteredCampaigns = campaigns.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        paddingTop: "6.5rem",
        paddingBottom: "6rem",
      }}
    >
      <div
        className="am-container"
        style={{
          maxWidth: "70rem",
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        {/* Header Hero Section */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              backgroundColor: "#ecfdf5",
              border: "1px solid rgba(5, 150, 105, 0.2)",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#059669",
              letterSpacing: "0.5px",
              marginBottom: "0.75rem",
            }}
          >
            <Sparkles size={14} />
            <span>MARKETPLACE KAMPANYE AKTIF • BNB CHAIN ESCROW</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1.25rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "#111111",
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                Eksplorasi Bounty Video
              </h1>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "rgba(17,17,17,0.65)",
                  marginTop: "0.5rem",
                  maxWidth: "38rem",
                  lineHeight: 1.5,
                }}
              >
                Pilih video podcast atau konten sponsor, potong momen paling menarik, upload ke YouTube Shorts / TikTok dengan watermark kamu, dan nikmati transfer USDT instan saat views naik.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link
                href="/brand/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                <Megaphone size={16} />
                <span>Buat Campaign Baru</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar Bento Box */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "1rem",
            border: "1px solid rgba(17,17,17,0.08)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {/* Search Input */}
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <Search
              size={17}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(17,17,17,0.4)",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul podcast, topik video, atau brand..."
              style={{
                width: "100%",
                padding: "0.55rem 1rem 0.55rem 2.6rem",
                fontSize: "0.875rem",
                borderRadius: "9999px",
                border: "1px solid rgba(17,17,17,0.1)",
                outline: "none",
                backgroundColor: "#fbfaf9",
              }}
            />
          </div>

          {/* Filter Status Pills & Sorters */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Status Pills */}
            <div
              style={{
                display: "inline-flex",
                backgroundColor: "#f4f3f0",
                padding: "0.25rem",
                borderRadius: "9999px",
              }}
            >
              {(["ACTIVE", "ENDED", "ALL"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: "0.35rem 0.875rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: statusFilter === st ? "#ffffff" : "transparent",
                    color: statusFilter === st ? "#111111" : "rgba(17,17,17,0.6)",
                    boxShadow: statusFilter === st ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {st === "ACTIVE" ? "Aktif" : st === "ENDED" ? "Selesai" : "Semua"}
                </button>
              ))}
            </div>

            {/* Sorter */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <SlidersHorizontal size={14} color="rgba(17,17,17,0.5)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "0.45rem 0.75rem",
                  borderRadius: "9999px",
                  border: "1px solid rgba(17,17,17,0.1)",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  cursor: "pointer",
                  color: "#111",
                }}
              >
                <option value="ending_soon">Segera Berakhir</option>
                <option value="cpm_desc">CPM Tertinggi</option>
                <option value="budget_desc">Budget Terbesar</option>
                <option value="newest">Paling Baru</option>
              </select>
            </div>
          </div>
        </div>

        {/* Campaign Cards Grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  height: "380px",
                  backgroundColor: "#f4f3f0",
                  borderRadius: "20px",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredCampaigns.map((camp) => (
              <CampaignCard key={camp.id} campaign={camp} />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              backgroundColor: "#fbfaf9",
              borderRadius: "20px",
              border: "1px dashed rgba(17,17,17,0.15)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111" }}>
              Tidak ada kampanye yang cocok dengan pencarian
            </h3>
            <p style={{ fontSize: "0.875rem", color: "rgba(17,17,17,0.6)", marginTop: "0.35rem" }}>
              Coba sesuaikan kata kunci pencarian atau ubah opsi filter kamu.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.8125rem",
                fontWeight: 600,
                backgroundColor: "#111",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
