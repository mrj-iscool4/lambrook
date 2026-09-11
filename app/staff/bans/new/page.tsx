
"use client";

import Link from "next/link";
import { ArrowLeft, Ban, CalendarDays, Shield } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function NewBanPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const data = {
      robloxUserId: formData.get("robloxUserId"),
      username: formData.get("username"),
      displayName: formData.get("displayName"),
      reason: formData.get("reason"),
      duration: formData.get("duration"),
      expiresAt: formData.get("expiresAt"),
      notes: formData.get("notes"),
    };

    try {
      const response = await fetch("/api/staff/bans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong.");
        return;
      }

      router.push(`/staff/bans/${result.ban.id}`);
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1000px] px-6 py-8 lg:px-10">
          <Link
            href="/staff/bans"
            className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#858991] transition hover:text-[#111318]"
          >
            <ArrowLeft size={14} />
            Back to ban database
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111318] text-white">
              <Ban size={18} />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
                <Shield size={12} />
                Moderation
              </div>

              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#111318]">
                Issue a ban
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-6 py-8 lg:px-10 lg:py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <h2 className="text-sm font-semibold text-[#111318]">
                Player information
              </h2>

              <p className="mt-1 text-xs text-[#969aa1]">
                Identify the Roblox account being moderated.
              </p>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <Field
                label="Roblox User ID"
                name="robloxUserId"
                placeholder="123456789"
                required
              />

              <Field
                label="Username"
                name="username"
                placeholder="RobloxUsername"
                required
              />

              <Field
                label="Display name"
                name="displayName"
                placeholder="Display Name"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <h2 className="text-sm font-semibold text-[#111318]">
                Moderation details
              </h2>

              <p className="mt-1 text-xs text-[#969aa1]">
                Record the reason and duration for this action.
              </p>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="reason"
                  className="mb-2 block text-xs font-semibold text-[#555a63]"
                >
                  Reason
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="reason"
                  name="reason"
                  type="text"
                  required
                  placeholder="e.g. Exploiting, RDM, Staff Disrespect"
                  className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-3.5 text-sm text-[#111318] outline-none transition placeholder:text-[#b0b2b7] focus:border-black/[0.2] focus:ring-2 focus:ring-black/[0.04]"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="mb-2 block text-xs font-semibold text-[#555a63]"
                >
                  Duration
                </label>

                <select
                  id="duration"
                  name="duration"
                  defaultValue="24 Hours"
                  required
                  className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-3.5 text-sm text-[#111318] outline-none transition focus:border-black/[0.2]"
                >
                  {durations.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="expiresAt"
                  className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#555a63]"
                >
                  <CalendarDays size={13} />
                  Expiry date
                </label>

                <input
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-3.5 text-sm text-[#111318] outline-none transition focus:border-black/[0.2] focus:ring-2 focus:ring-black/[0.04]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="notes"
                  className="mb-2 block text-xs font-semibold text-[#555a63]"
                >
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={5}
                  placeholder="Add any relevant moderation notes..."
                  className="w-full resize-none rounded-lg border border-black/[0.08] bg-white px-3.5 py-3 text-sm text-[#111318] outline-none transition placeholder:text-[#b0b2b7] focus:border-black/[0.2] focus:ring-2 focus:ring-black/[0.04]"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
              <p className="text-xs font-semibold text-red-700">{error}</p>
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <p className="text-xs font-semibold text-amber-800">
              Moderation action
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              This action will create a permanent moderation record. Make sure
              the player information and reason are correct before submitting.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/staff/bans"
              className="flex h-11 items-center justify-center rounded-lg border border-black/[0.08] bg-white px-5 text-xs font-semibold text-[#555a63] transition hover:border-black/[0.14] hover:bg-[#fafafa]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#111318] px-5 text-xs font-semibold text-white transition hover:bg-[#25272c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Ban size={14} />
              {loading ? "Creating..." : "Issue ban"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold text-[#555a63]"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-3.5 text-sm text-[#111318] outline-none transition placeholder:text-[#b0b2b7] focus:border-black/[0.2] focus:ring-2 focus:ring-black/[0.04]"
      />
    </div>
  );
}
