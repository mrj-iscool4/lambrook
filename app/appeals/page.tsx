"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  ShieldQuestion,
} from "lucide-react";

export default function AppealsPage() {
  const [form, setForm] = useState({
    robloxUserId: "",
    username: "",
    caseId: "",
    email: "",
    reason: "",
    statement: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [error, setError] = useState("");

  function update(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/appeals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to submit appeal."
        );
      }

      setSubmittedId(result.appeal.id);
      setSuccess(true);

      setForm({
        robloxUserId: "",
        username: "",
        caseId: "",
        email: "",
        reason: "",
        statement: "",
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit appeal."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#f8f9fb]">
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[700px] items-center justify-center px-6 py-12">
          <div className="w-full rounded-2xl border border-black/[0.07] bg-white p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.03)] sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={25} />
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#969aa1]">
              Appeal submitted
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111318]">
              Your appeal has been received
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#777b83]">
              Your appeal has been submitted to the UKRP moderation
              team. Please allow the team time to review your case.
            </p>

            <div className="mx-auto mt-6 max-w-sm rounded-xl bg-[#f8f9fb] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#a0a3a9]">
                Appeal reference
              </p>

              <p className="mt-1 break-all font-mono text-xs font-semibold text-[#555a63]">
                {submittedId}
              </p>
            </div>

            <Link
              href="/"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#111318] px-4 text-xs font-semibold text-white transition hover:bg-[#25272d]"
            >
              Return home
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f8f9fb]">
      {/* Header */}
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1000px] px-6 py-12 lg:px-10 lg:py-16">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#969aa1]">
              <ShieldQuestion size={13} />
              Moderation appeals
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111318] sm:text-4xl">
              Submit an Appeal
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#777b83]">
              If you believe a moderation action against your
              account was issued incorrectly, you can submit an
              appeal for the moderation team to review.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Form */}
          <form
            onSubmit={submit}
            className="rounded-2xl border border-black/[0.07] bg-white"
          >
            <div className="border-b border-black/[0.06] px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#686d75]">
                  <FileText size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#111318]">
                    Appeal information
                  </h2>

                  <p className="mt-1 text-xs text-[#969aa1]">
                    Provide accurate information about your
                    moderation record.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Roblox User ID"
                  value={form.robloxUserId}
                  onChange={(value) =>
                    update("robloxUserId", value)
                  }
                  placeholder="123456789"
                  required
                />

                <Field
                  label="Roblox Username"
                  value={form.username}
                  onChange={(value) =>
                    update("username", value)
                  }
                  placeholder="Username"
                  required
                />
              </div>

              <Field
                label="Case ID"
                value={form.caseId}
                onChange={(value) => update("caseId", value)}
                placeholder="UKRP-XXXX"
                required
              />

              <Field
                label="Email address"
                type="email"
                value={form.email}
                onChange={(value) => update("email", value)}
                placeholder="you@example.com"
                required
              />

              <Field
                label="Reason for appeal"
                value={form.reason}
                onChange={(value) => update("reason", value)}
                placeholder="Why do you believe this ban should be reviewed?"
                required
              />

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#858991]">
                  Your statement
                </label>

                <textarea
                  value={form.statement}
                  onChange={(event) =>
                    update("statement", event.target.value)
                  }
                  placeholder="Explain what happened and provide any relevant information..."
                  required
                  rows={7}
                  maxLength={5000}
                  className="w-full resize-y rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-6 text-[#111318] outline-none transition placeholder:text-[#a0a3a9] focus:border-black/[0.18]"
                />

                <p className="mt-1.5 text-right text-[10px] text-[#a0a3a9]">
                  {form.statement.length}/5000
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <p className="text-xs leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#111318] text-sm font-semibold text-white transition hover:bg-[#25272d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Appeal
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Information */}
          <div className="space-y-6">
            <InfoCard
              icon={<Info size={17} />}
              title="Before submitting"
            >
              <ul className="space-y-3">
                <li>
                  Be honest and provide as much relevant information
                  as possible.
                </li>
                <li>
                  Submitting multiple appeals for the same case may
                  delay your review.
                </li>
                <li>
                  Appeals are reviewed by authorised UKRP staff.
                </li>
                <li>
                  Approval is not guaranteed.
                </li>
              </ul>
            </InfoCard>

            <InfoCard
              icon={<ShieldQuestion size={17} />}
              title="What happens next?"
            >
              <p>
                Your appeal will be placed into the moderation
                queue. A member of staff will review the original
                moderation action and your statement before making
                a decision.
              </p>
            </InfoCard>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#858991]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#111318] outline-none transition placeholder:text-[#a0a3a9] focus:border-black/[0.18]"
      />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#686d75]">
          {icon}
        </div>

        <h2 className="text-sm font-semibold text-[#111318]">
          {title}
        </h2>
      </div>

      <div className="text-xs leading-6 text-[#777b83]">
        {children}
      </div>
    </div>
  );
}