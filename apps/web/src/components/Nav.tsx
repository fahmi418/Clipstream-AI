"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAuth } from "@/lib/auth-context";
import {
  Video,
  LayoutDashboard,
  Plus,
  Scissors,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Layers,
} from "lucide-react";

export function Nav() {
  const pathname = usePathname();
  const { login, authenticated, logout } = usePrivy();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="am-navbar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99 }}>
        <nav className="am-section is-navbar" style={{ width: "100%" }}>
          <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "0 1.5rem" }}>
            <div className="am-nav-content-wrapper" style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}>
              <div
                className={`am-nav-content ${scrolled ? "is-minified" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.75rem",
                  background: scrolled ? "rgba(251, 250, 249, 0.92)" : "rgba(251, 250, 249, 0.8)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(17, 17, 17, 0.08)",
                  boxShadow: scrolled
                    ? "0 6px 24px rgba(17, 17, 17, 0.06)"
                    : "0 2px 8px rgba(17, 17, 17, 0.02)",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Logo & Navigation */}
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                  <Link
                    href="/"
                    className="am-logo"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      textDecoration: "none",
                      color: "#111",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: "#111",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                      }}
                    >
                      <Video size={16} strokeWidth={2.2} />
                    </div>
                    <span
                      style={{
                        fontSize: "1.0625rem",
                        fontWeight: 600,
                        letterSpacing: "-0.4px",
                        color: "#111",
                      }}
                    >
                      ClipStream
                    </span>
                  </Link>

                  {/* Desktop navigation links */}
                  <div
                    className="hidden md:flex items-center"
                    style={{ gap: "0.5rem" }}
                  >
                    <Link
                      href="/campaigns"
                      className="am-nav-link"
                      style={{
                        padding: "0.5rem 0.875rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        color: pathname.startsWith("/campaigns") ? "#111" : "#6d6c6b",
                        fontWeight: pathname.startsWith("/campaigns") ? 600 : 400,
                        textDecoration: "none",
                        backgroundColor: pathname.startsWith("/campaigns") ? "rgba(17, 17, 17, 0.05)" : "transparent",
                      }}
                    >
                      Campaigns
                    </Link>
                    <Link
                      href="/clipper"
                      className="am-nav-link"
                      style={{
                        padding: "0.5rem 0.875rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        color: pathname.startsWith("/clipper") ? "#111" : "#6d6c6b",
                        fontWeight: pathname.startsWith("/clipper") ? 600 : 400,
                        textDecoration: "none",
                        backgroundColor: pathname.startsWith("/clipper") ? "rgba(17, 17, 17, 0.05)" : "transparent",
                      }}
                    >
                      Clipper Dashboard
                    </Link>
                    <Link
                      href="/brand/campaigns"
                      className="am-nav-link"
                      style={{
                        padding: "0.5rem 0.875rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        color: pathname.startsWith("/brand") ? "#111" : "#6d6c6b",
                        fontWeight: pathname.startsWith("/brand") ? 600 : 400,
                        textDecoration: "none",
                        backgroundColor: pathname.startsWith("/brand") ? "rgba(17, 17, 17, 0.05)" : "transparent",
                      }}
                    >
                      Brand Portal
                    </Link>
                  </div>
                </div>

                {/* Right side CTA & Auth */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  {authenticated && user ? (
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="am-nav-btn is-secondary"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          borderRadius: "0.5rem",
                          border: "1px solid rgba(17, 17, 17, 0.12)",
                          backgroundColor: "#fff",
                          color: "#111",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#1a7f37]" />
                        <span>{user.displayName || "Akun Saya"}</span>
                        <ChevronDown size={14} />
                      </button>

                      {menuOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            right: 0,
                            background: "#fff",
                            borderRadius: "0.75rem",
                            border: "1px solid rgba(17, 17, 17, 0.08)",
                            boxShadow: "0 10px 30px rgba(17, 17, 17, 0.1)",
                            minWidth: "220px",
                            padding: "0.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                            zIndex: 100,
                          }}
                        >
                          <Link
                            href="/clipper"
                            style={{
                              padding: "0.625rem 0.875rem",
                              fontSize: "0.875rem",
                              borderRadius: "0.375rem",
                              color: "#111",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.625rem",
                            }}
                            className="hover:bg-black/5"
                          >
                            <Scissors size={15} />
                            <span>Dashboard Clipper</span>
                          </Link>
                          <Link
                            href="/brand/campaigns"
                            style={{
                              padding: "0.625rem 0.875rem",
                              fontSize: "0.875rem",
                              borderRadius: "0.375rem",
                              color: "#111",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.625rem",
                            }}
                            className="hover:bg-black/5"
                          >
                            <LayoutDashboard size={15} />
                            <span>Dashboard Brand</span>
                          </Link>
                          <Link
                            href="/brand/new"
                            style={{
                              padding: "0.625rem 0.875rem",
                              fontSize: "0.875rem",
                              borderRadius: "0.375rem",
                              color: "#111",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.625rem",
                            }}
                            className="hover:bg-black/5"
                          >
                            <Plus size={15} />
                            <span>Buat Campaign</span>
                          </Link>
                          <div
                            style={{
                              height: "1px",
                              backgroundColor: "rgba(17, 17, 17, 0.06)",
                              margin: "0.25rem 0",
                            }}
                          />
                          <button
                            onClick={() => logout()}
                            style={{
                              padding: "0.625rem 0.875rem",
                              fontSize: "0.875rem",
                              borderRadius: "0.375rem",
                              color: "#e8400d",
                              background: "none",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.625rem",
                              width: "100%",
                            }}
                            className="hover:bg-red-50"
                          >
                            <LogOut size={15} />
                            <span>Keluar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={login}
                        className="am-nav-btn is-secondary"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          borderRadius: "0.5rem",
                          border: "1px solid rgba(17, 17, 17, 0.12)",
                          backgroundColor: "transparent",
                          color: "#111",
                          cursor: "pointer",
                        }}
                      >
                        Masuk
                      </button>
                      <button
                        onClick={login}
                        className="am-nav-btn"
                        style={{
                          padding: "0.5rem 1.125rem",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          borderRadius: "0.5rem",
                          backgroundColor: "#111",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Mulai Gratis
                      </button>
                    </>
                  )}

                  {/* Mobile hamburger button */}
                  <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="md:hidden"
                    style={{
                      padding: "0.5rem",
                      borderRadius: "0.5rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#111",
                    }}
                    aria-label="Toggle navigation menu"
                  >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            top: "68px",
            left: "1rem",
            right: "1rem",
            backgroundColor: "#fff",
            borderRadius: "1rem",
            border: "1px solid rgba(17, 17, 17, 0.08)",
            boxShadow: "0 12px 40px rgba(17, 17, 17, 0.15)",
            padding: "1rem",
            zIndex: 98,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <Link
            href="/campaigns"
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              color: "#111",
              textDecoration: "none",
            }}
          >
            Campaigns
          </Link>
          <Link
            href="/clipper"
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              color: "#111",
              textDecoration: "none",
            }}
          >
            Clipper Dashboard
          </Link>
          <Link
            href="/brand/campaigns"
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              color: "#111",
              textDecoration: "none",
            }}
          >
            Brand Portal
          </Link>
          <Link
            href="/clipper/submit"
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              color: "#111",
              textDecoration: "none",
            }}
          >
            Submit Klip
          </Link>
          <div
            style={{
              height: "1px",
              backgroundColor: "rgba(17, 17, 17, 0.08)",
              margin: "0.5rem 0",
            }}
          />
          {!authenticated ? (
            <button
              onClick={login}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                backgroundColor: "#111",
                color: "#fff",
                border: "none",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Masuk / Mulai Gratis
            </button>
          ) : (
            <button
              onClick={() => logout()}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                backgroundColor: "#fff",
                color: "#e8400d",
                border: "1px solid rgba(232, 64, 13, 0.2)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Keluar
            </button>
          )}
        </div>
      )}
    </>
  );
}
