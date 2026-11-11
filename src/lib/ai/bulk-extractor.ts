import "server-only";
import { getGeminiClient, DEFAULT_GEMINI_MODEL } from "./gemini";
import * as XLSX from "xlsx";
import type { OptionLabel, DifficultyLevel } from "@/lib/types";

export type ExtractedQuestionType =
  | "EXISTING_MCQ"
  | "NON_MCQ"
  | "INCOMPLETE_MCQ"
  | "UNREADABLE";

export interface ExtractedQuestionItem {
  tempId: string;
  sourceFileName: string;
  sourcePageNumber?: number | null;
  questionNumber?: number | string | null;
  questionType: ExtractedQuestionType;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: OptionLabel;
  hasSourceAnswerKey: boolean;
  isVerifiedAnswer: boolean; // CRITICAL: False if proposed by AI, true if present in source key or confirmed by owner
  explanation: string;
  difficulty: DifficultyLevel;
  suggestedExamName?: string | null;
  suggestedSubjectName?: string | null;
  suggestedChapterName?: string | null;
  suggestedTopicName?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
  isDuplicate?: boolean;
  duplicateReason?: string | null;
  isSelectedForImport: boolean;
  isConvertedFromNonMCQ?: boolean;
}

/**
 * Normalizes question stems for reliable duplicate detection.
 */
