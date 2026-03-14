import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// AI search endpoint for natural language queries.
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ reply: "I need a query to search.", candidates: [] }, { status: 200 });
  }

  const query = (body.query || "").trim();
  if (!query) {
    return NextResponse.json({ reply: "Please provide a search query.", candidates: [] }, { status: 200 });
  }

  const stopwords = new Set(["give", "find", "show", "list", "need", "want", "developer", "developers", "engineer", "engineers", "with", "for", "in", "of", "years", "year", "experience", "exp", "please"]);
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/)
    .map((t) => t.trim())
    .filter((t) => t && !stopwords.has(t));

  try {
    const orFilters = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { skills: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
    ];

    for (const term of terms) {
      orFilters.push({ skills: { contains: term, mode: "insensitive" } });
      orFilters.push({ name: { contains: term, mode: "insensitive" } });
      orFilters.push({ location: { contains: term, mode: "insensitive" } });
    }

    const candidates = await prisma.candidate.findMany({
      where: {
        OR: orFilters,
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    const reply = candidates.length
      ? `I found ${candidates.length} candidates relevant to "${query}".`
      : `I couldn’t find matches for "${query}". Try adjusting skills, location, or experience.`;

    return NextResponse.json({ reply, candidates });
  } catch (err) {
    console.error("/api/ai-search error", err);
    return NextResponse.json({ reply: "I hit an issue fetching results. Try again soon.", candidates: [] }, { status: 200 });
  }
}
