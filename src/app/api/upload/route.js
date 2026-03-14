import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import PDFParser from 'pdf2json';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import levenshtein from 'js-levenshtein';

export const dynamic = 'force-dynamic';

async function parsePdfBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => {
            resolve(pdfParser.getRawTextContent());
        });
        pdfParser.parseBuffer(buffer);
    });
}

// Section headers to skip when looking for the candidate name (regex fallback only)
const SECTION_HEADERS = /^(personal\s*information|contact|education|experience|skills|key\s*skills|technical\s*skills|summary|objective|profile|about\s*me|certifications?|projects?|references?|languages?|achievements?|awards?|activities|volunteer|interests?|courses?|training|links|publications?|open\s*source|curriculum\s*vitae|curriculumvitae|resume|^cv$|cover\s*letter)/i;

function cleanLine(line) {
    return line.replace(/([a-z])\s([a-z])/gi, (_, a, b) => a + b).trim();
}

/**
 * Use Gemini to extract name and email from resume text.
 * Falls back to regex if API is unavailable or returns nothing useful.
 */
async function extractFieldsWithAI(text) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return {};

    const prompt = `Extract candidate contact information from this resume text.
Return ONLY a JSON object with these fields (use null if not found):
{
  "name": "Full Name — never use document titles like Curriculum Vitae or Resume",
  "email": "email@example.com",
  "phone": "+91-9999999999 or any phone number",
  "location": "City, State/Country — e.g. Vadodara, Gujarat or Mumbai, India or New York, USA"
}

Resume text (first 3000 chars):
${text.slice(0, 3000)}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json', temperature: 0 },
                }),
            }
        );
        if (!response.ok) return {};
        const data = await response.json();
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) return {};
        const clean = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(clean);
        return {
            name:     parsed.name     && parsed.name     !== 'null' ? parsed.name     : null,
            email:    parsed.email    && parsed.email    !== 'null' ? parsed.email    : null,
            phone:    parsed.phone    && parsed.phone    !== 'null' ? parsed.phone    : null,
            location: parsed.location && parsed.location !== 'null' ? parsed.location : null,
        };
    } catch {
        return {};
    }
}

async function extractResumeData(text) {
    const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // ── AI-powered extraction (name, email, phone, location) ─────────────────
    const ai = await extractFieldsWithAI(text);

    // ── Email fallback via regex ───────────────────────────────────────────────
    const emailMatch = text.match(/([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const email = ai.email || (emailMatch ? emailMatch[1] : "");

    // ── Phone fallback via regex ───────────────────────────────────────────────
    const phoneMatch = text.match(/(\+?[\d][\d\s\-().]{7,}\d)/);
    const phone = ai.phone || (phoneMatch ? phoneMatch[1].trim() : "");

    // ── Name fallback via regex (used only if AI returned nothing) ────────────
    // Use RAW lines (not cleanLine) so "RUDRA BHUNGALIYA" stays as 2 words,
    // not collapsed into "RUDRABHUNGALIYA" (which would fail the word-count check).
    const titleWords = /engineer|developer|manager|designer|analyst|architect|consultant|specialist|officer|intern|associate|director|lead|senior|junior|staff/i;
    let regexName = "";
    for (const line of rawLines.slice(0, 15)) {
        const wordCount = line.split(/\s+/).length;
        if (
            wordCount >= 2 && wordCount <= 5 &&
            !line.includes('@') &&
            !line.includes(':') &&          // skip "Frameworks: React, Node.js"
            !/\d/.test(line) &&
            !SECTION_HEADERS.test(line) &&
            !titleWords.test(line) &&
            line.length >= 4 && line.length <= 60
        ) {
            regexName = line;
            break;
        }
    }
    const name = ai.name || regexName || "Unknown";

    // ── Location — AI first, regex fallback ───────────────────────────────────
    const locationMatch =
        text.match(/(?:location|address|based\s+in|city)[:\s]+([A-Z][a-zA-Z\s]+,\s*[A-Z]{2,})/i) ||
        text.match(/\b([A-Z][a-zA-Z\s]+,\s*(?:CO|CA|NY|TX|FL|WA|MA|IL|GA|NC|VA|AZ|OH|PA|NJ|IN|MN|TN|MI|OR|MO|SC|AL|KY|WI|MD|CT|NV|AR|UT|KS|NE|ID|NH|ME|RI|MT|DE|SD|ND|WY|VT|DC|HI|AK))\b/) ||
        text.match(/\b([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z]+)\b/);
    const location = ai.location || (locationMatch ? locationMatch[1].trim() : "");

    // ── Social links ───────────────────────────────────────────────────────────
    const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w\-]+/i);
    const linkedin = linkedinMatch ? linkedinMatch[0] : "";

    const githubMatch = text.match(/(https?:\/\/)?(www\.)?github\.com\/[\w\-]+/i);
    const github = githubMatch ? githubMatch[0] : "";

    const twitterMatch = text.match(/(https?:\/\/)?(www\.)?(?:twitter|x)\.com\/[\w]+/i);
    const twitter = twitterMatch ? twitterMatch[0] : "";

    // Portfolio: any http URL that isn't linkedin/github/twitter
    const portfolioMatch = text.match(/https?:\/\/(?!.*(?:linkedin|github|twitter|x\.com))[\w\-\.]+\.(?:com|io|net|dev|co|app|me)(\/[\w\-]*)?/i);
    const portfolio = portfolioMatch ? portfolioMatch[0] : "";

    // ── Skills ─────────────────────────────────────────────────────────────────
    const SKILLS = [
        // Languages
        'javascript','typescript','python','java','c++','c#','c','ruby','php','swift','kotlin','go','golang','rust','scala','r','dart','lua','perl','bash','shell','powershell','vba','matlab','groovy','elixir','clojure','haskell','erlang','objective-c','assembly',
        // Frontend
        'react','angular','vue','vue.js','next.js','nextjs','nuxt','svelte','html','css','sass','scss','less','tailwind','bootstrap','jquery','redux','zustand','webpack','vite','babel','storybook','framer','gsap','three.js','webgl','d3','chart.js',
        // Backend
        'node','node.js','express','fastapi','django','flask','spring','spring boot','laravel','rails','asp.net','.net','nestjs','hapi','koa','graphql','rest','restful','grpc','websocket','oauth','jwt',
        // Database
        'sql','mysql','postgresql','postgres','mongodb','redis','sqlite','oracle','mssql','dynamodb','cassandra','elasticsearch','firebase','supabase','prisma','sequelize','mongoose','typeorm',
        // Cloud & DevOps
        'aws','azure','gcp','google cloud','docker','kubernetes','k8s','terraform','ansible','jenkins','github actions','ci/cd','linux','nginx','apache','heroku','vercel','netlify','cloudflare',
        // Mobile
        'react native','flutter','android','ios','xcode','expo',
        // AI / ML / Data
        'machine learning','deep learning','nlp','computer vision','tensorflow','pytorch','keras','scikit-learn','pandas','numpy','data science','data analysis','opencv','huggingface','langchain','openai','llm',
        // Tools & practices
        'git','github','gitlab','jira','figma','postman','swagger','agile','scrum','microservices','tdd','bdd','unit testing','jest','mocha','cypress','selenium','playwright','linux','unix',
        // Soft / generic
        'leadership','communication','project management','teamwork','problem solving','ui/ux','ux','accessibility','performance optimization','web performance',
    ];
    const lowerText = text.toLowerCase();
    const foundSkills = SKILLS.filter(skill => {
        const re = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return re.test(lowerText);
    });
    // De-duplicate (e.g. don't list both "node" and "node.js")
    const dedupedSkills = [...new Set(foundSkills)];
    const skills = dedupedSkills.join(', ') || "Not specified";

    // ── Experience years ───────────────────────────────────────────────────────
    // Prefer explicit "X years of experience" statements
    const expPatterns = [
        /(\d+)\+?\s*years?\s+of\s+(?:professional\s+)?experience/i,
        /(\d+)\+?\s*years?\s+(?:of\s+)?(?:work|working|industry|hands.on)\s+experience/i,
        /experience[:\s]+(\d+)\+?\s*years?/i,
        /(\d+)\+?\s*yrs?\s+(?:of\s+)?experience/i,
    ];
    let experienceYears = 0;
    for (const pat of expPatterns) {
        const m = text.match(pat);
        if (m) { experienceYears = parseInt(m[1]); break; }
    }
    // Fallback: compute from earliest year found in the text vs current year
    if (!experienceYears) {
        const yearMatches = [...text.matchAll(/\b(19[89]\d|20[012]\d)\b/g)].map(m => parseInt(m[1]));
        if (yearMatches.length >= 2) {
            const earliest = Math.min(...yearMatches);
            const latest = Math.max(...yearMatches);
            const currentYear = new Date().getFullYear();
            // Only use if earliest year looks like a career start (not a recent school year)
            if (earliest < currentYear - 1) {
                experienceYears = Math.min(currentYear - earliest, latest - earliest + 1);
            }
        }
    }

    // ── Education ──────────────────────────────────────────────────────────────
    // Find line with a degree keyword and grab up to the next 2 lines for context
    const degreeRe = /\b(bachelor(?:'s)?|master(?:'s)?|mba|phd|ph\.d|associate(?:'s)?|b\.?s\.?|m\.?s\.?|b\.?e\.?|m\.?e\.?|b\.?tech|m\.?tech|b\.?sc|m\.?sc|diploma|bootcamp|certificate)\b/i;
    let education = "Not specified";
    for (let i = 0; i < rawLines.length; i++) {
        if (degreeRe.test(rawLines[i])) {
            // Use raw lines — cleanLine() collapses "Bachelor of Technology" → "BachelorofTechnology"
            const parts = [rawLines[i].trim()];
            if (rawLines[i + 1] && !SECTION_HEADERS.test(rawLines[i + 1])) {
                parts.push(rawLines[i + 1].trim());
            }
            education = parts.join(' — ').substring(0, 200);
            break;
        }
    }

    // ── Summary ────────────────────────────────────────────────────────────────
    // Find the ABOUT / SUMMARY / OBJECTIVE / PROFILE section and grab its first 300 chars
    const summaryRe = /\b(about\s*me|professional\s*summary|summary|objective|profile)\b/i;
    let summary = "";
    for (let i = 0; i < rawLines.length; i++) {
        if (summaryRe.test(rawLines[i]) && rawLines[i].length < 40) {
            const parts = [];
            for (let j = i + 1; j < rawLines.length && j < i + 8; j++) {
                if (SECTION_HEADERS.test(rawLines[j]) && rawLines[j].length < 40) break;
                parts.push(rawLines[j]);
            }
            summary = parts.join(' ').trim().substring(0, 400);
            break;
        }
    }
    // Fallback: first long-ish line
    if (!summary) {
        const fallback = rawLines.find(l => l.length > 60 && !SECTION_HEADERS.test(l) && !l.includes('@'));
        if (fallback) summary = cleanLine(fallback).substring(0, 300);
    }

    return {
        name: name.substring(0, 100),
        email: email || `candidate-${Date.now()}@unknown.com`,
        phone: phone || "Not provided",
        skills,
        experienceYears,
        location: location || "Not specified",
        education,
        linkedin: linkedin || null,
        github: github || null,
        portfolio: portfolio || null,
        twitter: twitter || null,
        summary: summary || null,
    };
}

function toTokenSet(text) {
    const normalized = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    if (!normalized) return new Set();
    const tokens = normalized.split(/\s+/).filter(token => token.length > 2);
    return new Set(tokens);
}

function calculateTextDifference(existingText, incomingText) {
    const MAX_COMPARE_CHARS = 12000;
    const baseText = (existingText || '').slice(0, MAX_COMPARE_CHARS);
    const nextText = (incomingText || '').slice(0, MAX_COMPARE_CHARS);
    const baseTokens = toTokenSet(baseText);
    const nextTokens = toTokenSet(nextText);

    if (baseTokens.size === 0 && nextTokens.size === 0) return 0;
    if (baseTokens.size === 0 || nextTokens.size === 0) return 100;

    let intersection = 0;
    baseTokens.forEach(token => {
        if (nextTokens.has(token)) intersection++;
    });
    const union = baseTokens.size + nextTokens.size - intersection;
    const similarity = union === 0 ? 0 : (intersection / union) * 100;
    return Math.max(0, Math.min(100, 100 - similarity));
}

function calculateTextSimilarity(existingText, incomingText) {
    const difference = calculateTextDifference(existingText, incomingText);
    return Math.max(0, Math.min(100, 100 - difference));
}

function cosineSimilarity(vecA, vecB) {
    if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        const a = vecA[i];
        const b = vecB[i];
        dot += a * b;
        normA += a * a;
        normB += b * b;
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function generateResumeEmbedding(text) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!text || !text.trim()) return null;

    const payload = {
        content: {
            parts: [{ text: text || '' }]
        }
    };

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini embedding error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const embedding = data?.embedding?.values;
    if (!Array.isArray(embedding) || embedding.length === 0) return null;
    return embedding;
}

function hashBuffer(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function hashText(text) {
    return crypto.createHash('sha256').update(text || '').digest('hex');
}

function normalizeResumeText(text) {
    return (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizePhone(phone) {
    return (phone || '').replace(/\D/g, '');
}

function stringSimilarity(a, b) {
    if (!a || !b) return 0;
    const s1 = a.toLowerCase().trim();
    const s2 = b.toLowerCase().trim();
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 100;
    const distance = levenshtein(s1, s2);
    const maxLength = Math.max(s1.length, s2.length) || 1;
    return Math.max(0, Math.min(100, ((maxLength - distance) / maxLength) * 100));
}

function parseSkills(skills) {
    if (!skills || typeof skills !== 'string') return [];
    return skills
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
}

function calculateSkillsSimilarity(skillsA, skillsB) {
    if (!skillsA.length && !skillsB.length) return 0;
    const setA = new Set(skillsA);
    const setB = new Set(skillsB);
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    setA.forEach(value => {
        if (setB.has(value)) intersection++;
    });
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : (intersection / union) * 100;
}

function calculateExperienceSimilarity(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') return 0;
    const diff = Math.abs(a - b);
    if (diff === 0) return 100;
    if (diff <= 1) return 90;
    if (diff <= 2) return 80;
    if (diff <= 4) return 60;
    return 0;
}

function calculateIdentitySimilarity(candidate, parsedData) {
    const weights = {
        name: 40,
        education: 20,
        skills: 25,
        experience: 15,
    };

    const nameScore = stringSimilarity(candidate.name, parsedData.name);
    const educationScore = stringSimilarity(candidate.education, parsedData.education);
    const skillsScore = calculateSkillsSimilarity(
        parseSkills(candidate.skills),
        parseSkills(parsedData.skills)
    );
    const experienceScore = calculateExperienceSimilarity(
        candidate.experienceYears,
        parsedData.experienceYears
    );

    const available = [
        { key: 'name', score: nameScore, present: !!candidate.name && !!parsedData.name },
        { key: 'education', score: educationScore, present: !!candidate.education && !!parsedData.education },
        { key: 'skills', score: skillsScore, present: !!candidate.skills && !!parsedData.skills },
        { key: 'experience', score: experienceScore, present: Number.isFinite(candidate.experienceYears) && Number.isFinite(parsedData.experienceYears) },
    ].filter(item => item.present);

    if (available.length === 0) return 0;

    const totalWeight = available.reduce((sum, item) => sum + weights[item.key], 0) || 1;
    const weightedScore = available.reduce((sum, item) => sum + (item.score * weights[item.key]), 0);
    return Math.max(0, Math.min(100, weightedScore / totalWeight));
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('files');
        const file = formData.get('file');
        const uploadFiles = files.length > 0 ? files : (file ? [file] : []);

        if (uploadFiles.length === 0) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const candidates = [];
        const errors = [];
        const dedupeResults = [];

        const existingCandidates = await prisma.candidate.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                skills: true,
                education: true,
                experienceYears: true,
                resumeText: true,
                resumeHash: true,
                contentHash: true,
                resumeEmbedding: true,
            },
        });

        for (const currentFile of uploadFiles) {
            try {
                if (!currentFile || typeof currentFile.arrayBuffer !== "function") {
                    errors.push({ name: "unknown", error: "Invalid file" });
                    continue;
                }

                const bytes = await currentFile.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Extract text from PDF using pdf2json
                const rawText = await parsePdfBuffer(buffer);
                // Strip null bytes and other non-UTF-8-safe characters that Postgres rejects
                const textData = rawText.replace(/\x00/g, "").replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

                // AI + regex hybrid parsing
                const parsedData = await extractResumeData(textData);
                const normalizedText = normalizeResumeText(textData);
                const resumeHash = hashBuffer(buffer);
                const contentHash = hashText(normalizedText);

                let resumeEmbedding = null;
                try {
                    resumeEmbedding = await generateResumeEmbedding(textData.slice(0, 12000));
                } catch (embeddingError) {
                    if (process.env.GEMINI_API_KEY) {
                        console.error('[WARN] Resume embedding generation failed:', embeddingError);
                    }
                }

                const emailValue = parsedData.email || `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@unknown.com`;

                const existingCandidate = await prisma.candidate.findUnique({
                    where: { email: emailValue },
                });

                const existingPhoneMatch = normalizePhone(parsedData.phone);
                if (existingPhoneMatch) {
                    const phoneMatch = existingCandidates.find(candidate => normalizePhone(candidate.phone) === existingPhoneMatch);
                    if (phoneMatch && (!existingCandidate || phoneMatch.id !== existingCandidate.id)) {
                        console.info(`[INFO] Duplicate candidate detected by phone match for ${parsedData.name || "Unknown"}. Skipping database insert.`);
                        dedupeResults.push({
                            id: null,
                            email: emailValue,
                            name: parsedData.name || "Unknown",
                            updated: false,
                            skippedAsDuplicate: true,
                            matchedCandidateId: phoneMatch.id,
                            matchedCandidateEmail: phoneMatch.email,
                            duplicateReason: 'PHONE_MATCH',
                        });
                        continue;
                    }
                }

                const hashMatch = existingCandidates.find(candidate =>
                    (candidate.resumeHash && candidate.resumeHash === resumeHash) ||
                    (candidate.contentHash && candidate.contentHash === contentHash)
                );

                if (hashMatch && (!existingCandidate || hashMatch.id !== existingCandidate.id)) {
                    console.info('[INFO] Resume hash already exists. Duplicate detected.');
                    dedupeResults.push({
                        id: null,
                        email: emailValue,
                        name: parsedData.name || "Unknown",
                        updated: false,
                        skippedAsDuplicate: true,
                        matchedCandidateId: hashMatch.id,
                        matchedCandidateEmail: hashMatch.email,
                        duplicateReason: hashMatch.resumeHash === resumeHash ? 'RESUME_HASH' : 'CONTENT_HASH',
                    });
                    continue;
                }

                let topSimilarity = 0;
                let topMatch = null;
                for (const candidate of existingCandidates) {
                    if (!candidate.resumeText) continue;
                    if (existingCandidate && candidate.id === existingCandidate.id) continue;
                    const similarity = calculateTextSimilarity(normalizeResumeText(candidate.resumeText), normalizedText);
                    if (similarity > topSimilarity) {
                        topSimilarity = similarity;
                        topMatch = candidate;
                    }
                }

                if (topSimilarity >= 92 && topMatch) {
                    console.info(`[INFO] Resume content similarity score: ${Math.round(topSimilarity)}%. Duplicate candidate.`);
                    dedupeResults.push({
                        id: null,
                        email: emailValue,
                        name: parsedData.name || "Unknown",
                        updated: false,
                        differencePercentage: 100 - topSimilarity,
                        skippedAsDuplicate: true,
                        matchedCandidateId: topMatch.id,
                        matchedCandidateEmail: topMatch.email,
                        similarityPercentage: topSimilarity,
                        duplicateReason: 'CONTENT_SIMILARITY',
                    });
                    continue;
                }

                let identityTopScore = 0;
                let identityMatch = null;
                for (const candidate of existingCandidates) {
                    if (existingCandidate && candidate.id === existingCandidate.id) continue;
                    const score = calculateIdentitySimilarity(candidate, parsedData);
                    if (score > identityTopScore) {
                        identityTopScore = score;
                        identityMatch = candidate;
                    }
                }

                if (identityTopScore >= 85 && identityMatch) {
                    console.info(`[INFO] Candidate identity similarity score: ${Math.round(identityTopScore)}%. Duplicate candidate.`);
                    dedupeResults.push({
                        id: null,
                        email: emailValue,
                        name: parsedData.name || "Unknown",
                        updated: false,
                        skippedAsDuplicate: true,
                        matchedCandidateId: identityMatch.id,
                        matchedCandidateEmail: identityMatch.email,
                        similarityPercentage: identityTopScore,
                        duplicateReason: 'IDENTITY_MATCH',
                    });
                    continue;
                }

                if (resumeEmbedding) {
                    let topEmbeddingScore = 0;
                    let embeddingMatch = null;
                    for (const candidate of existingCandidates) {
                        if (!Array.isArray(candidate.resumeEmbedding)) continue;
                        if (existingCandidate && candidate.id === existingCandidate.id) continue;
                        const similarity = cosineSimilarity(candidate.resumeEmbedding, resumeEmbedding);
                        if (similarity > topEmbeddingScore) {
                            topEmbeddingScore = similarity;
                            embeddingMatch = candidate;
                        }
                    }

                    if (topEmbeddingScore >= 0.85 && embeddingMatch) {
                        console.info(`[INFO] Resume embedding similarity score: ${(topEmbeddingScore * 100).toFixed(2)}%. Duplicate candidate.`);
                        dedupeResults.push({
                            id: null,
                            email: emailValue,
                            name: parsedData.name || "Unknown",
                            updated: false,
                            skippedAsDuplicate: true,
                            matchedCandidateId: embeddingMatch.id,
                            matchedCandidateEmail: embeddingMatch.email,
                            similarityPercentage: Math.round(topEmbeddingScore * 100),
                            duplicateReason: 'EMBEDDING_SIMILARITY',
                        });
                        continue;
                    }
                }

                let shouldUpdateResume = true;
                let differencePercentage = 100;
                if (existingCandidate?.resumeText) {
                    differencePercentage = calculateTextDifference(existingCandidate.resumeText, textData);
                    shouldUpdateResume = differencePercentage >= 20;
                }

                let resumeFileUrl = null;
                if (shouldUpdateResume) {
                    // Save original PDF to public/resumes/<safe-email>.pdf
                    try {
                        const uploadsDir = path.join(process.cwd(), 'public', 'resumes');
                        await mkdir(uploadsDir, { recursive: true });
                        const safeEmail = emailValue.replace(/[^a-zA-Z0-9._-]/g, '_');
                        const fileName = `${safeEmail}.pdf`;
                        await writeFile(path.join(uploadsDir, fileName), buffer);
                        resumeFileUrl = `/resumes/${fileName}`;
                    } catch (fileErr) {
                        console.error('PDF save error:', fileErr);
                    }
                }

                // Save to Database
                const updatePayload = shouldUpdateResume
                    ? {
                        name: parsedData.name || "Unknown",
                        phone: parsedData.phone || "",
                        skills: parsedData.skills || "",
                        experienceYears: parsedData.experienceYears || 0,
                        location: parsedData.location || "",
                        education: parsedData.education || "",
                        linkedin: parsedData.linkedin,
                        github: parsedData.github,
                        portfolio: parsedData.portfolio,
                        twitter: parsedData.twitter,
                        summary: parsedData.summary,
                        resumeText: textData,
                        resumeHash,
                        contentHash,
                        resumeEmbedding,
                        duplicateFlag: false,
                        ...(resumeFileUrl && { resumeFileUrl }),
                    }
                    : {};

                const candidate = existingCandidate && !shouldUpdateResume
                    ? existingCandidate
                    : await prisma.candidate.upsert({
                        where: { email: emailValue },
                        update: updatePayload,
                        create: {
                            name: parsedData.name || "Unknown",
                            email: emailValue,
                            phone: parsedData.phone || "",
                            skills: parsedData.skills || "",
                            experienceYears: parsedData.experienceYears || 0,
                            location: parsedData.location || "",
                            education: parsedData.education || "",
                            linkedin: parsedData.linkedin,
                            github: parsedData.github,
                            portfolio: parsedData.portfolio,
                            twitter: parsedData.twitter,
                            summary: parsedData.summary,
                            resumeText: textData,
                            resumeFileUrl: resumeFileUrl || null,
                            resumeHash,
                            contentHash,
                            resumeEmbedding,
                            duplicateFlag: false,
                        }
                    });

                candidates.push(candidate);
                dedupeResults.push({
                    id: candidate.id || null,
                    email: emailValue,
                    name: parsedData.name || candidate.name || "Unknown",
                    updated: shouldUpdateResume || !existingCandidate,
                    differencePercentage,
                });

                if (!existingCandidate) {
                    existingCandidates.push({
                        id: candidate.id,
                        email: emailValue,
                        name: candidate.name,
                        phone: candidate.phone,
                        skills: candidate.skills,
                        education: candidate.education,
                        experienceYears: candidate.experienceYears,
                        resumeText: candidate.resumeText,
                        resumeHash: candidate.resumeHash,
                        contentHash: candidate.contentHash,
                        resumeEmbedding: candidate.resumeEmbedding,
                    });
                }
            } catch (err) {
                errors.push({ name: currentFile?.name || "unknown", error: err?.message || "Parse failed" });
            }
        }

        return NextResponse.json({ success: true, candidates, errors, dedupeResults }, { status: 201 });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
