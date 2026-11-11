"use client";

import { Card, Badge, Button, Modal, Input, Select, Textarea, Alert } from "@/components/ui";
import { useState } from "react";
import { Plus } from "lucide-react";
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
          <h2 className="text-base font-bold text-text-primary">
            Registered Examinations ({exams.length})
          </h2>
          <p className="text-xs text-text-muted">
            Configure examination categories, variants, and activation state.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5 text-xs"
        >
          <Plus className="h-4 w-4" />
          Create Examination
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary-bg/50 border-b border-border text-text-secondary uppercase font-bold">
            <tr>
              <th className="px-6 py-3.5">Exam Name & Code</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Sub-Category</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-text-primary font-medium">
            {exams.map((exam) => (
              <tr key={exam.id} className="hover:bg-secondary-bg/30 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="font-bold text-text-primary">{exam.name}</div>
                  <div className="font-mono text-[10px] text-text-muted">{exam.code}</div>
                </td>
                <td className="px-6 py-3.5 text-text-secondary">{exam.category}</td>
                <td className="px-6 py-3.5 text-text-muted">{exam.sub_category || "—"}</td>
                <td className="px-6 py-3.5">
                  <Badge variant={exam.is_active ? "success" : "secondary"}>
                    {exam.is_active ? "Active" : "Deactivated"}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(exam)}
                    className="text-xs text-primary hover:text-primary-hover"
                  >
                    {exam.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Create Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Examination"
        description="Add a competitive examination to the public catalog."
      >
        {errorMsg && (
          <div className="mb-4">
            <Alert variant="error" title={errorMsg} onClose={() => setErrorMsg(null)} />
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Exam Name *"
            required
            placeholder="e.g. GATE — Electrical Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unique Code *"
              required
              placeholder="GATE-EE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "GATE", label: "GATE" },
                { value: "KAS", label: "KAS" },
                { value: "UPSC", label: "UPSC" },
                { value: "Railway Examinations", label: "Railway Examinations" },
                { value: "KEA Examinations", label: "KEA Examinations" },
                { value: "AE Civil Engineering", label: "AE Civil Engineering" },
                { value: "General Knowledge", label: "General Knowledge" },
                { value: "Other", label: "Other" },
              ]}
            />
          </div>

          <Input
            label="Sub-Category / Branch (Optional)"
            placeholder="e.g. Electrical Engineering"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          />

          <Textarea
            label="Description"
            rows={2}
            placeholder="Short description of the examination..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Save Examination"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
