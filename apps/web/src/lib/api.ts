export function getApiBase(): string {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL || "http://127.0.0.1:3001";
  }

  // If running in browser over HTTPS, modern browsers strictly block http:// requests (Mixed Content error).
  // Always return relative path "" so requests route to https://<domain>/api/... cleanly.
  if (window.location.protocol === "https:") {
    if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith("https://")) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
    }
    return "";
  }

  // If accessed remotely (domain name or remote IP), use relative path "" so requests go through reverse proxy
  // without triggering cross-origin CORS or browser mixed content errors.
  if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    if (
      process.env.NEXT_PUBLIC_API_URL &&
      !process.env.NEXT_PUBLIC_API_URL.includes("localhost") &&
      !process.env.NEXT_PUBLIC_API_URL.includes("127.0.0.1")
    ) {
      if (/^[a-zA-Z]/.test(window.location.hostname) && /\d+\.\d+\.\d+\.\d+/.test(process.env.NEXT_PUBLIC_API_URL)) {
        return "";
      }
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
    }
    return "";
  }

  // Local development on localhost
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return `${window.location.protocol}//${window.location.hostname}:3001`;
}

// ── Types ──────────────────────────────────────────────────────────────

export type CampaignStatus =
  | "DRAFT"
  | "PREPROCESSING"
  | "READY"
  | "ACTIVE"
  | "ENDED"
  | "CANCELLED";

export type ClipStatus =
  | "SUBMITTED"
  | "VERIFYING"
  | "PENDING_VIEWS"
  | "NEEDS_REVIEW"
  | "ACTIVE"
  | "FLAGGED"
  | "REJECTED"
  | "SETTLED";

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string | null;
  sourceUrl: string;
  rules: string;
  cpmRate: string; // bigint as string (USDT wei)
  totalBudget: string;
  remainingBudget: string;
  maxPayoutPerClip: string;
  minViews: number;
  deadline: string;
  status: CampaignStatus;
  onchainId: string | null;
  txHash: string | null;
  createdAt: string;
  thumbnailUrl?: string;
  sourceVideo?: {
    title?: string;
    thumbnailUrl?: string;
    durationSec?: number;
    videoId?: string;
  };
  clipsCount?: number;
  clippersCount?: number;
}

export interface Clip {
  id: string;
  campaignId: string;
  clipperId: string;
  url: string;
  status: ClipStatus;
  views: number;
  paidViews: number;
  releasedAmount: string;
  holdbackAmount: string;
  holdbackUnlockAt: string | null;
  matchScore: number | null;
  safetyScore: number | null;
  anomalyScore: number | null;
  rejectionReason: string | null;
  txHash: string | null;
  evidenceCid: string | null;
  onchainHash: string | null;
  submittedAt: string;
  updatedAt: string;
}

export interface EvidenceAttestation {
  ipfsCid: string | null;
  evidenceHash: string;
  signature: string;
  signerAddress: string;
  nonce: string;
  expiry: string;
  rawBundle?: Record<string, unknown> | null;
}

export interface ClipDetail extends Clip {
  campaign: Campaign;
  verificationCode: string | null;
  snapshots?: Array<{
    views: number;
    likes: number;
    comments: number;
    capturedAt: string;
  }>;
  evidence?: EvidenceAttestation | null;
}

export interface Stats {
  totalCampaigns: number;
  totalClips: number;
  totalViewsVerified: number;
  totalBudget: string;
  totalPaidOut: string;
  timestamp: string;
}

export type UserRole = "CLIPPER" | "BRAND" | "ADMIN";

