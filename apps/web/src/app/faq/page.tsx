"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, HelpCircle, Mail, MessageSquare, ShieldCheck, Zap } from "lucide-react";

interface FaqCategory {
  title: string;
  items: { q: string; a: string }[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    title: "Untuk Clipper & Editor Video",
    items: [
      {
        q: "Bagaimana cara mulai menghasilkan uang dari ClipStream AI?",
        a: "Cukup login ke platform, pilih kampanye bounty yang sedang aktif di Marketplace Kampanye, unduh bahan video yang disediakan, edit menjadi klip vertikal menarik dengan menyertakan watermark sponsor, dan unggah ke TikTok, YouTube Shorts, atau Instagram Reels. Setelah itu, submit link postingan Anda di dashboard Clipper.",
      },
      {
        q: "Kapan saya akan menerima pembayaran USDT?",
        a: "Pembayaran dipicu otomatis oleh smart contract di BNB Chain begitu video klip Anda mencapai target minimal views (misalnya 1.000 views) dan diverifikasi oleh AI kami. Dana langsung masuk ke wallet Anda tanpa perlu menunggu persetujuan admin manual.",
      },
      {
        q: "Apakah saya harus membayar biaya gas fee saat menerima uang?",
        a: "Tidak. ClipStream AI menggunakan teknologi Gasless Relayer (EIP-2771 meta-transactions) sehingga seluruh biaya gas on-chain ditanggung oleh sistem. Anda menerima 100% USDT bersih.",
      },
    ],
  },
  {
    title: "Untuk Brand & Sponsor",
    items: [
      {
        q: "Bagaimana cara membuat kampanye bounty untuk bisnis saya?",
        a: "Masuk ke menu 'Pasang Bounty Brand', tentukan judul, masukkan link video podcast atau webinar YouTube Anda, tentukan tarif CPM (misal Rp 20.000 / 1.000 views) dan batas maksimal per video. Setelah itu, depositkan budget USDT ke smart contract escrow di BNB Chain.",
      },
      {
        q: "Bagaimana jika ada sisa budget saat kampanye selesai?",
        a: "Smart contract memiliki fitur Emergency Timelock Refund. Jika durasi kampanye berakhir dan masih ada saldo yang belum terserap, Anda dapat menarik kembali sisa saldo USDT langsung ke wallet Anda dengan 1 klik.",
      },
      {
        q: "Bagaimana AI memastikan klip mematuhi aturan sponsor?",
        a: "AI Multi-Modal kami menggabungkan Whisper (mendeteksi sebutan nama brand dan punchline pada audio) dan Gemini Vision (mendeteksi logo visual dan penempatan watermark pada frame video) sebelum menyetujui klaim views.",
      },
    ],
  },
  {
    title: "Keamanan, Blockchain, & Teknis",
    items: [
      {
        q: "Di jaringan blockchain mana ClipStream AI beroperasi?",
        a: "ClipStream AI beroperasi di BNB Chain (Binance Smart Chain) dengan dukungan token USDT/USDC BEP-20 untuk kecepatan transaksi tinggi dan efisiensi gas fee maksimal.",
      },
      {
        q: "Apakah smart contract ClipStream AI aman?",
        a: "Ya, arsitektur smart contract kami dibangun menggunakan library standar OpenZeppelin dengan proteksi reentrancy guard dan telah melalui audit keamanan independen.",
      },
    ],
  },
];

export default function HelpFaqPage() {
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f6f5f3", paddingTop: "5.5rem", paddingBottom: "5rem" }}>
      <div className="am-container" style={{ maxWidth: "900px", margin: "0 auto", paddingLeft: "clamp(1rem, 3vw, 2rem)", paddingRight: "clamp(1rem, 3vw, 2rem)" }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
          >
            <ArrowLeft size={13} />
            <span>Beranda</span>
          </Link>
          <span style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.3)" }}>/</span>
          <span style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", fontWeight: 500 }}>
            Resources &amp; Support
          </span>
        </div>

        {/* Header */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            padding: "clamp(1.75rem, 5vw, 3rem)",
            border: "1px solid rgba(17, 17, 17, 0.08)",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.03)",
            marginBottom: "2.5rem",
            textAlign: "center",
          }}
        >
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
              marginBottom: "1rem",
            }}
          >
            <HelpCircle size={14} style={{ color: "#e8400d" }} />
            <span>PUSAT BANTUAN &amp; FAQ</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              color: "#111",
              marginBottom: "0.75rem",
              fontFamily: "'Labil Grotesk Variable', sans-serif",
            }}
          >
            Pertanyaan yang Sering Diajukan
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(17, 17, 17, 0.65)", maxWidth: "38rem", margin: "0 auto" }}>
            Temukan jawaban lengkap seputar cara kerja escrow, verifikasi AI, panduan clipper, dan pembayaran di BNB Chain.
          </p>
        </div>

        {/* FAQ Accordions by Category */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "3rem" }}>
          {FAQ_DATA.map((cat, catIdx) => (
            <div
              key={catIdx}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "clamp(1.25rem, 3.5vw, 2rem)",
                border: "1px solid rgba(17, 17, 17, 0.08)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#111",
                  letterSpacing: "-0.02em",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#e8400d" }} />
                <span>{cat.title}</span>
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {cat.items.map((item, itemIdx) => {
                  const id = `${catIdx}-${itemIdx}`;
                  const isOpen = openIndex === id;

                  return (
                    <div
                      key={itemIdx}
                      style={{
                        borderRadius: "14px",
                        border: isOpen ? "1px solid rgba(17, 17, 17, 0.18)" : "1px solid rgba(17, 17, 17, 0.06)",
                        backgroundColor: isOpen ? "#fbfaf9" : "#ffffff",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        style={{
                          width: "100%",
                          padding: "1rem 1.25rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          gap: "1rem",
                        }}
                      >
                        <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#111" }}>
                          {item.q}
                        </span>
                        <ChevronDown
                          size={16}
                          style={{
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                            flexShrink: 0,
                            color: "rgba(17, 17, 17, 0.5)",
                          }}
                        />
                      </button>

                      {isOpen && (
                        <div
                          style={{
                            padding: "0 1.25rem 1.25rem 1.25rem",
                            fontSize: "0.875rem",
                            lineHeight: 1.6,
                            color: "rgba(17, 17, 17, 0.75)",
                          }}
                        >
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support Box */}
        <div
          style={{
            backgroundColor: "#111111",
            color: "#ffffff",
            borderRadius: "20px",
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              Punya pertanyaan lain yang belum terjawab?
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255, 255, 255, 0.7)" }}>
              Tim komunitas dan teknis kami siap membantu Anda 24/7 melalui email atau Discord.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <a
              href="mailto:support@clipstream.ai"
              style={{
                backgroundColor: "#ffffff",
                color: "#111111",
                padding: "0.625rem 1.25rem",
                borderRadius: "9999px",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Mail size={14} />
              <span>Hubungi Support</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
