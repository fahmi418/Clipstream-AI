"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Play,
  Check,
  Video,
  Sparkles,
  TrendingUp,
  Coins,
  Cpu,
  Layers,
  Lock,
  Eye,
  CheckCircle2,
  Bot,
  Scissors,
  Megaphone,
  Users,
  Rocket,
  Star,
} from "lucide-react";
import { fetchStats, listCampaigns, type Stats, type Campaign } from "@/lib/api";
import { formatUsdt, formatIdr, formatViews } from "@/lib/format";
import { RoleSelectModal } from "@/components/RoleSelectModal";
import { HeroCreatorRocket } from "@/components/HeroCreatorRocket";
import { ScrollReveal } from "@/components/ScrollReveal";
import { IconBadge } from "@/components/ui/IconBadge";
import {
  PERSONAS_DATA,
  FEATURE_SECTIONS,
  TESTIMONIALS_DATA,
  TICKER_UPDATES,
} from "@/data/landing-content";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PERSONA_CONFIG = [
  {
    ...PERSONAS_DATA[0],
    role: "Clipper",
    icon: Scissors,
    image: "/assets/66aca46a2e87f778fe899f3b_am_6_personas_sellers%202.avif",
  },
  {
    ...PERSONAS_DATA[1],
    role: "Brand",
    icon: Megaphone,
    image: "/assets/66aca84f860e0b6ca0cabcda_am_8_personas_founders_2%202.avif",
  },
  {
    ...PERSONAS_DATA[2],
    role: "Agency",
    icon: Users,
    image: "/assets/66aca8430056a00245b85bf7_am_7_personas_sales_leaders%202.avif",
  },
  {
    ...PERSONAS_DATA[3],
    role: "Validator",
    icon: Bot,
    image: "/assets/66aca84f1064e578674a4da0_am_9_personas_revops%202.avif",
  },
  {
    ...PERSONAS_DATA[4],
    role: "Ekosistem Web3",
    icon: Layers,
    image: "/assets/66aca84f84f3bc82100d704e_am_10_personas_marketers%202.avif",
  },
];

const defaultLandingDemoCampaigns: Campaign[] = [
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
];

