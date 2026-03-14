import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STOPWORDS = new Set([
  "give", "find", "show", "list", "need", "want", "get", "fetch", "search",
  "developer", "developers", "engineer", "engineers", "candidate", "candidates",
  "with", "for", "in", "of", "years", "year", "experience", "exp", "please",
  "who", "has", "have", "and", "the", "a", "an", "or", "is", "are", "me",
  "people", "person", "professionals", "skilled", "looking", "based",
]);

function extractTerms(query) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function extractExpYears(query) {
  const m = query.match(/(\d+)\s*(?:\+\s*)?(?:years?|yrs?)/i);
  return m ? parseInt(m[1]) : null;
}

function buildReply(query, candidates) {
  if (candidates.length === 0) {
    return `No candidates matched **"${query}"**.\n\nTry:\n• A different skill (e.g. "React", "Python")\n• Removing location or experience filters\n• A broader term like "frontend" or "backend"`;
  }

  if (candidates.length === 1) {
    const c = candidates[0];
    const skills = (c.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
    const skillStr = skills.slice(0, 5).join(", ") || "not listed";
    let reply = `Found **1 match** for "${query}":\n\n`;
    reply += `**${c.name || "Unnamed"}**\n`;
    reply += `• Location: ${c.location || "Not specified"}\n`;
    reply += `• Experience: ${c.experienceYears ?? 0} year${c.experienceYears !== 1 ? "s" : ""}\n`;
    reply += `• Skills: ${skillStr}\n`;
    reply += `• Education: ${c.education || "Not specified"}\n`;
    reply += `• Pipeline: **${c.pipelineStatus || "Applied"}**\n`;
    if (c.summary) {
      reply += `\n**Summary:** ${c.summary.slice(0, 200)}${c.summary.length > 200 ? "..." : ""}`;
    }
    return reply;
  }

  // Multiple results — aggregate stats
  const total = candidates.length;
  const avgExp = Math.round(
    candidates.reduce((sum, c) => sum + (c.experienceYears || 0), 0) / total
  );

  const skillMap = new Map();
  for (const c of candidates) {
    for (const s of (c.skills || "").split(",").map((s) => s.trim()).filter(Boolean)) {
      skillMap.set(s.toLowerCase(), (skillMap.get(s.toLowerCase()) || 0) + 1);
    }
  }
  const topSkills = [...skillMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([s]) => s);

  const stageMap = {};
  for (const c of candidates) {
    const s = c.pipelineStatus || "Applied";
    stageMap[s] = (stageMap[s] || 0) + 1;
  }
  const stageStr = Object.entries(stageMap)
    .map(([s, n]) => `${n} ${s}`)
    .join(" · ");

  let reply = `Found **${total} candidates** matching **"${query}"**\n\n`;
  reply += `• Avg experience: **${avgExp} years**\n`;
  if (topSkills.length) reply += `• Top skills: **${topSkills.join(", ")}**\n`;
  reply += `• Pipeline: ${stageStr}\n`;

  reply += `\n**Top matches:**\n`;
  for (const c of candidates.slice(0, 4)) {
    const skills = (c.skills || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
    reply += `→ **${c.name || "Unnamed"}** — ${c.experienceYears ?? 0} yrs · ${c.location || "location N/A"} · [${c.pipelineStatus || "Applied"}]\n`;
    if (skills.length) reply += `   Skills: ${skills.join(", ")}\n`;
  }

  if (total > 4) {
    reply += `\n_...and ${total - 4} more in the results panel →_`;
  }

  return reply;
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ reply: "I need a query to search.", candidates: [] });
  }

  const query = (body.query || "").trim();
  if (!query) {
    return NextResponse.json({ reply: "Please type something to search for.", candidates: [] });
  }

  const terms = extractTerms(query);
  const minExp = extractExpYears(query);

  // Filter out tokens that are only experience-related (numbers, "year+", "yr+")
  // These won't match any text field in the DB and will cause OR to fail
  const meaningfulTerms = terms.filter(
    (t) => !/^\d+\+?$/.test(t) && t !== "year+" && t !== "yr+"
  );

  try {
    const where = {};

    if (meaningfulTerms.length > 0) {
      const orFilters = [
        { name: { contains: query, mode: "insensitive" } },
        { skills: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { education: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { resumeText: { contains: query, mode: "insensitive" } },
      ];

      for (const term of meaningfulTerms) {
        orFilters.push({ skills: { contains: term, mode: "insensitive" } });
        orFilters.push({ name: { contains: term, mode: "insensitive" } });
        orFilters.push({ location: { contains: term, mode: "insensitive" } });
        orFilters.push({ summary: { contains: term, mode: "insensitive" } });
      }

      where.OR = orFilters;
    }

    if (minExp !== null) {
      where.experienceYears = { gte: minExp };
    }

    // Nothing to filter on — ask for clarification
    if (!where.OR && where.experienceYears === undefined) {
      return NextResponse.json({
        reply: "Please specify a skill, technology, or experience level to search for.",
        candidates: [],
      });
    }

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: [{ experienceYears: "desc" }, { createdAt: "desc" }],
      take: 30,
    });

    const reply = buildReply(query, candidates);
    return NextResponse.json({ reply, candidates });
  } catch (err) {
    console.error("/api/ai-search error", err);
    return NextResponse.json({
      reply: "Something went wrong fetching results. Check DB connection and try again.",
      candidates: [],
    });
  }
}
