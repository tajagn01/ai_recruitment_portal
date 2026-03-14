import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import PDFParser from 'pdf2json';

export const dynamic = 'force-dynamic';

async function parsePdfBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            resolve(pdfParser.getRawTextContent());
        });
        pdfParser.parseBuffer(buffer);
    });
}

// Smart regex-based resume parser
function extractResumeData(text) {
    // Extract Email
    const emailMatch = text.match(/([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const email = emailMatch ? emailMatch[1] : "";

    // Extract Phone
    const phoneMatch = text.match(/(\+?1?\s?[-.\(]?\d{3}[-.\)]?\s?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s?\d{3}[-.\s]?\d{4})/);
    const phone = phoneMatch ? phoneMatch[1] : "";

    // Extract Name (usually first substantial line or after contact info)
    const lines = text.split('\n').filter(l => l.trim().length > 3);
    let name = "";
    for (let line of lines.slice(0, 5)) {
        const cleaned = line.trim();
        if (!cleaned.includes('@') && !cleaned.match(/\d/) && cleaned.length < 50) {
            name = cleaned;
            break;
        }
    }
    name = name || "Unknown";

    // Extract Location (look for common city/state patterns)
    const locationMatch = text.match(/(?:location|based|located|located in|from|city|state)[\s:]*([A-Z][a-z]+,?\s*[A-Z]{2})/i);
    const location = locationMatch ? locationMatch[1] : "";

    // Extract LinkedIn URL
    const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w\-]+/i);
    const linkedin = linkedinMatch ? linkedinMatch[0] : "";

    // Extract GitHub URL
    const githubMatch = text.match(/(https?:\/\/)?(www\.)?github\.com\/[\w\-]+/i);
    const github = githubMatch ? githubMatch[0] : "";

    // Extract Portfolio/Website
    const portfolioMatch = text.match(/(https?:\/\/[\w\-\.]+\.(com|io|net|dev|co)(?:\/[\w\-]*)?)/i);
    const portfolio = portfolioMatch ? portfolioMatch[0] : "";

    // Extract Twitter
    const twitterMatch = text.match(/(https?:\/\/)?(www\.)?twitter\.com\/[\w]+/i);
    const twitter = twitterMatch ? twitterMatch[0] : "";

    // Extract Skills (look for common skill keywords)
    const skillKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes', 'typescript', 'html', 'css', 'mongodb', 'postgresql', 'git', 'rest', 'api', 'machine learning', 'data science', 'project management', 'leadership', 'communication'];
    const foundSkills = skillKeywords.filter(skill => text.toLowerCase().includes(skill));
    const skills = foundSkills.join(', ') || "Not specified";

    // Extract Experience Years (look for year patterns or "X years")
    const yearsMatch = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp|work)/i);
    const experienceYears = yearsMatch ? parseInt(yearsMatch[1]) : 0;

    // Extract Education (look for degree keywords)
    const educationMatch = text.match(/(bachelor|master|phd|associate|diploma|certification|bootcamp)[\s\w]*/i);
    const education = educationMatch ? educationMatch[0] : "Not specified";

    // Extract summary (first paragraph that's substantial)
    const summaryMatch = text.match(/^[^\n]{50,200}/m);
    const summary = summaryMatch ? summaryMatch[0].trim() : "";

    return {
        name: name.substring(0, 100),
        email: email || `candidate-${Date.now()}@unknown.com`,
        phone: phone || "Not provided",
        skills: skills,
        experienceYears: experienceYears,
        location: location || "Not specified",
        education: education,
        linkedin: linkedin || null,
        github: github || null,
        portfolio: portfolio || null,
        twitter: twitter || null,
        summary: summary || null,
    };
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

        for (const currentFile of uploadFiles) {
            try {
                if (!currentFile || typeof currentFile.arrayBuffer !== "function") {
                    errors.push({ name: "unknown", error: "Invalid file" });
                    continue;
                }

                const bytes = await currentFile.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Extract text from PDF using pdf2json
                const textData = await parsePdfBuffer(buffer);

                // Smart regex-based parsing (no API needed)
                const parsedData = extractResumeData(textData);

                const emailValue = parsedData.email || `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@unknown.com`;

                // Save to Database
                const candidate = await prisma.candidate.upsert({
                    where: { email: emailValue },
                    update: {
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
                    },
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
                    }
                });

                candidates.push(candidate);
            } catch (err) {
                errors.push({ name: currentFile?.name || "unknown", error: err?.message || "Parse failed" });
            }
        }

        return NextResponse.json({ success: true, candidates, errors }, { status: 201 });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
