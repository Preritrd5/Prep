"use client";

import { Card, Badge, Button, Modal, Input, Textarea, Select, Alert, EmptyState } from "@/components/ui";
import { useState, useTransition } from "react";
import {
  FolderPlus,
  Plus,
  BookOpen,
  Lock,
  ChevronLeft,
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
        const qId = res.questionId || `q-personal-${Date.now()}`;
        const newQ: Question = {
          id: qId,
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
            { id: "1", question_id: qId, option_label: "A", option_text: optA, order_index: 1, created_at: new Date().toISOString() },
            { id: "2", question_id: qId, option_label: "B", option_text: optB, order_index: 2, created_at: new Date().toISOString() },
            { id: "3", question_id: qId, option_label: "C", option_text: optC, order_index: 3, created_at: new Date().toISOString() },
            { id: "4", question_id: qId, option_label: "D", option_text: optD, order_index: 4, created_at: new Date().toISOString() },
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPracticing(false)}
          className="text-xs text-primary hover:text-primary-hover gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Exit Personal Bank Practice
        </Button>
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
      <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Private Student Question Banks
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Author and organize your own custom MCQ collections. Strictly private to your account via Supabase Row-Level Security.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewBankModal(true)}
            className="gap-1.5 text-xs"
          >
            <FolderPlus className="w-4 h-4" /> New Bank
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewQuestionModal(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" /> Add Private Question
          </Button>
        </div>
      </Card>

      {msg && (
        <Alert
          variant={msg.type === "success" ? "success" : "error"}
          title={msg.text}
          onClose={() => setMsg(null)}
        />
      )}

      {/* Banks Selection Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedBankId(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            selectedBankId === null
              ? "bg-primary text-white shadow-sm"
              : "bg-card border border-border text-text-secondary hover:bg-secondary-bg"
          }`}
        >
          All Personal Questions ({questions.length})
        </button>
        {banks.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBankId(b.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedBankId === b.id
                ? "bg-primary text-white shadow-sm"
                : "bg-card border border-border text-text-secondary hover:bg-secondary-bg"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Questions list or practice CTA */}
      {activeQuestions.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Bank is Empty"
          description="Click 'Add Private Question' to author your first customized question in this bank."
          action={{
            label: "Add Private Question",
            onClick: () => setShowNewQuestionModal(true),
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Showing {activeQuestions.length} private questions
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPracticing(true)}
              className="gap-1.5 text-xs bg-success hover:bg-success/90"
            >
              <BookOpen className="w-3.5 h-3.5" /> Practice This Bank ({activeQuestions.length})
            </Button>
          </div>

          <div className="space-y-3">
            {activeQuestions.map((q, idx) => (
              <Card key={q.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-muted">Personal #{idx + 1}</span>
                  <Badge variant="primary">{q.difficulty}</Badge>
                </div>

                <p className="text-sm font-semibold text-text-primary leading-snug">{q.question_text}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(q.options || []).map((opt) => (
                    <div
                      key={opt.id}
                      className="p-2.5 rounded-xl bg-secondary-bg border border-border text-xs text-text-primary flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-md bg-card border border-border flex items-center justify-center font-bold text-text-primary text-[11px]">
                        {opt.option_label}
                      </span>
                      <span>{opt.option_text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Question Bank */}
      <Modal
        isOpen={showNewBankModal}
        onClose={() => setShowNewBankModal(false)}
        title="Create Private Question Bank"
        description="Organize your personal practice items into focused topic folders."
      >
        <form onSubmit={handleCreateBank} className="space-y-4">
          <Input
            label="Bank Name *"
            required
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. Tough Geotechnical Formulas, Polity Tricky Cases"
          />
          <Textarea
            label="Description (Optional)"
            rows={2}
            value={bankDesc}
            onChange={(e) => setBankDesc(e.target.value)}
            placeholder="Personal notes on the scope of this bank..."
          />
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewBankModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Bank"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Private Question */}
      <Modal
        isOpen={showNewQuestionModal}
        onClose={() => setShowNewQuestionModal(false)}
        title="Add Private Question"
        description="Author an MCQ strictly visible to your student account."
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <Textarea
            label="Question Text *"
            required
            rows={3}
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Type your question statement..."
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Subject (Optional)"
              value={qSubjectId}
              onChange={(e) => setQSubjectId(e.target.value)}
              options={[
                { value: "", label: "None / General" },
                ...subjects.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
            <Select
              label="Difficulty"
              value={qDifficulty}
              onChange={(e) => setQDifficulty(e.target.value as DifficultyLevel)}
              options={[
                { value: "Easy", label: "Easy" },
                { value: "Medium", label: "Medium" },
                { value: "Hard", label: "Hard" },
              ]}
            />
          </div>

          {/* 4 Options */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-text-primary uppercase">
              Answer Options (Select correct option radio) *
            </label>
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
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="w-6 h-6 rounded-lg bg-secondary-bg flex items-center justify-center text-xs font-bold text-text-primary border border-border">
                  {opt.label}
                </span>
                <input
                  type="text"
                  required
                  value={opt.val}
                  onChange={(e) => opt.setter(e.target.value)}
                  placeholder={`Option ${opt.label} text...`}
                  className="flex-1 px-3 py-1.5 border border-border rounded-xl text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>

          <Textarea
            label="Personal Explanation / Formula Notes"
            rows={2}
            value={exp}
            onChange={(e) => setExp(e.target.value)}
            placeholder="Why is this answer correct? Key equation or trick..."
          />

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewQuestionModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Question"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
