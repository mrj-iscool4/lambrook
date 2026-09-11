"use client";

import {
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AppealActions({
  appealId,
  banId,
}: {
  appealId: string;
  banId: string | null;
}) {
  const router = useRouter();

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<
    "approve" | "deny" | null
  >(null);
  const [error, setError] = useState("");

  async function submit() {
    if (!action) return;

    setLoading(true);
    setError("");

    try {
      const result = await fetch(
        `/api/staff/appeals/${appealId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            response,
            banId,
          }),
        }
      );

      const data = await result.json();

      if (!result.ok) {
        throw new Error(
          data.error || "Failed to update appeal."
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update appeal."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#858991]">
        Staff response
      </label>

      <textarea
        value={response}
        onChange={(event) =>
          setResponse(event.target.value)
        }
        placeholder="Write a response to the player..."
        rows={5}
        maxLength={3000}
        className="w-full resize-y rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-6 text-[#111318] outline-none transition placeholder:text-[#a0a3a9] focus:border-black/[0.18]"
      />

      <div className="mt-1.5 text-right text-[10px] text-[#a0a3a9]">
        {response.length}/3000
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => setAction("deny")}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition disabled:opacity-50 ${
            action === "deny"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-black/[0.08] text-[#555a63] hover:bg-[#f7f7f8]"
          }`}
        >
          <XCircle size={14} />
          Deny Appeal
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => setAction("approve")}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition disabled:opacity-50 ${
            action === "approve"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-black/[0.08] text-[#555a63] hover:bg-[#f7f7f8]"
          }`}
        >
          <CheckCircle2 size={14} />
          Approve Appeal
        </button>
      </div>

      {action && (
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#111318] text-xs font-semibold text-white transition hover:bg-[#25272d] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2
                size={14}
                className="animate-spin"
              />
              Processing...
            </>
          ) : action === "approve" ? (
            <>
              Confirm Approval
              <CheckCircle2 size={14} />
            </>
          ) : (
            <>
              Confirm Denial
              <XCircle size={14} />
            </>
          )}
        </button>
      )}

      {action === "approve" && !banId && (
        <p className="mt-3 text-[10px] leading-5 text-red-600">
          The original ban could not be found. Approval is
          disabled by the server until the moderation record can
          be verified.
        </p>
      )}
    </div>
  );
}