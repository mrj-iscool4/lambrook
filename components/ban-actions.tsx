"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Edit3,
  Loader2,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

type BanActionsProps = {
  ban: {
    id: string;
    reason: string;
    duration: string;
    expiresAt: Date | null;
    notes: string | null;
    active: boolean;
  };
};

const durations = [
  "Warning",
  "1 Hour",
  "6 Hours",
  "12 Hours",
  "24 Hours",
  "3 Days",
  "7 Days",
  "14 Days",
  "30 Days",
  "Permanent",
];

export default function BanActions({ ban }: BanActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "revoke" | "restore" | null
  >(null);

  const [reason, setReason] = useState(ban.reason);
  const [duration, setDuration] = useState(ban.duration);
  const [expiresAt, setExpiresAt] = useState(
    ban.expiresAt
      ? new Date(ban.expiresAt).toISOString().slice(0, 16)
      : ""
  );
  const [notes, setNotes] = useState(ban.notes || "");

  async function performAction(action: "revoke" | "restore") {
    setLoading(true);

    try {
      const response = await fetch(`/api/staff/bans/${ban.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      setConfirmAction(null);
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit() {
    if (!reason.trim()) {
      alert("A moderation reason is required.");
      return;
    }

    if (!duration.trim()) {
      alert("A duration is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/staff/bans/${ban.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "edit",
          reason,
          duration,
          expiresAt,
          notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update ban.");
      }

      setEditing(false);
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update ban."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-2">
        {ban.active ? (
          <button
            type="button"
            onClick={() => setConfirmAction("revoke")}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#111318] px-4 text-xs font-semibold text-white transition hover:bg-[#25272c]"
          >
            <X size={14} />
            Revoke ban
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmAction("restore")}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#111318] px-4 text-xs font-semibold text-white transition hover:bg-[#25272c]"
          >
            <RotateCcw size={14} />
            Restore ban
          </button>
        )}

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-black/[0.08] bg-white px-4 text-xs font-semibold text-[#555a63] transition hover:bg-[#f7f7f8]"
        >
          <Edit3 size={14} />
          Edit record
        </button>
      </div>

      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#111318]">
                  {confirmAction === "revoke"
                    ? "Revoke this ban?"
                    : "Restore this ban?"}
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#777b83]">
                  {confirmAction === "revoke"
                    ? "This will mark the moderation record as inactive. The player will no longer be considered actively banned."
                    : "This will mark the moderation record as active again."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmAction(null)}
                className="flex h-10 flex-1 items-center justify-center rounded-lg border border-black/[0.08] text-xs font-semibold text-[#555a63] transition hover:bg-[#f7f7f8] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => performAction(confirmAction)}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#111318] text-xs font-semibold text-white transition hover:bg-[#25272c] disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}

                {confirmAction === "revoke"
                  ? "Revoke ban"
                  : "Restore ban"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      {editing && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/20 px-6 py-10 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-2xl rounded-2xl border border-black/[0.08] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
              <div>
                <h2 className="text-sm font-semibold text-[#111318]">
                  Edit moderation record
                </h2>

                <p className="mt-1 text-xs text-[#969aa1]">
                  Update the public moderation information and internal notes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#969aa1] transition hover:bg-[#f5f5f6] hover:text-[#111318]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#858991]">
                  Reason
                </label>

                <input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 text-sm text-[#111318] outline-none transition placeholder:text-[#a0a3a9] focus:border-black/[0.18] focus:ring-2 focus:ring-black/[0.03]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#858991]">
                  Duration
                </label>

                <select
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 text-sm text-[#111318] outline-none transition focus:border-black/[0.18]"
                >
                  {durations.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {duration !== "Permanent" && duration !== "Warning" && (
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#858991]">
                    Expiry
                  </label>

                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    className="h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 text-sm text-[#111318] outline-none transition focus:border-black/[0.18]"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#858991]">
                  Internal notes
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={5}
                  placeholder="Internal staff notes..."
                  className="w-full resize-none rounded-xl border border-black/[0.08] bg-white px-3.5 py-3 text-sm text-[#111318] outline-none transition placeholder:text-[#a0a3a9] focus:border-black/[0.18] focus:ring-2 focus:ring-black/[0.03]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-black/[0.06] px-6 py-4">
              <button
                type="button"
                disabled={loading}
                onClick={() => setEditing(false)}
                className="h-10 rounded-lg border border-black/[0.08] px-4 text-xs font-semibold text-[#555a63] transition hover:bg-[#f7f7f8] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={saveEdit}
                className="flex h-10 items-center gap-2 rounded-lg bg-[#111318] px-4 text-xs font-semibold text-white transition hover:bg-[#25272c] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}

                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}