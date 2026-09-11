"use client";

import {
  Archive,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Rule = {
  id: string;
  ruleNumber: string;
  title: string;
  description: string;
  severity: string;
  published: boolean;
  archived: boolean;
  sortOrder: number;
  categoryId: string;
  categoryName: string;
};

type Category = {
  id: string;
  name: string;
};

export default function RuleManager({
  initialRules,
  categories,
}: {
  initialRules: Rule[];
  categories: Category[];
}) {
  const [rules, setRules] = useState(initialRules);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Rule | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredRules = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return rules;

    return rules.filter(
      (rule) =>
        rule.ruleNumber.toLowerCase().includes(search) ||
        rule.title.toLowerCase().includes(search) ||
        rule.description.toLowerCase().includes(search) ||
        rule.categoryName.toLowerCase().includes(search)
    );
  }, [rules, query]);

  const grouped = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        rules: filteredRules
          .filter((rule) => rule.categoryId === category.id)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .filter((group) => group.rules.length > 0);
  }, [categories, filteredRules]);

  async function updateRule(
    id: string,
    changes: Partial<Rule>
  ) {
    setSaving(true);

    try {
      const response = await fetch(`/api/staff/rules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update rule.");
      }

      setRules((current) =>
        current.map((rule) =>
          rule.id === id
            ? {
                ...rule,
                ...data,
                categoryName:
                  data.category?.name ?? rule.categoryName,
              }
            : rule
        )
      );

      setEditing(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update rule."
      );
    } finally {
      setSaving(false);
    }
  }

  async function archiveRule(rule: Rule) {
    if (
      !window.confirm(
        `Archive ${rule.ruleNumber} — ${rule.title}?`
      )
    ) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/staff/rules/${rule.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to archive rule.");
      }

      setRules((current) =>
        current.filter((item) => item.id !== rule.id)
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to archive rule."
      );
    } finally {
      setSaving(false);
    }
  }

  async function moveRule(rule: Rule, direction: "up" | "down") {
    const sameCategory = rules
      .filter(
        (item) =>
          item.categoryId === rule.categoryId &&
          !item.archived
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const index = sameCategory.findIndex(
      (item) => item.id === rule.id
    );

    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      index === -1 ||
      targetIndex < 0 ||
      targetIndex >= sameCategory.length
    ) {
      return;
    }

    const target = sameCategory[targetIndex];

    setSaving(true);

    try {
      await Promise.all([
        updateDirect(rule.id, {
          sortOrder: target.sortOrder,
        }),
        updateDirect(target.id, {
          sortOrder: rule.sortOrder,
        }),
      ]);

      setRules((current) =>
        current.map((item) => {
          if (item.id === rule.id) {
            return {
              ...item,
              sortOrder: target.sortOrder,
            };
          }

          if (item.id === target.id) {
            return {
              ...item,
              sortOrder: rule.sortOrder,
            };
          }

          return item;
        })
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateDirect(
    id: string,
    changes: Record<string, unknown>
  ) {
    const response = await fetch(`/api/staff/rules/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(changes),
    });

    if (!response.ok) {
      throw new Error("Unable to reorder rules.");
    }
  }

  return (
    <>
      <div className="mb-5 rounded-2xl border border-black/[0.07] bg-white p-4">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#969aa1]"
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rules..."
            className="h-11 w-full rounded-xl border border-black/[0.08] bg-white pl-10 pr-4 text-sm text-[#111318] outline-none transition placeholder:text-[#a0a3a9] focus:border-black/[0.18]"
          />
        </div>
      </div>

      <div className="space-y-8">
        {grouped.map(({ category, rules: categoryRules }) => (
          <section key={category.id}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#111318]">
                  {category.name}
                </h2>

                <p className="mt-1 text-[11px] text-[#969aa1]">
                  {categoryRules.length} rules
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
              <div className="divide-y divide-black/[0.05]">
                {categoryRules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className="p-5 transition hover:bg-[#fafafa]"
                  >
                    <div className="flex gap-4">
                      <div className="hidden shrink-0 pt-1 sm:block">
                        <span className="font-mono text-[10px] text-[#a0a3a9]">
                          {rule.ruleNumber}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] text-[#a0a3a9] sm:hidden">
                            {rule.ruleNumber}
                          </span>

                          <h3 className="text-sm font-semibold text-[#111318]">
                            {rule.title}
                          </h3>

                          <SeverityBadge
                            severity={rule.severity}
                          />

                          {rule.published ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                              <Eye size={10} />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#777b83]">
                              <EyeOff size={10} />
                              Draft
                            </span>
                          )}
                        </div>

                        <p className="mt-2 max-w-3xl text-xs leading-6 text-[#686d75]">
                          {rule.description}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditing(rule)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/[0.08] px-3 text-[10px] font-semibold text-[#555a63] transition hover:bg-[#f3f4f5]"
                          >
                            <Edit3 size={12} />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              updateRule(rule.id, {
                                published: !rule.published,
                              })
                            }
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/[0.08] px-3 text-[10px] font-semibold text-[#555a63] transition hover:bg-[#f3f4f5] disabled:opacity-50"
                          >
                            {rule.published ? (
                              <>
                                <EyeOff size={12} />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Check size={12} />
                                Publish
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => archiveRule(rule)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-100 px-3 text-[10px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Archive size={12} />
                            Archive
                          </button>

                          <div className="ml-auto flex items-center gap-1">
                            <button
                              type="button"
                              disabled={saving || index === 0}
                              onClick={() =>
                                moveRule(rule, "up")
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] text-[#858991] transition hover:bg-[#f3f4f5] disabled:opacity-30"
                              title="Move up"
                            >
                              <ChevronUp size={14} />
                            </button>

                            <button
                              type="button"
                              disabled={
                                saving ||
                                index ===
                                  categoryRules.length - 1
                              }
                              onClick={() =>
                                moveRule(rule, "down")
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] text-[#858991] transition hover:bg-[#f3f4f5] disabled:opacity-30"
                              title="Move down"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {editing && (
        <EditModal
          rule={editing}
          categories={categories}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={(changes) =>
            updateRule(editing.id, changes)
          }
        />
      )}
    </>
  );
}

function EditModal({
  rule,
  categories,
  saving,
  onClose,
  onSave,
}: {
  rule: Rule;
  categories: Category[];
  saving: boolean;
  onClose: () => void;
  onSave: (changes: Partial<Rule>) => void;
}) {
  const [title, setTitle] = useState(rule.title);
  const [description, setDescription] = useState(
    rule.description
  );
  const [categoryId, setCategoryId] = useState(
    rule.categoryId
  );
  const [severity, setSeverity] = useState(rule.severity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
          <div>
            <p className="font-mono text-[10px] text-[#a0a3a9]">
              {rule.ruleNumber}
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#111318]">
              Edit rule
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#858991] transition hover:bg-[#f3f4f5] hover:text-[#111318]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <Field label="Title">
            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              className={`${inputClass} resize-none py-3`}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
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
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-black/[0.06] bg-[#fafafa] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-black/[0.08] px-4 text-xs font-semibold text-[#555a63] transition hover:bg-white"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving || !title.trim() || !description.trim()}
            onClick={() =>
              onSave({
                title: title.trim(),
                description: description.trim(),
                categoryId,
                severity,
              })
            }
            className="h-9 rounded-lg bg-[#111318] px-4 text-xs font-semibold text-white transition hover:bg-[#25272d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const style =
    severity === "Severe"
      ? "bg-red-50 text-red-700"
      : severity === "Serious"
        ? "bg-amber-50 text-amber-700"
        : "bg-[#f3f4f5] text-[#686d75]";

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${style}`}
    >
      {severity}
    </span>
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
  "h-10 w-full rounded-lg border border-black/[0.08] bg-white px-3 text-sm text-[#111318] outline-none transition placeholder:text-[#a0a3a9] focus:border-black/[0.2]";