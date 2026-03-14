import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import GEMINI_KEYS from './gemini-keys';

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
  const buffer = fs.readFileSync(filePath);
  const result = await pdfParse(buffer);
  return result.text;
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

function getApiKeys(): string[] {
  return GEMINI_KEYS;
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
  const keys = getApiKeys();
  const trimmedText = resumeText.slice(0, 12000);
  let lastError: Error = new Error('No API keys available');

  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0 },
      });

      const result = await model.generateContent(PARSE_PROMPT(trimmedText));
      const content = result.response.text();
      if (!content) throw new Error('Empty response from Gemini');

      const clean = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(clean) as ParsedCandidate;
      if (!Array.isArray(parsed.skills)) parsed.skills = [];

      if (keys.length > 1) console.log(`[INFO] Used Gemini key #${i + 1} of ${keys.length}`);
      return parsed;
    } catch (err) {
      lastError = err as Error;
      const msg = lastError.message;
      // Only rotate to next key on quota/rate limit errors
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        console.log(`[WARN] Gemini key #${i + 1} quota exhausted — trying next key...`);
        continue;
      }
      // Any other error (auth, network, etc.) — throw immediately
      throw lastError;
    }
  }

  throw new Error(`All ${keys.length} Gemini API key(s) exhausted. ${lastError.message}`);
}
