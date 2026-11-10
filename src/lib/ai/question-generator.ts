import "server-only";
import { getGeminiClient, DEFAULT_GEMINI_MODEL } from "./gemini";
import {
  GeneratedQuestionsBatchSchema,
  type GeneratedQuestion,
} from "@/lib/validations/question-schema";

export interface GenerationParams {
  examName?: string;
  subjectName: string;
  chapterName?: string;
  topicName?: string;
  count: number; // 5, 10, 20, 30, 50
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  language?: string; // 'English' | 'Kannada'
  instructions?: string;
  sourceText?: string;
  useMock?: boolean;
}

export interface GenerationResult {
  success: boolean;
  error?: string;
  questions?: GeneratedQuestion[];
}

export async function generateMCQBatch(params: GenerationParams): Promise<GenerationResult> {
  const {
    examName,
    subjectName,
    chapterName,
    topicName,
    count,
    difficulty,
    language = "English",
    instructions,
    sourceText,
    useMock = false,
  } = params;

  // Use mock generator if explicitly requested (e.g. For automated test runs without quota usage)
  if (useMock) {
    const mockQuestions: GeneratedQuestion[] = Array.from({ length: Math.min(count, 5) }).map(
      (_, i) => ({
        question: `[Mock] Practice question #${i + 1} regarding ${topicName || subjectName}: Which statement is correct?`,
        options: [
          `Primary standard principle for ${subjectName}`,
          `Secondary alternative condition`,
          `Tertiary exception to the rule`,
          `None of the above`,
        ],
        correctAnswer: (["A", "B", "C", "D"][i % 4] as "A" | "B" | "C" | "D"),
        explanation: `Verified rationale: Option ${["A", "B", "C", "D"][i % 4]} directly matches standard competitive examination guidelines for ${subjectName}.`,
        difficulty: (difficulty === "Mixed" ? (["Easy", "Medium", "Hard"][i % 3] as any) : difficulty),
        topic: topicName || subjectName,
      })
    );

    return {
      success: true,
      questions: mockQuestions,
    };
  }

  try {
    const ai = getGeminiClient();

    const prompt = `You are an expert competitive examination question setter for ${examName || "Competitive Examinations in India"}.
Generate exactly ${count} multiple choice questions (MCQs) for:
- Subject: ${subjectName}
${chapterName ? `- Chapter: ${chapterName}` : ""}
${topicName ? `- Topic: ${topicName}` : ""}
- Target Difficulty: ${difficulty}
- Language: ${language}
${instructions ? `- Specific Instructions: ${instructions}` : ""}
${sourceText ? `- Study Source Context: ${sourceText}` : ""}

CRITICAL REQUIREMENTS:
1. Provide exactly 4 distinct answer options per question labeled implicitly as an array of 4 strings [Option A, Option B, Option C, Option D].
2. Specify the correct answer strictly as "A", "B", "C", or "D".
3. Provide a detailed, pedagogical explanation explaining why the correct option is right and others are incorrect.
4. Difficulty must strictly be "Easy", "Medium", or "Hard".
5. Return JSON format only matching this schema:
[
  {
    "question": "Question text here?",
    "options": ["First option", "Second option", "Third option", "Fourth option"],
    "correctAnswer": "A",
    "explanation": "Detailed explanation here.",
    "difficulty": "Medium",
    "topic": "${topicName || subjectName}"
  }
]`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      return { success: false, error: "Empty response received from Gemini model." };
    }

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(responseText);
    } catch {
      return { success: false, error: "Failed to parse model output as valid JSON." };
    }

    // Strict Zod Validation
    const validationResult = GeneratedQuestionsBatchSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      return {
        success: false,
        error: `Schema validation failed: ${validationResult.error.issues.map((i) => i.message).join(", ")}`,
      };
    }

    return {
      success: true,
      questions: validationResult.data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Gemini generation failed: ${err.message || "Unknown API error"}`,
    };
  }
}
