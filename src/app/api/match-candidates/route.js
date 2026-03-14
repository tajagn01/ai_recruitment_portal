import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STOPWORDS = new Set([
  "and", "or", "the", "a", "an", "with", "for", "in", "of", "to", "from",
  "looking", "need", "want", "seeking", "hire", "hiring", "role", "position",
  "engineer", "developer", "designer", "manager", "candidate", "candidates",
  "years", "year", "experience", "skills", "skill", "based", "remote",
]);

function extractTerms(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function normalizeSkills(csv) {
  if (!csv) return [];
  return csv
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function scoreCandidate(candidate, inputs) {
  const candidateSkills = new Set(normalizeSkills(candidate.skills));
  const primarySkills = inputs.skills.length ? inputs.skills : inputs.descriptionTerms;

  let matchedSkills = 0;
  for (const skill of primarySkills) {
    if (candidateSkills.has(skill)) matchedSkills += 1;
  }

  const skillScore = primarySkills.length
    ? Math.round((matchedSkills / primarySkills.length) * 70)
    : 0;

  let expScore = 0;
  if (Number.isFinite(inputs.minExperience) && inputs.minExperience > 0) {
    const ratio = Math.min(1, (candidate.experienceYears || 0) / inputs.minExperience);
    expScore = Math.round(ratio * 20);
  }

  let locationScore = 0;
  if (inputs.location) {
    const candLocation = (candidate.location || "").toLowerCase();
    if (candLocation.includes(inputs.location)) locationScore = 10;
  }

  let keywordScore = 0;
  if (inputs.descriptionTerms.length) {
    const haystack = `${candidate.summary || ""} ${candidate.resumeText || ""} ${candidate.education || ""}`
      .toLowerCase();
    let hits = 0;
    for (const term of inputs.descriptionTerms) {
      if (haystack.includes(term)) hits += 1;
    }
    keywordScore = Math.min(10, Math.round((hits / inputs.descriptionTerms.length) * 10));
  }

  const total = Math.max(0, Math.min(100, skillScore + expScore + locationScore + keywordScore));

  return {
    score: total,
    breakdown: {
      skillScore,
      expScore,
      locationScore,
      keywordScore,
      matchedSkills,
      totalSkills: primarySkills.length,
    },
  };
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const jobDescription = (body.jobDescription || "").trim();
  const skillInput = (body.skills || "").trim();
  const location = (body.location || "").trim().toLowerCase();
  const minExperienceRaw = body.minExperience ?? "";
  const minExperience = parseInt(minExperienceRaw, 10);

  if (!jobDescription && !skillInput && !location && !minExperienceRaw) {
    return NextResponse.json(
      { error: "Add a job description, skills, or filters to calculate match scores." },
      { status: 400 }
    );
  }

  const skills = skillInput
    ? skillInput
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];
  const descriptionTerms = extractTerms(jobDescription);

  const inputs = {
    skills,
    descriptionTerms,
    minExperience: Number.isNaN(minExperience) ? null : minExperience,
    location,
  };

  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const scored = candidates.map((candidate) => {
      const { score, breakdown } = scoreCandidate(candidate, inputs);
      return { ...candidate, candidateScore: score, matchBreakdown: breakdown };
    });

    scored.sort((a, b) => (b.candidateScore || 0) - (a.candidateScore || 0));

    const updates = scored.slice(0, 100).map((c) =>
      prisma.candidate.update({
        where: { id: c.id },
        data: { candidateScore: c.candidateScore || 0 },
      })
    );

    if (updates.length) {
      await prisma.$transaction(updates);
    }

    const avgScore = scored.length
      ? Math.round(scored.reduce((sum, c) => sum + (c.candidateScore || 0), 0) / scored.length)
      : 0;

    return NextResponse.json({
      candidates: scored,
      summary: {
        total: scored.length,
        avgScore,
        skillsUsed: skills.length || descriptionTerms.length,
        minExperience: Number.isNaN(minExperience) ? null : minExperience,
      },
    });
  } catch (err) {
    console.error("/api/match-candidates error", err);
    return NextResponse.json({ error: "Failed to score candidates" }, { status: 500 });
  }
}