function HomePageContent() {
  const searchParams = useSearchParams();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Tab States
  const [activePillar, setActivePillar] = useState<number>(1);
  const [activePersona, setActivePersona] = useState<number>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // GSAP Container & Transition Refs
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const personaContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowRoleModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    Promise.all([
      fetchStats().catch(() => null),
      listCampaigns({ status: "ACTIVE", limit: 3 }).catch(() => []),
    ]).then(([statsData, campaignsData]) => {
      if (statsData) setStats(statsData);
      if (campaignsData && Array.isArray(campaignsData)) setCampaigns(campaignsData);
      setLoading(false);
      // Refresh ScrollTrigger after async layout load
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    });
  }, []);

  // GSAP Master Timelines and ScrollTrigger Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Staggered Entrance
      const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

      heroTl
        .fromTo(
          ".gsap-hero-badge",
          { opacity: 0, y: -18, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6 }
        )
        .fromTo(
          ".gsap-hero-heading",
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.85 },
          "-=0.35"
        )
        .fromTo(
          ".gsap-hero-desc",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.55"
        )
        .fromTo(
          ".gsap-hero-cta-btn",
          { opacity: 0, y: 20, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 },
          "-=0.4"
        )
        .fromTo(
          ".gsap-hero-proof",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          ".gsap-hero-rocket",
          { opacity: 0, x: 50, y: 30, scale: 0.88 },
          { opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: "back.out(1.3)" },
          "-=0.8"
        );

      // Continuous organic float for rocket
      gsap.to(".gsap-hero-rocket-inner", {
        y: "-=14",
        rotation: 1.5,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Scroll Parallax for Hero Ambient Glow & Rocket
      gsap.to(".gsap-hero-glow", {
        y: 130,
        ease: "none",
        scrollTrigger: {
          trigger: ".am-home-hero-content",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(".gsap-hero-rocket", {
        y: 90,
        ease: "none",
        scrollTrigger: {
          trigger: ".am-home-hero-content",
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // 2. Section 2: Platform 8-Grid Bento Scroll Reveal
      gsap.fromTo(
        ".platform-tile",
        { opacity: 0, y: 35, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".platform-tiles-grid",
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      // Testimonial 1 reveal
      gsap.fromTo(
        ".gsap-testimonial-1",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-testimonial-1",
            start: "top 85%",
            once: true,
          },
        }
      );

      // Bento cards: platform rows + timeline steps slide in, log lines type in
      gsap.fromTo(
        ".am-plat-row, .am-tl-step",
        { opacity: 0, x: -14 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".am-bento-grid",
            start: "top 78%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".am-term-line",
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".am-bento-grid",
            start: "top 78%",
            once: true,
          },
        }
      );

      // Testimonial 2 reveal
      gsap.fromTo(
        ".gsap-testimonial-2",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-testimonial-2",
            start: "top 85%",
            once: true,
          },
        }
      );

      // 4. Section 5: Midnight Indigo Journey Banner
      gsap.fromTo(
        ".gsap-midnight-banner",
        { opacity: 0, scale: 0.95, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-midnight-banner",
            start: "top 85%",
            once: true,
          },
        }
      );

      // 5. Section 6: Personas Section Reveal
      gsap.fromTo(
        ".am-personas-wrapper",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".am-personas-wrapper",
            start: "top 85%",
            once: true,
          },
        }
      );

      // 6. Section 7: Bento Customer Stories / Results Grid
      gsap.fromTo(
        ".bento-results-grid > div",
        { opacity: 0, y: 35, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".bento-results-grid",
            start: "top 85%",
            once: true,
          },
        }
      );

      // 7. Section 8: Active Campaigns Grid (Safe query guard)
      if (document.querySelector(".gsap-campaign-card")) {
        gsap.fromTo(
          ".gsap-campaign-card",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".gsap-campaigns-container",
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // 8. Section 9: Blog Articles Grid
      if (document.querySelector(".gsap-blog-card")) {
        gsap.fromTo(
          ".gsap-blog-card",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".gsap-blog-grid",
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // 9. Section 10: Wall of Love Testimonial Cards
      if (document.querySelector(".gsap-wall-card")) {
        gsap.fromTo(
          ".gsap-wall-card",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".gsap-wall-grid",
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // 10. Section 11: FAQ Accordion items
      if (document.querySelector(".gsap-faq-item")) {
        gsap.fromTo(
          ".gsap-faq-item",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".gsap-faq-list",
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // 11. Section 12: Pre-Footer Banner
      if (document.querySelector(".gsap-footer-cta")) {
        gsap.fromTo(
          ".gsap-footer-cta",
          { opacity: 0, y: 35, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".gsap-footer-cta",
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    }, mainContainerRef);

    return () => ctx.revert();
  }, []);

  // Animate tab transitions when user clicks Pillar tabs
  useEffect(() => {
    if (tabContentRef.current) {
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, y: 14, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [activePillar]);

  // Animate persona transition when user clicks Persona tabs
  useEffect(() => {
    if (personaContentRef.current) {
      gsap.fromTo(
        personaContentRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [activePersona]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div ref={mainContainerRef} className="flex flex-col w-full">
      {/* ── 1. HERO SECTION (Amplemarket Reference Hero) ──────────────── */}
      <section
        className="am-section"
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "5rem",
          paddingBottom: "2.5rem",
          boxSizing: "border-box",
        }}
      >
        {/* Bespoke ClipStream Aesthetic Ambient Glow Mesh (Emerald + Amber + Violet with Grain) */}
        <div
          className="gsap-hero-glow"
          style={{
            position: "absolute",
            top: "-8%",
            left: "-10%",
            width: "55%",
            height: "95%",
            background:
                "radial-gradient(ellipse at 30% 35%, rgba(0, 208, 132, 0.24) 0%, rgba(245, 158, 11, 0.26) 28%, rgba(251, 113, 133, 0.18) 50%, rgba(139, 92, 246, 0.15) 68%, transparent 82%)",
            filter: "blur(54px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Aesthetic SVG Grain Texture Overlay */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: 0.38,
            mixBlendMode: "overlay",
            zIndex: 0,
          }}
        >
          <filter id="hero-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-grain)" />
        </svg>

        {/* Bespoke Original ClipStream Creator Rocket Vector Illustration */}
        <HeroCreatorRocket className="gsap-hero-rocket" />

        <div className="am-container" style={{ position: "relative", zIndex: 1, paddingLeft: "1rem", paddingRight: "1rem", width: "100%" }}>
          <div className="am-home-hero-content" style={{ paddingTop: "0.25rem", width: "100%", alignItems: "center" }}>
            <div className="am-home-hero-content-top" style={{ width: "100%" }}>
              <div className="am-home-hero-content-top-text" style={{ maxWidth: "64rem", margin: "0 auto", textAlign: "center", width: "100%" }}>
                <div className="am-home-hero-heading-wrapper" style={{ maxWidth: "60rem", margin: "0 auto", width: "100%" }}>
                  {/* Eyebrow Link / Badge */}
                  <Link href="/campaigns" className="am-featured-link w-inline-block gsap-hero-badge" style={{ maxWidth: "100%", whiteSpace: "normal", marginBottom: "0.75rem" }}>
                    <div className="am-new-label is-black" style={{ flexShrink: 0 }}>
                      <div>BNB CHAIN 2026</div>
                    </div>
                    <div className="am-opacity-80" style={{ fontSize: "0.8125rem" }}>
                      Kreator + AI Agent Escrow Ecosystem →
                    </div>
                  </Link>

                  {/* Main Display Title - Wide, breathing, balanced */}
                  <h1
                    className="am-heading-56 am-text-align-center gsap-hero-heading"
                    style={{
                      maxWidth: "58rem",
                      margin: "0 auto",
                      fontSize: "clamp(1.85rem, 5.5vw, 4.25rem)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.035em",
                      fontWeight: 800,
                      fontFamily: "'Labil Grotesk Variable', sans-serif",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    <span>Kl</span>ip <span className="am-alternate">ka</span>mu, diba
                    <span className="am-alternate">yar</span> oto
                    <span className="am-alternate">ma</span>tis: Kreator + AI
                  </h1>
                </div>

                {/* Subtitle - Wider and comfortably spaced */}
                <p
                  className="am-paragraph-20 am-opacity-60 am-text-align-center gsap-hero-desc"
                  style={{
                    maxWidth: "46rem",
                    margin: "1rem auto 0 auto",
                    fontSize: "clamp(0.9375rem, 2vw, 1.1875rem)",
                    lineHeight: 1.6,
                    color: "rgba(17, 17, 17, 0.68)",
                    padding: "0 0.25rem",
                  }}
                >
                  Platform escrow video terdesentralisasi pertama di BNB Chain. Upload klip TikTok,
                  Shorts, atau Reels kamu — AI Agent memverifikasi views dan mentransfer USDT langsung
                  ke wallet tanpa nunggu approval admin.
                </p>
              </div>

              {/* Dual Action CTAs for Clipper & Brand */}
              <div style={{ marginTop: "1.75rem", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    width: "100%",
                    maxWidth: "480px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(true)}
                    className="am-nav-btn gsap-hero-cta-btn w-full sm:w-auto"
                    style={{
                      backgroundColor: "#111111",
                      color: "#ffffff",
                      borderRadius: "9999px",
                      padding: "0.75rem 1.625rem",
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      minWidth: "200px",
                    }}
                  >
                    <span>Daftar sebagai Clipper</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRoleModal(true)}
                    className="am-nav-btn is-secondary gsap-hero-cta-btn w-full sm:w-auto"
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
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      minWidth: "200px",
                    }}
                  >
                    <span>Pasang Bounty Brand</span>
                  </button>
                </div>

                {/* Social Proof Stripe with CertiK & OpenZeppelin Security Audit */}
                <div
                  className="am-social-proof-stripe is-dark gsap-hero-proof"
                  style={{
                    marginTop: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    maxWidth: "100%",
                    padding: "0 0.5rem",
                  }}
                >
                  <div className="am-social-proof-stars" style={{ display: "flex", alignItems: "center" }}>
                    <div className="am-social-proof-link w-inline-block">
                      <img
                        src="/assets/669e737879aa8335b500699a_g2-starts.svg"
                        loading="eager"
                        alt="Kreator reviews 5 stars"
                        className="am-image"
                        style={{ maxHeight: "20px" }}
                      />
                    </div>
                  </div>
                  <div className="am-vertical-divider hidden sm:block"></div>
                  <div
                    className="am-social-proof-gartner-wrapper am-social-proof-link w-inline-block"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      textAlign: "center",
                    }}
                  >
                    <ShieldCheck size={16} style={{ color: "#00d084", flexShrink: 0 }} />
                    <div
                      className="am-social-proof-gartner-text"
                      style={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4, whiteSpace: "normal" }}
                    >
                      Audit Keamanan Smart Contract oleh <span style={{ color: "#111", fontWeight: 700 }}>CertiK</span> &amp; Standar OpenZeppelin
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUSTED BY / MIGRATED OFF 8-GRID BENTO ─────────────────── */}
      <section className="am-section am-padding-100 am-padding-bottom-144" style={{ paddingTop: "5rem", paddingBottom: "7rem" }}>
        <div className="am-container">
          <div className="am-social-proof-wrapper">
            <div className="am-logos-migrated-section">
              <ScrollReveal>
                <h2 className="am-heading-28" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                  Beralih dari sistem manual lama ke ClipStream AI
                </h2>
              </ScrollReveal>

              {/* Clean 8-Card Grid with Normal 1px Borders */}
              <div className="platform-tiles-grid">
                {/* Tile 1: YouTube Shorts */}
                <div className="platform-tile">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="6" fill="#FF0000" />
                      <polygon points="10,7 16,12 10,17" fill="#ffffff" />
                    </svg>
                    <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>YouTube Shorts</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(17, 17, 17, 0.6)", lineHeight: 1.45, marginBottom: "0.625rem" }}>
                      Beralih dari YouTube manual approvals
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                      <span>Lihat kreator →</span>
                    </div>
                  </div>
                </div>

                {/* Tile 2: TikTok */}
                <div className="platform-tile">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#000000">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.902 2.896 2.897 2.897 0 0 1-2.896-2.896 2.897 2.897 0 0 1 2.896-2.896c.294 0 .576.046.842.128V9.43a6.37 6.37 0 0 0-.842-.057A6.34 6.34 0 0 0 3 15.668 6.34 6.34 0 0 0 9.368 22a6.34 6.34 0 0 0 6.368-6.332V9.08a8.212 8.212 0 0 0 4.853 1.574V7.21a4.814 4.814 0 0 1-1-.524z" />
                    </svg>
                    <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>TikTok</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(17, 17, 17, 0.6)", lineHeight: 1.45, marginBottom: "0.625rem" }}>
                      Beralih dari shadowban &amp; bio link manual
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                      <span>Lihat kreator →</span>
                    </div>
                  </div>
                </div>

                {/* Tile 3: Instagram Reels */}
                <div className="platform-tile">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="2.2" />
                      <circle cx="12" cy="12" r="4.5" stroke="#E1306C" strokeWidth="2.2" />
                      <circle cx="17.5" cy="6.5" r="1.2" fill="#E1306C" />
                    </svg>
                    <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>Instagram Reels</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(17, 17, 17, 0.6)", lineHeight: 1.45, marginBottom: "0.625rem" }}>
                      Beralih dari invoice agency tanpa verifikasi
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                      <span>Lihat kreator →</span>
                    </div>
                  </div>
                </div>

                {/* Tile 4: BNB Chain */}
                <div className="platform-tile">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                    <svg width="26" height="26" viewBox="0 0 32 32" fill="#F3BA2F">
                      <path d="M16 2l4.1 4.1-8.2 8.2L7.8 10.2 16 2zm0 28l-4.1-4.1 8.2-8.2 4.1 4.1L16 30zm-9.9-14l-4.1 4.1L2 16l4.1-4.1 4.1 4.1-4.1 4.1zm19.8 0l4.1-4.1L30 16l-4.1 4.1-4.1-4.1 4.1-4.1zM16 11.9l4.1 4.1-4.1 4.1-4.1-4.1 4.1-4.1z" />
                    </svg>
                    <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>BNB Chain</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(17, 17, 17, 0.6)", lineHeight: 1.45, marginBottom: "0.625rem" }}>
                      Beralih dari transfer bank berhari-hari
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                      <span>Jelajahi on-chain →</span>
                    </div>
                  </div>
                </div>

                {/* Tile 5: CertiK Verified */}
                <div className="platform-tile">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                    <ShieldCheck size={26} style={{ color: "#00d084" }} />
                    <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>CertiK Verified</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(17, 17, 17, 0.6)", lineHeight: 1.45, marginBottom: "0.625rem" }}>
                      Beralih dari bot escrow manual Telegram
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                      <span>Audit keamanan →</span>
                    </div>
                  </div>
                </div>

                {/* Tile 6: IPFS Storage */}
                <div className="platform-tile">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                    <Layers size={26} style={{ color: "#06b6d4" }} />
                    <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>IPFS Storage</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(17, 17, 17, 0.6)", lineHeight: 1.45, marginBottom: "0.625rem" }}>
                      Beralih dari spreadsheet Discord berantakan
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                      <span>Protokol data →</span>
                    </div>
                  </div>
                </div>

                {/* Tile 7: Timelock Escrow */}
                <div className="platform-tile">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                    <Lock size={26} style={{ color: "#7c3aed" }} />
                    <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>Timelock Escrow</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(17, 17, 17, 0.6)", lineHeight: 1.45, marginBottom: "0.625rem" }}>
                      Beralih dari pembayaran net-60 tertunda
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                      <span>Aturan timelock →</span>
                    </div>
                  </div>
                </div>

                {/* Tile 8: Whisper AI */}
                <div className="platform-tile" style={{ borderRight: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                    <Bot size={26} style={{ color: "#e8400d" }} />
                    <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>Whisper AI</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(17, 17, 17, 0.6)", lineHeight: 1.45, marginBottom: "0.625rem" }}>
                      Beralih dari verifikasi audio manual
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                      <span>Lihat AI pipeline →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 1 */}
            <div data-testimonial-color-mode="light" className="am-testimonial-wrapper-new gsap-testimonial-1" style={{ marginTop: "5rem" }}>
              <div className="am-testimonial-inner-wrapper">
                <div className="am-testimonial-text-wrapper">
                  <p data-testimonial-text-size="normal" className="am-heading-36 am-is-line-height-120 am-text-wrap-pretty">
                    &ldquo;ClipStream AI seperti asisten escrow pribadi yang nggak pernah tidur. AI verifikasinya sangat cepat, langsung mengecek watermark &amp; views klip TikTok saya, dan mentransfer USDT tanpa menunggu approval brand berhari-hari.&rdquo;
                  </p>
                </div>

                <div className="am-testiminial-info-wrapper">
                  <div className="am-testimonial-user-wrapper">
                    <div className="am-testimonial-user-text">
                      <div className="am-paragraph-16" style={{ fontWeight: 700, color: "#111" }}>Rizky Pratama</div>
                      <div className="am-paragraph-16 am-opacity-60">Top Video Clipper (5.2M Views)</div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "9999px",
                      backgroundColor: "#fef9c3",
                      border: "1px solid rgba(234, 179, 8, 0.3)",
                      color: "#854d0e",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                    className="am-hide-mobile"
                  >
                    <CheckCircle2 size={14} style={{ color: "#ca8a04" }} />
                    <span>BNB Chain Verified Clipper</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. DARK SECTION: DUO AI AGENT COPILOT ─────────────────────── */}
      <section className="am-section am-is-black-bg" style={{ backgroundColor: "#272625", color: "#fff", paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="am-duo-section am-padding-100 am-no-padding-bottom">
          <div className="am-container">
            <div className="am-ai-assistant-content">
              <div className="am-ai-assistant-content-top">
                <div className="am-ai-assistant-content-text">
                  <div className="am-ai-assistant-heading-wrapper">
                    <div className="am-featured-link is-dark am-no-hover">
                      <div className="am-new-label-wrapper">
                        <div className="am-new-label is-dark is-bg">
                          <div>AGENT</div>
                        </div>
                        <div className="am-new-label is-dark">
                          <div>AGENT</div>
                        </div>
                        <div className="am-grain-button"></div>
                      </div>
                      <div className="am-opacity-80">AI Verifier Copilot</div>
                    </div>

                    <ScrollReveal delay={100}>
                      <h2 className="am-heading-44 am-is-white am-text-align-center am-text-wrap-balance">
                        Tra<span className="am-alternate">nsf</span>ormasi cara{" "}
                        <span className="am-alternate">veri</span>fikasi klip dengan{" "}
                        <span className="am-alternate">AI</span> Agent
                      </h2>
                    </ScrollReveal>
                  </div>

                  <p className="am-paragraph-16 am-opacity-60 am-text-align-center is-white am-max-width-400-same">
                    Hemat puluhan jam setiap minggu dengan deteksi otomatis audio Whisper, tracking views
                    lintas platform, dan pencairan smart contract timelock escrow.
                  </p>
                </div>

                <Link href="/campaigns" className="am-nav-btn is-light is-mobile-center w-button">
                  Jelajahi AI Agent →
                </Link>
              </div>

              {/* Bento feature grid (original, reference-inspired style only) */}
              <div className="am-ai-assistant-interaction-wrapper" style={{ position: "relative", marginTop: "3rem" }}>
                <div className="am-bento-grid">
                  {/* A — Audio Whisper waveform */}
                  <ScrollReveal className="am-bento-card is-light is-span-2">
                    <div className="am-bento-visual is-wave">
                      <div className="am-wave" aria-hidden="true">
                        {Array.from({ length: 44 }, (_, i) => (
                          <span
                            key={i}
                            className={`am-wave-bar${i < 41 ? " is-match" : ""}`}
                            style={{ height: `${30 + ((i * 37) % 65)}%`, animationDelay: `${(i % 12) * 0.07}s` }}
                          />
                        ))}
                      </div>
                      <div className="am-wave-meta">
                        <span className="am-wave-dot" />
                        <span className="am-wave-match">Match 92%</span>
                        <span className="am-wave-sub">· deteksi 2.4 dtk</span>
                      </div>
                    </div>
                    <div className="am-bento-body">
                      <div className="am-bento-title">Deteksi Audio Whisper</div>
                      <div className="am-bento-desc">Waveform klip dicocokkan otomatis dengan sumber asli — tahu match atau tidak dalam hitungan detik.</div>
                    </div>
                  </ScrollReveal>

                  {/* B — Cross-platform view tracking */}
                  <ScrollReveal className="am-bento-card is-light" delay={80}>
                    <div className="am-bento-body">
                      <div className="am-bento-title">16+ Platform Terdeteksi</div>
                      <div className="am-bento-desc">Views terhitung otomatis lintas platform dalam satu dashboard.</div>
                    </div>
                    <div className="am-plat-list">
                      {[
                        { name: "TikTok", color: "#ff4b6e", views: "2.4M" },
                        { name: "YouTube Shorts", color: "#ff2e2e", views: "860K" },
                        { name: "Instagram Reels", color: "#e1306c", views: "1.1M" },
                      ].map((p) => (
                        <div key={p.name} className="am-plat-row">
                          <span className="am-plat-dot" style={{ backgroundColor: p.color }} />
                          <span className="am-plat-name">{p.name}</span>
                          <span className="am-plat-views">{p.views}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollReveal>

                  {/* C — Escrow release timeline */}
                  <ScrollReveal className="am-bento-card is-light" delay={160}>
                    <div className="am-bento-body">
                      <div className="am-bento-title">Escrow Otomatis</div>
                      <div className="am-bento-desc">Smart contract menahan dan mencair dana tanpa pihak ketiga.</div>
                    </div>
                    <div className="am-tl">
                      <div className="am-tl-step is-done">
                        <span className="am-tl-mark"><Check size={12} strokeWidth={3} /></span>
                        <span className="am-tl-text">Klip diverifikasi</span>
                      </div>
                      <div className="am-tl-step is-active">
                        <span className="am-tl-mark" />
                        <span className="am-tl-text">Target tercapai</span>
                      </div>
                      <div className="am-tl-step">
                        <span className="am-tl-mark" />
                        <span className="am-tl-text">Dana cair USDT</span>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* D — Live audit log (dark) */}
                  <ScrollReveal className="am-bento-card is-dark is-span-2" delay={240}>
                    <div className="am-term">
                      <div className="am-term-line"><span className="am-term-ok">✓</span><span className="am-term-cmd">whisper.audio_match</span><span className="am-term-val">92%</span><span className="am-term-time">1.2s</span></div>
                      <div className="am-term-line"><span className="am-term-ok">✓</span><span className="am-term-cmd">gemini.vision.watermark</span><span className="am-term-val">pass</span><span className="am-term-time">0.8s</span></div>
                      <div className="am-term-line"><span className="am-term-ok">✓</span><span className="am-term-cmd">oracle.views</span><span className="am-term-val">860,432</span><span className="am-term-time">0.4s</span></div>
                      <div className="am-term-line is-running"><span className="am-term-live">●</span><span className="am-term-cmd">escrow.release</span><span className="am-term-val">standby</span><span className="am-term-cursor" /></div>
                    </div>
                    <div className="am-bento-body is-row">
                      <div className="am-bento-title is-white">Log Audit Real-Time</div>
                      <div className="am-bento-desc is-on-dark">Setiap pemeriksaan AI agent tercatat dan bisa kamu buktikan ke brand.</div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Row Busy Multi-Directional Marquee Ticker */}
          <div className="am-container" style={{ marginTop: "4rem" }}>
            <div id="duo-signals" className="am-padding-144" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
              <div className="am-duo-signals-wrapper">
                <h3 className="am-heading-24 am-is-white am-opacity-60" style={{ textAlign: "center", marginBottom: "2rem" }}>
                  Aktivitas Verifikasi &amp; Pencairan Real-Time
                </h3>

                <div
                  style={{
                    overflow: "hidden",
                    position: "relative",
                    width: "100%",
                    maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                    padding: "0.5rem 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {/* Row 1: Scrolling Left */}
                  <div
                    className="animate-marquee"
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                      width: "max-content",
                    }}
                  >
                    {[
                      { color: "#ff4b6e", text: "@fajar_clip lolos verifikasi sponsor TikTok (145k views)" },
                      { color: "#00d084", text: "Escrow 450 USDT dicairkan ke wallet 0x8f...3a1c" },
                      { color: "#f59e0b", text: "YouTube Shorts #web3 disetujui Gemini Vision Flash" },
                      { color: "#3b82f6", text: "Brand GameFi menambah pool bounty 2,500 USDT di BNB Chain" },
                      { color: "#a855f7", text: "Whisper AI memverifikasi audio mention sponsor otomatis dari rekaman klip" },
                      { color: "#06b6d4", text: "@rizky_editor klaim reward 185 USDT via timelock smart contract" },
                      { color: "#ec4899", text: "Klip video TikTok @andi_viral lolos deduplikasi 100%" },
                      { color: "#10b981", text: "Campaign 'Web3 Edu' mencapai 2.4M views organik" },
                      { color: "#f97316", text: "Smart contract timelock release 1,200 USDT ke 8 kreator" },
                      { color: "#6366f1", text: "@maya_creative submit 3 klip baru untuk brand FinTech" },
                      { color: "#14b8a6", text: "Batch verifikasi OCR 65 klip selesai dalam 14 detik" },
                      { color: "#eab308", text: "Pool hadiah 'DeFi Summit' ditambah 5,000 USDT on-chain" },
                      { color: "#00d084", text: "Crawler API feed terverifikasi memvalidasi 84,000 views TikTok secara berkala" },
                      { color: "#ff4b6e", text: "@dian_shorts klaim 75 USDT reward CPM tier 1" },
                      { color: "#3b82f6", text: "Klip IG Reels @agus_streamer terverifikasi watermark sponsor" },
                      { color: "#a855f7", text: "Zero platform fee: 100% bounty dialokasikan ke kreator" },
                      // Duplicate for seamless infinite loop
                      { color: "#ff4b6e", text: "@fajar_clip lolos verifikasi sponsor TikTok (145k views)" },
                      { color: "#00d084", text: "Escrow 450 USDT dicairkan ke wallet 0x8f...3a1c" },
                      { color: "#f59e0b", text: "YouTube Shorts #web3 disetujui Gemini Vision Flash" },
                      { color: "#3b82f6", text: "Brand GameFi menambah pool bounty 2,500 USDT di BNB Chain" },
                      { color: "#a855f7", text: "Whisper AI memverifikasi audio mention sponsor otomatis dari rekaman klip" },
                      { color: "#06b6d4", text: "@rizky_editor klaim reward 185 USDT via timelock smart contract" },
                      { color: "#ec4899", text: "Klip video TikTok @andi_viral lolos deduplikasi 100%" },
                      { color: "#10b981", text: "Campaign 'Web3 Edu' mencapai 2.4M views organik" },
                      { color: "#f97316", text: "Smart contract timelock release 1,200 USDT ke 8 kreator" },
                      { color: "#6366f1", text: "@maya_creative submit 3 klip baru untuk brand FinTech" },
                      { color: "#14b8a6", text: "Batch verifikasi OCR 65 klip selesai dalam 14 detik" },
                      { color: "#eab308", text: "Pool hadiah 'DeFi Summit' ditambah 5,000 USDT on-chain" },
                      { color: "#00d084", text: "Crawler API feed terverifikasi memvalidasi 84,000 views TikTok secara berkala" },
                      { color: "#ff4b6e", text: "@dian_shorts klaim 75 USDT reward CPM tier 1" },
                      { color: "#3b82f6", text: "Klip IG Reels @agus_streamer terverifikasi watermark sponsor" },
                      { color: "#a855f7", text: "Zero platform fee: 100% bounty dialokasikan ke kreator" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.07)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "9999px",
                          padding: "0.45rem 1rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.625rem",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                          flexShrink: 0,
                          userSelect: "none",
                        }}
                      >
                        <div style={{ width: "9px", height: "9px", borderRadius: "2px", backgroundColor: item.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#e5e7eb", whiteSpace: "nowrap" }}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Row 2: Scrolling Right (Reverse) */}
                  <div
                    className="animate-marquee-reverse"
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                      width: "max-content",
                    }}
                  >
                    {[
                      { color: "#f97316", text: "Brand Web3 Gaming mendanai pool 6,000 USDT di BNB Chain" },
                      { color: "#00d084", text: "Smart contract timelock melepaskan 1,850 USDT otomatis" },
                      { color: "#06b6d4", text: "@budi_clipper menerima 125 USDT dari kampanye viral" },
                      { color: "#a855f7", text: "Verifikasi OCR views selesai dalam 11 detik tanpa delay" },
                      { color: "#eab308", text: "Brand D2C meluncurkan kampanye klip video 10,000 USDT" },
                      { color: "#ff4b6e", text: "Validator node menyetujui batch 40 klip video komunitas" },
                      { color: "#10b981", text: "@mega_content tembus 620k views di YouTube Shorts" },
                      { color: "#f59e0b", text: "Payout instan gas fee hanya 0.0003 BNB di BNB Chain" },
                      { color: "#3b82f6", text: "AI Agent memverifikasi watermark sponsor 1080p 60fps" },
                      { color: "#ec4899", text: "@hendra_clips cairkan reward ke MetaMask sukses" },
                      { color: "#14b8a6", text: "Kampanye 'AI Productivity' tuntas dengan 3.1M impresi" },
                      { color: "#8b5cf6", text: "Sistem anti-fraud memblokir 18 video manipulasi views" },
                      { color: "#00d084", text: "Hash video disimpan di IPFS untuk bukti orisinalitas klip" },
                      { color: "#f97316", text: "@putri_cut menerima bonus performa 90 USDT dari sponsor" },
                      { color: "#06b6d4", text: "35 video baru terdaftar dalam 10 menit terakhir" },
                      { color: "#a855f7", text: "Kontrak escrow diaudit CertiK & OpenZeppelin aman" },
                      // Duplicate for seamless infinite loop
                      { color: "#f97316", text: "Brand Web3 Gaming mendanai pool 6,000 USDT di BNB Chain" },
                      { color: "#00d084", text: "Smart contract timelock melepaskan 1,850 USDT otomatis" },
                      { color: "#06b6d4", text: "@budi_clipper menerima 125 USDT dari kampanye viral" },
                      { color: "#a855f7", text: "Verifikasi OCR views selesai dalam 11 detik tanpa delay" },
                      { color: "#eab308", text: "Brand D2C meluncurkan kampanye klip video 10,000 USDT" },
                      { color: "#ff4b6e", text: "Validator node menyetujui batch 40 klip video komunitas" },
                      { color: "#10b981", text: "@mega_content tembus 620k views di YouTube Shorts" },
                      { color: "#f59e0b", text: "Payout instan gas fee hanya 0.0003 BNB di BNB Chain" },
                      { color: "#3b82f6", text: "AI Agent memverifikasi watermark sponsor 1080p 60fps" },
                      { color: "#ec4899", text: "@hendra_clips cairkan reward ke MetaMask sukses" },
                      { color: "#14b8a6", text: "Kampanye 'AI Productivity' tuntas dengan 3.1M impresi" },
                      { color: "#8b5cf6", text: "Sistem anti-fraud memblokir 18 video manipulasi views" },
                      { color: "#00d084", text: "Hash video disimpan di IPFS untuk bukti orisinalitas klip" },
                      { color: "#f97316", text: "@putri_cut menerima bonus performa 90 USDT dari sponsor" },
                      { color: "#06b6d4", text: "35 video baru terdaftar dalam 10 menit terakhir" },
                      { color: "#a855f7", text: "Kontrak escrow diaudit CertiK & OpenZeppelin aman" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.07)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "9999px",
                          padding: "0.45rem 1rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.625rem",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                          flexShrink: 0,
                          userSelect: "none",
                        }}
                      >
                        <div style={{ width: "9px", height: "9px", borderRadius: "2px", backgroundColor: item.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#e5e7eb", whiteSpace: "nowrap" }}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Row 3: Scrolling Left (Slow) */}
                  <div
                    className="animate-marquee-slow"
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                      width: "max-content",
                    }}
                  >
                    {[...TICKER_UPDATES, ...TICKER_UPDATES].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.07)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "9999px",
                          padding: "0.45rem 1rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.625rem",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                          flexShrink: 0,
                          userSelect: "none",
                        }}
                      >
                        <div style={{ width: "9px", height: "9px", borderRadius: "2px", backgroundColor: item.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#e5e7eb", whiteSpace: "nowrap" }}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 (Dark Deel Testimonial) */}
          <div className="am-container">
            <div data-testimonial-color-mode="dark" className="am-testimonial-wrapper-new gsap-testimonial-2" style={{ marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "4rem" }}>
              <div className="am-testimonial-inner-wrapper">
                <div className="am-testimonial-text-wrapper">
                  <p data-testimonial-text-size="normal" className="am-heading-36 am-is-line-height-120 am-text-wrap-pretty" style={{ color: "#fff" }}>
                    &ldquo;Kami menjalankan 30 kampanye clipper sekaligus. Tanpa ClipStream AI, tim kami butuh 5 admin full-time untuk cek view satu per satu. Sekarang semua otomatis dan terbukti di blockchain!&rdquo;
                  </p>
                </div>

                <div className="am-testiminial-info-wrapper">
                  <div className="am-testimonial-user-wrapper">
                    <div className="am-testimonial-user-text">
                      <div className="am-paragraph-16" style={{ color: "#fff", fontWeight: 700 }}>Jonathan Kevin</div>
                      <div className="am-paragraph-16 am-opacity-60" style={{ color: "rgba(255,255,255,0.6)" }}>Campaign Director, Web3 Media Lab</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. ALL-IN-ONE PLATFORM INTERACTIVE TABS (Amplemarket Pillars) */}
      <section className="am-section am-padding-100 am-no-padding-sides-tablet am-no-padding-bottom am-max-width-1440 am-centered-margins" style={{ paddingTop: "6rem" }}>
        <div className="am-container am-is-small">
          <div className="am-pillars-content-wrapper">
            <div className="am-pillars-content-top">
              <ScrollReveal>
            <h2 className="am-heading-44 am-text-align-center am-text-wrap-balance">
              <span className="am-alternate">All</span>-in-one platform{" "}
              u<span className="am-alternate">nt</span>uk mak<span className="am-alternate">sim</span>alkan hasil klip
            </h2>
            <p className="am-paragraph-16 am-opacity-60 am-text-align-center" style={{ maxWidth: "420px", margin: "0 auto" }}>
              Otomatiskan verifikasi video dan pembayaran kreator lewat smart contract dan AI.
            </p>
          </ScrollReveal>
            </div>
            {/* 4 Interactive Tab Selector Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.625rem",
                flexWrap: "wrap",
                marginTop: "2.5rem",
                marginBottom: "2rem",
                position: "relative",
                zIndex: 2,
              }}
            >
              {[
                { id: 1, title: "Multi-Modal Verification", color: "#ff4b6e", icon: CheckCircle2 },
                { id: 2, title: "Cross-Platform Tracking", color: "#f59e0b", icon: TrendingUp },
                { id: 3, title: "Smart Escrow Protection", color: "#00d084", icon: ShieldCheck },
                { id: 4, title: "Intelligence & CPM Analytics", color: "#3b82f6", icon: Layers },
              ].map((tab) => {
                const isSelected = activePillar === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePillar(tab.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.125rem",
                      borderRadius: "9999px",
                      backgroundColor: isSelected ? "#111111" : "#ffffff",
                      color: isSelected ? "#ffffff" : "rgba(17, 17, 17, 0.7)",
                      border: isSelected ? "1px solid #111111" : "1px solid rgba(0, 0, 0, 0.08)",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: isSelected ? 600 : 500,
                      boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 6px rgba(0,0,0,0.02)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <IconBadge
                      icon={IconComponent}
                      size="xs"
                      shape="circle"
                      style={{
                        backgroundColor: isSelected ? "rgba(255, 255, 255, 0.15)" : `${tab.color}15`,
                        borderColor: isSelected ? "rgba(255, 255, 255, 0.25)" : "transparent",
                        color: isSelected ? "#ffffff" : tab.color,
                      }}
                    />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Stable Tab Body Container (Never collapses, fixes jumping bug) */}
            <div
              ref={tabContentRef}
              className="am-pillars-content-bottom"
              style={{
                position: "relative",
                minHeight: "440px",
                width: "100%",
                borderRadius: "16px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                backgroundColor: "#ffffff",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                overflow: "hidden",
                padding: "clamp(1.25rem, 3vw, 2.5rem)",
              }}
            >
              {/* Tab 1 Content: Multi-Modal Verification */}
              {activePillar === 1 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "2.5rem",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ff4b6e" }} />
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#ff4b6e" }}>
                        MULTI-MODAL VERIFICATION
                      </span>
                    </div>
                    <h3 className="am-heading-36" style={{ margin: 0, fontSize: "2rem", lineHeight: 1.25 }}>
                      Data akurat, hasil maksimal tanpa manipulasi
                    </h3>
                    <p className="am-paragraph-16 am-opacity-60" style={{ margin: 0, lineHeight: 1.6 }}>
                      Deteksi transkripsi audio lewat Whisper dan visual Gemini 1.5 Flash untuk memvalidasi watermark sponsor dan kesesuaian konten secara otomatis.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#00d084", flexShrink: 0 }} /> Audio fingerprint matching transkrip sponsor otomatis
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#00d084", flexShrink: 0 }} /> Deteksi watermark sponsor pada detik tertentu
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#00d084", flexShrink: 0 }} /> Otomatisasi approval tanpa tim review manual
                      </div>
                    </div>
                  </div>

                  {/* SVG Graphic 1: Verification Mockup */}
                  <div style={{ width: "100%", maxWidth: "460px", margin: "0 auto" }}>
                    <svg viewBox="0 0 420 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", borderRadius: "8px" }}>
                      <rect x="16" y="16" width="388" height="228" rx="8" fill="#ffffff" />
                      <rect x="16" y="16" width="388" height="34" rx="8" fill="#f8f9fa" />
                      <circle cx="34" cy="33" r="5" fill="#ff5f56" />
                      <circle cx="48" cy="33" r="5" fill="#ffbd2e" />
                      <circle cx="62" cy="33" r="5" fill="#27c93f" />
                      <text x="80" y="37" fontFamily="sans-serif" fontSize="11" fill="#666" fontWeight="600">Clip_Verification_Stream #089.mp4</text>
                      
                      <rect x="32" y="66" width="220" height="48" rx="6" fill="#f3f4f6" />
                      <path d="M42 90 L46 80 L50 96 L54 75 L58 102 L62 84 L66 94 L70 70 L74 105 L78 86 L82 92 L86 78 L90 98 L94 82 L98 90 L102 76 L106 100 L110 88 L114 92 L118 80 L122 96 L126 72 L130 104 L134 84 L138 90 L142 80 L146 98 L150 82 L154 94 L158 86 L162 90 L166 76 L170 102 L174 84 L178 92 L182 82 L186 96 L190 74 L194 100 L198 86 L202 92 L206 80 L210 94 L214 84 L218 90 L222 88 L226 90 L230 84 L234 90" stroke="#00d084" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="46" cy="125" r="3.5" fill="#059669" />
                      <text x="56" y="128" fontFamily="sans-serif" fontSize="10.5" fill="#059669" fontWeight="700">Whisper Audio Mention: Terverifikasi</text>

                      <rect x="270" y="66" width="120" height="96" rx="6" fill="#f0fdf4" stroke="#86efac" strokeWidth="1" strokeDasharray="3 3" />
                      <rect x="280" y="76" width="60" height="14" rx="3" fill="#22c55e" />
                      <text x="285" y="87" fontFamily="sans-serif" fontSize="9" fill="#ffffff" fontWeight="700">SPONSOR</text>
                      <text x="280" y="112" fontFamily="sans-serif" fontSize="10" fill="#15803d" fontWeight="600">Gemini 1.5</text>
                      <text x="280" y="126" fontFamily="sans-serif" fontSize="9" fill="#166534">Watermark: OK</text>
                      <text x="280" y="140" fontFamily="sans-serif" fontSize="9" fill="#166534">Duration: 12.4s</text>

                      <rect x="32" y="180" width="356" height="42" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                      <circle cx="50" cy="201" r="6" fill="#22c55e" />
                      <text x="64" y="205" fontFamily="sans-serif" fontSize="12" fill="#0f172a" fontWeight="700">Klip Lolos Validasi AI Agent</text>
                      <rect x="270" y="190" width="106" height="22" rx="11" fill="#00d084" />
                      <text x="285" y="205" fontFamily="sans-serif" fontSize="10" fill="#ffffff" fontWeight="700">SIAP CAIR USDT</text>
                    </svg>
                  </div>
                </div>
              )}

              {/* Tab 2 Content: Cross-Platform Tracking */}
              {activePillar === 2 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "2.5rem",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#f59e0b" }}>
                        CROSS-PLATFORM TRACKING
                      </span>
                    </div>
                    <h3 className="am-heading-36" style={{ margin: 0, fontSize: "2rem", lineHeight: 1.25 }}>
                      TikTok, Shorts, dan Reels dalam Satu Dashboard
                    </h3>
                    <p className="am-paragraph-16 am-opacity-60" style={{ margin: 0, lineHeight: 1.6 }}>
                      Satu dashboard cerdas untuk memantau performa views di ketiga platform video pendek terbesar dengan sinkronisasi otomatis tiap jam.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#f59e0b", flexShrink: 0 }} /> Sinkronisasi API resmi dan webhook realtime
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#f59e0b", flexShrink: 0 }} /> Deduplikasi view antarplatform otomatis
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#f59e0b", flexShrink: 0 }} /> Laporan retensi video dan engagement rate
                      </div>
                    </div>
                  </div>

                  {/* SVG Graphic 2: Tracking Mockup */}
                  <div style={{ width: "100%", maxWidth: "460px", margin: "0 auto" }}>
                    <svg viewBox="0 0 420 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", borderRadius: "8px" }}>
                      <rect x="16" y="16" width="388" height="228" rx="8" fill="#ffffff" />
                      <rect x="16" y="16" width="388" height="34" rx="8" fill="#f8f9fa" />
                      <text x="32" y="38" fontFamily="sans-serif" fontSize="12" fill="#111" fontWeight="700">Performa Tayangan Lintas Platform (24 Jam)</text>
                      
                      <text x="32" y="78" fontFamily="sans-serif" fontSize="11" fill="#111" fontWeight="600">TikTok</text>
                      <text x="300" y="78" fontFamily="sans-serif" fontSize="11" fill="#059669" fontWeight="700">840,500 Views</text>
                      <rect x="32" y="86" width="356" height="12" rx="6" fill="#f1f5f9" />
                      <rect x="32" y="86" width="220" height="12" rx="6" fill="#00d084" />

                      <text x="32" y="126" fontFamily="sans-serif" fontSize="11" fill="#111" fontWeight="600">YouTube Shorts</text>
                      <text x="300" y="126" fontFamily="sans-serif" fontSize="11" fill="#d97706" fontWeight="700">415,200 Views</text>
                      <rect x="32" y="134" width="356" height="12" rx="6" fill="#f1f5f9" />
                      <rect x="32" y="134" width="140" height="12" rx="6" fill="#f59e0b" />

                      <text x="32" y="174" fontFamily="sans-serif" fontSize="11" fill="#111" fontWeight="600">Instagram Reels</text>
                      <text x="300" y="174" fontFamily="sans-serif" fontSize="11" fill="#e11d48" fontWeight="700">164,300 Views</text>
                      <rect x="32" y="182" width="356" height="12" rx="6" fill="#f1f5f9" />
                      <rect x="32" y="182" width="75" height="12" rx="6" fill="#ff4b6e" />

                      <line x1="32" y1="210" x2="388" y2="210" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="32" y="228" fontFamily="sans-serif" fontSize="10.5" fill="#64748b">Sinkronisasi otomatis tiap 60 menit</text>
                      <text x="250" y="228" fontFamily="sans-serif" fontSize="11.5" fill="#0f172a" fontWeight="800">Total: 1,420,000 Views</text>
                    </svg>
                  </div>
                </div>
              )}

              {/* Tab 3 Content: Smart Escrow Protection */}
              {activePillar === 3 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "2.5rem",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#00d084" }} />
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#00d084" }}>
                        SMART ESCROW PROTECTION
                      </span>
                    </div>
                    <h3 className="am-heading-36" style={{ margin: 0, fontSize: "2rem", lineHeight: 1.25 }}>
                      Uang Aman &amp; Terkunci di BNB Chain
                    </h3>
                    <p className="am-paragraph-16 am-opacity-60" style={{ margin: 0, lineHeight: 1.6 }}>
                      Dana sponsor dikunci di smart contract sejak awal. Kreator dijamin menerima haknya tanpa risiko brand menolak membayar.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#00d084", flexShrink: 0 }} /> Kontrak timelock escrow non-custodial
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#00d084", flexShrink: 0 }} /> Rilis otomatis langsung ke alamat dompet clipper
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#00d084", flexShrink: 0 }} /> Perlindungan holdback 14 hari cegah penghapusan video
                      </div>
                    </div>
                  </div>

                  {/* SVG Graphic 3: Escrow Vault Mockup */}
                  <div style={{ width: "100%", maxWidth: "460px", margin: "0 auto" }}>
                    <svg viewBox="0 0 420 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", borderRadius: "8px" }}>
                      <rect x="16" y="16" width="388" height="228" rx="8" fill="#ffffff" />
                      <rect x="16" y="16" width="388" height="34" rx="8" fill="#f8f9fa" />
                      <text x="32" y="38" fontFamily="sans-serif" fontSize="12" fill="#111" fontWeight="700">BNB Chain Escrow Smart Contract</text>
                      <text x="290" y="38" fontFamily="monospace" fontSize="10" fill="#64748b">0x71C...B4e2</text>

                      <rect x="32" y="66" width="160" height="116" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                      <circle cx="112" cy="110" r="26" fill="rgba(0, 208, 132, 0.12)" stroke="#00d084" strokeWidth="2" />
                      <path d="M106 110 L110 114 L118 106" stroke="#00d084" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="56" y="156" fontFamily="sans-serif" fontSize="11" fill="#0f172a" fontWeight="700">DANA TERKUNCI</text>
                      <text x="50" y="172" fontFamily="sans-serif" fontSize="12" fill="#059669" fontWeight="800">5,000.00 USDT</text>

                      <rect x="206" y="66" width="182" height="116" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                      <text x="218" y="86" fontFamily="sans-serif" fontSize="10.5" fill="#64748b" fontWeight="600">Aturan Penguncian:</text>
                      <circle cx="224" cy="103" r="3" fill="#059669" />
                      <text x="234" y="106" fontFamily="sans-serif" fontSize="10" fill="#0f172a">Target: 1M Views tercapai</text>
                      <circle cx="224" cy="121" r="3" fill="#059669" />
                      <text x="234" y="124" fontFamily="sans-serif" fontSize="10" fill="#0f172a">Anti-Fraud: Skor Sybil 0%</text>
                      <circle cx="224" cy="139" r="3" fill="#059669" />
                      <text x="234" y="142" fontFamily="sans-serif" fontSize="10" fill="#0f172a">Timelock: 14 hari rilis</text>
                      <text x="218" y="166" fontFamily="sans-serif" fontSize="10" fill="#059669" fontWeight="700">Pencairan Otomatis Aktif</text>

                      <rect x="32" y="194" width="356" height="34" rx="6" fill="#f1f5f9" />
                      <text x="44" y="215" fontFamily="monospace" fontSize="9.5" fill="#475569">Tx: 0x9a8f4c...3e1b7d | BSC Testnet Block #391024</text>
                    </svg>
                  </div>
                </div>
              )}

              {/* Tab 4 Content: Intelligence & CPM Analytics */}
              {activePillar === 4 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "2.5rem",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3b82f6" }} />
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#3b82f6" }}>
                        INTELLIGENCE &amp; CPM ANALYTICS
                      </span>
                    </div>
                    <h3 className="am-heading-36" style={{ margin: 0, fontSize: "2rem", lineHeight: 1.25 }}>
                      Kalkulasi CPM Transparan &amp; Penghasilan Maksimal
                    </h3>
                    <p className="am-paragraph-16 am-opacity-60" style={{ margin: 0, lineHeight: 1.6 }}>
                      Dapatkan nilai CPM terbaik (Rp 15.000 - Rp 35.000 / 1k views) dengan laporan analitik engagement yang bisa diaudit publik.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#3b82f6", flexShrink: 0 }} /> Kalkulator proyeksi pendapatan clipper otomatis
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#3b82f6", flexShrink: 0 }} /> Evaluasi kualitas audiens Indonesia (Tier 1 &amp; Tier 2)
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                        <Check size={14} style={{ color: "#3b82f6", flexShrink: 0 }} /> Laporan ROI transparan untuk pengiklan brand
                      </div>
                    </div>
                  </div>

                  {/* SVG Graphic 4: CPM Analytics Mockup */}
                  <div style={{ width: "100%", maxWidth: "460px", margin: "0 auto" }}>
                    <svg viewBox="0 0 420 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", borderRadius: "8px" }}>
                      <rect x="16" y="16" width="388" height="228" rx="8" fill="#ffffff" />
                      <rect x="16" y="16" width="388" height="34" rx="8" fill="#f8f9fa" />
                      <text x="32" y="38" fontFamily="sans-serif" fontSize="12" fill="#111" fontWeight="700">Kalkulasi CPM Transparan &amp; Penghasilan</text>

                      <path d="M40 170 Q 120 160, 180 120 T 320 70 L 380 56" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                      
                      <rect x="40" y="60" width="100" height="42" rx="6" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1" />
                      <text x="48" y="76" fontFamily="sans-serif" fontSize="9.5" fill="#0369a1" fontWeight="600">Average CPM</text>
                      <text x="48" y="94" fontFamily="sans-serif" fontSize="12" fill="#0c4a6e" fontWeight="800">Rp 28.500</text>

                      <rect x="150" y="60" width="100" height="42" rx="6" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
                      <text x="158" y="76" fontFamily="sans-serif" fontSize="9.5" fill="#15803d" fontWeight="600">Audience Quality</text>
                      <text x="158" y="94" fontFamily="sans-serif" fontSize="12" fill="#14532d" fontWeight="800">94.2% Organik</text>

                      <rect x="32" y="194" width="356" height="36" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                      <text x="44" y="216" fontFamily="sans-serif" fontSize="11" fill="#475569">Estimasi Pendapatan Total:</text>
                      <text x="210" y="217" fontFamily="sans-serif" fontSize="12.5" fill="#0f172a" fontWeight="800">Rp 40.470.000 (2,450 USDT)</text>
                    </svg>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ── 5. MID-PAGE JOURNEY BANNER (3D Gradient Indigo Card) ──────── */}
      <section className="am-section am-padding-bottom-44" style={{ paddingTop: "6rem", paddingBottom: "3rem", position: "relative", zIndex: 2, clear: "both" }}>
        <div className="am-cta-content-wrapper am-max-width-1440 am-centered-margins">
          <div className="am-cta-wrapper is-bold is-midnight-indigo am-padding-100 am-padding-bottom-84 gsap-midnight-banner">
            <div className="am-cta-heading-wrapper">
              <div className="w-richtext">
                <div className="w-embed">
                  <h2 className="am-heading-84-caps am-is-primary-light am-text-align-center">
                    Mulai Monetisasi{" "}
                    <span className="am-text-gradient-container">
                      <span className="am-text-gradient is-cta">Klip Video</span>
                      <span className="am-grain-word"></span>
                    </span>{" "}
                    Kamu Hari Ini
                  </h2>
                </div>
              </div>
            </div>

            <div className="am-partial-form-wrapper" style={{ marginTop: "2rem" }}>
              <div data-form-color-mode="midnight-indigo" data-form-align="center" className="am-partial-form-container">
                <div className="am-form-block-wrapper w-form">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setShowRoleModal(true);
                    }}
                    className="am-form-wrapper"
                  >
                    <input
                      className="am-form-email business-only-email-field w-input"
                      placeholder="Masukkan alamat wallet BNB / email kamu"
                      type="text"
                      required
                    />
                    <div className="am-form-submit-wrapper">
                      <div className="am-nav-btn-wrapper">
                        <button
                          type="submit"
                          className="am-nav-btn business-only-submit-button is-full-size-mobile w-button"
                          style={{ border: "none", cursor: "pointer" }}
                        >
                          Mulai Gratis
                        </button>
                        <div className="am-nav-btn-rocket" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Rocket size={18} color="#ffffff" />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. PERSONAS SECTION (5 Roles with Sketch Figures) ─────────── */}
      {/* ── 6. PERSONAS SECTION (5 Roles with Sketch Figures & Dynamic Pastel Tint) ── */}
      <section className="am-section" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="am-container" style={{ maxWidth: "1280px", width: "100%", margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          <div
            className="am-personas-wrapper"
            style={{
              backgroundColor: activePersona === 1 ? "#eefdf4" : activePersona === 2 ? "#fffbeb" : activePersona === 3 ? "#faf5ff" : activePersona === 4 ? "#f0f9ff" : activePersona === 5 ? "#fff1f2" : "#ffffff",
              borderColor: activePersona === 1 ? "#86efac" : activePersona === 2 ? "#fde68a" : activePersona === 3 ? "#e9d5ff" : activePersona === 4 ? "#bae6fd" : activePersona === 5 ? "#fecdd3" : "rgba(0, 0, 0, 0.08)",
              borderWidth: "1.5px",
              borderStyle: "solid",
              borderRadius: "28px",
              padding: "clamp(2rem, 4vw, 4rem) clamp(1rem, 3vw, 2.5rem)",
              transition: "background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
              boxShadow: activePersona ? "0 20px 48px -12px rgba(0, 0, 0, 0.08)" : "0 4px 20px rgba(0, 0, 0, 0.04)",
              width: "100%",
            }}
          >
            <ScrollReveal>
              <h2 className="am-heading-44 am-text-align-center" style={{ margin: "0 auto", maxWidth: "720px" }}>
                D<span className="am-alternate">id</span>esain untuk{" "}
                <span
                  style={{
                    color:
                      activePersona === 1
                        ? "#15803d"
                        : activePersona === 2
                        ? "#b45309"
                        : activePersona === 3
                        ? "#7e22ce"
                        : activePersona === 4
                        ? "#0369a1"
                        : "#be123c",
                    fontWeight: 700,
                    transition: "color 0.3s ease",
                  }}
                >
                  semua peran
                </span>{" "}
                di ekosistem video
              </h2>
            </ScrollReveal>

            <div className="am-personas-content" style={{ marginTop: "2.5rem" }}>
              <div className="am-personas-content-wrapper">
                {/* Responsive Persona Tabs Menu with Solid Shapes, Vibrant Colors & Active Gradients */}
                <div
                  className="am-personas-tabs-wrapper"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "0.75rem",
                    maxWidth: "1120px",
                    margin: "0 auto",
                    width: "100%",
                  }}
                >
                  {PERSONA_CONFIG.map((p) => {
                    const isSelected = activePersona === p.id;
                    const IconComp = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActivePersona(p.id)}
                        className="am-personas-tab w-inline-block"
                        style={{
                          background: isSelected ? p.gradient : p.bgInactive,
                          border: isSelected ? "1.5px solid transparent" : `1.5px solid ${p.borderInactive}`,
                          borderRadius: "20px",
                          padding: "0.875rem 0.75rem",
                          cursor: "pointer",
                          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          boxShadow: isSelected
                            ? `0 12px 28px -6px ${p.color}50, 0 4px 10px -2px ${p.color}30`
                            : "0 2px 6px rgba(0, 0, 0, 0.03)",
                          transform: isSelected ? "translateY(-2px) scale(1.02)" : "none",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          outline: "none",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: isSelected ? "#ffffff" : p.textColorInactive,
                            fontSize: "0.9375rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              backgroundColor: isSelected ? "rgba(255, 255, 255, 0.22)" : p.badgeBg,
                              color: isSelected ? "#ffffff" : p.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <IconComp size={15} />
                          </div>
                          <span>{p.role}</span>
                        </div>

                        {/* Character illustration image — visible on desktop/tablet, hidden on mobile */}
                        <div className="hidden md:flex items-center justify-center" style={{ marginTop: "0.5rem", height: "125px" }}>
                          <img
                            src={p.image}
                            alt={p.role}
                            className="am-personas-hero-illustration"
                            style={{ maxHeight: "125px", width: "auto", objectFit: "contain", filter: isSelected ? "drop-shadow(0 8px 16px rgba(0,0,0,0.15))" : "grayscale(20%) opacity(0.85)" }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Persona Content Panel */}
                <div ref={personaContentRef} style={{ marginTop: "3rem", textAlign: "center" }}>
                  {(() => {
                    const currentPersona = PERSONA_CONFIG.find((p) => p.id === activePersona) || PERSONA_CONFIG[0];
                    return (
                      <div key={currentPersona.id} style={{ display: "block", maxWidth: "48rem", margin: "0 auto" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.4rem 1.125rem",
                            borderRadius: "9999px",
                            background: currentPersona.gradient,
                            color: "#ffffff",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                            marginBottom: "1rem",
                            textTransform: "uppercase",
                            boxShadow: `0 4px 14px ${currentPersona.color}35`,
                          }}
                        >
                          {currentPersona.subtitle}
                        </div>
                        <h3 className="am-heading-28" style={{ marginBottom: "0.875rem", fontSize: "clamp(1.35rem, 4vw, 1.875rem)", fontWeight: 700, lineHeight: 1.25 }}>
                          {currentPersona.heading}
                        </h3>
                        <p className="am-paragraph-16 am-opacity-60" style={{ fontSize: "1rem", lineHeight: 1.6, maxWidth: "42rem", margin: "0 auto" }}>
                          {currentPersona.desc}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginTop: "1.5rem", alignItems: "center" }}>
                          {currentPersona.benefits.map((b, bi) => (
                            <div key={bi} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                              <Check size={14} style={{ color: currentPersona.color, flexShrink: 0 }} />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ marginTop: "2rem" }}>
                          {currentPersona.ctaHref.startsWith("http") ? (
                            <a
                              href={currentPersona.ctaHref}
                              target="_blank"
                              rel="noreferrer"
                              className="am-nav-btn"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                background: currentPersona.gradient,
                                color: "#ffffff",
                                padding: "0.75rem 1.75rem",
                                borderRadius: "9999px",
                                fontWeight: 700,
                                textDecoration: "none",
                                boxShadow: `0 6px 20px ${currentPersona.color}40`,
                              }}
                            >
                              <span>{currentPersona.cta}</span>
                              <ExternalLink size={14} />
                            </a>
                          ) : (
                            <Link
                              href={currentPersona.ctaHref}
                              className="am-nav-btn"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                background: currentPersona.gradient,
                                color: "#ffffff",
                                padding: "0.75rem 1.75rem",
                                borderRadius: "9999px",
                                fontWeight: 700,
                                textDecoration: "none",
                                boxShadow: `0 6px 20px ${currentPersona.color}40`,
                              }}
                            >
                              <span>{currentPersona.cta}</span>
                              <ArrowRight size={14} />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. PASTEL BENTO RESULTS GRID (Customer Stories) ───────────── */}
      <section className="am-section am-is-white-bg am-padding-100 am-no-padding-bottom" style={{ backgroundColor: "#fff", paddingTop: "5rem", paddingBottom: "5.5rem" }}>
        <div className="am-container" style={{ maxWidth: "1200px", margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          <div className="am-customer-stories-wrapper" style={{ position: "relative" }}>
            <h2 className="am-heading-36 am-text-align-center" style={{ margin: "0 auto 3rem", maxWidth: "680px" }}>
              Hasil nyata dari kreator &amp; brand di ekosistem
            </h2>

            <div className="bento-results-grid">
              {/* Row 1, Col 1: Stat Card (Yellow) */}
              <div className="am-customer-stories-cards-result w-inline-block" style={{ minHeight: "220px" }}>
                <div className="am-card-inner" style={{ minHeight: "220px" }}>
                  <div className="am-card-front is-yellow" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(0, 0, 0, 0.08)", minHeight: "220px" }}>
                    <div>
                      <span className="am-customer-stories-cards-number" style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111111", display: "block" }}>78%+</span>
                      <span style={{ fontSize: "0.9375rem", color: "#374151", fontWeight: 500 }}>retensi views</span>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.625rem", borderRadius: "9999px", backgroundColor: "rgba(0,0,0,0.06)", fontSize: "0.75rem", fontWeight: 700, color: "#111", alignSelf: "flex-start" }}>
                      <Video size={13} color="#ff0050" />
                      <span>TikTok &amp; Shorts</span>
                    </div>
                  </div>
                  <div className="am-card-back" style={{ borderRadius: "14px" }}>
                    <div className="am-nav-btn is-white is-no-hover">
                      <div>Rata-rata klip</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 1, Col 2: Stat Card (Mint Green) */}
              <div className="am-customer-stories-cards-result w-inline-block" style={{ minHeight: "220px" }}>
                <div className="am-card-inner" style={{ minHeight: "220px" }}>
                  <div className="am-card-front is-green" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(0, 0, 0, 0.08)", minHeight: "220px" }}>
                    <div>
                      <span className="am-customer-stories-cards-number" style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111111", display: "block" }}>$145k+</span>
                      <span style={{ fontSize: "0.9375rem", color: "#374151", fontWeight: 500 }}>reward dicairkan</span>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.625rem", borderRadius: "9999px", backgroundColor: "rgba(0,0,0,0.06)", fontSize: "0.75rem", fontWeight: 700, color: "#111", alignSelf: "flex-start" }}>
                      <Coins size={13} color="#f0b90b" />
                      <span>BNB Chain Escrow</span>
                    </div>
                  </div>
                  <div className="am-card-back" style={{ borderRadius: "14px" }}>
                    <div className="am-nav-btn is-white is-no-hover">
                      <div>100% On-Time</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 1, Col 3-4: Testimonial Card 1 (Storylake - spans 2 columns) */}
              <div className="am-customer-stories-cards-testimonial bento-span-2" style={{ minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.75rem", borderRadius: "14px", border: "1px solid rgba(0, 0, 0, 0.08)", backgroundColor: "#ffffff", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                <p className="am-paragraph-20 am-text-wrap-pretty" style={{ fontSize: "1.0625rem", lineHeight: 1.6, color: "#1f2937", margin: 0 }}>
                  &ldquo;ClipStream AI membantu kami meluncurkan kampanye klip video viral dengan 2 juta views dalam 10 hari tanpa ada kekhawatiran view palsu.&rdquo;
                </p>
                <div className="am-customer-stories-testimonial-details" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem" }}>
                  <div className="am-case-study-person-details">
                    <div className="am-paragraph-14">
                      <div style={{ fontWeight: 700, color: "#111111" }}>Arya Wijaya</div>
                      <div className="am-opacity-60" style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Head of Community, Web3 Gaming Guild</div>
                    </div>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.35rem 0.75rem", borderRadius: "9999px", backgroundColor: "#f3f4f6", fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>
                    <Sparkles size={13} color="#8b5cf6" />
                    <span>Web3 Partner</span>
                  </div>
                </div>
              </div>

              {/* Row 2, Col 1-2: Testimonial Card 2 (HPE - spans 2 columns) */}
              <div className="am-customer-stories-cards-testimonial bento-span-2" style={{ minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.75rem", borderRadius: "14px", border: "1px solid rgba(0, 0, 0, 0.08)", backgroundColor: "#ffffff", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                <p className="am-paragraph-20 am-text-wrap-pretty" style={{ fontSize: "1.0625rem", lineHeight: 1.6, color: "#1f2937", margin: 0 }}>
                  &ldquo;Kemampuan memverifikasi sponsor di video secara otomatis lewat Whisper AI telah menghemat puluhan jam kerja admin tiap minggu.&rdquo;
                </p>
                <div className="am-customer-stories-testimonial-details" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem" }}>
                  <div className="am-case-study-person-details">
                    <div className="am-paragraph-14">
                      <div style={{ fontWeight: 700, color: "#111111" }}>Dimas Setiawan</div>
                      <div className="am-opacity-60" style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Operations Head, FinTech Media</div>
                    </div>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.35rem 0.75rem", borderRadius: "9999px", backgroundColor: "#f3f4f6", fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>
                    <ShieldCheck size={13} color="#00d084" />
                    <span>Verified Brand</span>
                  </div>
                </div>
              </div>

              {/* Row 2, Col 3: Stat Card (Warm Amber) */}
              <div className="am-customer-stories-cards-result w-inline-block" style={{ minHeight: "220px" }}>
                <div className="am-card-inner" style={{ minHeight: "220px" }}>
                  <div className="am-card-front is-yellow" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(0, 0, 0, 0.08)", minHeight: "220px" }}>
                    <div>
                      <span className="am-customer-stories-cards-number" style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111111", display: "block" }}>&lt; 15s</span>
                      <span style={{ fontSize: "0.9375rem", color: "#374151", fontWeight: 500 }}>verifikasi AI</span>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.625rem", borderRadius: "9999px", backgroundColor: "rgba(0,0,0,0.06)", fontSize: "0.75rem", fontWeight: 700, color: "#111", alignSelf: "flex-start" }}>
                      <Zap size={13} color="#06b6d4" />
                      <span>Gemini Vision</span>
                    </div>
                  </div>
                  <div className="am-card-back" style={{ borderRadius: "14px" }}>
                    <div className="am-nav-btn is-white is-no-hover">
                      <div>Cepat &amp; Aman</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2, Col 4: Stat Card (Soft Pink) */}
              <div className="am-customer-stories-cards-result w-inline-block" style={{ minHeight: "220px" }}>
                <div className="am-card-inner" style={{ minHeight: "220px" }}>
                  <div className="am-card-front is-pink" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(0, 0, 0, 0.08)", minHeight: "220px" }}>
                    <div>
                      <span className="am-customer-stories-cards-number" style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111111", display: "block" }}>0%</span>
                      <span style={{ fontSize: "0.9375rem", color: "#374151", fontWeight: 500 }}>potongan admin</span>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.625rem", borderRadius: "9999px", backgroundColor: "rgba(0,0,0,0.06)", fontSize: "0.75rem", fontWeight: 700, color: "#111", alignSelf: "flex-start" }}>
                      <Lock size={13} color="#e8400d" />
                      <span>Timelock Escrow</span>
                    </div>
                  </div>
                  <div className="am-card-back" style={{ borderRadius: "14px" }}>
                    <div className="am-nav-btn is-white is-no-hover">
                      <div>P2P Escrow</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. LIVE ACTIVE CAMPAIGNS MARKETPLACE (Backend Wired) ──────── */}
      <section className="am-section am-padding-100" style={{ paddingTop: "5rem", paddingBottom: "5rem", backgroundColor: "#f6f5f3" }}>
        <div className="am-container" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div className="am-eyebrow" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px", color: "#e8400d", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                PASAR KAMPANYE AKTIF
              </div>
              <h2 className="am-heading-36">Bounty Video Siap Diambil</h2>
            </div>
            <Link href="/campaigns" className="am-nav-btn is-secondary hidden sm:inline-flex">
              Lihat Semua Kampanye →
            </Link>
          </div>

          {(() => {
            const displayCampaigns = campaigns.length > 0 ? campaigns : defaultLandingDemoCampaigns;
            return loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={{ height: "200px", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "12px" }} />
                ))}
              </div>
            ) : (
              <div className="gsap-campaigns-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {displayCampaigns.map((c) => {
                  const budgetRemaining = Number(c.remainingBudget);
                  const budgetPool = Number(c.totalBudget);
                  const progress = budgetPool > 0 ? Math.min(100, Math.round(((budgetPool - budgetRemaining) / budgetPool) * 100)) : 0;

                  return (
                    <div
                      key={c.id}
                      className="gsap-campaign-card"
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        border: "1px solid rgba(17,17,17,0.08)",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              padding: "0.25rem 0.5rem",
                              borderRadius: "9999px",
                              backgroundColor: "#b7efb2",
                              color: "#1a4d17",
                            }}
                          >
                            AKTIF
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)" }}>
                            TikTok / Shorts
                          </span>
                        </div>

                        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111", marginBottom: "0.375rem" }}>
                          {c.title}
                        </h3>
                        <p style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", lineHeight: 1.4, marginBottom: "1rem" }}>
                          {c.description || "Kampanye pembuatan klip video dengan sistem verifikasi otomatis."}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", backgroundColor: "#f6f5f3", borderRadius: "8px", marginBottom: "1rem" }}>
                          <div>
                            <div style={{ fontSize: "0.6875rem", color: "rgba(17,17,17,0.5)" }}>RATE CPM</div>
                            <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#e8400d" }}>
                              {formatIdr(c.cpmRate)}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.6875rem", color: "rgba(17,17,17,0.5)" }}>SISA POOL</div>
                            <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111" }}>
                              {formatUsdt(c.remainingBudget)} USDT
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ width: "100%", height: "6px", backgroundColor: "#ecebea", borderRadius: "9999px", overflow: "hidden", marginBottom: "1.25rem" }}>
                          <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#111" }} />
                        </div>
                      </div>

                      <Link
                        href={`/campaigns/${c.id}`}
                        className="am-nav-btn is-secondary"
                        style={{ textAlign: "center", display: "block", textDecoration: "none" }}
                      >
                        Ikuti Kampanye Ini →
                      </Link>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── 9. LEVEL-UP RESOURCE CARDS ────────────────────────────────── */}
      <section className="am-section am-is-white-bg am-padding-144" style={{ backgroundColor: "#fff", paddingTop: "5rem", paddingBottom: "6rem" }}>
        <div className="am-container">
          <div className="am-blog-section-wrapper">
            <div className="am-blog-section-content-top" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <h3 className="am-heading-36 am-text-wrap-balance" style={{ margin: 0 }}>Tingkatkan skill &amp; penghasilan klip kamu</h3>
              <Link href="/blog" className="am-nav-btn is-secondary w-button">
                Lihat Semua Artikel
              </Link>
            </div>

            <div className="w-dyn-list" style={{ marginTop: "2.5rem" }}>
              <div role="list" className="am-blog-section-articles w-dyn-items gsap-blog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
                {/* Article 1 */}
                <div role="listitem" className="am-blog-section-item w-dyn-item gsap-blog-card">
                  <Link href="/blog/panduan-memulai-clipper-bnb-chain" style={{ textDecoration: "none", display: "block" }}>
                    <div className="am-blog-index-item-wrapper" style={{ border: "1px solid rgba(17,17,17,0.08)", borderRadius: "12px", overflow: "hidden", transition: "box-shadow 0.2s" }}>
                      <div className="am-blog-index-item-thumbnail" style={{ height: "170px", backgroundColor: "#111" }}>
                        <img
                          src="/assets/blog-cover-clipper.jpg"
                          alt="Panduan Clipper BNB Chain"
                          className="am-image is-cover"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ padding: "1.25rem" }}>
                        <div className="am-blog-index-item-content-tags am-opacity-60" style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                          <div>Panduan</div>
                          <div>·</div>
                          <div>23 Sep 2026</div>
                        </div>
                        <h4 className="am-paragraph-16" style={{ fontWeight: 600, color: "#111" }}>
                          Panduan Lengkap Memulai Menjadi Clipper Video Berbayar di BNB Chain
                        </h4>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Article 2 */}
                <div role="listitem" className="am-blog-section-item w-dyn-item gsap-blog-card">
                  <Link href="/blog/timelock-escrow-pembayaran-tanpa-admin" style={{ textDecoration: "none", display: "block" }}>
                    <div className="am-blog-index-item-wrapper" style={{ border: "1px solid rgba(17,17,17,0.08)", borderRadius: "12px", overflow: "hidden", transition: "box-shadow 0.2s" }}>
                      <div className="am-blog-index-item-thumbnail" style={{ height: "170px", backgroundColor: "#111" }}>
                        <img
                          src="/assets/blog-cover-escrow.jpg"
                          alt="Timelock Escrow Smart Contract"
                          className="am-image is-cover"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ padding: "1.25rem" }}>
                        <div className="am-blog-index-item-content-tags am-opacity-60" style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                          <div>Smart Contract</div>
                          <div>·</div>
                          <div>21 Sep 2026</div>
                        </div>
                        <h4 className="am-paragraph-16" style={{ fontWeight: 600, color: "#111" }}>
                          Bagaimana Timelock Escrow Menjamin Pembayaran Tanpa Biaya Admin
                        </h4>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Article 3 */}
                <div role="listitem" className="am-blog-section-item w-dyn-item gsap-blog-card">
                  <Link href="/blog/whisper-ai-gemini-vision-validasi-watermark" style={{ textDecoration: "none", display: "block" }}>
                    <div className="am-blog-index-item-wrapper" style={{ border: "1px solid rgba(17,17,17,0.08)", borderRadius: "12px", overflow: "hidden", transition: "box-shadow 0.2s" }}>
                      <div className="am-blog-index-item-thumbnail" style={{ height: "170px", backgroundColor: "#111" }}>
                        <img
                          src="/assets/blog-cover-ai.jpg"
                          alt="Whisper AI dan Gemini Vision"
                          className="am-image is-cover"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ padding: "1.25rem" }}>
                        <div className="am-blog-index-item-content-tags am-opacity-60" style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                          <div>AI Verifier</div>
                          <div>·</div>
                          <div>18 Sep 2026</div>
                        </div>
                        <h4 className="am-paragraph-16" style={{ fontWeight: 600, color: "#111" }}>
                          Cara Whisper AI &amp; Gemini Vision Memvalidasi Watermark Sponsor dan Konten Klip
                        </h4>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── 10. WALL OF LOVE TESTIMONIALS (Amplemarket Black Marquee) ── */}
      <section className="am-section am-padding-100 am-is-black-bg" style={{ backgroundColor: "#111", color: "#fff", paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="am-container am-is-small">
          <div className="am-wall-of-love-section">
            <div className="am-customers-wall-of-love-heading-wrapper" style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 className="am-heading-44 am-is-white am-text-align-center am-max-width-348 am-text-wrap-balance" style={{ margin: "0 auto" }}>
                Pengakuan dari para clipper &amp; brand kami!
              </h2>
            </div>

            <div className="am-customers-wall-of-love-grid gsap-wall-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {TESTIMONIALS_DATA.map((item) => (
                <div
                  key={item.id}
                  className="am-customers-wall-of-love-card gsap-wall-card"
                  style={{
                    backgroundColor: "#1e1d1c",
                    padding: "1.5rem",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "3px", color: "#f59e0b" }}>
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="#f59e0b" strokeWidth={0} />
                        ))}
                      </div>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          color: item.tagColor,
                          backgroundColor: item.tagBg,
                          padding: "2px 8px",
                          borderRadius: "9999px",
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <p className="am-paragraph-16 am-is-white am-opacity-80" style={{ fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                  <div className="am-customer-stories-testimonial-details">
                    <div className="am-paragraph-14 am-is-white">
                      <div style={{ fontWeight: 600 }}>{item.author}</div>
                      <div className="am-opacity-60" style={{ fontSize: "0.75rem" }}>{item.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. FAQ ACCORDION SECTION ─────────────────────────────────── */}
      <section className="am-section am-padding-100" style={{ paddingTop: "5rem", paddingBottom: "5rem", backgroundColor: "#fff" }}>
        <div className="am-container am-is-smaller">
          <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
            <h2 className="am-heading-36 am-text-align-center" style={{ marginBottom: "2.5rem" }}>
              Pertanyaan yang Sering Diajukan
            </h2>

            <div className="gsap-faq-list" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                {
                  q: "Bagaimana cara kerja smart contract escrow ClipStream AI?",
                  a: "Brand mengunci dana kampanye di smart contract BNB Chain. Saat clipper mengunggah video, AI Agent memvalidasi views dan watermark. Begitu target tercapai, smart contract otomatis mentransfer USDT ke dompet clipper tanpa perantara.",
                },
                {
                  q: "Berapa lama waktu yang dibutuhkan untuk pencairan hadiah?",
                  a: "Pencairan terjadi instan dalam hitungan detik setelah AI Agent mengonfirmasi metrik views dan watermark di video Anda.",
                },
                {
                  q: "Apakah saya harus punya crypto atau BNB terlebih dahulu untuk jadi clipper?",
                  a: "Tidak! Anda cukup login dengan email atau Google lewat Privy. Kami otomatis membuatkan embedded wallet aman untuk Anda di BNB Chain.",
                },
                {
                  q: "Platform video apa saja yang didukung saat ini?",
                  a: "Saat ini ClipStream AI mendukung klip dari TikTok, YouTube Shorts, dan Instagram Reels.",
                },
                {
                  q: "Bagaimana sistem perhitungan rate CPM di ClipStream AI?",
                  a: "Rate CPM ditentukan langsung oleh brand sponsor (berkisar antara Rp 15.000 hingga Rp 35.000 per 1.000 views terverifikasi). Sistem membaca performa views secara transparan lewat YouTube Data API dan TikTok crawler.",
                },
                {
                  q: "Apakah ada potongan biaya platform (platform fee)?",
                  a: "ClipStream AI menerapkan 0% platform fee untuk kreator clipper. 100% dana bounty yang dialokasikan sponsor langsung masuk ke dompet wallet kreator.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="gsap-faq-item"
                  style={{
                    border: "1px solid rgba(17,17,17,0.08)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(i)}
                    style={{
                      width: "100%",
                      padding: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: "#111",
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: openFaq === i ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>
                  {openFaq === i && (
                    <div
                      style={{
                        padding: "0 1.25rem 1.25rem",
                        color: "rgba(17,17,17,0.65)",
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. GLOWING PRE-FOOTER BANNER (Amplemarket Footer CTA) ────── */}
      <section className="am-section am-is-black-bg" style={{ backgroundColor: "#111111", color: "#ffffff", paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
        <div className="am-container" style={{ maxWidth: "60rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div className="gsap-footer-cta" style={{ textAlign: "center" }}>
            <h2
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                textAlign: "center",
                margin: "0 auto",
                lineHeight: 1.15,
                textTransform: "uppercase",
                maxWidth: "48rem",
              }}
            >
              Raih Penghasilan Otomatis dari Setiap{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #ff7a45 0%, #ffc069 50%, #85e89d 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                }}
              >
                Klip Video
              </span>
            </h2>

            <div style={{ marginTop: "2.25rem", maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowRoleModal(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  borderRadius: "9999px",
                  padding: "5px 6px 5px 18px",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.35)",
                  boxSizing: "border-box",
                  width: "100%",
                }}
              >
                <input
                  type="text"
                  placeholder="Mulai monetisasi klip video kamu sekarang..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: "0.875rem",
                    color: "#111111",
                    minWidth: 0,
                    padding: "8px 12px 8px 0",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#111111",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "9999px",
                    padding: "10px 20px",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                  }}
                >
                  Daftar Sekarang
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Modal */}
      <RoleSelectModal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-2 border-[#e8400d] border-t-transparent animate-spin" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