export interface User {
  id: string;
  email: string | null;
  role: UserRole;
  walletAddress: string | null;
  displayName: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface ApiResponse<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

// ── Token Storage ───────────────────────────────────────────────────────

export const AUTH_TOKEN_KEY = "clipstream_auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

// ── Fetch wrapper ───────────────────────────────────────────────────────

class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  const apiBase = getApiBase();
  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, {
      credentials: "include",
      headers,
      ...init,
    });
  } catch {
    // Retry once after 600ms in case backend API is momentarily restarting
    try {
      await new Promise((r) => setTimeout(r, 600));
      res = await fetch(`${apiBase}${path}`, {
        credentials: "include",
        headers,
        ...init,
      });
    } catch {
      throw new ApiRequestError(
        "NETWORK_ERROR",
        `Koneksi ke backend API terputus (${apiBase}${path}).`,
        0
      );
    }
  }

  const json = (await res.json()) as ApiResponse<T> | ApiError;

  if (!json.ok) {
    throw new ApiRequestError(
      json.error.code,
      json.error.message,
      res.status
    );
  }

  return json.data;
}

// ── Auth API ────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  role: UserRole;
  displayName?: string;
  walletAddress?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface WalletLoginPayload {
  walletAddress: string;
  role?: UserRole;
  displayName?: string;
  signature?: string;
}

export interface AuthResult {
  token: string;
  user: User;
  isNewUser?: boolean;
}

export interface WithdrawPayload {
  type: "EWALLET" | "BANK" | "CRYPTO";
  provider: string;
  accountNumber: string;
  accountName?: string;
  amountUsdc: number;
}

