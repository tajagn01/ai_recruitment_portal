import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ParsedCandidate {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  years_of_experience: string | null;
  education: string | null;
  location: string | null;
}

// ---------------------------------------------------------------------------
// Text extraction
// ---------------------------------------------------------------------------

export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return extractFromPdf(filePath);
  }

  if (ext === '.docx' || ext === '.doc') {
    return extractFromDocx(filePath);
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

async function extractFromPdf(filePath: string): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  const buffer = fs.readFileSync(filePath);
  const parser = new (PDFParse as any)({ data: new Uint8Array(buffer) });
  const pages: { text: string }[] = await parser.getText();
  return pages.map((p: { text: string }) => p.text).join('\n');
}

async function extractFromDocx(filePath: string): Promise<string> {
  const mammoth = await import('mammoth');
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// ---------------------------------------------------------------------------
// AI parsing — Gemini
// ---------------------------------------------------------------------------

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
}

const PARSE_PROMPT = (resumeText: string) => `
You are a resume parser. Extract structured candidate information from the resume text below.

Return ONLY a valid JSON object — no markdown, no code blocks, no explanation.
Use null for any field that cannot be found in the resume.

Required JSON format:
{
  "name": "Full Name or null",
  "email": "email@example.com or null",
  "phone": "phone number or null",
  "skills": ["skill1", "skill2"],
  "years_of_experience": "e.g. 5 years or null",
  "education": "highest degree and institution or null",
  "location": "city, country or null"
}

Resume text:
${resumeText}
`;

export async function parseResumeWithAI(resumeText: string): Promise<ParsedCandidate> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0,
    },
  });

  const trimmedText = resumeText.slice(0, 12000); // stay within token limits

  const result = await model.generateContent(PARSE_PROMPT(trimmedText));
  const content = result.response.text();

  if (!content) throw new Error('Empty response from Gemini');

  // Strip any accidental markdown fences just in case
  const clean = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(clean) as ParsedCandidate;

  if (!Array.isArray(parsed.skills)) {
    parsed.skills = [];
  }

  return parsed;
}
