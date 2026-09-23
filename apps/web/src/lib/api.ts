const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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

export interface User {
  id: string;
  walletAddress: string;
  displayName: string | null;
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
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

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

// ── Auth ────────────────────────────────────────────────────────────────

export function createSession(payload: {
  privyToken: string;
  walletAddress?: string;
  displayName?: string;
}) {
  return request<{ user: User; isNewUser: boolean }>("/api/auth/session", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Stats ───────────────────────────────────────────────────────────────

export function fetchStats() {
  return request<Stats>("/api/stats");
}

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
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
  } catch {
    // Fallback mock campaigns if backend is offline/starting
    return [
      {
        id: "1",
        brandId: "brand_01",
        title: "Podcast Bincang Teknologi — Episode 42",
        description: "Potong klip terbaik seputar AI agent dan ekosistem Web3.",
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        rules: "Cantumkan kode di deskripsi, tidak boleh SARA.",
        cpmRate: "1500000",
        totalBudget: "5000000000",
        remainingBudget: "4850000000",
        maxPayoutPerClip: "500000000",
        minViews: 1000,
        deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
        status: "ACTIVE",
        onchainId: "1",
        txHash: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        brandId: "brand_02",
        title: "DeFi DEX Launch — Gasless Swap Tutorial",
        description: "Tutorial swap gasless di BNB Chain dengan Clipstream Escrow.",
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        rules: "Tampilkan UI swap min 5 detik, sertakan link campaign.",
        cpmRate: "2000000",
        totalBudget: "8000000000",
        remainingBudget: "7400000000",
        maxPayoutPerClip: "800000000",
        minViews: 2500,
        deadline: new Date(Date.now() + 86400000 * 45).toISOString(),
        status: "ACTIVE",
        onchainId: "2",
        txHash: null,
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

export function getCampaign(id: string) {
  return request<Campaign>(`/api/campaigns/${id}`);
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

export function getCampaignClips(campaignId: string) {
  return request<Clip[]>(`/api/campaigns/${campaignId}/clips`);
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

// ── Clips ────────────────────────────────────────────────────────────────

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
  campaignTitle: string;
  brandName: string;
  clipUrl: string;
  claimAmount: string;
  aiScore: number;
  reason: string;
  status: "PENDING" | "UPHELD" | "REJECTED";
  reviewNotes: string | null;
  createdAt: string;
}

export function getAdminAppeals() {
  return request<AdminAppeal[]>("/api/admin/appeals");
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
  }>(`/api/admin/appeals/${appealId}/resolve`, {
    method: "POST",
    body: JSON.stringify(payload),
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

export { ApiRequestError };