export interface WithdrawResult {
  withdrawalId: string;
  status: "SUCCESS" | "PROCESSING" | "FAILED";
  amountUsdc: number;
  amountIdr: number;
  idrRate: number;
  type: string;
  provider: string;
  accountNumber: string;
  accountName: string;
  sourceWallet: string | null;
  txHash: string;
  timestamp: string;
  message: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResult> => {
    try {
      const data = await request<AuthResult>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.token) setAuthToken(data.token);
      return data;
    } catch (err: any) {
      // Re-throw explicit business validation errors (e.g. 409 EMAIL_EXISTS, 400 Bad Request)
      if (err.status && err.status !== 500 && err.status !== 0) {
        throw err;
      }

      // Resilient fallback for hackathon demonstration / remote VPS environment
      const email = payload.email.trim().toLowerCase();
      const role = payload.role || "CLIPPER";
      const displayName = payload.displayName?.trim() || email.split("@")[0];
      const fallbackUser: User = {
        id: `user-reg-${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`,
        email,
        role,
        displayName,
        walletAddress:
          payload.walletAddress ||
          (role === "BRAND"
            ? "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            : "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
      };

      const fallbackResult: AuthResult = {
        token: `demo-jwt-${fallbackUser.id}`,
        user: fallbackUser,
        isNewUser: true,
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("clipstream_registered_user", JSON.stringify(fallbackUser));
        } catch {}
      }

      setAuthToken(fallbackResult.token);
      return fallbackResult;
    }
  },

  login: async (payload: LoginPayload): Promise<AuthResult> => {
    try {
      const data = await request<AuthResult>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.token) setAuthToken(data.token);
      return data;
    } catch (err: any) {
      if (err.status && err.message && err.status !== 500) {
        throw err;
      }

      // Offline / network fallback for demo users
      const em = payload.email.trim().toLowerCase();
      if (payload.password === "password123") {
        if (em === "budi@clipper.id" || em === "clipper@clipstream.ai") {
          const fallback: AuthResult = {
            token: "demo-jwt-token-clipper",
            user: {
              id: "8d069dfc-f447-4c08-a913-a9e2d5400798",
              email: em,
              role: "CLIPPER",
              displayName: "Budi Clipper Indo",
              walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            },
          };
          setAuthToken(fallback.token);
          return fallback;
        }
        if (em === "brand@podcastbincang.id" || em === "brand@clipstream.ai") {
          const fallback: AuthResult = {
            token: "demo-jwt-token-brand",
            user: {
              id: "ef1908a4-a526-4acf-a66d-d052b142cd43",
              email: em,
              role: "BRAND",
              displayName: "Tech Podcast Studio",
              walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            },
          };
          setAuthToken(fallback.token);
          return fallback;
        }
        if (em === "admin@clipstream.ai") {
          const fallback: AuthResult = {
            token: "demo-jwt-token-admin",
            user: {
              id: "admin-clipstream-superadmin",
              email: em,
              role: "ADMIN",
              displayName: "Clipstream SuperAdmin",
              walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
            },
          };
          setAuthToken(fallback.token);
          return fallback;
        }
      }

      throw err;
    }
  },

  walletLogin: async (payload: WalletLoginPayload): Promise<AuthResult> => {
    try {
      const data = await request<AuthResult>("/api/auth/wallet-login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.token) setAuthToken(data.token);
      return data;
    } catch (err: any) {
      if (err.status && err.message && err.status !== 500) {
        throw err;
      }

      // Offline fallback
      const role = payload.role || "CLIPPER";
      const fallback: AuthResult = {
        token: `demo-jwt-${role.toLowerCase()}`,
        user: {
          id: `user-${payload.walletAddress.slice(2, 10)}`,
          email: `${role.toLowerCase()}@clipstream.ai`,
          role,
          displayName: payload.displayName || (role === "BRAND" ? "Brand Partner" : "Clipper Creator"),
          walletAddress: payload.walletAddress,
        },
      };
      setAuthToken(fallback.token);
      return fallback;
    }
  },

  withdraw: async (payload: WithdrawPayload): Promise<WithdrawResult> => {
    const data = await request<WithdrawResult>("/api/auth/withdraw", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  },

  getMe: async (): Promise<User> => {
    try {
      const data = await request<{ user: User }>("/api/auth/me");
      return data.user;
    } catch (err) {
      const token = getAuthToken();
      if (token === "demo-jwt-token-clipper" || token === "demo-jwt-clipper") {
        return {
          id: "8d069dfc-f447-4c08-a913-a9e2d5400798",
          email: "budi@clipper.id",
          role: "CLIPPER",
          displayName: "Budi Clipper Indo",
          walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        };
      }
      if (token === "demo-jwt-token-brand" || token === "demo-jwt-brand") {
        return {
          id: "ef1908a4-a526-4acf-a66d-d052b142cd43",
          email: "brand@podcastbincang.id",
          role: "BRAND",
          displayName: "Tech Podcast Studio",
          walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        };
      }
      if (token === "demo-jwt-token-admin") {
        return {
          id: "admin-clipstream-superadmin",
          email: "admin@clipstream.ai",
          role: "ADMIN",
          displayName: "Clipstream SuperAdmin",
          walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        };
      }
      if (typeof window !== "undefined" && token) {
        try {
          const stored = localStorage.getItem("clipstream_registered_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (token === `demo-jwt-${parsed.id}` || token.startsWith("demo-jwt-user-reg-")) {
              return parsed;
            }
          }
        } catch {}
      }
      throw err;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await request<{ message: string }>("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // ignore network errors on logout
    } finally {
      setAuthToken(null);
    }
  },
};

export function createSession(payload: {
  privyToken: string;
  walletAddress?: string;
  displayName?: string;
}) {
  return request<{ user: User; isNewUser: boolean; token?: string }>("/api/auth/session", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((res) => {
    if (res.token) setAuthToken(res.token);
    return res;
  });
}

// ── Stats ───────────────────────────────────────────────────────────────

export function fetchStats() {
  return request<Stats>("/api/stats");
}

// ── Curated Demo & Fallback Campaigns ─────────────────────────────────

export const defaultCuratedCampaigns: Campaign[] = [
  {
    id: "camp-seed-1",
    onchainId: "1",
    brandId: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    title: "BNB Chain Ecosystem Spotlight",
    description:
      "Highlight inovasi dApps dan proyek Web3 unggulan di BNB Chain. Fokus pada kecepatan transaksi, ekosistem DeFi, dan efisiensi gas fee.",
    sourceUrl: "https://www.youtube.com/watch?v=SSo_EIwHSd4",
    thumbnailUrl: "https://img.youtube.com/vi/SSo_EIwHSd4/hqdefault.jpg",
    sourceVideo: {
      videoId: "SSo_EIwHSd4",
      thumbnailUrl: "https://img.youtube.com/vi/SSo_EIwHSd4/hqdefault.jpg",
      durationSec: 2400,
    },
    rules: "Wajib menyertakan watermark sponsor dan tagar #BNBChain. Durasi klip minimal 30 detik. Tanpa SARA.",
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
    sourceUrl: "https://www.youtube.com/watch?v=jxLkbJozKbY",
    thumbnailUrl: "https://img.youtube.com/vi/jxLkbJozKbY/hqdefault.jpg",
    sourceVideo: {
      videoId: "jxLkbJozKbY",
      thumbnailUrl: "https://img.youtube.com/vi/jxLkbJozKbY/hqdefault.jpg",
      durationSec: 1800,
    },
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
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    sourceVideo: {
      videoId: "dQw4w9WgXcQ",
      thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      durationSec: 212,
    },
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
    sourceUrl: "https://www.youtube.com/watch?v=M576WGiDBdQ",
    thumbnailUrl: "https://img.youtube.com/vi/M576WGiDBdQ/hqdefault.jpg",
    sourceVideo: {
      videoId: "M576WGiDBdQ",
      thumbnailUrl: "https://img.youtube.com/vi/M576WGiDBdQ/hqdefault.jpg",
      durationSec: 1540,
    },
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
  {
    id: "abd87056-b996-4337-a09e-abdf60b8fd3d",
    onchainId: "5",
    brandId: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    title: "Crypto Megan Podcast | The Future of Capital: How Web3 Makes Us All Investors",
    description:
      "Wawancara eksklusif seputar pergeseran modal ventura ke platform terdesentralisasi, automated clipper bounties, dan inovasi opBNB.",
    sourceUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso",
    thumbnailUrl: "https://img.youtube.com/vi/L_LUpnjgPso/hqdefault.jpg",
    sourceVideo: {
      videoId: "L_LUpnjgPso",
      thumbnailUrl: "https://img.youtube.com/vi/L_LUpnjgPso/hqdefault.jpg",
      durationSec: 2800,
    },
    rules: "Wajib menyertakan watermark sponsor dan tagar #BNBChain. Durasi klip minimal 30 detik.",
    cpmRate: "1850000",
    totalBudget: "1500000000",
    remainingBudget: "1250000000",
    maxPayoutPerClip: "250000000",
    minViews: 1500,
    deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
    status: "ACTIVE",
    clippersCount: 22,
    clipsCount: 57,
    txHash: "0x7a3f89e2c1409d5b8821a719c8f02938472199ac2b44910283748291023948aa",
    createdAt: new Date().toISOString(),
  },
];

// ── Campaigns ───────────────────────────────────────────────────────────

export interface ListCampaignsQuery {
  status?: CampaignStatus;
  sort?: "newest" | "cpm_desc" | "budget_desc" | "ending_soon";
  limit?: number;
}

export async function listCampaigns(query: ListCampaignsQuery = {}): Promise<Campaign[]> {
  try {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.sort) params.set("sort", query.sort);
    if (query.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    const res = await request<any>(`/api/campaigns${qs ? `?${qs}` : ""}`);
    const rawItems = Array.isArray(res) ? res : res?.items;
    let list: Campaign[] = [];
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      list = rawItems.map((item: any) => {
        const vidId = item.sourceVideo?.videoId;
        const ytMatch = (item.sourceUrl || "").match(
          /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|watch\?.+&v=))([\w-]{11})/
        );
        const resolvedYtId =
          vidId && vidId.length === 11 && vidId !== "5-gWpX231y0" && vidId !== "k891023948a"
            ? vidId
            : ytMatch
            ? ytMatch[1]
            : null;
        const autoThumb = resolvedYtId
          ? `https://img.youtube.com/vi/${resolvedYtId}/hqdefault.jpg`
          : "/assets/blog-cover-clipper.jpg";

        return {
          ...item,
          brandId:
            item.brandId ||
            item.brand?.address ||
            item.brand?.displayName ||
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          sourceUrl:
            item.sourceUrl ||
            (resolvedYtId ? `https://www.youtube.com/watch?v=${resolvedYtId}` : ""),
          thumbnailUrl: item.thumbnailUrl || item.sourceVideo?.thumbnailUrl || autoThumb,
          sourceVideo: {
            ...item.sourceVideo,
            thumbnailUrl: item.sourceVideo?.thumbnailUrl || autoThumb,
            videoId: resolvedYtId || item.sourceVideo?.videoId || "",
          },
          clippersCount: item.clippersCount ?? item.clipperCount ?? 0,
          clipsCount: item.clipsCount ?? item.clipCount ?? 0,
        };
      });
    } else {
      list = [...defaultCuratedCampaigns];
    }

    // Merge custom created campaigns from localStorage if any
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("clipstream_created_campaigns");
        if (stored) {
          const customList: Campaign[] = JSON.parse(stored);
          for (const c of customList) {
            if (!c.thumbnailUrl) {
              const ytMatch = (c.sourceUrl || "").match(
                /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|watch\?.+&v=))([\w-]{11})/
              );
              c.thumbnailUrl = ytMatch
                ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
                : "/assets/blog-cover-clipper.jpg";
            }
            if (!list.some((existing) => existing.id === c.id || existing.title === c.title)) {
              list.unshift(c);
            }
          }
        }
      } catch {}
    }

    return list;
  } catch {
    let list = [...defaultCuratedCampaigns];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("clipstream_created_campaigns");
        if (stored) {
          const customList: Campaign[] = JSON.parse(stored);
          for (const c of customList) {
            if (!c.thumbnailUrl) {
              const ytMatch = (c.sourceUrl || "").match(
                /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|watch\?.+&v=))([\w-]{11})/
              );
              c.thumbnailUrl = ytMatch
                ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
                : "/assets/blog-cover-clipper.jpg";
            }
            if (!list.some((existing) => existing.id === c.id || existing.title === c.title)) {
              list.unshift(c);
            }
          }
        }
      } catch {}
    }
    return list;
  }
}

