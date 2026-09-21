"use client";

import { useState, useEffect } from "react";
import { listCampaigns, type Campaign, type CampaignStatus } from "@/lib/api";
import { CampaignCard } from "@/components/CampaignCard";
import { Search, SlidersHorizontal, Megaphone, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "ALL">("ACTIVE");
  const [sortBy, setSortBy] = useState<"ending_soon" | "cpm_desc" | "budget_desc" | "newest">("ending_soon");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCampaignList = async () => {
    setLoading(true);
    try {
      const data = await listCampaigns({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        sort: sortBy,
      });
      setCampaigns(data);
    } catch {
      setCampaigns([]);
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
      className="am-container"
      style={{
        maxWidth: "69rem",
        margin: "0 auto",
        padding: "7.5rem 1.5rem 4rem",
      }}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-ash)]">
              Eksplorasi Peluang
            </span>
            <h1 className="text-3xl sm:text-5xl font-normal text-[var(--color-ink)] tracking-tight mt-1">
              Daftar Campaign
            </h1>
            <p className="text-sm text-[var(--color-ash)] mt-2 max-w-xl">
              Pilih video sumber, potong bagian menarik, upload Shorts dengan kode
              verifikasi kamu, dan dapatkan bayaran otomatis langsung ke saldo.
            </p>
          </div>

          <Link
            href="/brand/new"
            className="btn-primary py-2.5 px-4 text-sm inline-flex items-center gap-2 self-start md:self-auto"
            style={{ textDecoration: "none" }}
          >
            <Megaphone size={15} />
            <span>Buat Campaign</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="card p-4 bg-white rounded-xl border border-[rgba(17,17,17,0.08)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ash)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul campaign atau topik video..."
              className="input pl-10 pr-4 text-sm"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status filter */}
            <div className="flex items-center gap-1 bg-[var(--color-cream-wash)] p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === "ACTIVE"
                    ? "bg-white text-[var(--color-ink)] shadow-sm"
                    : "text-[var(--color-ash)] hover:text-[var(--color-ink)]"
                }`}
              >
                Aktif
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ENDED")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === "ENDED"
                    ? "bg-white text-[var(--color-ink)] shadow-sm"
                    : "text-[var(--color-ash)] hover:text-[var(--color-ink)]"
                }`}
              >
                Selesai
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === "ALL"
                    ? "bg-white text-[var(--color-ink)] shadow-sm"
                    : "text-[var(--color-ash)] hover:text-[var(--color-ink)]"
                }`}
              >
                Semua
              </button>
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-ash)]">
              <SlidersHorizontal size={14} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[var(--color-cream-wash)] text-[var(--color-ink)] border border-[rgba(17,17,17,0.08)] rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 skeleton rounded-xl" />
            ))}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((camp) => (
              <CampaignCard key={camp.id} campaign={camp} />
            ))}
          </div>
        ) : (
          /* Empty State per APP-FLOW Section 15.1 */
          <div className="card p-12 text-center bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-4">
            <h3 className="text-xl font-medium text-[var(--color-ink)]">
              Belum ada campaign yang buka
            </h3>
            <p className="text-sm text-[var(--color-ash)] max-w-md mx-auto">
              Cek lagi nanti, atau ikuti channel komunitas kami untuk mendapatkan
              notifikasi begitu ada campaign baru dengan budget besar.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={fetchCampaignList}
                className="btn-pearl text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Muat Ulang</span>
              </button>
              <Link
                href="/brand/new"
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                style={{ textDecoration: "none" }}
              >
                <Megaphone size={13} />
                <span>Buat Campaign Pertama</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
