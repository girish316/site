"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { deleteSkill, getSkills, upsertSkill } from "@/lib/db";
import type { SkillNode } from "@/types";

type SkillCategory = SkillNode["cat"];

type SkillForm = {
  id?: string;
  label: string;
  cat: SkillCategory;
  level: number;
  desc: string;
  order: number;
  url: string;
  connections: string[];
};

const EMPTY_FORM: SkillForm = {
  label: "",
  cat: "core",
  level: 75,
  desc: "",
  order: 99,
  url: "",
  connections: [],
};

const CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: "core", label: "Core Languages" },
  { value: "systems", label: "Systems" },
  { value: "ai", label: "AI / ML" },
  { value: "robotics", label: "Robotics" },
  { value: "web", label: "Web / Cloud" },
  { value: "learning", label: "Learning Now" },
];

function toForm(skill: SkillNode): SkillForm {
  return {
    id: skill.id,
    label: skill.label || "",
    cat: skill.cat || "core",
    level: Number(skill.level) || 75,
    desc: skill.desc || "",
    order: Number(skill.order) || 99,
    url: skill.url || "",
    connections: Array.isArray(skill.connections) ? skill.connections : [],
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: any) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white"
    />
  );
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillNode[]>([]);
  const [editing, setEditing] = useState<SkillForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const sortedSkills = useMemo(
    () => [...skills].sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99)),
    [skills]
  );

  async function loadSkills() {
    setLoading(true);
    try {
      const data = await getSkills();
      setSkills(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  function startNew() {
    setEditing({
      ...EMPTY_FORM,
      order: sortedSkills.length + 1,
    });
  }

  function startEdit(skill: SkillNode) {
    setEditing(toForm(skill));
  }

  function cancel() {
    setEditing(null);
  }

  async function saveSkill() {
    if (!editing?.label.trim()) {
      alert("Skill name required");
      return;
    }

    setSaving(true);

    try {
      const payload: Partial<SkillNode> = {
        label: editing.label.trim(),
        cat: editing.cat,
        level: Math.min(100, Math.max(1, Number(editing.level) || 75)),
        desc: editing.desc.trim(),
        order: Number(editing.order) || 99,
        url: editing.url.trim(),
        connections: editing.connections,
      };

      await upsertSkill(payload, editing.id);
      await loadSkills();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(skill: SkillNode) {
    if (!skill.id) return;
    if (!confirm(`Delete "${skill.label}"?`)) return;

    await deleteSkill(skill.id);
    await loadSkills();
  }

  if (editing) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={cancel} className="btn-ghost p-2">
            <ArrowLeft size={16} />
          </button>

          <h1 className="font-display font-bold text-2xl text-slate-900">
            {editing.id ? "Edit Skill" : "New Skill"}
          </h1>

          <div className="ml-auto flex gap-2">
            <button onClick={cancel} className="btn-secondary">
              Cancel
            </button>

            <button onClick={saveSkill} disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Skill Name">
              <Input
                value={editing.label}
                onChange={(v: string) => setEditing((e) => e && { ...e, label: v })}
                placeholder="C++, ROS2, Firebase..."
              />
            </Field>

            <Field label="Category">
              <select
                value={editing.cat}
                onChange={(e) =>
                  setEditing((f) => f && { ...f, cat: e.target.value as SkillCategory })
                }
                className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Level">
              <Input
                type="number"
                value={editing.level}
                onChange={(v: string) =>
                  setEditing((e) => e && { ...e, level: Number(v) })
                }
                placeholder="85"
              />
            </Field>

            <Field label="Order">
              <Input
                type="number"
                value={editing.order}
                onChange={(v: string) =>
                  setEditing((e) => e && { ...e, order: Number(v) })
                }
                placeholder="1"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={editing.desc}
              onChange={(e) =>
                setEditing((f) => f && { ...f, desc: e.target.value })
              }
              rows={3}
              placeholder="Short description shown on hover..."
              className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white resize-y"
            />
          </Field>

          <Field label="Node Link">
            <Input
              value={editing.url}
              onChange={(v: string) => setEditing((e) => e && { ...e, url: v })}
              placeholder="#projects, /blog, /projects/my-project, https://github.com/..."
            />
          </Field>

          <Field label="Connections">
            <Input
              value={editing.connections.join(", ")}
              onChange={(v: string) =>
                setEditing((e) =>
                  e
                    ? {
                        ...e,
                        connections: v
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      }
                    : e
                )
              }
              placeholder="cpp, linux, ros2"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Use skill IDs, separated by commas. Example: cpp, linux, ros2
            </p>
          </Field>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Skills Map</h1>
          <p className="text-slate-500 text-sm mt-1">
            {skills.length} constellation nodes
          </p>
        </div>

        <button onClick={startNew} className="btn-primary">
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-500" size={24} />
        </div>
      ) : sortedSkills.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-3">✨</div>
          <p className="font-mono text-sm">No skills yet.</p>
          <button onClick={startNew} className="btn-primary mt-4">
            Add your first skill
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-w-3xl">
          {sortedSkills.map((skill) => (
            <div key={skill.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs text-slate-400">{skill.cat}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface-100 text-slate-500 border border-surface-200">
                    {skill.level}%
                  </span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface-100 text-slate-500 border border-surface-200">
                    order {skill.order}
                  </span>
                </div>

                <div className="font-display font-semibold text-slate-900">
                  {skill.label}
                </div>

                <div className="font-mono text-xs text-slate-400 mt-0.5 truncate">
                  {skill.desc || "No description yet."}
                </div>

                {skill.connections?.length ? (
                  <div className="font-mono text-xs text-brand-500 mt-1 truncate">
                    connects to: {skill.connections.join(", ")}
                  </div>
                ) : null}
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(skill)}
                  className="p-2 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-brand-600 transition-colors"
                >
                  <Pencil size={15} />
                </button>

                <button
                  onClick={() => handleDelete(skill)}
                  className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}