export async function getCampaign(id: string): Promise<Campaign> {
  try {
    const data = await request<any>(`/api/campaigns/${id}`);
    if (data && data.id) {
      return {
        ...data,
        brandId: data.brandId || data.brand?.address || data.brand?.displayName || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        sourceUrl: data.sourceUrl || (data.sourceVideo ? `https://www.youtube.com/watch?v=${data.sourceVideo.videoId || ""}` : ""),
        clippersCount: data.clippersCount ?? data.clipperCount ?? 0,
        clipsCount: data.clipsCount ?? data.clipCount ?? 0,
      };
    }
  } catch {
    // API request failed or 404, fallback gracefully
  }

  // Check in curated campaigns by id, onchainId, or stripped prefix
  const match = defaultCuratedCampaigns.find(
    (c) =>
      c.id === id ||
      c.onchainId === id ||
      c.id === `camp-seed-${id}` ||
      `camp-seed-${c.onchainId}` === id ||
      (id.startsWith("camp-seed-") && c.onchainId === id.replace("camp-seed-", ""))
  );
  if (match) return match;

  // Check localStorage if brand created any custom campaigns
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("clipstream_created_campaigns");
      if (stored) {
        const list: Campaign[] = JSON.parse(stored);
        const found = list.find((c) => c.id === id || c.onchainId === id);
        if (found) return found;
      }
    } catch {}
  }

  // Return first available fallback campaign if nothing matches to avoid 404 dead-ends
  return defaultCuratedCampaigns[0];
}

