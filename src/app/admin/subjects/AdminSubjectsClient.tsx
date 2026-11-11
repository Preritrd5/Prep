"use client";

import React, { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { adminCreateSubjectAction } from "@/app/actions/syllabus";
import type { Subject } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">
            Subjects Library ({subjects.length})
          </h2>
          <p className="text-xs text-text-secondary">
            Modular subjects shared and mapped across competitive examinations.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          size="md"
        >
          Create Subject
        </Button>
      </div>

      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <Card
              key={s.id}
              className="p-5 hover:border-primary/40 transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">
                    {s.category || "General"}
                  </Badge>
                  <span className="font-mono text-[11px] font-bold text-text-muted bg-background-secondary px-2 py-0.5 rounded border border-border/80">
                    {s.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-text-primary">
                  {s.name}
                </h3>
                {s.description && (
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No subjects registered"
          description="Create common curriculum subjects to begin building exam syllabuses."
          action={
            <Button
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
              size="sm"
            >
              Create Subject
            </Button>
          }
        />
      )}

      {/* Create Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Curriculum Subject"
        description="Add a reusable subject to the central curriculum library."
      >
        {errorMsg && (
          <Alert variant="error" className="mb-4">
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Subject Name"
            required
            placeholder="e.g. Environmental Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject Code"
              required
              placeholder="CE-ENV"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { label: "General Studies", value: "General Studies" },
                { label: "Technical", value: "Technical" },
                { label: "Aptitude", value: "Aptitude" },
                { label: "Static GK", value: "Static GK" },
              ]}
            />
          </div>

          <Textarea
            label="Description"
            rows={3}
            placeholder="Curriculum coverage summary..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Save Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
