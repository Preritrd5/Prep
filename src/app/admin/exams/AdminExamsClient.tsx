"use client";

import { useState } from "react";
import { BookOpen, Plus, Tag, Check, X, AlertCircle } from "lucide-react";
import { adminCreateExamAction, adminToggleExamStatusAction } from "@/app/actions/exams";
import type { Exam } from "@/lib/types";

interface AdminExamsClientProps {
  exams: Exam[];
}

export default function AdminExamsClient({ exams }: AdminExamsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("General Knowledge");
  const [subCategory, setSubCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("code", code);
    formData.append("category", category);
    formData.append("subCategory", subCategory);
    formData.append("description", description);

    const res = await adminCreateExamAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsModalOpen(false);
      setName("");
      setCode("");
      setSubCategory("");
      setDescription("");
    }
  };

  const handleToggle = async (exam: Exam) => {
    const formData = new FormData();
    formData.append("examId", exam.id);
    formData.append("currentStatus", exam.is_active ? "true" : "false");
    await adminToggleExamStatusAction(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Registered Examinations ({exams.length})
          </h2>
          <p className="text-xs text-slate-500">
            Configure examination categories, variants, and activation state.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Create Examination
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
            <tr>
              <th className="px-6 py-3.5">Exam Name & Code</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Sub-Category</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {exams.map((exam) => (
              <tr key={exam.id} className="hover:bg-slate-50/70">
                <td className="px-6 py-3.5">
                  <div className="font-bold text-slate-900">{exam.name}</div>
                  <div className="font-mono text-[10px] text-slate-400">{exam.code}</div>
                </td>
                <td className="px-6 py-3.5">{exam.category}</td>
                <td className="px-6 py-3.5 text-slate-500">{exam.sub_category || "—"}</td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      exam.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {exam.is_active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    onClick={() => handleToggle(exam)}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                  >
                    {exam.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Create New Examination</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a competitive examination to the public catalog.
            </p>

            {errorMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GATE — Electrical Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Unique Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="GATE-EE"
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
                    <option value="GATE">GATE</option>
                    <option value="KAS">KAS</option>
                    <option value="UPSC">UPSC</option>
                    <option value="Railway Examinations">Railway Examinations</option>
                    <option value="KEA Examinations">KEA Examinations</option>
                    <option value="AE Civil Engineering">AE Civil Engineering</option>
                    <option value="General Knowledge">General Knowledge</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sub-Category / Branch (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electrical Engineering"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of the examination..."
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
                  {isPending ? "Creating..." : "Save Examination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