export function normalizeQuestionStem(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts questions from CSV or XLSX files using sheet parser.
 */
export function extractFromSpreadsheet(
  buffer: Buffer,
  fileName: string
): ExtractedQuestionItem[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellFormula: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

  const items: ExtractedQuestionItem[] = [];

  rows.forEach((row, idx) => {
    const qText = (
      row["Question"] ||
      row["question"] ||
      row["Question Text"] ||
      row["question_text"] ||
      row["Text"] ||
      ""
    ).toString().trim();

    if (!qText) return;

    const optA = (row["Option A"] || row["option_a"] || row["OptionA"] || row["A"] || "").toString().trim();
    const optB = (row["Option B"] || row["option_b"] || row["OptionB"] || row["B"] || "").toString().trim();
    const optC = (row["Option C"] || row["option_c"] || row["OptionC"] || row["C"] || "").toString().trim();
    const optD = (row["Option D"] || row["option_d"] || row["OptionD"] || row["D"] || "").toString().trim();

    const rawKey = (
      row["Correct Option"] ||
      row["correct_option"] ||
      row["Answer"] ||
      row["answer"] ||
      row["Key"] ||
      ""
    ).toString().trim().toUpperCase();

    const hasKey = ["A", "B", "C", "D"].includes(rawKey);
    const correctOption: OptionLabel = hasKey ? (rawKey as OptionLabel) : "A";

    const hasAllOptions = !!(optA && optB && optC && optD);
    const hasSomeOptions = !!(optA || optB || optC || optD);

    let qType: ExtractedQuestionType = "EXISTING_MCQ";
    if (!hasSomeOptions) {
      qType = "NON_MCQ";
    } else if (!hasAllOptions) {
      qType = "INCOMPLETE_MCQ";
    }

    const exp = (row["Explanation"] || row["explanation"] || row["Rationale"] || "").toString().trim();
    const diffRaw = (row["Difficulty"] || row["difficulty"] || "Medium").toString().trim();
    const difficulty: DifficultyLevel = ["Easy", "Medium", "Hard"].includes(diffRaw)
      ? (diffRaw as DifficultyLevel)
      : "Medium";

    const subject = (row["Subject"] || row["subject"] || row["Subject Name"] || "").toString().trim() || null;
    const exam = (row["Exam"] || row["exam"] || row["Exam Name"] || "").toString().trim() || null;

    items.push({
      tempId: `spread-${idx + 1}-${Date.now()}`,
      sourceFileName: fileName,
      sourcePageNumber: 1,
      questionNumber: idx + 1,
      questionType: qType,
      questionText: qText,
      options: {
        A: optA,
        B: optB,
        C: optC,
        D: optD,
      },
      correctOption,
      hasSourceAnswerKey: hasKey,
      isVerifiedAnswer: hasKey, // True only if source had a valid key
      explanation: exp,
      difficulty,
      suggestedExamName: exam,
      suggestedSubjectName: subject,
      isSelectedForImport: qType === "EXISTING_MCQ",
    });
  });

  return items;
}

/**
 * Extracts plain text from TXT or DOCX buffers.
 */
export function extractFromPlainText(
  rawText: string,
  fileName: string
): ExtractedQuestionItem[] {
  const items: ExtractedQuestionItem[] = [];

  // Match questions delimited by numbering e.g. "1. Question ... (A) ... (B) ... (C) ... (D) ... Answer: B"
  const qBlocks = rawText.split(/(?:\r?\n)(?=\s*(?:Q(?:uestion)?\.?\s*)?\d+[\.\)\-]\s+)/gi);

  qBlocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (trimmed.length < 10) return;

    // Extract options
    const optAMatch = trimmed.match(/(?:[\(\[]?[Aa][\)\]\.]\s*)([^\(\[\n]+)/);
    const optBMatch = trimmed.match(/(?:[\(\[]?[Bb][\)\]\.]\s*)([^\(\[\n]+)/);
    const optCMatch = trimmed.match(/(?:[\(\[]?[Cc][\)\]\.]\s*)([^\(\[\n]+)/);
    const optDMatch = trimmed.match(/(?:[\(\[]?[Dd][\)\]\.]\s*)([^\(\[\n]+)/);

    const optA = optAMatch ? optAMatch[1].trim() : "";
    const optB = optBMatch ? optBMatch[1].trim() : "";
    const optC = optCMatch ? optCMatch[1].trim() : "";
    const optD = optDMatch ? optDMatch[1].trim() : "";

    // Extract question stem (before Option A)
    let qStem = trimmed;
    if (optAMatch && optAMatch.index !== undefined) {
      qStem = trimmed.substring(0, optAMatch.index).trim();
    }
    // Clean leading numbering e.g. "1. ", "Q1. "
    qStem = qStem.replace(/^(?:Q(?:uestion)?\.?\s*)?\d+[\.\)\-]\s*/i, "").trim();

    // Check for answer key in block e.g. "Ans: B" or "Answer: (C)"
    const ansMatch = trimmed.match(/(?:Ans(?:wer)?|Correct(?:\s+Option)?)\s*[:=\-]?\s*[\(\[]?([A-Da-d])[\)\]]?/i);
    const hasKey = !!ansMatch;
    const correctOption: OptionLabel = hasKey
      ? (ansMatch[1].toUpperCase() as OptionLabel)
      : "A";

    const hasAll = !!(optA && optB && optC && optD);
    const hasSome = !!(optA || optB || optC || optD);

    let qType: ExtractedQuestionType = "EXISTING_MCQ";
    if (!hasSome) {
      qType = "NON_MCQ";
    } else if (!hasAll) {
      qType = "INCOMPLETE_MCQ";
    }

    if (qStem.length >= 5) {
      items.push({
        tempId: `txt-${idx + 1}-${Date.now()}`,
        sourceFileName: fileName,
        questionNumber: idx + 1,
        questionType: qType,
        questionText: qStem,
        options: {
          A: optA,
          B: optB,
          C: optC,
          D: optD,
        },
        correctOption,
        hasSourceAnswerKey: hasKey,
        isVerifiedAnswer: hasKey,
        explanation: "",
        difficulty: "Medium",
        isSelectedForImport: qType === "EXISTING_MCQ",
      });
    }
  });

  return items;
}

/**
 * Multimodal extraction using Gemini 2.5 Flash for PDF documents and question paper images.
 * Extracts questions, 4 options, answer keys (with strict verification labelling),
 * subject/chapter classification, and page numbers.
 */
export async function extractFromMultimodalDocument(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ExtractedQuestionItem[]> {
  const ai = getGeminiClient();
  const base64Data = buffer.toString("base64");

  const prompt = `
You are an expert examination paper parser. Analyze this uploaded question paper document/image.
Your task is to identify and extract every question in structured format.

For each question:
1. "question_text": The complete question stem.
2. "question_type":
   - "EXISTING_MCQ" if the source already has options A, B, C, D.
   - "NON_MCQ" if it is a short-answer, fill-in-the-blank, or descriptive question without options.
   - "INCOMPLETE_MCQ" if options are missing or cut off.
   - "UNREADABLE" if blurry or damaged.
3. "options": Object with keys "A", "B", "C", "D". If it's an existing MCQ, copy the exact options from the document.
4. "has_source_answer_key": true ONLY if the document explicitly contains an official answer key, marked answer, or answer table. Otherwise false.
5. "correct_option":
   - If has_source_answer_key is true, provide the exact answer from the document ("A", "B", "C", or "D").
   - If has_source_answer_key is false, propose the best educational answer, BUT has_source_answer_key must remain FALSE.
6. "explanation": Brief explanation or rationale.
7. "difficulty": "Easy", "Medium", or "Hard".
8. "suggested_subject": The academic subject (e.g., Indian History, Geography, Polity, Science, General Mental Ability).
9. "page_number": Approximate page number if identifiable.
10. "question_number": Original question number from the paper if visible.

Return a STRICT JSON array of objects conforming to this schema. No markdown formatting outside the JSON.
[
  {
    "question_text": "...",
    "question_type": "EXISTING_MCQ",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "has_source_answer_key": true,
    "correct_option": "B",
    "explanation": "...",
    "difficulty": "Medium",
    "suggested_subject": "Indian History",
    "page_number": 1,
    "question_number": 1
  }
]
`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any, idx: number) => {
      const qType: ExtractedQuestionType = [
        "EXISTING_MCQ",
        "NON_MCQ",
        "INCOMPLETE_MCQ",
        "UNREADABLE",
      ].includes(item.question_type)
        ? item.question_type
        : "EXISTING_MCQ";

      const hasSourceKey = Boolean(item.has_source_answer_key);
      const correctOpt: OptionLabel = ["A", "B", "C", "D"].includes(item.correct_option)
        ? (item.correct_option as OptionLabel)
        : "A";

      return {
        tempId: `ai-doc-${idx + 1}-${Date.now()}`,
        sourceFileName: fileName,
        sourcePageNumber: item.page_number || 1,
        questionNumber: item.question_number || idx + 1,
        questionType: qType,
        questionText: (item.question_text || "").trim(),
        options: {
          A: item.options?.A || "",
          B: item.options?.B || "",
          C: item.options?.C || "",
          D: item.options?.D || "",
        },
        correctOption: correctOpt,
        hasSourceAnswerKey: hasSourceKey,
        isVerifiedAnswer: hasSourceKey, // CRITICAL: False if proposed by AI without source key
        explanation: (item.explanation || "").trim(),
        difficulty: (["Easy", "Medium", "Hard"].includes(item.difficulty)
          ? item.difficulty
          : "Medium") as DifficultyLevel,
        suggestedSubjectName: item.suggested_subject || null,
        isSelectedForImport: qType === "EXISTING_MCQ",
      };
    });
  } catch (err: any) {
    console.error("Gemini document extraction error:", err?.message);
    throw new Error(`AI question extraction failed: ${err?.message || "Unknown error"}`);
  }
}

/**
 * STEP 4: Convert non-MCQ questions into four-option MCQs using Gemini AI.
 * Preserves the original concept, generates 4 plausible options, proposes the correct answer,
 * and EXPLICITLY marks isVerifiedAnswer as false (AI Suggested / Unverified).
 */
export async function convertNonMCQQuestionsWithAI(
  nonMCQQuestions: ExtractedQuestionItem[]
): Promise<ExtractedQuestionItem[]> {
  if (nonMCQQuestions.length === 0) return [];

  const ai = getGeminiClient();

  const prompt = `
You are an expert examination creator. Convert these non-MCQ or incomplete questions into high-quality 4-option Multiple Choice Questions (MCQs).
Rules:
1. Preserve the exact factual and conceptual meaning of the original question.
2. Formulate 4 clear, distinct options labeled A, B, C, D. Do NOT generate nonsensical or obviously silly distractors.
3. Propose the correct answer option ("A", "B", "C", or "D").
4. Provide a thorough pedagogical explanation.
5. Suggest the difficulty ("Easy", "Medium", "Hard") and subject.

Input questions:
${JSON.stringify(
  nonMCQQuestions.map((q) => ({
    tempId: q.tempId,
    questionText: q.questionText,
    sourceFileName: q.sourceFileName,
  })),
  null,
  2
)}

Return a STRICT JSON array of converted questions:
[
  {
    "tempId": "...",
    "questionText": "...",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correctOption": "C",
    "explanation": "...",
    "difficulty": "Medium",
    "suggestedSubjectName": "..."
  }
]
`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text || "[]");
    if (!Array.isArray(parsed)) return nonMCQQuestions;

    const convertedMap = new Map<string, any>(parsed.map((p) => [p.tempId, p]));

    return nonMCQQuestions.map((orig) => {
      const conv = convertedMap.get(orig.tempId);
      if (!conv) return orig;

      return {
        ...orig,
        questionText: conv.questionText || orig.questionText,
        options: {
          A: conv.options?.A || "",
          B: conv.options?.B || "",
          C: conv.options?.C || "",
          D: conv.options?.D || "",
        },
        correctOption: (conv.correctOption as OptionLabel) || "A",
        hasSourceAnswerKey: false,
        isVerifiedAnswer: false, // CRITICAL: AI proposed, MUST remain UNVERIFIED until owner checks it
        explanation: conv.explanation || "AI-generated option rationale.",
        difficulty: conv.difficulty || orig.difficulty,
        suggestedSubjectName: conv.suggestedSubjectName || orig.suggestedSubjectName,
        questionType: "EXISTING_MCQ",
        isConvertedFromNonMCQ: true,
        isSelectedForImport: true,
      };
    });
  } catch (err: any) {
    console.error("AI MCQ conversion failed:", err?.message);
    throw new Error(`AI MCQ conversion failed: ${err?.message}`);
  }
}

/**
 * STEP 7: Detects exact and normalized stem duplicates across the batch
 * and against existing questions in the database.
 */
export function annotateDuplicates(
  items: ExtractedQuestionItem[],
  existingStems: Set<string>
): ExtractedQuestionItem[] {
  const seenInBatch = new Set<string>();

  return items.map((item) => {
    const normalized = normalizeQuestionStem(item.questionText);

    if (existingStems.has(normalized)) {
      return {
        ...item,
        isDuplicate: true,
        duplicateReason: "Question already exists in your question bank",
        isSelectedForImport: false, // Deselect duplicate by default
      };
    }

    if (seenInBatch.has(normalized)) {
      return {
        ...item,
        isDuplicate: true,
        duplicateReason: "Duplicate question within this upload batch",
        isSelectedForImport: false,
      };
    }

    seenInBatch.add(normalized);
    return item;
  });
}