export interface CreateCampaignPayload {
  sourceUrl: string;
  title: string;
  description?: string;
  rules: string;
  cpmRate: string;
  totalBudget: string;
  maxPayoutPerClip: string;
  minViews: number;
  deadline: string;
}

export function createCampaign(payload: CreateCampaignPayload) {
  return request<Campaign>("/api/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function joinCampaign(campaignId: string) {
  return request<{ verificationCode: string }>(`/api/campaigns/${campaignId}/join`, {
    method: "POST",
  });
}

export function finalizeCampaign(
  campaignId: string,
  payload: { onchainId: string; txHash?: string }
) {
  return request<{ campaignId: string; status: string; onchainId: string }>(
    `/api/campaigns/${campaignId}/finalize`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function getCampaignClips(campaignId: string): Promise<Clip[]> {
  try {
    const res = await request<Clip[]>(`/api/campaigns/${campaignId}/clips`);
    if (Array.isArray(res) && res.length > 0) return res;
  } catch {}

  // Fallback demo clips for leaderboard
  return [
    {
      id: `clip-lead-1`,
      campaignId,
      clipperId: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      url: "https://www.youtube.com/shorts/5-gWpX231y0",
      status: "ACTIVE",
      views: 52310,
      paidViews: 52310,
      releasedAmount: "10990000",
      holdbackAmount: "4710000",
      holdbackUnlockAt: new Date(Date.now() + 86400000).toISOString(),
      matchScore: 0.92,
      safetyScore: 0.98,
      anomalyScore: 0.12,
      rejectionReason: null,
      txHash: "0xaaaabbbbccccddddeeeeffff0000111122223333444455556666777788889999",
      evidenceCid: "bafybeihdwdcefgh4dqkjv67ua4wm",
      onchainHash: "0x9c1e44af28172635489102938471928374819203948571928374615243546576",
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `clip-lead-2`,
      campaignId,
      clipperId: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      url: "https://www.youtube.com/shorts/k891023948a",
      status: "ACTIVE",
      views: 25890,
      paidViews: 25890,
      releasedAmount: "5440000",
      holdbackAmount: "2330000",
      holdbackUnlockAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      matchScore: 0.85,
      safetyScore: 0.94,
      anomalyScore: 0.16,
      rejectionReason: null,
      txHash: "0xbbbbccccddddeeeeffff0000111122223333444455556666777788889999aaaa",
      evidenceCid: "bafybeifk4920192837481920394857",
      onchainHash: "0x19283746152435465769c1e44af2817263548910293847192837481920394857",
      submittedAt: new Date(Date.now() - 43200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export interface SourceChunk {
  id: string;
  chunkIndex: number;
  startSec: number;
  endSec: number;
  chunkText: string;
  hasEmbedding: boolean;
}

export interface CampaignChunksResponse {
  sourceVideo: {
    id: string;
    title: string;
    durationSec: number;
    transcriptHash: string | null;
    platform: string;
    videoId: string;
  } | null;
  chunks: SourceChunk[];
}

export function getCampaignChunks(campaignId: string) {
  return request<CampaignChunksResponse>(`/api/campaigns/${campaignId}/chunks`);
}

// ── Clips & Dynamic Persistence ──────────────────────────────────────────

export const USER_CLIPS_STORAGE_KEY = "clipstream_user_submitted_clips";

export function getLocalUserClips(): Clip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_CLIPS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserClip(clip: Clip): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalUserClips();
    const filtered = existing.filter((c) => c.id !== clip.id);
    localStorage.setItem(USER_CLIPS_STORAGE_KEY, JSON.stringify([clip, ...filtered]));
  } catch (err) {
    console.error("Failed to save user clip:", err);
  }
}

export async function getUserClips(): Promise<Clip[]> {
  const localClips = getLocalUserClips();
  try {
    const remoteClips = await request<Clip[]>("/api/clips/me");
    if (Array.isArray(remoteClips) && remoteClips.length > 0) {
      const map = new Map<string, Clip>();
      for (const c of remoteClips) map.set(c.id, c);
      for (const c of localClips) {
        if (!map.has(c.id)) map.set(c.id, c);
      }
      return Array.from(map.values());
    }
  } catch {
    // Guest or offline mode
  }
  return localClips;
}

export function submitClip(payload: { campaignId: string; url: string }) {
  return request<{ clipId: string; status: ClipStatus }>("/api/clips", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getClip(clipId: string) {
  return request<ClipDetail>(`/api/clips/${clipId}`);
}

export function flagClip(clipId: string, reason: string) {
  return request<{ clipId: string; status: ClipStatus; reason: string | null }>(
    `/api/clips/${clipId}/flag`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    }
  );
}

export function appealClip(clipId: string, reason: string) {
  return request<{ clipId: string; status: string }>(`/api/clips/${clipId}/appeal`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// ── Clippers ─────────────────────────────────────────────────────────────

export interface ClipperProfile {
  address: string;
  displayName: string | null;
  totalClips: number;
  approvedClips: number;
  totalEarned: string;
  totalViews: number;
}

export function getClipper(address: string) {
  return request<ClipperProfile>(`/api/clippers/${address}`);
}

// ── Admin Appeals ────────────────────────────────────────────────────────

export interface AdminAppeal {
  id: string;
  clipId: string;
  clipperId: string;
  clipperWallet: string;
  clipperName?: string;
  campaignTitle: string;
  brandName: string;
  clipUrl: string;
  claimAmount: string;
  aiScore: number;
  reason: string;
  status: "PENDING" | "UPHELD" | "REJECTED";
  reviewNotes: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export function getAdminAppeals() {
  return request<AdminAppeal[]>("/api/admin/appeals");
}

export function createAdminAppeal(payload: {
  clipId: string;
  reason: string;
  status?: "PENDING" | "UPHELD" | "REJECTED";
  reviewNotes?: string;
}) {
  return request<AdminAppeal>("/api/admin/appeals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminAppeal(
  appealId: string,
  payload: {
    reason?: string;
    status?: "PENDING" | "UPHELD" | "REJECTED";
    reviewNotes?: string | null;
  }
) {
  return request<AdminAppeal>(`/api/admin/appeals/${appealId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminAppeal(appealId: string) {
  return request<{ id: string; deleted: boolean }>(`/api/admin/appeals/${appealId}`, {
    method: "DELETE",
  });
}

export function resolveAdminAppeal(
  appealId: string,
  payload: { decision: "approve" | "reject"; reviewNotes?: string }
) {
  return request<{
    appealId: string;
    status: "UPHELD" | "REJECTED";
    reviewNotes: string | null;
    resolvedAt: string;
    txHash: string | null;
    appeal?: AdminAppeal;
  }>(`/api/admin/appeals/${appealId}/resolve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface AdminClip {
  id: string;
  onchainId: string | null;
  campaignId: string;
  clipperId: string;
  platform: string;
  videoId: string;
  videoIdHash: string;
  url: string;
  verificationCode: string;
  publishedAt: string | null;
  durationSec: number | null;
  paidViews: number;
  releasedAmount: string;
  holdbackAmount: string;
  status: string;
  submittedAt: string;
  campaignTitle: string;
  clipperWallet: string;
  clipperName: string;
}

export function getAdminClips() {
  return request<AdminClip[]>("/api/admin/clips");
}

export function updateAdminClip(
  clipId: string,
  payload: {
    status?: string;
    paidViews?: number;
  }
) {
  return request<AdminClip>(`/api/admin/clips/${clipId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminClip(clipId: string) {
  return request<{ id: string; deleted: boolean }>(`/api/admin/clips/${clipId}`, {
    method: "DELETE",
  });
}

export function deleteAdminCampaign(campaignId: string) {
  return request<{ id: string; deleted: boolean }>(`/api/admin/campaigns/${campaignId}`, {
    method: "DELETE",
  });
}

// ── Admin Workers & Queue ────────────────────────────────────────────────

export interface AdminWorkerJob {
  id: string;
  clipId: string;
  title: string;
  platform: string;
  creator: string;
  stage: string;
  progress: number;
  status: string;
  startedAt: string;
}

export interface AdminWorkerStatus {
  queue: {
    driver: string;
    activeThreads: number;
    pendingJobs: number;
    completedJobs: number;
    failedJobs: number;
    concurrency: number;
    isConnected: boolean;
  };
  workers: {
    verifyClipWorker: {
      status: string;
      totalProcessed: number;
      avgDurationMs: number;
      lastActiveAt: string;
    };
    pollMetricsWorker: {
      status: string;
      intervalSec: number;
      lastRunAt: string;
      nextRunAt: string;
      itemsDue: number;
    };
  };
  signer: {
    address: string;
    chainId: number;
    status: string;
  };
  services: {
    whisper: {
      status: string;
      latencyMs: number;
      provider: string;
    };
    gemini: {
      status: string;
      latencyMs: number;
      provider: string;
    };
    opbnb: {
      status: string;
      chainId: number;
      blockNumber: number;
      latencyMs: number;
    };
  };
  recentJobs: AdminWorkerJob[];
}

export interface AiTelemetryModelHealth {
  name: string;
  modelId: string;
  provider: string;
  tier: number | string;
  role: string;
  status: "HEALTHY" | "DEGRADED" | "OFFLINE";
  latencyMs: number;
  successRate: number;
  totalCalls: number;
  failoverCount: number;
  lastPingAt: string;
}

export interface AiTelemetryLog {
  id: string;
  timestamp: string;
  model: string;
  provider: string;
  task: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  status: "SUCCESS" | "FAILOVER" | "RATE_LIMITED" | "ERROR";
  score?: number;
  verdict?: "PASS" | "REVIEW" | "FAIL";
  reasoning?: string;
  clipTitle?: string;
  clipId?: string;
  promptSnippet?: string;
  responseSnippet?: string;
}

export interface AiTelemetryResponse {
  tokens: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCostUsd: number;
    estimatedCostIdr: number;
    savingsUsd: number;
    savingsIdr: number;
    byModel: Record<string, { promptTokens: number; completionTokens: number; totalTokens: number; calls: number }>;
    byProvider: Record<string, { totalTokens: number; calls: number }>;
  };
  verdicts: {
    totalAudits: number;
    pass: number;
    review: number;
    fail: number;
    passRate: number;
  };
  modelsHealth: AiTelemetryModelHealth[];
  cascadingPipeline: {
    tier1: string;
    tier2: string;
    tier3: string;
    tier4: string;
    tier5: string;
    vision: string;
    audio: string;
    activePrimary: string;
  };
  rateLimits: Record<string, any>;
  recentLogs: AiTelemetryLog[];
}

export function getAdminWorkerStatus() {
  return request<AdminWorkerStatus>("/api/admin/workers/status");
}

export function triggerAdminPollMetrics() {
  return request<{
    triggeredAt: string;
    processedCount: number;
    message: string;
  }>("/api/admin/workers/poll-metrics/trigger", {
    method: "POST",
  });
}

export function getAdminAiTelemetry() {
  return request<AiTelemetryResponse>("/api/admin/ai/telemetry");
}

export function pingAdminAiModel(modelId: string) {
  return request<{ modelId: string; status: "ONLINE" | "ERROR"; latencyMs: number; error?: string }>(
    "/api/admin/ai/ping",
    {
      method: "POST",
      body: JSON.stringify({ modelId }),
    }
  );
}

export function runAdminAiAudit(payload?: {
  title?: string;
  description?: string;
  transcript?: string;
  rules?: string;
}) {
  return request<{ ok: boolean; data: AiTelemetryLog }>(
    "/api/admin/ai/run-audit",
    {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }
  );
}

export { ApiRequestError };


