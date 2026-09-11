"use client";

import Link from "next/link";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRuleForm({
  categories,
}: {
  categories: {
    id: string;
    name: string;
  }[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id ?? ""
  );
  const [severity, setSeverity] = useState("Standard");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !categoryId) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/staff/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          categoryId,
          severity,
          published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create rule."
        );
      }

      router.push("/staff/rules");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to create rule."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white"
    >
      <div className="space-y-6 p-6 sm:p-8">
        <Field label="Category">
          <select
            value={categoryId}
            onChange={(event) =>
              setCategoryId(event.target.value)
            }
            className={inputClass}
          >
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Rule title">
          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. No combat logging"
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Explain the rule clearly..."
            rows={7}
            className={`${inputClass} h-auto resize-none py-3`}
          />
        </Field>

        <Field label="Severity">
          <select
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value)
            }
            className={inputClass}
          >
            <option>Standard</option>
            <option>Serious</option>
            <option>Severe</option>
          </select>
        </Field>

        <div className="rounded-xl border border-black/[0.06] bg-[#fafafa] p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) =>
                setPublished(event.target.checked)
              }
              className="mt-0.5 h-4 w-4 rounded border-gray-300"
            />

            <span>
              <span className="flex items-center gap-2 text-xs font-semibold text-[#111318]">
                <Check size={13} />
                Publish immediately
              </span>

              <span className="mt-1 block text-[11px] leading-5 text-[#858991]">
                If disabled, the rule will be saved as a draft
                and won't appear on the public rules page.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-between border-t border-black/[0.06] bg-[#fafafa] px-6 py-4 sm:px-8">
        <Link
          href="/staff/rules"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/[0.08] px-4 text-xs font-semibold text-[#555a63] transition hover:bg-white"
        >
          <ArrowLeft size={13} />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={
            saving ||
            !title.trim() ||
            !description.trim() ||
            !categoryId
          }
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#111318] px-4 text-xs font-semibold text-white transition hover:bg-[#25272d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={13} />
          {saving ? "Creating..." : "Create rule"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#858991]">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-black/[0.08] bg-white px-3 text-sm text-[#111318] outline-none transition placeholder:text-[#a0a3a9] focus:border-black/[0.2]";