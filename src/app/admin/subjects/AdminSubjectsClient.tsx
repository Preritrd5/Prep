"use client";

import { useState } from "react";
import { Layers, Plus, AlertCircle, Tag } from "lucide-react";
import { adminCreateSubjectAction } from "@/app/actions/syllabus";
import type { Subject } from "@/lib/types";

interface AdminSubjectsClientProps {
  subjects: Subject[];
}

export default function AdminSubjectsClient({ subjects }: AdminSubjectsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("General Studies");
  const [description, setDescription] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("code", code);
    formData.append("category", category);
    formData.append("description", description);

    const res = await adminCreateSubjectAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsModalOpen(false);
      setName("");
      setCode("");
      setDescription("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Subject Repository ({subjects.length})
          </h2>
          <p className="text-xs text-slate-500">
            Modular subjects shared and mapped across competitive examinations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Create Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                {s.category || "General"}
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-bold">{s.code}</span>
            </div>

            <h3 className="mt-3 text-base font-bold text-slate-900">{s.name}</h3>
            {s.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Create Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Create Subject</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a reusable subject to the central curriculum library.
            </p>

            {errorMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Environmental Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CE-ENV"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="General Studies">General Studies</option>
                    <option value="Technical">Technical</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="Static GK">Static GK</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Coverage summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-60"
                >
                  {isPending ? "Creating..." : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
