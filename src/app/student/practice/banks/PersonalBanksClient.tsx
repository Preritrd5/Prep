"use client";

import { useState, useTransition } from "react";
import {
  FolderPlus,
  Plus,
  BookOpen,
  Lock,
  Layers,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import type { QuestionBank, Question, Subject, OptionLabel, DifficultyLevel } from "@/lib/types";
import {
  studentCreatePersonalBankAction,
  studentCreatePersonalQuestionAction,
} from "@/app/actions/questions";
import PracticeRunner from "@/components/practice/PracticeRunner";

interface PersonalBanksClientProps {
  personalBanks: QuestionBank[];
  personalQuestions: Question[];
  subjects: Subject[];
  bookmarkedIds: string[];
}

export default function PersonalBanksClient({
  personalBanks: initialBanks,
  personalQuestions: initialQuestions,
  subjects,
  bookmarkedIds,
}: PersonalBanksClientProps) {
  const [banks, setBanks] = useState<QuestionBank[]>(initialBanks);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const [showNewBankModal, setShowNewBankModal] = useState(false);
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);

  const [bankName, setBankName] = useState("");
  const [bankDesc, setBankDesc] = useState("");

  // New Question Form state
  const [qText, setQText] = useState("");
  const [qSubjectId, setQSubjectId] = useState("");
  const [qDifficulty, setQDifficulty] = useState<DifficultyLevel>("Medium");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctAns, setCorrectAns] = useState<OptionLabel>("A");
  const [exp, setExp] = useState("");

  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreateBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName) return;

    const fd = new FormData();
    fd.append("name", bankName);
    if (bankDesc) fd.append("description", bankDesc);

    startTransition(async () => {
      const res = await studentCreatePersonalBankAction(fd);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        const newBank: QuestionBank = {
          id: res.bankId,
          name: bankName,
          description: bankDesc || null,
          is_system: false,
          is_published: false,
          created_by: "student",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setBanks([newBank, ...banks]);
        setShowNewBankModal(false);
        setBankName("");
        setBankDesc("");
        setMsg({ type: "success", text: "Personal question bank created!" });
      }
    });
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText || !optA || !optB || !optC || !optD) return;

    const fd = new FormData();
    if (selectedBankId) fd.append("bank_id", selectedBankId);
    fd.append("question_text", qText);
    if (qSubjectId) fd.append("subject_id", qSubjectId);
    fd.append("difficulty", qDifficulty);
    fd.append("option_a", optA);
    fd.append("option_b", optB);
    fd.append("option_c", optC);
    fd.append("option_d", optD);
    fd.append("correct_option", correctAns);
    if (exp) fd.append("explanation", exp);

    startTransition(async () => {
      const res = await studentCreatePersonalQuestionAction(fd);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        const newQ: Question = {
          id: res.questionId,
          bank_id: selectedBankId,
          question_text: qText,
          subject_id: qSubjectId || null,
          chapter_id: null,
          topic_id: null,
          difficulty: qDifficulty,
          source_type: "Student Created",
          pyq_exam_name: null,
          pyq_year: null,
          source_reference: "Personal Notes",
          status: "Published",
          is_personal: true,
          created_by: "student",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          options: [
            { id: "1", question_id: res.questionId, option_label: "A", option_text: optA, order_index: 1, created_at: "" },
            { id: "2", question_id: res.questionId, option_label: "B", option_text: optB, order_index: 2, created_at: "" },
            { id: "3", question_id: res.questionId, option_label: "C", option_text: optC, order_index: 3, created_at: "" },
            { id: "4", question_id: res.questionId, option_label: "D", option_text: optD, order_index: 4, created_at: "" },
          ],
        };
        setQuestions([newQ, ...questions]);
        setShowNewQuestionModal(false);
        setQText("");
        setOptA("");
        setOptB("");
        setOptC("");
        setOptD("");
        setExp("");
        setMsg({ type: "success", text: "Personal question added successfully!" });
      }
    });
  };

  const activeQuestions = selectedBankId
    ? questions.filter((q) => q.bank_id === selectedBankId)
    : questions;

  if (isPracticing) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setIsPracticing(false)}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          ← Exit Personal Bank Practice
        </button>
        <PracticeRunner
          questions={activeQuestions}
          title="Private Question Bank Practice"
          subtitle="Practicing your personally authored multiple choice questions."
          bookmarkedQuestionIds={bookmarkedIds}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" /> Private Student Question Banks
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Author and organize your own custom MCQ collections. Strictly private to your account via Supabase Row-Level Security.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewBankModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-medium text-xs hover:bg-indigo-100 transition"
          >
            <FolderPlus className="w-4 h-4" /> New Bank
          </button>
          <button
            onClick={() => setShowNewQuestionModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Private Question
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Banks Selection Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedBankId(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedBankId === null
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Personal Questions ({questions.length})
        </button>
        {banks.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBankId(b.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedBankId === b.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Questions list or practice CTA */}
      {activeQuestions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-lg text-slate-800">Bank is Empty</h3>
          <p className="text-sm text-slate-400 mt-1">
            Click &quot;Add Private Question&quot; to author your first customized question in this bank.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {activeQuestions.length} private questions
            </span>
            <button
              onClick={() => setIsPracticing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 shadow-sm transition"
            >
              <BookOpen className="w-3.5 h-3.5" /> Practice This Bank ({activeQuestions.length})
            </button>
          </div>

          <div className="space-y-3">
            {activeQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400">Personal #{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700">
                    {q.difficulty}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-snug">{q.question_text}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(q.options || []).map((opt) => (
                    <div
                      key={opt.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded bg-white border flex items-center justify-center font-bold text-slate-800">
                        {opt.option_label}
                      </span>
                      <span>{opt.option_text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Question Bank */}
      {showNewBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-in">
            <h3 className="text-base font-bold text-slate-900">Create Private Question Bank</h3>
            <form onSubmit={handleCreateBank} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Tough Geotechnical Formulas, Polity Tricky Cases"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={bankDesc}
                  onChange={(e) => setBankDesc(e.target.value)}
                  placeholder="Personal notes on the scope of this bank..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewBankModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Create Bank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Private Question */}
      {showNewQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scale-in my-8">
            <h3 className="text-base font-bold text-slate-900">Add Private Question</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Question Text *
                </label>
                <textarea
                  required
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Type your question statement..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Subject (Optional)
                  </label>
                  <select
                    value={qSubjectId}
                    onChange={(e) => setQSubjectId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700"
                  >
                    <option value="">None / General</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Difficulty
                  </label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* 4 Options */}
              <div className="space-y-2 pt-1">
                {[
                  { label: "A", val: optA, setter: setOptA },
                  { label: "B", val: optB, setter: setOptB },
                  { label: "C", val: optC, setter: setOptC },
                  { label: "D", val: optD, setter: setOptD },
                ].map((opt) => (
                  <div key={opt.label} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="private_key"
                      checked={correctAns === opt.label}
                      onChange={() => setCorrectAns(opt.label as OptionLabel)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 border">
                      {opt.label}
                    </span>
                    <input
                      type="text"
                      required
                      value={opt.val}
                      onChange={(e) => opt.setter(e.target.value)}
                      placeholder={`Option ${opt.label} text...`}
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Personal Explanation / Formula Notes
                </label>
                <textarea
                  rows={2}
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  placeholder="Why is this answer correct? Key equation or trick..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewQuestionModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
