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

export interface ClipDetail extends Clip {
  campaign: Campaign;
  verificationCode: string | null;
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

export function listCampaigns(query: ListCampaignsQuery = {}) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return request<Campaign[]>(`/api/campaigns${qs ? `?${qs}` : ""}`);
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

export { ApiRequestError };
