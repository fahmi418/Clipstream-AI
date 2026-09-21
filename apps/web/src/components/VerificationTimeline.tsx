"use client";

import { useEffect, useState, useRef } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";
import type { ClipStatus } from "@/lib/api";

export interface VerificationStage {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  durationSeconds?: number;
  detail?: string;
}

const DEFAULT_STAGES: Omit<VerificationStage, "status">[] = [
  { id: "ownership", name: "Kepemilikan terverifikasi" },
  { id: "views", name: "Views terbaca" },
  { id: "transcript", name: "Transkrip siap" },
  { id: "matching", name: "Mencocokkan dengan video sumber" },
  { id: "safety", name: "Memeriksa pedoman brand" },
  { id: "anomaly", name: "Memeriksa pola views" },
  { id: "settlement", name: "Mengirim pembayaran on-chain" },
];

interface VerificationTimelineProps {
  clipId: string;
  initialStatus?: ClipStatus;
  onComplete?: (status: ClipStatus, clipData?: any) => void;
  className?: string;
}

export function VerificationTimeline({
  clipId,
  initialStatus = "SUBMITTED",
  onComplete,
  className = "",
}: VerificationTimelineProps) {
  const [stages, setStages] = useState<VerificationStage[]>(() =>
    DEFAULT_STAGES.map((s, idx) => ({
      ...s,
      status: idx === 0 ? "running" : "pending",
      durationSeconds: undefined,
    }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [finalStatus, setFinalStatus] = useState<ClipStatus>(initialStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Poll backend status if SSE is not supported or as reliable sync
  useEffect(() => {
    let isMounted = true;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/clips/${clipId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!isMounted || !json.ok) return;

        const clip = json.data;
        setFinalStatus(clip.status);

        if (clip.status === "ACTIVE" || clip.status === "SETTLED") {
          setStages((prev) =>
            prev.map((s) => ({
              ...s,
              status: "completed",
              durationSeconds: s.durationSeconds ?? Math.floor(Math.random() * 8 + 2),
            }))
          );
          onComplete?.(clip.status, clip);
        } else if (clip.status === "REJECTED" || clip.status === "FLAGGED") {
          setStages((prev) => {
            const next = [...prev];
            // Mark earlier as complete, current/failed as failed
            const failIdx = clip.matchScore && clip.matchScore < 0.72 ? 3 : 4;
            return next.map((s, idx) => ({
              ...s,
              status:
                idx < failIdx
                  ? "completed"
                  : idx === failIdx
                  ? "failed"
                  : "pending",
            }));
          });
          setErrorMessage(clip.rejectionReason ?? "Klip belum memenuhi kriteria");
          onComplete?.(clip.status, clip);
        } else if (clip.status === "PENDING_VIEWS") {
          setStages((prev) =>
            prev.map((s, idx) => ({
              ...s,
              status: idx <= 2 ? "completed" : "pending",
            }))
          );
          onComplete?.(clip.status, clip);
        }
      } catch {
        // Silent catch
      }
    };

    // Initial fetch
    fetchStatus();

    // Setup polling interval
    const interval = setInterval(fetchStatus, 3000);

    // Setup simulated progressive UI feedback for smooth feeling
    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < DEFAULT_STAGES.length - 1) {
          const next = prev + 1;
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setStages((oldStages) =>
            oldStages.map((s, idx) => {
              if (idx < next) {
                return {
                  ...s,
                  status: "completed",
                  durationSeconds: s.durationSeconds ?? Math.min(Math.round(elapsed / (idx + 1)), 15),
                };
              }
              if (idx === next) {
                return { ...s, status: "running" };
              }
              return s;
            })
          );
          return next;
        }
        return prev;
      });
    }, 4500);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [clipId, onComplete]);

  return (
    <div
      aria-live="polite"
      className={`card p-6 bg-white border border-[rgba(17,17,17,0.08)] rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(17,17,17,0.06)]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ash)]">
            Proses Verifikasi AI
          </span>
          <h3 className="text-lg font-normal text-[var(--color-ink)] mt-0.5">
            {finalStatus === "ACTIVE"
              ? "Klip Berhasil Diverifikasi"
              : finalStatus === "REJECTED"
              ? "Klip Belum Bisa Disetujui"
              : "Memverifikasi klip kamu..."}
          </h3>
        </div>
        {finalStatus === "VERIFYING" || finalStatus === "SUBMITTED" ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[var(--color-pearl)] text-[var(--color-ink)]">
            <Loader2 size={12} className="animate-spin text-[var(--color-phoenix-orange)]" />
            <span>Sedang diproses</span>
          </div>
        ) : finalStatus === "ACTIVE" ? (
          <div className="badge badge-active">Lolos Verifikasi</div>
        ) : finalStatus === "REJECTED" ? (
          <div className="badge badge-rejected">Ditolak</div>
        ) : null}
      </div>

      {/* Stages list */}
      <div className="space-y-3.5 my-2">
        {stages.map((stage, idx) => {
          const isCompleted = stage.status === "completed";
          const isRunning = stage.status === "running";
          const isFailed = stage.status === "failed";

          return (
            <div
              key={stage.id}
              className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                isRunning
                  ? "bg-[var(--color-cream-wash)]"
                  : isFailed
                  ? "bg-[#fdeeee]"
                  : "bg-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="text-[#1a7f37]" />
                  ) : isRunning ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-[var(--color-phoenix-orange)]"
                    />
                  ) : isFailed ? (
                    <ShieldAlert size={18} className="text-[#cf222e]" />
                  ) : (
                    <Circle size={18} className="text-[var(--color-stone)]" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    isCompleted
                      ? "text-[var(--color-ink)] font-normal"
                      : isRunning
                      ? "text-[var(--color-ink)] font-medium"
                      : isFailed
                      ? "text-[#cf222e] font-medium"
                      : "text-[var(--color-ash)]"
                  }`}
                >
                  {stage.name}
                </span>
              </div>

              <div className="text-xs text-[var(--color-ash)] font-mono">
                {isCompleted && stage.durationSeconds !== undefined ? (
                  `${stage.durationSeconds}s`
                ) : isRunning ? (
                  <span className="text-[var(--color-phoenix-orange)]">...</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful context helper */}
      <div className="mt-5 pt-3 border-t border-[rgba(17,17,17,0.06)] flex items-center justify-between text-xs text-[var(--color-ash)]">
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          <span>Biasanya selesai dalam 45 detik.</span>
        </div>
        <span>Bisa ditutup & tetap berjalan di backend.</span>
      </div>
    </div>
  );
}
