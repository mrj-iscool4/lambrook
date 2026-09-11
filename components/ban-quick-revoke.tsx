"use client";

import { Loader2, ShieldOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BanQuickRevoke({
  banId,
}: {
  banId: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function revoke() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/staff/bans/${banId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "revoke",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to revoke ban."
        );
      }

      setConfirming(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to revoke ban."
      );
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="h-8 rounded-lg border border-black/[0.08] px-2.5 text-[11px] font-semibold text-[#666a72] transition hover:bg-[#f7f7f8]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={revoke}
          disabled={loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? (
            <Loader2
              size={12}
              className="animate-spin"
            />
          ) : (
            <ShieldOff size={12} />
          )}

          Confirm
        </button>

        {error && (
          <span className="max-w-[180px] truncate text-[10px] text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100"
    >
      <ShieldOff size={12} />
      Revoke
    </button>
  );
}